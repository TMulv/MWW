# Product photo cutouts

Created with the built-in image editing tool. Original JPEGs are retained; the site uses the transparent PNG versions under public/photos and their thumbnails under public/photos/thumbs.

Prompts used: background extraction for each of IMG_4597, IMG_4599 and IMG_4598: remove room, blue surface, shadows and reflections; preserve the exact turkey, camera angle, intersecting boards, feather slots, wood grain and imperfections; center full product on transparent background with 8% margin. For IMG_4600: remove room, table and ground shadows; preserve all three angels in the same arrangement and proportions, whitewashed wood texture and fine raffia bows; center on transparent background with 6% margin.

These are AI-edited product cutouts.

## Wooden reindeer figures

IMG_4620, IMG_4622, and IMG_4621 were edited with the built-in image editing tool to remove the workshop background and tabletop. The prompt kept both wooden deer together and preserved their shapes, open spaces, wood grain, relative positions, and camera angles. The transparent PNGs are in `public/photos/wooden-reindeer-*-cutout.png`, with smaller gallery thumbnails in `public/photos/thumbs/`.

## 3D models

public/models/turkeys.glb and public/models/angels.glb were modeled in Blender (bpy) from the product photos by tools/blender/build_holiday_models.py. They are approximations traced from the photos, not scans. Re-run the script to regenerate: `python tools/blender/build_holiday_models.py -- public/models` (needs the `bpy`, `numpy` and `pillow` packages).

- Turkey: two interlocking boards (side-view body, 11-feather tail fan), about 3 x 4 x 5 in, basswood texture.
- Angels: the large, medium and small angel arranged as in the photo, large 18¾ in tall. Proportions follow the photo (medium about 11 in, small about 7 in), which does not match the 15½ in and 6 in listed in lib/catalog.ts. Confirm the real sizes with Mulvey's Woodworking.
