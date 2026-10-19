"""Build the Wooden Turkeys and Wooden Angels 3D models for the MWW site.

Run with a Python that has the `bpy` package (or inside Blender):

    python build_holiday_models.py -- <output_dir>

Writes turkeys.glb and angels.glb (real-world meters, standing on z=0, one
textured mesh each, same conventions as the other files in public/models).
All dimensions below are in inches and converted at export time.
"""
import math
import os
import sys
import tempfile

import bpy  # must come before bmesh when using the standalone bpy package
import bmesh
import numpy as np
from mathutils import Matrix
from PIL import Image

OUT = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "out"
os.makedirs(OUT, exist_ok=True)
TEX = tempfile.mkdtemp(prefix="mww_tex_")  # generated wood textures; embedded in the GLBs
INCH = 0.0254


# ───────────────────────── textures ─────────────────────────
def noise_field(h, w, octaves, seed):
    rng = np.random.default_rng(seed)
    acc = np.zeros((h, w), np.float32)
    amp, tot = 1.0, 0.0
    for gh, gw in octaves:
        base = (rng.random((gh, gw)) * 255).astype(np.uint8)
        img = Image.fromarray(base).resize((w, h), Image.BICUBIC)
        acc += amp * np.asarray(img, np.float32) / 255.0
        tot += amp
        amp *= 0.6
    return acc / tot


def grain_tone(seed, size=1024):
    """0..1 field with long vertical streaks and fine growth lines."""
    g = noise_field(size, size, [(4, 160), (8, 320), (16, 640), (32, 1024)], seed)
    x = np.linspace(0, 1, size, dtype=np.float32)[None, :]
    warp = noise_field(size, size, [(3, 5), (6, 9)], seed + 1)
    rings = 0.5 + 0.5 * np.sin((x * 70 + warp * 1.2) * 2 * np.pi)
    speck = noise_field(size, size, [(256, 256), (512, 512)], seed + 2)
    t = 0.55 * g + 0.25 * rings + 0.20 * speck
    return (t - t.min()) / (t.max() - t.min())


def save_png(arr, path):
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(path)


def basswood_texture(path, seed):
    t = grain_tone(seed)
    base = np.array([241, 216, 181], np.float32)
    col = base[None, None, :] * (0.90 + 0.13 * t[..., None])
    save_png(col, path)


def whitewash_texture(path, seed):
    t = grain_tone(seed)
    wood = np.array([214, 186, 146], np.float32)
    paint = np.array([241, 238, 231], np.float32)
    col = paint[None, None, :] * (0.955 + 0.06 * t[..., None])
    # thin spots where the wood shows through the wash
    m = noise_field(1024, 1024, [(5, 5), (11, 11), (23, 23)], seed + 7)
    m = np.clip((m - 0.60) / 0.18, 0, 1) ** 1.5
    col = col * (1 - 0.16 * m[..., None]) + wood[None, None, :] * (0.16 * m[..., None])
    save_png(col, path)


# ───────────────────────── materials ─────────────────────────
def srgb_to_lin(c):
    out = []
    for v in c:
        v /= 255.0
        out.append(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4)
    return out


def make_mat(name, rough, color=None, image=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = rough
    if image:
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = bpy.data.images.load(image)
        tex.extension = "MIRROR"  # grain continues across UV wraps without a seam
        nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    else:
        bsdf.inputs["Base Color"].default_value = (*srgb_to_lin(color), 1.0)
    return m


# ───────────────────────── geometry helpers ─────────────────────────
def chaikin(pts, iters=3):
    """Corner-cutting smoothing. A point listed twice in a row stays a sharp corner."""
    for _ in range(iters):
        out = []
        n = len(pts)
        for i in range(n):
            p, q = pts[i], pts[(i + 1) % n]
            out.append((0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]))
            out.append((0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1]))
        pts = out
    ded = [pts[0]]
    for p in pts[1:]:
        if abs(p[0] - ded[-1][0]) > 1e-6 or abs(p[1] - ded[-1][1]) > 1e-6:
            ded.append(p)
    if abs(ded[0][0] - ded[-1][0]) < 1e-6 and abs(ded[0][1] - ded[-1][1]) < 1e-6:
        ded.pop()
    return ded


def _rdp(pts, eps):
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    norm = math.hypot(dx, dy) or 1e-9
    dmax, idx = 0.0, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / norm
        if d > dmax:
            dmax, idx = d, i
    if dmax > eps:
        return _rdp(pts[: idx + 1], eps)[:-1] + _rdp(pts[idx:], eps)
    return [pts[0], pts[-1]]


def simplify(loop, eps=0.004):
    """Drop points that sit within eps (inches) of the outline, keeping curves and corners."""
    n = len(loop)
    if n < 12:
        return loop
    a = 0
    b = max(range(n), key=lambda i: (loop[i][0] - loop[a][0]) ** 2 + (loop[i][1] - loop[a][1]) ** 2)
    first = _rdp(loop[a : b + 1], eps)
    second = _rdp(loop[b:] + [loop[a]], eps)
    return first[:-1] + second[:-1]


def shape(spec, iters=3):
    """spec: list of (u, v) or (u, v, 'c') for a sharp corner."""
    pts = []
    for s in spec:
        pts.append((s[0], s[1]))
        if len(s) > 2:
            pts.append((s[0], s[1]))
    return simplify(chaikin(pts, iters))


def circle(cx, cy, r, n=24):
    return [(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n)]


def plate(name, loops, thickness, bevel, uv_scale, uv_off, mats=(0, 1)):
    """Extrude 2D loops (first = outline, rest = holes) in XY, centred on z=0.
    Returns a Mesh with UVs (planar from x,y) and face/edge material indices."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "2D"
    cu.fill_mode = "BOTH"
    cu.extrude = thickness / 2
    for loop in loops:
        sp = cu.splines.new("POLY")
        sp.points.add(len(loop) - 1)
        for p, (u, v) in zip(sp.points, loop):
            p.co = (u, v, 0.0, 1.0)
        sp.use_cyclic_u = True
    ob = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(ob)
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    bpy.data.objects.remove(ob)
    bpy.data.curves.remove(cu)

    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    sharp = [e for e in bm.edges if len(e.link_faces) == 2 and e.calc_face_angle(0.0) > 0.55]
    if bevel > 0:
        bmesh.ops.bevel(bm, geom=sharp, offset=bevel, segments=2, affect="EDGES", profile=0.5, clamp_overlap=True)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for old in list(bm.loops.layers.uv):
        bm.loops.layers.uv.remove(old)
    uv = bm.loops.layers.uv.new("UVMap")
    for f in bm.faces:
        f.material_index = mats[0] if abs(f.normal.z) > 0.6 else mats[1]
        for l in f.loops:
            l[uv].uv = (l.vert.co.x * uv_scale + uv_off[0], l.vert.co.y * uv_scale + uv_off[1])
    bm.to_mesh(me)
    bm.free()
    return me


def xform(me, m):
    me.transform(m)
    me.update()
    return me


def merge(meshes, name):
    bm = bmesh.new()
    for me in meshes:
        bm.from_mesh(me)
    out = bpy.data.meshes.new(name)
    bm.to_mesh(out)
    bm.free()
    return out


def curve_mesh(points, radius, mat_index, closed=False, res=0):
    cu = bpy.data.curves.new("strand", "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = res
    cu.use_fill_caps = True
    sp = cu.splines.new("POLY")
    sp.points.add(len(points) - 1)
    for p, (x, y, z) in zip(sp.points, points):
        p.co = (x, y, z, 1.0)
    sp.use_cyclic_u = closed
    ob = bpy.data.objects.new("strand", cu)
    bpy.context.scene.collection.objects.link(ob)
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    bpy.data.objects.remove(ob)
    bpy.data.curves.remove(cu)
    for p in me.polygons:
        p.material_index = mat_index
    return me


# profile plane (x, y) + thickness z  ->  world.  Body: x->X, y->Z, z->-Y.   Fan: x->Y, y->Z, z->X.
M_BODY = Matrix(((1, 0, 0), (0, 0, -1), (0, 1, 0))).to_4x4()
M_FAN = Matrix(((0, 0, 1), (1, 0, 0), (0, 1, 0))).to_4x4()


def finish(me, name, mats, path, scale=INCH):
    """Centre on x/y, sit on z=0, scale to meters, export a single-mesh GLB."""
    xs = [v.co.x for v in me.vertices]
    ys = [v.co.y for v in me.vertices]
    zs = [v.co.z for v in me.vertices]
    xform(me, Matrix.Translation(((-(max(xs) + min(xs)) / 2), (-(max(ys) + min(ys)) / 2), -min(zs))))
    xform(me, Matrix.Scale(scale, 4))
    for m in mats:
        me.materials.append(m)
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    for p in me.polygons:
        p.use_smooth = False
    bpy.ops.object.select_all(action="DESELECT")
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB", use_selection=True, export_yup=True,
        export_image_format="JPEG", export_jpeg_quality=88, export_apply=True,
    )
    return ob


# ───────────────────────── turkey ─────────────────────────
def build_turkey():
    tex = os.path.join(TEX, "basswood.png")
    basswood_texture(tex, 11)
    wood = make_mat("Basswood", 0.62, image=tex)
    edge = make_mat("Basswood end grain", 0.9, color=(222, 188, 148))

    T = 0.25  # board thickness
    # body profile traced from the side-view product photo (px -> inches, u forward, v up)
    def px(x, y):
        return ((x - 655) / 209.0, (1160 - y) / 209.0)

    body_px = [
        (600, 1160, "c"), (655, 1160, "c"), (655, 1082, "c"), (700, 1076), (768, 1080, "c"),
        (772, 1138, "c"), (838, 1142, "c"), (836, 1088, "c"), (905, 1060), (975, 1005), (1025, 925),
        (1040, 850), (1020, 800), (1032, 765), (1004, 735), (1010, 695), (980, 655), (988, 600),
        (962, 548), (990, 515), (984, 478), (950, 430), (900, 386), (850, 372), (800, 386), (762, 422),
        (748, 470), (772, 522), (812, 562), (850, 598, "c"), (790, 586), (730, 582), (672, 584, "c"),
        (655, 604, "c"),
    ]
    spec = [(*px(p[0], p[1]), *p[2:]) for p in body_px]
    outline = shape(spec, 3)
    eye = circle(*px(850, 437), 0.05, 14)
    nick = [px(868, 513), px(898, 506), px(912, 522), px(878, 530)]
    body = plate("body", [outline, eye, nick], T, 0.012, 1 / 6.0, (0.13, 0.31))
    xform(body, M_BODY)

    # tail fan: one board in the plane across the back of the body, cut into 11 feathers
    R, zc = 2.45, 2.45
    r_slit, r_base, kerf_out, kerf_in = 0.47 * R, 0.72 * R, 0.11, 0.04
    a_start, span, n = -22.0, 224.0, 11
    step = span / n

    def pt(r, deg):
        return (r * math.cos(math.radians(deg)), zc + r * math.sin(math.radians(deg)))

    fan = [(*pt(r_base, a_start), "c"), (*pt(R, a_start), "c")]
    for i in range(n):
        a1 = a_start + (i + 1) * step
        if i < n - 1:
            do, di = math.degrees(0.5 * kerf_out / R), math.degrees(0.5 * kerf_in / r_slit)
            fan += [(*pt(R, a1 - do), "c"), (*pt(r_slit, a1 - di), "c"), (*pt(r_slit, a1 + di), "c"), (*pt(R, a1 + do), "c")]
        else:
            fan += [(*pt(R, a1), "c"), (*pt(r_base, a1), "c")]
    for k in range(1, 14):  # round bottom edge back to the start
        fan.append(pt(r_base, a_start + span + k * (360 - span) / 14))
    outline_fan = shape(fan, 2)
    fan_me = plate("fan", [outline_fan], T, 0.012, 1 / 6.0, (0.57, 0.12))
    xform(fan_me, M_FAN)

    me = merge([body, fan_me], "turkey")
    # turn it a little so the first view is three-quarter, like the product photos
    xform(me, Matrix.Rotation(math.radians(-35), 4, "Z"))
    return finish(me, "WoodenTurkey", [wood, edge], os.path.join(OUT, "turkeys.glb"))


# ───────────────────────── angels ─────────────────────────
def angel_parts(H, hem_half, sh_half, head_r, thick, wing_yaw, wing_thick, seed, mats_face=0, mats_edge=1, mat_raffia=2, uv_k=0.1):
    r = head_r * H
    neck_half = 0.05 * H
    yc = H - r
    yj = yc - math.sqrt(r * r - neck_half * neck_half)
    y_sh = 0.69 * H
    # left side up, shoulder, neck, head, right side down, scalloped hem back
    spec = []
    for i in range(9):  # left side, hem -> shoulder (bell flare)
        s = i / 8.0
        y = 0.012 * H + (y_sh - 0.012 * H) * s
        k = (1 - s) ** 1.35
        spec.append((-(sh_half + (hem_half - sh_half) * k), y, "c") if i == 0 else (-(sh_half + (hem_half - sh_half) * k), y))
    y_n = min(0.722 * H, yj - 0.012 * H)  # shoulder-to-neck points must stay below the head join
    spec += [(-0.8 * sh_half, y_n - 0.016 * H), (-neck_half * 1.3, y_n), (-neck_half, yj, "c")]
    # head arc: clockwise over the top, from the lower-left neck join to the lower-right one
    ang0 = math.atan2(yj - yc, -neck_half) % (2 * math.pi)   # ~ 200 deg
    ang1 = math.atan2(yj - yc, neck_half) % (2 * math.pi)    # ~ 340 deg
    ang1 -= 2 * math.pi                                      # sweep down through 90 deg to -20 deg
    arc = []
    for i in range(1, 20):
        a = ang0 + (ang1 - ang0) * i / 20.0
        arc.append((r * math.cos(a), yc + r * math.sin(a)))
    spec += arc
    spec += [(neck_half, yj, "c"), (neck_half * 1.3, y_n), (0.8 * sh_half, y_n - 0.016 * H)]
    for i in range(9):  # right side, shoulder -> hem
        s = 1 - i / 8.0
        y = 0.012 * H + (y_sh - 0.012 * H) * s
        k = (1 - s) ** 1.35
        x = sh_half + (hem_half - sh_half) * k
        spec.append((x, y, "c") if i == 8 else (x, y))
    waves = 4 if H > 9 else 3
    amp = 0.011 * H
    for i in range(1, 24):  # hem, right -> left
        t = i / 24.0
        x = hem_half - 2 * hem_half * t
        spec.append((x, 0.012 * H + amp * 0.5 * (1 - math.cos(2 * math.pi * waves * t))))
    body_outline = simplify(chaikin([(p[0], p[1]) for p in spec for _ in range(2 if len(p) > 2 else 1)], 2))
    body = plate("angel_body", [body_outline], thick, 0.012 * (H / 18.75) + 0.006, uv_k, (seed * 0.17, seed * 0.29),
                 mats=(mats_face, mats_edge))
    xform(body, M_BODY)

    # wings: one board each side, hinged behind the shoulder, swept forward by wing_yaw
    # feather-shaped wing: rounded top at the shoulder, near-straight outer edge, pointed lower tip, scalloped inner edge
    wing_spec = [(0.0, 0.48 * H, "c"), (0.0, 0.735 * H, "c"), (0.09 * H, 0.752 * H), (0.19 * H, 0.728 * H),
                 (0.285 * H, 0.665 * H), (0.350 * H, 0.560 * H), (0.372 * H, 0.440 * H), (0.366 * H, 0.335 * H),
                 (0.338 * H, 0.250 * H, "c"), (0.290 * H, 0.262 * H), (0.250 * H, 0.320 * H), (0.200 * H, 0.330 * H),
                 (0.160 * H, 0.385 * H), (0.110 * H, 0.420 * H)]
    wing_outline = simplify(chaikin([(p[0], p[1]) for p in wing_spec], 3))
    parts = [body]
    behind = 0.5 * thick + 0.5 * wing_thick + 0.012 * H
    for side in (1, -1):
        loop = [(side * x, y) for (x, y) in wing_outline][:: side]
        w = plate("wing", [loop], wing_thick, 0.008 * (H / 18.75) + 0.004, uv_k, (seed * 0.31 + side * 0.2, seed * 0.11),
                  mats=(mats_face, mats_edge))
        xform(w, M_BODY)
        # hinge at the shoulder (x=0 of the wing board), yaw so the tips come forward
        xform(w, Matrix.Translation((0, behind, 0)) @ Matrix.Rotation(math.radians(-side * wing_yaw), 4, "Z"))
        parts.append(w)

    # raffia bow tied at the neck, on the front of the body
    kz = 0.728 * H
    ky = -(thick / 2) - 0.004 * H
    rad = 0.0026 * H
    rng = np.random.default_rng(seed)
    for side in (1, -1):
        for j in range(3):
            L = H * (0.115 + 0.012 * rng.random())
            phi = math.radians(14 + 12 * rng.random())
            W = H * (0.035 + 0.01 * rng.random())
            pts = []
            for i in range(22):
                t = 2 * math.pi * i / 22
                ax = L * (1 - math.cos(t)) / 2
                lat = W * math.sin(t) * math.sin(t / 2)
                x = side * (ax * math.cos(phi) - lat * math.sin(phi) * 0)
                z = kz + ax * math.sin(phi) + lat
                y = ky - 0.006 * H * math.sin(t / 2) * (1 + j * 0.4) - rad * j * 0.6
                pts.append((x, y, z))
            parts.append(curve_mesh(pts, rad, mat_raffia, closed=True))
    for side in (1, -1):
        for j in range(3):
            Ltail = H * (0.20 + 0.07 * rng.random())
            drift = side * H * (0.02 + 0.05 * rng.random())
            pts = []
            for i in range(12):
                t = i / 11.0
                x = 0.005 * H * side + drift * t + H * 0.006 * math.sin(7 * t + j)
                z = kz - Ltail * t
                y = ky - 0.008 * H * (1 - t) - rad * (j + 1) * 0.7
                pts.append((x, y, z))
            parts.append(curve_mesh(pts, rad, mat_raffia))
    knot = bmesh.new()
    bmesh.ops.create_uvsphere(knot, u_segments=14, v_segments=9, radius=0.018 * H)
    kme = bpy.data.meshes.new("knot")
    knot.to_mesh(kme)
    knot.free()
    for p in kme.polygons:
        p.material_index = mat_raffia
    xform(kme, Matrix.Translation((0, ky - 0.004 * H, kz)) @ Matrix.Scale(0.6, 4, (0, 1, 0)))
    parts.append(kme)
    return merge(parts, "angel")


def build_angels():
    tex = os.path.join(TEX, "whitewash.png")
    whitewash_texture(tex, 23)
    paint = make_mat("Whitewashed wood", 0.78, image=tex)
    edge = make_mat("Natural edge", 0.88, color=(208, 184, 150))
    raffia = make_mat("Raffia", 0.8, color=(224, 193, 132))

    # heights from the product photo, scaled so the large angel is 18.75 in
    sizes = [
        # name, H, hem_half, shoulder_half, head_r, thick, wing_yaw, wing_thick, x, y(depth, - toward viewer), yaw
        ("large", 18.75, 0.180, 0.135, 0.137, 0.60, 8, 0.30, 0.0, 0.0, 0),
        ("medium", 10.9, 0.272, 0.115, 0.105, 0.45, 24, 0.25, -7.4, -3.6, 9),
        ("small", 7.2, 0.300, 0.130, 0.118, 0.38, 24, 0.22, 4.7, -3.0, -9),
    ]
    meshes = []
    for i, (name, H, hh, sh, hr, th, wy, wt, x, y, yaw) in enumerate(sizes):
        me = angel_parts(H, hh * H, sh * H, hr, th, wy, wt, seed=i + 3, uv_k=1.0 / 10.0 / max(1.0, H / 18.75))
        xform(me, Matrix.Translation((x, y, 0)) @ Matrix.Rotation(math.radians(yaw), 4, "Z"))
        meshes.append(me)
    me = merge(meshes, "angels")
    return finish(me, "WoodenAngels", [paint, edge, raffia], os.path.join(OUT, "angels.glb"))


if __name__ == "__main__":
    bpy.ops.wm.read_factory_settings(use_empty=True)
    build_turkey()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    build_angels()
    print("wrote", sorted(os.listdir(OUT)))
