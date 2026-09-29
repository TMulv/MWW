// Cloudflare Worker: receives a checkout from mulveyswoodworking.com and files it
// as a page in the Notion "Orders" database. The Notion token lives here as a secret,
// never in the public site.
//
// Secrets / vars (set in the Cloudflare dashboard or with wrangler):
//   NOTION_TOKEN     (secret)  internal integration token, starts with "ntn_"
//   NOTION_DB_ID     (var)     Orders database id
//   ALLOWED_ORIGINS  (var)     comma-separated, e.g. "https://mulveyswoodworking.com,http://localhost:3000"

const clip = (s, n = 1900) => String(s ?? "").slice(0, n); // Notion rich text caps at 2000 chars
const text = (s) => [{ type: "text", text: { content: clip(s) } }];
const para = (s) => ({ object: "block", type: "paragraph", paragraph: { rich_text: text(s) } });
const bullet = (s) => ({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: text(s) } });
const h3 = (s) => ({ object: "block", type: "heading_3", heading_3: { rich_text: text(s) } });

function cors(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim());
  return {
    "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : allowed[0] || "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const headers = cors(origin, env);
    if (req.method === "OPTIONS") return new Response(null, { headers });
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers });
    if (!headers["Access-Control-Allow-Origin"] || headers["Access-Control-Allow-Origin"] !== origin) {
      return new Response("Forbidden", { status: 403, headers });
    }

    let o;
    try {
      const raw = await req.text();
      if (raw.length > 20000) throw new Error("too big");
      o = JSON.parse(raw);
    } catch {
      return new Response("Bad request", { status: 400, headers });
    }
    if (!o?.name || !o?.email || !/^\S+@\S+\.\S+$/.test(o.email)) {
      return new Response("Missing name or email", { status: 400, headers });
    }

    const items = Array.isArray(o.items) ? o.items.slice(0, 50) : [];
    const custom = items.length === 0;
    const pieceCount = items.reduce((n, i) => n + (Number(i.qty) || 0), 0);
    const itemLine = (i) => `${i.qty} x ${i.name}${i.personalization ? ` ("${i.personalization}")` : ""}`;
    const what = custom ? "Custom request" : items.length === 1 ? items[0].name : `${pieceCount} pieces`;
    const neededBy = /^\d{4}-\d{2}-\d{2}$/.test(o.needed_by || "") ? o.needed_by : null;
    const delivery = ["Not sure yet", "Local pickup", "Local delivery", "Shipping (ask for a quote)"]
      .includes(o.delivery) ? o.delivery : "Not sure yet";

    const properties = {
      Order: { title: text(`${o.name} · ${what}`) },
      Status: { select: { name: "New" } },
      Type: { select: { name: custom ? "Custom request" : "Cart" } },
      Customer: { rich_text: text(o.name) },
      Email: { email: clip(o.email, 200) },
      Rush: { checkbox: !!o.rushed },
      Delivery: { select: { name: delivery } },
      Items: { rich_text: text(custom ? "Custom (see notes)" : items.map(itemLine).join("\n")) },
      "Piece count": { number: pieceCount },
      Notes: { rich_text: text(o.details || "") },
      Budget: { rich_text: text(o.budget || "") },
    };
    if (o.phone) properties.Phone = { phone_number: clip(o.phone, 40) };
    if (neededBy) properties["Needed by"] = { date: { start: neededBy } };
    if (!custom) properties["Starting total"] = { number: Number(o.starting_total) || 0 };

    const children = [
      h3(custom ? "Custom request" : "Pieces"),
      ...(custom ? [] : items.map((i) => bullet(`${itemLine(i)}, from $${i.from_price} each`))),
      ...(o.details ? [h3("Notes from the customer"), para(o.details)] : []),
      h3("Next step"),
      para(`Email ${o.email} to confirm details, final price and timing, then set Status to Confirmed.`),
    ];

    const res = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ parent: { database_id: env.NOTION_DB_ID }, icon: { emoji: "🪵" }, properties, children }),
    });

    if (!res.ok) {
      console.log("Notion error", res.status, await res.text());
      return new Response("Could not save order", { status: 502, headers });
    }
    return new Response(JSON.stringify({ ok: true }), { headers: { ...headers, "Content-Type": "application/json" } });
  },
};
