// B1 — Independent (თავისუფალი მოსაუბრე). "B" band: hold your own in
// conversations about work, travel, health, and opinions.

const b1 = {
  id: "b1",
  cefr: "B1",
  band: "B",
  name: "Independent",
  georgian: "დამოუკიდებელი",
  tagline: "Talk about work, travel, health, and what you think.",
  color: "#ce82ff",
  units: [
    {
      id: "b1-work",
      title: "Work & Study",
      icon: "💼",
      lessons: [
        {
          id: "b1-work-1",
          title: "What Do You Do?",
          icon: "💼",
          goal: "Talk about your job, studies, and profession.",
          words: [
            { ka: "სამსახური", tr: "samsakhuri", en: "job / work" },
            { ka: "პროფესია", tr: "propesia", en: "profession" },
            { ka: "უნივერსიტეტი", tr: "universiteti", en: "university" },
            { ka: "ოფისი", tr: "opisi", en: "office" },
            { ka: "ექიმი", tr: "ekimi", en: "doctor" },
            { ka: "მასწავლებელი", tr: "mastsavlebeli", en: "teacher" },
            { ka: "სტუდენტი", tr: "studenti", en: "student" },
            { ka: "ინჟინერი", tr: "inzhineri", en: "engineer" },
          ],
          phrases: [
            { ka: "სად მუშაობ?", tr: "sad mushaob?", en: "where do you work?" },
            { ka: "მე ვარ ექიმი", tr: "me var ekimi", en: "I am a doctor" },
            { ka: "რას სწავლობ?", tr: "ras stsavlob?", en: "what do you study?" },
          ],
        },
      ],
    },
    {
      id: "b1-travel",
      title: "Travel & Reservations",
      icon: "✈️",
      lessons: [
        {
          id: "b1-travel-1",
          title: "Booking a Trip",
          icon: "✈️",
          goal: "Buy tickets and reserve a room.",
          words: [
            { ka: "მოგზაურობა", tr: "mogzauroba", en: "travel" },
            { ka: "ბილეთი", tr: "bileti", en: "ticket" },
            { ka: "მატარებელი", tr: "matarebeli", en: "train" },
            { ka: "თვითმფრინავი", tr: "tvitmprinavi", en: "airplane" },
            { ka: "ჯავშანი", tr: "javshani", en: "reservation" },
            { ka: "ოთახი", tr: "otakhi", en: "room" },
            { ka: "პასპორტი", tr: "pasporti", en: "passport" },
          ],
          phrases: [
            { ka: "ერთი ბილეთი თბილისამდე", tr: "erti bileti tbilisamde", en: "one ticket to Tbilisi" },
            { ka: "ოთახი მაქვს დაჯავშნილი", tr: "otakhi makvs dajavshnili", en: "I have a room reserved" },
            { ka: "როდის გადის მატარებელი?", tr: "rodis gadis matarebeli?", en: "when does the train leave?" },
          ],
        },
      ],
    },
    {
      id: "b1-health",
      title: "Health",
      icon: "🩺",
      lessons: [
        {
          id: "b1-health-1",
          title: "At the Doctor",
          icon: "🩺",
          goal: "Say how you feel and find a pharmacy.",
          words: [
            { ka: "ექიმი", tr: "ekimi", en: "doctor" },
            { ka: "აფთიაქი", tr: "aptiaki", en: "pharmacy" },
            { ka: "ტკივილი", tr: "tkivili", en: "pain" },
            { ka: "თავი", tr: "tavi", en: "head" },
            { ka: "მუცელი", tr: "mutseli", en: "stomach" },
            { ka: "ცხელება", tr: "tskheleba", en: "fever" },
            { ka: "წამალი", tr: "tsamali", en: "medicine" },
          ],
          phrases: [
            { ka: "თავი მტკივა", tr: "tavi mtkiva", en: "I have a headache" },
            { ka: "ცუდად ვარ", tr: "tsudad var", en: "I feel bad" },
            { ka: "სად არის აფთიაქი?", tr: "sad aris aptiaki?", en: "where is the pharmacy?" },
          ],
        },
      ],
    },
    {
      id: "b1-opinions",
      title: "Opinions & Stories",
      icon: "💬",
      lessons: [
        {
          id: "b1-opinions-1",
          title: "What Do You Think?",
          icon: "💬",
          goal: "Share what you like and what you think.",
          words: [
            { ka: "მიყვარს", tr: "miqvars", en: "I love / like" },
            { ka: "ვფიქრობ", tr: "vpikrob", en: "I think" },
            { ka: "მიხარია", tr: "mikharia", en: "I'm glad" },
            { ka: "საინტერესო", tr: "saintereso", en: "interesting" },
            { ka: "მშვენიერი", tr: "mshvenieri", en: "wonderful" },
            { ka: "ალბათ", tr: "albat", en: "maybe / probably" },
          ],
          phrases: [
            { ka: "ეს ძალიან საინტერესოა", tr: "es dzalian sainteresoa", en: "this is very interesting" },
            { ka: "მიყვარს საქართველო", tr: "miqvars sakartvelo", en: "I love Georgia" },
            { ka: "რას ფიქრობ?", tr: "ras pikrob?", en: "what do you think?" },
          ],
        },
      ],
    },
  ],
};

export default b1;
