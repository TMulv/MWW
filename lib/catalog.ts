import photos from "./photos.json";

/*
 * ─────────────────────────────────────────────────────────────
 *  THE CATALOG. Edit this file to change what shows on the site.
 *
 *  • price: shown as "From $X". Best-guess starting prices (Sept 2026), based on
 *    her market signs and Etsy ranges for similar handmade pieces. Adjust freely.
 *  • Photos live in /public/photos and are mapped in photos.json.
 *  • Categories: change labels/blurbs in CATEGORIES below.
 * ─────────────────────────────────────────────────────────────
 */

export type Photo = { src: string; thumb: string; w: number; h: number };

export type CategoryId =
  | "puzzles"
  | "figurines"
  | "engraving"
  | "flags"
  | "kids"
  | "home-garden"
  | "holiday";

// dot: category color, pulled from the cat mascot's palette
export const CATEGORIES: { id: CategoryId; label: string; dot: string; blurb: string }[] = [
  { id: "puzzles", label: "Puzzles", dot: "#7f9a86", blurb: "Animal families and word puzzles, cut on the scroll saw." },
  { id: "figurines", dot: "#e0917c", label: "Figurines", blurb: "Small wooden figures of people and animals. Most can be personalized." },
  { id: "engraving", dot: "#2f4057", label: "Engraving & Glass", blurb: "Laser engraving on slate, wood, leather and crystal." },
  { id: "flags", dot: "#b8453a", label: "Flags", blurb: "Wooden flags, torched and painted by hand." },
  { id: "kids", dot: "#d9a53c", label: "Kids & Toys", blurb: "Step stools, picnic tables, wagons and pull toys." },
  { id: "home-garden", dot: "#6f9ab5", label: "Home & Garden", blurb: "Planters, porch animals and outdoor pieces." },
  { id: "holiday", dot: "#7a5236", label: "Holiday", blurb: "Reindeer, ornaments and seasonal signs. If you need something by Christmas, ask early." },
];

export type Item = {
  id: keyof typeof photos;
  name: string;
  category: CategoryId;
  price: number; // "from $X"
  description: string;
  custom?: boolean; // shows a "Personalize it" note
  model?: string; // optional 3D model (.glb in /public/models), shows a "Spin in 3D" view
};

const ITEMS_RAW: Item[] = [
  // ── Puzzles
  { id: "animal-family", name: "Animal Family Puzzles", category: "puzzles", price: 25, custom: true, model: "/models/animal-family.glb",
    description: "A parent animal with its babies fitted inside. Elephants, bears, cats, bunnies, kangaroos and more. Tell me which animal you want." },
  { id: "name-puzzle", name: "Family Name Puzzle", category: "puzzles", price: 35, custom: true,
    description: "One animal for each person in the family, with names engraved, on a wooden stand." },
  { id: "word-puzzles", name: "Word Puzzles", category: "puzzles", price: 25, custom: true, model: "/models/word-puzzles.glb",
    description: "The animal's name is cut out as the puzzle: HIPPO, ELEPHANT, BUTTERFLY. Painted or plain wood." },
  { id: "owl-tree", name: "Owl & Tree Puzzle", category: "puzzles", price: 40, model: "/models/owl-tree.glb",
    description: "A tree puzzle with an owl on the branch. It stands up on its own, so it works as decoration too." },
  { id: "standing-puzzles", name: "Standing Scene Puzzles", category: "puzzles", price: 30, model: "/models/standing-puzzles.glb",
    description: "Puzzles that stand up once they're put together, like the giraffe scene and the T-rex." },
  { id: "bunny-families", name: "Bunny Families", category: "puzzles", price: 10,
    description: "Stacking bunnies in plain wood or pastel paint. Popular around Easter." },
  { id: "animal-parade", name: "Animal Parade Set", category: "puzzles", price: 30, model: "/models/animal-parade.glb",
    description: "A row of animals on one base: elephant, giraffe, bunny, turtle and a few others." },

  // ── Figurines
  { id: "parent-child", name: "Parent & Child", category: "figurines", price: 20, custom: true,
    description: "Two figures leaning in toward each other. People get these for Mother's Day, new parents and grandparents." },
  { id: "couple-heart", name: "Couple with Heart", category: "figurines", price: 30, custom: true,
    description: "Two figures holding a heart with your names or a date engraved on it. Good for weddings and anniversaries." },
  { id: "flower-bearers", name: "Flower Bearers", category: "figurines", price: 15,
    description: "A figure holding a small bouquet. Order one, or a set for the whole family." },
  { id: "you-and-your-dog", name: "You & Your Dog", category: "figurines", price: 25, custom: true,
    description: "A person and their dog, face to face. I can shape the dog to look like your breed." },
  { id: "hobby-figures", name: "Hobby Figures", category: "figurines", price: 15, custom: true, model: "/models/hobby-figures.glb",
    description: "A figure doing their thing: reading, riding, playing guitar. Tell me the hobby." },
  { id: "figures-on-stands", name: "Figures on Stands", category: "figurines", price: 15,
    description: "Figures on round wooden bases, dancing, hugging or playing ball." },
  { id: "athlete-silhouette", name: "Athlete Silhouette", category: "figurines", price: 40, custom: true, model: "/models/athlete-silhouette.glb",
    description: "A painted silhouette of your player with their jersey number, on a stand. Nice for senior night." },
  { id: "deer-figurines", name: "Deer & Giraffe Figurines", category: "figurines", price: 20,
    description: "Tall standing deer and giraffes, stained or natural." },

  // ── Engraving & Glass
  { id: "cutting-boards", name: "Engraved Cutting Boards", category: "engraving", price: 30, custom: true,
    description: "Cutting boards engraved with a monogram, a family name or a saying." },
  { id: "slate-signs", name: "Slate Signs & Memorials", category: "engraving", price: 30, custom: true, model: "/models/slate-signs.glb",
    description: "Garden signs, house signs and pet memorials engraved on slate." },
  { id: "coasters", name: "Slate Coaster Sets", category: "engraving", price: 25, custom: true, model: "/models/coasters.glb",
    description: "Slate coasters in sets of four. Monograms, pet portraits or a funny line." },
  { id: "leather-journals", name: "Monogrammed Journals", category: "engraving", price: 25, custom: true, model: "/models/leather-journals.glb",
    description: "Lined journals with your initials engraved on the cover. They come in a gift box." },
  { id: "crystal-keepsake", name: "3D Crystal Photo Keepsake", category: "engraving", price: 55, custom: true, model: "/models/crystal-keepsake.glb",
    description: "Your photo engraved inside a crystal block, set on a lit wooden base. Usually pets, babies or memorials." },
  { id: "pet-bowls", name: "Pet Bowl Stands", category: "engraving", price: 45, custom: true,
    description: "Raised wooden stands for your pet's food and water bowls, with their name engraved." },
  { id: "smores-caddy", name: "S'mores Caddy", category: "engraving", price: 40, custom: true,
    description: "A wooden tray with three slots for graham crackers, chocolate and marshmallows. Engraved with your family's name." },
  { id: "engraved-plaques", name: "Engraved Plaques", category: "engraving", price: 15, custom: true, model: "/models/engraved-plaques.glb",
    description: "Small engraved plaques for birthdays, awards and thank-yous." },
  { id: "pet-plaque", name: "Pet Silhouette Plaque", category: "engraving", price: 45, custom: true, model: "/models/pet-plaque.glb",
    description: "Your dog's silhouette on a wood panel with their name. For a memorial I can add names and years." },

  // ── Flags
  { id: "flag-classic", name: "Rustic American Flag", category: "flags", price: 75, model: "/models/flag-classic.glb",
    description: "A wooden American flag, torched and painted, in a wood frame. Tell me the size you need." },
  { id: "flag-thin-blue", name: "Thin Blue Line Flag", category: "flags", price: 80,
    description: "The same wooden flag with a blue stripe, for police officers and their families." },
  { id: "flag-thin-red", name: "Thin Red Line Flag", category: "flags", price: 80,
    description: "The same wooden flag with a red stripe, for firefighters and their families." },

  // ── Kids & Toys
  { id: "pull-ducks", name: "Pull-Along Duck Family", category: "kids", price: 30, model: "/models/pull-ducks.glb",
    description: "A wooden duck on wheels with a pull string. Mama duck and ducklings." },
  { id: "step-stools", name: "Step Stools", category: "kids", price: 45, model: "/models/step-stools.glb", custom: true,
    description: "One- or two-step stools for reaching the sink. Plain wood or painted." },
  { id: "picnic-table", name: "Kids' Picnic Table", category: "kids", price: 150, model: "/models/picnic-table.glb",
    description: "A kid-sized picnic table. Natural wood, or painted black, green or a color you pick." },
  { id: "wagon", name: "Personalized Wagon", category: "kids", price: 150, custom: true,
    description: "A wooden wagon on wheels with a name on the seat back. It works as a toy box too." },
  { id: "kids-adirondack", name: "Kids' Adirondack Chair", category: "kids", price: 110, model: "/models/kids-adirondack.glb",
    description: "A small Adirondack chair for a kid, painted the color you pick." },
  { id: "toolbox", name: "Wooden Toolbox with Drawer", category: "kids", price: 45,
    description: "A wooden tote with a handle and a drawer, for small tools or craft supplies." },

  // ── Home & Garden
  { id: "lantern-planter", name: "Lantern Post Planter", category: "home-garden", price: 85,
    description: "A planter box with a post and a hanging lantern. Nice on a deck at night." },
  { id: "planter-box", name: "Umbrella Planters", category: "home-garden", price: 110,
    description: "Cedar planter boxes with a built-in umbrella pole slot, for patio tables and outdoor spaces." },
  { id: "porch-pals", name: "Porch Pals", category: "home-garden", price: 50,
    description: "Big painted animals for the front step: dachshund, frog, bear, lab, pig. Some have room for a plant." },
  { id: "pet-sitters", name: "Pet Shelf Sitters", category: "home-garden", price: 35, custom: true,
    description: "Wooden cutouts of your cat or dog, painted to match. They sit on a shelf edge or the floor." },
  { id: "bench-restore", name: "Bench Restoration", category: "home-garden", price: 125,
    description: "Have an old cast-iron bench with rotted slats? I'll replace the wood and refinish it." },

  // ── Holiday
  { id: "reindeer-family", name: "Personalized Reindeer", category: "holiday", price: 25, custom: true,
    description: "One reindeer for each person, with their name engraved and a plaid bow." },
  { id: "name-ornaments", name: "Name Ornaments", category: "holiday", price: 10, custom: true,
    description: "Wooden ornaments with a name and a small figure. Good for gift tags or a baby's first Christmas." },
  { id: "nativity", name: "Nativity Yard Display", category: "holiday", price: 200,
    description: "A large white nativity cutout for the yard or a church." },
  { id: "reindeer-holder", name: "Reindeer Card Holder", category: "holiday", price: 40,
    description: "A standing wooden reindeer that holds holiday cards or mail." },
  { id: "gnome-sign", name: "Seasonal Gnome Sign", category: "holiday", price: 30,
    description: "A gnome holding a sign. I can change the message for any holiday." },
];

export const ITEMS = ITEMS_RAW.map((it) => ({
  ...it,
  photos: (photos as Record<string, Photo[]>)[it.id],
}));

export type CatalogItem = (typeof ITEMS)[number];

export const MAKER_PHOTO = (photos as Record<string, Photo[]>)["_maker"][0];

export const INSTAGRAM = "https://www.instagram.com/mulveys_woodworkingcreations/";
export const INSTAGRAM_HANDLE = "@mulveys_woodworkingcreations";

export const CONTACT_EMAIL = "mulveyswoodworking@gmail.com";

// Get a free key at https://web3forms.com (enter the email above; the key gets emailed there).
// Until a key is set, the form falls back to opening the visitor's email app.
export const WEB3FORMS_KEY = "";

// Optional: a small server endpoint that files each checkout as a page in the Notion "Orders"
// database (keeps the Notion token off this public site). Leave empty until it's deployed.
export const ORDER_ENDPOINT = "https://mww-orders.tyler-mulvey10.workers.dev";
