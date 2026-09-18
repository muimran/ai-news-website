/* UI strings. Content strings live in the markdown; these are the chrome.
   Bangla here is written, not machine-translated — a half-translated interface
   around translated journalism undercuts the journalism. */

const en = {
  htmlLang: 'en',
  dir: 'ltr',
  tagline: 'AI, reported from wherever it lands.',
  otherLangName: 'বাংলা',
  switchTo: 'Read in Bangla',

  nav: {
    latest: 'Latest',
    investigations: 'Investigations',
    ideas: 'Ideas',
    people: 'People',
    tools: 'Tools',
    about: 'About'
  },

  home: 'Ground Truth — home',
  search: 'Search',
  searchStories: 'Search stories',
  searchPlaceholder: 'Headlines, reporters, places, topics…',
  searching: 'Searching…',
  clearAll: 'Clear all',
  filterByTopic: 'Filter by topic',
  resultsOne: 'story',
  resultsMany: 'stories',
  emptyHead: 'Nothing matches that yet.',
  emptyBody:
    "Try a broader term, or clear the topic filters. Our archive goes back to the newsroom's first dispatch.",
  resetSearch: 'Reset search',

  newsletter: 'Newsletter',
  darkMode: 'Dark mode',
  lightMode: 'Light mode',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  skipToMain: 'Skip to main content',

  justIn: 'Just in',
  allStories: 'All stories →',
  memberKicker: 'Member supported',
  memberLine: 'No owner. No advertiser. No algorithmic landlord deciding who reads this.',
  memberCta: 'Become a member →',

  radarKicker: "Editor's radar",
  radarTitle: 'What the newsroom is watching',
  radarFilter: 'Filter the radar',
  radarRegion: 'Radar stories — use left and right arrow keys to scroll',
  radarLeft: 'Scroll radar left',
  radarRight: 'Scroll radar right',
  radarEmpty: 'Nothing filed under that yet this cycle. Try',

  nlKicker: 'The dispatch — twice weekly, free',
  nlHead: "AI is changing the world. We'll help you see how.",
  nlSub:
    "Original reporting from nine bureaus, a plain-language read on the week's research, and the stories the trade press keeps missing. No hype, no doom, no press-release rewrites.",
  nlEmail: 'Email address',
  nlSignUp: 'Sign up',
  nlWorking: 'Signing up…',
  nlDone: 'Signed up',
  nlRest: 'We never sell your address. One click unsubscribes.',
  nlBad: 'That address looks incomplete. Check it and try again.',
  nlOk: 'You are on the list. The next dispatch goes out Thursday.',
  nlFail: 'We could not reach the server. Try again in a moment.',

  ftCoverage: 'Our coverage',
  ftNewsroom: 'The newsroom',
  ftFollow: 'Follow',
  ftLegal: 'Legal',
  ftBlurb:
    'A nonprofit newsroom with bureaus in nine countries, reporting on artificial intelligence and the people it reaches first.',
  ftDispatch: 'Get the dispatch →',
  ftRights: '© {year} Ground Truth — independent, reader funded',
  ftColophon: 'Set in Archivo, Newsreader and DM Mono. Artwork generated per story.',

  filedUnder: 'Filed under',
  moreFrom: 'More from',
  minRead: 'min',
  readTime: 'min read',
  watchTime: 'min watch',
  playLabel: 'Watch',
  breadcrumbTopic: 'Topic',
  inArchive: 'in the archive',
  noStoriesHead: 'Nothing filed here yet.',
  noStoriesBody: 'This topic exists in our taxonomy but has no published stories. Try the',
  frontPage: 'front page',

  err404: 'That page is not in the archive.',
  errOther: 'Something went wrong.',
  errBody:
    'The link may be mistyped, or the story may have moved. The front page has everything we have published.',
  errBack: 'Back to the front page →',

  noTranslation: "This story isn't available in Bangla — here's today's Bangla front page.",

  sectionBlurbs: {
    'The AI Race': 'Who is building the frontier, what it costs, and who is paying.',
    'AI & Everyday Life':
      'The systems people actually meet — at the clinic, the bank, the front door.',
    'Work After Automation': 'Not whether jobs vanish. What happens to the ones that stay.',
    'Machines and Power': 'Surveillance, procurement, elections, and the contracts behind them.',
    'AI in the Global South':
      'Reporting from the places the industry treats as a market, not a constituency.',
    'The Human Dataset': 'Where training data comes from, and who was never asked.',
    'Climate, Chips & Infrastructure': 'The physical cost: land, water, silicon, electricity.',
    'Culture, Media & Synthetic Reality':
      'What happens to a shared record when anything can be produced.',
    'Open Source and the Commons':
      'The shared infrastructure everything runs on, and nobody funds.'
  }
};

const bn = {
  htmlLang: 'bn',
  dir: 'ltr',
  tagline: 'এআই যেখানেই পৌঁছায়, সেখান থেকেই প্রতিবেদন।',
  otherLangName: 'English',
  switchTo: 'ইংরেজিতে পড়ুন',

  nav: {
    latest: 'সর্বশেষ',
    investigations: 'অনুসন্ধান',
    ideas: 'মতামত',
    people: 'মানুষ',
    tools: 'সরঞ্জাম',
    about: 'আমাদের কথা'
  },

  home: 'গ্রাউন্ড ট্রুথ — প্রচ্ছদ',
  search: 'খুঁজুন',
  searchStories: 'প্রতিবেদন খুঁজুন',
  searchPlaceholder: 'শিরোনাম, প্রতিবেদক, স্থান, বিষয়…',
  searching: 'খোঁজা হচ্ছে…',
  clearAll: 'সব মুছুন',
  filterByTopic: 'বিষয় অনুযায়ী ছাঁকুন',
  resultsOne: 'প্রতিবেদন',
  resultsMany: 'প্রতিবেদন',
  emptyHead: 'এখনো কিছু মেলেনি।',
  emptyBody:
    'আরেকটু সাধারণ শব্দ দিয়ে দেখুন, কিংবা বিষয়ের ছাঁকনি সরিয়ে দিন। আমাদের সংগ্রহে প্রথম প্রতিবেদন থেকে সবই আছে।',
  resetSearch: 'আবার শুরু করুন',

  newsletter: 'নিউজলেটার',
  darkMode: 'অন্ধকার মোড',
  lightMode: 'আলো মোড',
  openMenu: 'মেনু খুলুন',
  closeMenu: 'মেনু বন্ধ করুন',
  skipToMain: 'মূল অংশে যান',

  justIn: 'এইমাত্র',
  allStories: 'সব প্রতিবেদন →',
  memberKicker: 'পাঠকের সহায়তায়',
  memberLine: 'কোনো মালিক নেই। কোনো বিজ্ঞাপনদাতা নেই। কে পড়বে, তা ঠিক করার কোনো অ্যালগরিদম নেই।',
  memberCta: 'সদস্য হোন →',

  radarKicker: 'সম্পাদকের নজরে',
  radarTitle: 'সম্পাদকীয় বিভাগ যা দেখছে',
  radarFilter: 'নজর ছাঁকুন',
  radarRegion: 'নজরে থাকা প্রতিবেদন — ডান-বাঁ তিরচিহ্ন দিয়ে সরান',
  radarLeft: 'বাঁ দিকে সরান',
  radarRight: 'ডান দিকে সরান',
  radarEmpty: 'এই বিভাগে এখনো কিছু আসেনি। দেখুন',

  nlKicker: 'ডিসপ্যাচ — সপ্তাহে দুবার, বিনামূল্যে',
  nlHead: 'এআই বদলে দিচ্ছে পৃথিবী। আমরা দেখাব কীভাবে।',
  nlSub:
    'নয়টি ব্যুরোর নিজস্ব প্রতিবেদন, সপ্তাহের গবেষণার সহজ ব্যাখ্যা, আর যে খবরগুলো বাণিজ্যিক সংবাদমাধ্যম এড়িয়ে যায়। অতিকথন নেই, আতঙ্ক নেই, বিজ্ঞপ্তি নকল করা নেই।',
  nlEmail: 'ইমেইল ঠিকানা',
  nlSignUp: 'যোগ দিন',
  nlWorking: 'যোগ করা হচ্ছে…',
  nlDone: 'যুক্ত হয়েছেন',
  nlRest: 'আমরা কখনো আপনার ঠিকানা বিক্রি করি না। এক ক্লিকেই বেরিয়ে যেতে পারবেন।',
  nlBad: 'ঠিকানাটি অসম্পূর্ণ মনে হচ্ছে। দেখে আবার দিন।',
  nlOk: 'আপনি তালিকায় আছেন। পরের ডিসপ্যাচ যাবে বৃহস্পতিবার।',
  nlFail: 'সার্ভারে পৌঁছানো যায়নি। একটু পরে আবার চেষ্টা করুন।',

  ftCoverage: 'আমাদের বিষয়',
  ftNewsroom: 'সম্পাদকীয় বিভাগ',
  ftFollow: 'অনুসরণ',
  ftLegal: 'আইনি',
  ftBlurb:
    'নয়টি দেশে ব্যুরোসহ একটি অলাভজনক সংবাদমাধ্যম, যা কৃত্রিম বুদ্ধিমত্তা আর সবার আগে যাঁদের কাছে তা পৌঁছায় তাঁদের নিয়ে কাজ করে।',
  ftDispatch: 'ডিসপ্যাচ নিন →',
  ftRights: '© {year} গ্রাউন্ড ট্রুথ — স্বাধীন, পাঠকের অর্থে পরিচালিত',
  ftColophon: 'বাংলা অক্ষরে Baloo Da 2 ও Tiro Bangla। প্রতিটি প্রতিবেদনের ছবি আলাদাভাবে তৈরি।',

  filedUnder: 'বিষয়',
  moreFrom: 'আরও পড়ুন',
  minRead: 'মিনিট',
  readTime: 'মিনিটের পাঠ',
  watchTime: 'মিনিটের ভিডিও',
  playLabel: 'দেখুন',
  breadcrumbTopic: 'বিষয়',
  inArchive: 'সংগ্রহে আছে',
  noStoriesHead: 'এখানে এখনো কিছু নেই।',
  noStoriesBody: 'বিষয়টি আমাদের তালিকায় আছে, কিন্তু এখনো কোনো প্রতিবেদন প্রকাশ হয়নি। দেখুন',
  frontPage: 'প্রচ্ছদ',

  err404: 'পাতাটি সংগ্রহে নেই।',
  errOther: 'কিছু একটা ভুল হয়েছে।',
  errBody:
    'ঠিকানাটি ভুল হতে পারে, কিংবা প্রতিবেদনটি সরে গেছে। প্রচ্ছদে আমাদের প্রকাশিত সব লেখা পাবেন।',
  errBack: 'প্রচ্ছদে ফিরুন →',

  noTranslation: 'এই প্রতিবেদনটি ইংরেজিতে নেই — আজকের ইংরেজি প্রচ্ছদ দেখুন।',

  sectionBlurbs: {
    'The AI Race': 'সীমান্ত কারা গড়ছে, খরচ কত, আর দিচ্ছে কে।',
    'AI & Everyday Life': 'যে ব্যবস্থাগুলোর সঙ্গে মানুষের সত্যিই দেখা হয় — ক্লিনিকে, ব্যাংকে, দরজায়।',
    'Work After Automation': 'চাকরি থাকবে কি না, সেটা নয়। যেগুলো থাকে, তাদের কী হয়।',
    'Machines and Power': 'নজরদারি, কেনাকাটা, নির্বাচন — আর এর পেছনের চুক্তিগুলো।',
    'AI in the Global South': 'শিল্প যেসব জায়গাকে বাজার মনে করে, নাগরিক নয় — সেখান থেকে।',
    'The Human Dataset': 'প্রশিক্ষণের তথ্য আসে কোথা থেকে, আর কাকে জিজ্ঞেস করা হয়নি।',
    'Climate, Chips & Infrastructure': 'বাস্তব খরচ — জমি, পানি, সিলিকন, বিদ্যুৎ।',
    'Culture, Media & Synthetic Reality': 'যেকোনো কিছু বানানো গেলে সবার জানা রেকর্ডের কী হয়।',
    'Open Source and the Commons': 'যে সাধারণ অবকাঠামোয় সব চলে, অথচ কেউ অর্থ দেয় না।'
  }
};

const DICT = { en, bn };

export const t = (lang) => DICT[lang] || DICT.en;
