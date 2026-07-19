// A2+ — Elementary plus (geofl.ge partial level between A2 and B1). Bridges
// everyday survival into more independent everyday communication.

const a2plus = {
  id: "a2plus",
  cefr: "A2+",
  band: "A",
  name: "Elementary+",
  georgian: "ელემენტარული+",
  tagline: "Get around town, talk weather, and handle transport.",
  color: "#14b8c4",
  units: [
    {
      id: "a2p-transport",
      title: "Getting Around",
      icon: "🚌",
      lessons: [
        {
          id: "a2p-transport-1",
          title: "Transport",
          icon: "🚌",
          goal: "Take the bus, the metro, and ask about stops.",
          words: [
            { ka: "ავტობუსი", tr: "avtobusi", en: "bus" },
            { ka: "მეტრო", tr: "metro", en: "metro" },
            { ka: "გაჩერება", tr: "gachereba", en: "stop (station)" },
            { ka: "ბილეთი", tr: "bileti", en: "ticket" },
            { ka: "გზა", tr: "gza", en: "road / way" },
            { ka: "მანქანა", tr: "mankana", en: "car" },
          ],
          phrases: [
            { ka: "სად არის გაჩერება?", tr: "sad aris gachereba?", en: "where is the stop?" },
            { ka: "რომელი ავტობუსი?", tr: "romeli avtobusi?", en: "which bus?" },
          ],
        },
      ],
    },
    {
      id: "a2p-weather",
      title: "Weather & Seasons",
      icon: "🌦️",
      lessons: [
        {
          id: "a2p-weather-1",
          title: "Seasons",
          icon: "🌦️",
          goal: "Describe the weather and the four seasons.",
          words: [
            { ka: "ზაფხული", tr: "zapkhuli", en: "summer" },
            { ka: "ზამთარი", tr: "zamtari", en: "winter" },
            { ka: "გაზაფხული", tr: "gazapkhuli", en: "spring" },
            { ka: "შემოდგომა", tr: "shemodgoma", en: "autumn" },
            { ka: "წვიმა", tr: "tsvima", en: "rain" },
            { ka: "თოვლი", tr: "tovli", en: "snow" },
            { ka: "მზე", tr: "mze", en: "sun" },
          ],
          phrases: [
            { ka: "დღეს ცხელა", tr: "dghes tskhela", en: "it's hot today" },
            { ka: "გარეთ ცივა", tr: "garet tsiva", en: "it's cold outside" },
          ],
        },
      ],
    },
  ],
};

export default a2plus;
