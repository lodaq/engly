export const skills = [
  {
    id: "reading",
    name: "Reading",
    subtitle: "A new perspective, one story at a time.",
    color: "peach",
    minutes: 8,
    icon: "BookOpen",
  },
  {
    id: "writing",
    name: "Writing",
    subtitle: "Find the words. Make them yours.",
    color: "lavender",
    minutes: 8,
    icon: "PenLine",
  },
  {
    id: "listening",
    name: "Listening",
    subtitle: "Tune in to the world around you.",
    color: "mint",
    minutes: 5,
    icon: "Headphones",
  },
  {
    id: "speaking",
    name: "Speaking",
    subtitle: "A safe space to speak your mind.",
    color: "butter",
    minutes: 4,
    icon: "Mic",
  },
];
const q = (level, skill, prompt, options, answer, explanation) => ({
  level,
  skill,
  prompt,
  options,
  answer,
  explanation,
});
export const questionBank = [
  q(
    "A1",
    "grammar",
    "She ___ a teacher.",
    ["am", "is", "are", "be"],
    1,
    "Use “is” with she, he, or it.",
  ),
  q(
    "A1",
    "grammar",
    "My brother ___ coffee every morning.",
    ["drink", "drinks", "drinking", "to drink"],
    1,
    "Add -s to present simple verbs with he or she.",
  ),
  q(
    "A1",
    "vocabulary",
    "Which word means the opposite of “expensive”?",
    ["Small", "Cheap", "Heavy", "Early"],
    1,
    "Cheap means something does not cost much.",
  ),
  q(
    "A1",
    "vocabulary",
    "We buy bread at the ___.",
    ["library", "bakery", "airport", "hospital"],
    1,
    "A bakery makes and sells bread.",
  ),
  q(
    "A2",
    "grammar",
    "We ___ to Alexandria last weekend.",
    ["go", "have go", "went", "going"],
    2,
    "“Went” is the past simple form of “go.”",
  ),
  q(
    "A2",
    "grammar",
    "There isn’t ___ milk in the fridge.",
    ["many", "some", "a", "any"],
    3,
    "Use “any” in most negative sentences with uncountable nouns.",
  ),
  q(
    "A2",
    "vocabulary",
    "“Could you give me a hand?” means ___.",
    ["Can you help me?", "Can you wave?", "Can you leave?", "Can you draw?"],
    0,
    "To give someone a hand means to help them.",
  ),
  q(
    "A2",
    "vocabulary",
    "A person who is “reliable” ___.",
    ["is always late", "can be trusted", "is very tired", "talks loudly"],
    1,
    "A reliable person does what they promise.",
  ),
  q(
    "B1",
    "grammar",
    "If it rains tomorrow, we ___ at home.",
    ["would stay", "stayed", "will stay", "had stayed"],
    2,
    "The first conditional uses if + present simple, then will + verb.",
  ),
  q(
    "B1",
    "grammar",
    "I have lived here ___ 2020.",
    ["for", "since", "during", "from"],
    1,
    "Use “since” with a starting point in time.",
  ),
  q(
    "B1",
    "vocabulary",
    "We need to “put off” the meeting. We need to ___.",
    ["cancel it forever", "postpone it", "attend it", "finish it"],
    1,
    "Put off means to postpone until a later time.",
  ),
  q(
    "B1",
    "vocabulary",
    "Choose the natural phrase: “I need to ___ a decision.”",
    ["do", "take up", "make", "have up"],
    2,
    "In English, we usually say “make a decision.”",
  ),
  q(
    "B2",
    "grammar",
    "By the time we arrived, the film ___.",
    ["has started", "had started", "starts", "was start"],
    1,
    "The past perfect describes an event before another past event.",
  ),
  q(
    "B2",
    "grammar",
    "I wish I ___ more time to travel.",
    ["have", "will have", "had", "am having"],
    2,
    "Use the past simple after “I wish” for an unreal present situation.",
  ),
  q(
    "B2",
    "vocabulary",
    "The proposal is “feasible.” It is ___.",
    [
      "possible to carry out",
      "too expensive",
      "already completed",
      "difficult to explain",
    ],
    0,
    "Feasible means practical and possible to achieve.",
  ),
  q(
    "B2",
    "vocabulary",
    "“Despite the setback, she persevered.” She ___.",
    ["gave up", "kept trying", "changed jobs", "felt relieved"],
    1,
    "Persevere means to continue despite difficulties.",
  ),
  q(
    "C1",
    "grammar",
    "Not only ___ the deadline, but she also exceeded expectations.",
    ["she met", "did she meet", "she had met", "has met she"],
    1,
    "Negative fronted expressions such as “not only” require subject-auxiliary inversion.",
  ),
  q(
    "C1",
    "grammar",
    "Had I known about the delay, I ___ earlier.",
    ["would leave", "will have left", "would have left", "had left"],
    2,
    "This inverted third conditional describes an unreal past result.",
  ),
  q(
    "C1",
    "vocabulary",
    "A “nuanced” argument ___.",
    [
      "ignores details",
      "has subtle distinctions",
      "is very short",
      "is completely certain",
    ],
    1,
    "Nuanced arguments consider subtle differences and complexity.",
  ),
  q(
    "C1",
    "vocabulary",
    "The results “corroborate” her theory. They ___.",
    [
      "contradict it",
      "make it simpler",
      "provide supporting evidence",
      "replace it",
    ],
    2,
    "Corroborate means to confirm with additional evidence.",
  ),
  q(
    "B1",
    "reading",
    "Maya cycles to work. Although driving is quicker, she values the time outdoors. Why does Maya cycle?",
    [
      "It is faster",
      "She enjoys being outside",
      "Her car is broken",
      "Her job requires it",
    ],
    1,
    "The passage says she values her time outdoors, even though driving is quicker.",
  ),
  q(
    "B2",
    "reading",
    "A trial of a four-day week maintained output while reducing reported stress. Researchers cautioned that the sample was small. What is the best conclusion?",
    [
      "It works for every company",
      "There were no benefits",
      "The early results are promising but limited",
      "Employees worked longer hours",
    ],
    2,
    "The results are encouraging, but a small sample limits general conclusions.",
  ),
  q(
    "B1",
    "reading",
    "Omar booked an early train to avoid the rush. A signal fault delayed it, so he called his colleague. What disrupted his plan?",
    [
      "Heavy traffic",
      "A technical problem",
      "A missed booking",
      "A colleague’s call",
    ],
    1,
    "A signal fault is a technical problem that delayed the train.",
  ),
  q(
    "B2",
    "reading",
    "A library removed late fees. Returns increased, though seasonal changes may also explain the result. What remains uncertain?",
    [
      "Whether the library exists",
      "Whether the policy caused the increase",
      "Whether books were returned",
      "Whether fees were removed",
    ],
    1,
    "Seasonal changes are another possible cause, so causation is uncertain.",
  ),
];
export const writingPrompts = {
  A1: "Write a short message to a new classmate. Introduce yourself, say where you live, and mention one thing you enjoy. Aim for 30–50 words.",
  A2: "Write an email to a friend inviting them to your city. Suggest two activities and explain when you are free. Aim for 50–80 words.",
  B1: "Write an email to your manager asking to work from home for one day next week. Explain your reason and how you will stay available. Aim for 80–120 words.",
  B2: "Write a proposal to your team suggesting a four-day workweek trial. Explain the benefits, acknowledge one concern, and suggest how to measure success. Aim for 120–180 words.",
  C1: "Write a persuasive proposal for a company-wide mentorship programme. Weigh competing priorities, anticipate objections, and propose measurable outcomes. Aim for 180–250 words.",
  C2: "Write a concise editorial evaluating the claim that AI makes language learning obsolete. Address a strong counterargument and distinguish practical utility from cultural understanding. Aim for 200–300 words.",
};
export const writingDiagnostic =
  "Some people prefer to learn alone; others learn best with a group. Which do you prefer, and why? Give an example and consider the other point of view. Write at least 40 words.";
// shortcut: built-in lessons repeat at each level; connect Gemini for fresh, personalised practice.
export function localLesson(skill, level = "B1") {
  const beginner = ["A1", "A2"].includes(level);
  const advanced = ["C1", "C2"].includes(level);
  if (skill === "writing")
    return {
      title: "Words that work",
      prompt: writingPrompts[level],
      tip: "Start with your purpose. Add the details your reader needs. End with a clear next step.",
    };
  if (skill === "speaking")
    return {
      title: "A little conversation in London",
      prompt: beginner
        ? "You are at a café in London. Say hello, order tea, and ask for the bill. Try three short sentences."
        : advanced
          ? "Roleplay a conversation with a café owner about reducing single-use packaging. Weigh cost against sustainability, respond to a likely objection, then ask for an itemised receipt."
          : "You have just finished your tea at a café in London. Ask the waiter for the bill, then ask for a receipt for your expenses. Explain the difference in your own words.",
      tip: "The bill tells you what you owe. A receipt confirms that you have paid. Speak naturally; mistakes are welcome.",
    };
  if (skill === "listening")
    return {
      title: "A change of plans",
      text: beginner
        ? "Hi Sam. Our lunch is now at one o’clock, not twelve. Meet me at the café near the station. Please bring your notebook. See you soon!"
        : advanced
          ? "Following feedback from our remote colleagues, Thursday’s design review has been rescheduled from noon to half past two. Rather than revisiting the entire proposal, we will concentrate on accessibility concerns raised during the pilot. Please circulate your observations beforehand so that we can make an informed decision within the allotted forty-five minutes."
          : "Hi Sam, it’s Alex. A quick update about tomorrow: our team lunch has moved from twelve to one thirty because the morning meeting is running longer than expected. We are still meeting at the little café opposite the station. Could you bring your notes about the new project? We will talk about them over lunch. Let me know if the new time works for you.",
      question:
        "What changed, why did it change, and what should the listener bring or prepare?",
      tip: "Listen once for the main idea. Listen again for times, places, and the action the speaker asks for.",
    };
  return beginner
    ? {
        title: "A small habit, a big difference",
        text: "Every morning, Lina walks to a small park near her home. She leaves her phone in her bag and looks at the trees. At first, it is difficult to find time. Now, this simple habit helps her feel calm. She meets a neighbour in the park, and they sometimes walk together. Lina learns that a small change can make a good day even better.",
        words: [
          {
            word: "habit",
            definition: "Something you do regularly.",
            arabic: "عادة",
            example: "Reading before bed is a good habit.",
          },
          {
            word: "calm",
            definition: "Relaxed and not worried.",
            arabic: "هادئ",
            example: "I feel calm after a short walk.",
          },
          {
            word: "neighbour",
            definition: "Someone who lives near you.",
            arabic: "جار",
            example: "My neighbour has a friendly dog.",
          },
        ],
        questions: [
          {
            prompt: "What does Lina leave in her bag?",
            options: ["Her book", "Her phone", "Her lunch"],
            answer: 1,
            explanation: "Lina leaves her phone in her bag.",
          },
          {
            prompt: "How does walking help her?",
            options: [
              "She feels calm",
              "She earns money",
              "She learns to drive",
            ],
            answer: 0,
            explanation: "The habit helps Lina feel calm.",
          },
        ],
      }
    : advanced
      ? {
          title: "The quiet value of doing less",
          text: "In a culture that equates visibility with productivity, deliberate idleness can seem counterintuitive. Yet researchers increasingly distinguish between aimless distraction and restorative downtime. The latter allows the mind to consolidate information and form unexpected connections. One design studio instituted a weekly afternoon without meetings or predetermined deliverables. Initially, employees were apprehensive; without tangible output, how could they justify their time? Over several months, however, proposals became more inventive and collaboration less perfunctory. These observations are suggestive rather than conclusive: the studio had no control group, and novelty may have influenced behaviour. Nevertheless, the experiment challenges an entrenched assumption that every useful hour must produce an immediately measurable result.",
          words: [
            {
              word: "counterintuitive",
              definition: "Contrary to what you would naturally expect.",
              arabic: "مخالف للتوقعات",
              example:
                "Doing less can, counterintuitively, help us achieve more.",
            },
            {
              word: "restorative",
              definition: "Helping to restore energy or well-being.",
              arabic: "مُجدِّد للنشاط",
              example: "A restorative break improved her concentration.",
            },
            {
              word: "entrenched",
              definition: "Firmly established and difficult to change.",
              arabic: "راسخ",
              example: "The policy challenged entrenched working habits.",
            },
          ],
          questions: [
            {
              prompt: "Why should the findings be interpreted cautiously?",
              options: [
                "No employees participated",
                "There was no control group and novelty may have mattered",
                "Productivity was never discussed",
              ],
              answer: 1,
              explanation:
                "The passage explicitly identifies both limitations.",
            },
            {
              prompt: "What assumption does the experiment challenge?",
              options: [
                "All useful work must yield immediate measurable output",
                "Meetings are always helpful",
                "Design requires collaboration",
              ],
              answer: 0,
              explanation:
                "The final sentence questions the need for immediately measurable results.",
            },
          ],
        }
      : {
          title: "The unexpected power of a small hello",
          text: "When Youssef moved to a new city, the hardest part was not finding his way around. It was feeling like a stranger in a place full of people. Every morning, he bought coffee from the same little shop. For the first week, he simply smiled and left. Then one day, he asked the barista about the book she was reading. That brief conversation became a daily ritual. Soon, she introduced him to a neighbour who organised weekend walks. Youssef began to realise that belonging rarely arrives in one dramatic moment. Instead, it grows through small, consistent efforts: remembering a name, asking a thoughtful question, or showing up again. His city had not changed, but his connection to it had.",
          words: [
            {
              word: "ritual",
              definition:
                "An activity you do regularly, often with a special meaning.",
              arabic: "طقس أو عادة منتظمة",
              example: "Our Sunday walk has become a family ritual.",
            },
            {
              word: "belonging",
              definition:
                "The feeling of being accepted as part of a group or place.",
              arabic: "الشعور بالانتماء",
              example: "The friendly team gave her a sense of belonging.",
            },
            {
              word: "consistent",
              definition: "Happening regularly in a similar way over time.",
              arabic: "منتظم أو ثابت",
              example: "Consistent practice builds confidence.",
            },
          ],
          questions: [
            {
              prompt: "What was hardest for Youssef?",
              options: [
                "Finding a coffee shop",
                "Feeling disconnected from people",
                "Understanding the language",
              ],
              answer: 1,
              explanation: "He felt like a stranger in a place full of people.",
            },
            {
              prompt: "What helped him feel he belonged?",
              options: [
                "One dramatic event",
                "Moving again",
                "Small, repeated connections",
              ],
              answer: 2,
              explanation: "Belonging grew through small, consistent efforts.",
            },
          ],
        };
}
