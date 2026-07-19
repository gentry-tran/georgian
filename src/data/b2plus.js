// B2+ — Upper-intermediate plus (geofl.ge partial level between B2 and C1).
// Handle abstract, modern topics with more precision.

const b2plus = {
  id: "b2plus",
  cefr: "B2+",
  band: "B",
  name: "Advanced-intermediate",
  georgian: "მაღალი დონე+",
  tagline: "Discuss technology, work life, and society.",
  color: "#f97316",
  units: [
    {
      id: "b2p-tech",
      title: "Technology",
      icon: "💻",
      lessons: [
        {
          id: "b2p-tech-1",
          title: "Online & Devices",
          icon: "💻",
          goal: "Talk about computers, phones, and the internet.",
          words: [
            { ka: "კომპიუტერი", tr: "komputeri", en: "computer" },
            { ka: "ინტერნეტი", tr: "interneti", en: "internet" },
            { ka: "ტელეფონი", tr: "teleponi", en: "phone" },
            { ka: "პროგრამა", tr: "programa", en: "program / app" },
            { ka: "ფოტო", tr: "poto", en: "photo" },
            { ka: "მესიჯი", tr: "mesiji", en: "message" },
          ],
          phrases: [
            { ka: "ინტერნეტი არ მუშაობს", tr: "interneti ar mushaobs", en: "the internet isn't working" },
            { ka: "დამირეკე", tr: "damireke", en: "call me" },
          ],
        },
      ],
    },
    {
      id: "b2p-society",
      title: "Work & Society",
      icon: "🏛️",
      lessons: [
        {
          id: "b2p-society-1",
          title: "People & Rules",
          icon: "🏛️",
          goal: "Discuss society, rights, and problems.",
          words: [
            { ka: "საზოგადოება", tr: "sazogadoeba", en: "society" },
            { ka: "კანონი", tr: "kanoni", en: "law" },
            { ka: "უფლება", tr: "upleba", en: "right" },
            { ka: "პრობლემა", tr: "problema", en: "problem" },
            { ka: "გადაწყვეტილება", tr: "gadatsqvetileba", en: "decision" },
            { ka: "შესაძლებლობა", tr: "shesadzlebloba", en: "opportunity" },
          ],
          phrases: [
            { ka: "ეს პრობლემაა", tr: "es problemaa", en: "this is a problem" },
            { ka: "მე მაქვს უფლება", tr: "me makvs upleba", en: "I have the right" },
          ],
        },
      ],
    },
  ],
};

export default b2plus;
