// Visual grounding (comprehensible-input principle): map concrete vocabulary to
// an emoji so meaning is tied to a picture, not just an English gloss.
const EMOJI = {
  // numbers
  zero: "0️⃣", one: "1️⃣", two: "2️⃣", three: "3️⃣", four: "4️⃣", five: "5️⃣",
  six: "6️⃣", seven: "7️⃣", eight: "8️⃣", nine: "9️⃣", ten: "🔟",
  // family & people
  mother: "👩", father: "👨", sister: "👧", brother: "👦", child: "🧒",
  family: "👨‍👩‍👧", grandmother: "👵", grandfather: "👴", friend: "🧑‍🤝‍🧑",
  man: "👨", woman: "👩", boy: "👦", girl: "👧", husband: "🤵", wife: "👰",
  // everyday
  water: "💧", bread: "🍞", house: "🏠", cat: "🐈", dog: "🐕", car: "🚗",
  book: "📖", door: "🚪", window: "🪟", chair: "🪑", bed: "🛏️", room: "🛋️",
  kitchen: "🍳", bedroom: "🛏️", bathroom: "🛁",
  // table
  plate: "🍽️", fork: "🍴", spoon: "🥄", knife: "🔪", glass: "🥛", napkin: "🧻",
  // café & food
  coffee: "☕", tea: "🍵", wine: "🍷", beer: "🍺", menu: "📋",
  fruit: "🍎", apple: "🍎", banana: "🍌", tomato: "🍅", potato: "🥔",
  vegetables: "🥕", meat: "🍖", cheese: "🧀", milk: "🥛", egg: "🥚",
  salt: "🧂", sugar: "🍬", oil: "🫒", soup: "🍲", salad: "🥗", dessert: "🍰",
  restaurant: "🍽️", table: "🍽️",
  // getting around
  taxi: "🚕", hotel: "🏨", cinema: "🎬", ticket: "🎫", train: "🚆",
  airplane: "✈️", passport: "🛂",
  // time
  morning: "🌅", evening: "🌆", night: "🌙",
  // work / health
  office: "🏢", doctor: "🧑‍⚕️", teacher: "🧑‍🏫", student: "🧑‍🎓",
  engineer: "👷", university: "🎓", pharmacy: "💊", medicine: "💊", fever: "🤒",
  // b2
  newspaper: "📰", television: "📺", happy: "😀", sad: "😢", tired: "😫",
  afraid: "😨", nature: "🌳", mountain: "⛰️", sea: "🌊", river: "🏞️",
  forest: "🌲", weather: "🌤️", tree: "🌳", music: "🎵", art: "🎨",
  film: "🎬", song: "🎵",
};

// Look up an emoji for an English gloss. Handles qualifiers like "hello (polite)"
// and multi-word entries by trying the whole string then the first word.
export function emojiFor(en) {
  if (!en) return null;
  const clean = en.toLowerCase().replace(/\(.*?\)/g, "").trim();
  if (EMOJI[clean]) return EMOJI[clean];
  const first = clean.split(/[\s/]+/)[0];
  return EMOJI[first] || null;
}
