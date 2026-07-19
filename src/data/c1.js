// C1 — Advanced (geofl.ge top level in this app). Nuanced, abstract, opinionated
// language.

const c1 = {
  id: "c1",
  cefr: "C1",
  band: "C",
  name: "Advanced",
  georgian: "თავისუფალი ფლობა",
  tagline: "Express nuanced ideas and abstract thoughts.",
  color: "#a855f7",
  units: [
    {
      id: "c1-ideas",
      title: "Ideas & Abstraction",
      icon: "🧠",
      lessons: [
        {
          id: "c1-ideas-1",
          title: "Thoughts & Meaning",
          icon: "🧠",
          goal: "Talk about ideas, meaning, and experience.",
          words: [
            { ka: "აზრი", tr: "azri", en: "idea / opinion" },
            { ka: "მნიშვნელობა", tr: "mnishvneloba", en: "meaning" },
            { ka: "გამოცდილება", tr: "gamotsdileba", en: "experience" },
            { ka: "მიზანი", tr: "mizani", en: "goal" },
            { ka: "ცოდნა", tr: "tsodna", en: "knowledge" },
            { ka: "ჭეშმარიტება", tr: "cheshmariteba", en: "truth" },
          ],
          phrases: [
            { ka: "ჩემი აზრით", tr: "chemi azrit", en: "in my opinion" },
            { ka: "ეს ლოგიკურია", tr: "es logikuria", en: "that's logical" },
          ],
        },
      ],
    },
    {
      id: "c1-debate",
      title: "Discussion & Debate",
      icon: "🗣️",
      lessons: [
        {
          id: "c1-debate-1",
          title: "Making a Point",
          icon: "🗣️",
          goal: "Argue, agree, and qualify your views.",
          words: [
            { ka: "მაგალითი", tr: "magaliti", en: "example" },
            { ka: "მიზეზი", tr: "mizezi", en: "reason" },
            { ka: "შედეგი", tr: "shedegi", en: "result" },
            { ka: "თუმცა", tr: "tumtsa", en: "however" },
            { ka: "ალბათ", tr: "albat", en: "probably" },
            { ka: "ნამდვილად", tr: "namdvilad", en: "definitely" },
          ],
          phrases: [
            { ka: "ერთი მხრივ", tr: "erti mkhriv", en: "on one hand" },
            { ka: "ვფიქრობ, რომ", tr: "vpikrob, rom", en: "I think that" },
          ],
        },
      ],
    },
  ],
};

export default c1;
