// A2 — Elementary (დამოუკიდებელი ნაბიჯები). Still "A" band but pushing into
// real conversations: routines, shopping at the market, making plans, eating out.

const a2 = {
  id: "a2",
  cefr: "A2",
  band: "A",
  name: "Elementary",
  georgian: "ელემენტარული",
  tagline: "Handle daily life: time, the market, plans, and restaurants.",
  color: "#1cb0f6",
  units: [
    {
      id: "a2-time",
      title: "Time & Routine",
      icon: "⏰",
      lessons: [
        {
          id: "a2-time-1",
          title: "Days & Parts of Day",
          icon: "🌅",
          goal: "Say today, tomorrow, and the parts of the day.",
          words: [
            { ka: "დღეს", tr: "dghes", en: "today" },
            { ka: "ხვალ", tr: "khval", en: "tomorrow" },
            { ka: "გუშინ", tr: "gushin", en: "yesterday" },
            { ka: "დილა", tr: "dila", en: "morning" },
            { ka: "საღამო", tr: "saghamo", en: "evening" },
            { ka: "ღამე", tr: "ghame", en: "night" },
            { ka: "დღე", tr: "dghe", en: "day" },
            { ka: "საათი", tr: "saati", en: "hour / clock" },
          ],
          phrases: [
            { ka: "რომელი საათია?", tr: "romeli saatia?", en: "what time is it?" },
            { ka: "ხვალ ვმუშაობ", tr: "khval vmushaob", en: "tomorrow I work" },
          ],
        },
        {
          id: "a2-time-2",
          title: "Days of the Week",
          icon: "📅",
          goal: "Name every day of the week.",
          words: [
            { ka: "ორშაბათი", tr: "orshabati", en: "Monday" },
            { ka: "სამშაბათი", tr: "samshabati", en: "Tuesday" },
            { ka: "ოთხშაბათი", tr: "otkhshabati", en: "Wednesday" },
            { ka: "ხუთშაბათი", tr: "khutshabati", en: "Thursday" },
            { ka: "პარასკევი", tr: "paraskevi", en: "Friday" },
            { ka: "შაბათი", tr: "shabati", en: "Saturday" },
            { ka: "კვირა", tr: "kvira", en: "Sunday" },
          ],
        },
      ],
    },
    {
      id: "a2-market",
      title: "Food & Market",
      icon: "🛒",
      lessons: [
        {
          id: "a2-market-1",
          title: "At the Market",
          icon: "🥕",
          goal: "Buy fruit and vegetables and ask the price.",
          words: [
            { ka: "ხილი", tr: "khili", en: "fruit" },
            { ka: "ბოსტნეული", tr: "bostneuli", en: "vegetables" },
            { ka: "ვაშლი", tr: "vashli", en: "apple" },
            { ka: "ბანანი", tr: "banani", en: "banana" },
            { ka: "პომიდორი", tr: "pomidori", en: "tomato" },
            { ka: "კარტოფილი", tr: "kartopili", en: "potato" },
            { ka: "კილო", tr: "kilo", en: "kilogram" },
          ],
          phrases: [
            { ka: "რამდენი ღირს?", tr: "ramdeni ghirs?", en: "how much does it cost?" },
            { ka: "ერთი კილო, თუ შეიძლება", tr: "erti kilo, tu sheidzleba", en: "one kilo, please" },
            { ka: "ეს ძვირია", tr: "es dzviria", en: "this is expensive" },
            { ka: "იაფია", tr: "iapia", en: "it's cheap" },
          ],
        },
        {
          id: "a2-market-2",
          title: "In the Kitchen",
          icon: "🍳",
          goal: "Name staple foods you cook with.",
          words: [
            { ka: "ხორცი", tr: "khortsi", en: "meat" },
            { ka: "ყველი", tr: "qveli", en: "cheese" },
            { ka: "რძე", tr: "rdze", en: "milk" },
            { ka: "კვერცხი", tr: "kvertskhi", en: "egg" },
            { ka: "მარილი", tr: "marili", en: "salt" },
            { ka: "შაქარი", tr: "shakari", en: "sugar" },
            { ka: "ზეთი", tr: "zeti", en: "oil" },
          ],
        },
      ],
    },
    {
      id: "a2-plans",
      title: "Making Plans",
      icon: "🗓️",
      lessons: [
        {
          id: "a2-plans-1",
          title: "Let's Go!",
          icon: "🎬",
          goal: "Invite someone and say what you want to do.",
          words: [
            { ka: "მინდა", tr: "minda", en: "I want" },
            { ka: "შემიძლია", tr: "shemidzlia", en: "I can" },
            { ka: "წავიდეთ", tr: "tsavidet", en: "let's go" },
            { ka: "დრო", tr: "dro", en: "time" },
            { ka: "კინო", tr: "kino", en: "cinema" },
            { ka: "თავისუფალი", tr: "tavisupali", en: "free (available)" },
          ],
          phrases: [
            { ka: "წავიდეთ კინოში?", tr: "tsavidet kinoshi?", en: "shall we go to the cinema?" },
            { ka: "მინდა ყავა", tr: "minda qava", en: "I want coffee" },
            { ka: "ხვალ თავისუფალი ხარ?", tr: "khval tavisupali khar?", en: "are you free tomorrow?" },
          ],
        },
      ],
    },
    {
      id: "a2-restaurant",
      title: "At the Restaurant",
      icon: "🍽️",
      lessons: [
        {
          id: "a2-restaurant-1",
          title: "A Table for Two",
          icon: "🍽️",
          goal: "Reserve a table and order a meal.",
          words: [
            { ka: "რესტორანი", tr: "restorani", en: "restaurant" },
            { ka: "მაგიდა", tr: "magida", en: "table" },
            { ka: "კერძი", tr: "kerdzi", en: "dish" },
            { ka: "სუპი", tr: "supi", en: "soup" },
            { ka: "სალათი", tr: "salati", en: "salad" },
            { ka: "დესერტი", tr: "deserti", en: "dessert" },
          ],
          phrases: [
            { ka: "მაგიდა ორისთვის", tr: "magida oristvis", en: "a table for two" },
            { ka: "მენიუ, თუ შეიძლება", tr: "meniu, tu sheidzleba", en: "the menu, please" },
            { ka: "გემრიელი იყო", tr: "gemrieli iqo", en: "it was delicious" },
          ],
          dialogue: [
            { who: "Host", ka: "მაგიდა რამდენ კაცზე?", tr: "magida ramden katsze?", en: "A table for how many?" },
            { who: "You", ka: "ორისთვის, თუ შეიძლება.", tr: "oristvis, tu sheidzleba.", en: "For two, please." },
            { who: "Host", ka: "გამომყევით.", tr: "gamomqevit.", en: "Follow me." },
          ],
        },
      ],
    },
    {
      id: "a2-school",
      title: "School & Learning",
      icon: "🏫",
      lessons: [
        {
          id: "a2-school-1",
          title: "At School",
          icon: "🏫",
          goal: "Talk about school, lessons, and study things.",
          words: [
            { ka: "სკოლა", tr: "skola", en: "school" },
            { ka: "მოსწავლე", tr: "mostsavle", en: "pupil" },
            { ka: "გაკვეთილი", tr: "gaktsetili", en: "lesson" },
            { ka: "დაფა", tr: "dapa", en: "board" },
            { ka: "კალამი", tr: "kalami", en: "pen" },
            { ka: "რვეული", tr: "rveuli", en: "notebook" },
          ],
          phrases: [
            { ka: "მე ვსწავლობ", tr: "me vstsavlob", en: "I study / I'm learning" },
            { ka: "გაკვეთილი დაიწყო", tr: "gaktsetili daitsqo", en: "the lesson started" },
          ],
        },
      ],
    },
    {
      id: "a2-shopping",
      title: "Shopping",
      icon: "🛍️",
      lessons: [
        {
          id: "a2-shopping-1",
          title: "At the Shop",
          icon: "🛍️",
          goal: "Buy things, ask the price, and pay.",
          words: [
            { ka: "მაღაზია", tr: "maghazia", en: "shop" },
            { ka: "ბაზარი", tr: "bazari", en: "market" },
            { ka: "ფული", tr: "puli", en: "money" },
            { ka: "ფასი", tr: "pasi", en: "price" },
            { ka: "ჩანთა", tr: "chanta", en: "bag" },
            { ka: "ლარი", tr: "lari", en: "lari (currency)" },
          ],
          phrases: [
            { ka: "რა ღირს?", tr: "ra ghirs?", en: "how much is it?" },
            { ka: "ეს მინდა", tr: "es minda", en: "I want this" },
          ],
        },
      ],
    },
    {
      id: "a2-kids",
      title: "Kids & Play",
      icon: "🧸",
      lessons: [
        {
          id: "a2-kids-1",
          title: "Toys & Games",
          icon: "🧸",
          goal: "Words for toys, games, and playing.",
          words: [
            { ka: "სათამაშო", tr: "satamasho", en: "toy" },
            { ka: "თოჯინა", tr: "tojina", en: "doll" },
            { ka: "ბურთი", tr: "burti", en: "ball" },
            { ka: "თამაში", tr: "tamashi", en: "game" },
            { ka: "ბავშვი", tr: "bavshvi", en: "kid" },
            { ka: "სათამაშო მოედანი", tr: "satamasho moedani", en: "playground" },
          ],
          phrases: [
            { ka: "მოდი ვითამაშოთ", tr: "modi vitamashot", en: "let's play" },
            { ka: "ეს ჩემი ბურთია", tr: "es chemi burtia", en: "this is my ball" },
          ],
        },
      ],
    },
  ],
};

export default a2;
