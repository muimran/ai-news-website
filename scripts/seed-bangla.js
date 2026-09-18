/* Seeds the Bangla desk in content/articles/bn.
   Run once:  node scripts/seed-bangla.js

   Slugs are transliterated Latin rather than percent-encoded Bengali. Bengali
   slugs help Bangla search marginally, but they become unreadable 200-character
   URLs once encoded, which matters more here: most sharing happens through
   WhatsApp and Facebook, where a mangled URL looks like spam. */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'content/articles/bn');
mkdirSync(outDir, { recursive: true });

const A = {
  tanvir: ['তানভীর হোসেন', 'প্রযুক্তি প্রতিবেদক', 'ঢাকা'],
  nusrat: ['নুসরাত জাহান', 'অনুসন্ধান সম্পাদক', 'ঢাকা'],
  rafid: ['রাফিদ আহমেদ', 'শ্রম ও প্রযুক্তি প্রতিবেদক', 'চট্টগ্রাম'],
  sadia: ['সাদিয়া রহমান', 'বিশেষ প্রতিনিধি', 'সিলেট'],
  imrul: ['ইমরুল কায়েস', 'অবকাঠামো প্রতিবেদক', 'খুলনা'],
  desk: ['গ্রাউন্ড ট্রুথ ডেস্ক', 'সম্পাদকীয় বিভাগ', 'ঢাকা']
};

/* [slug, title, dek, section, authorKey, kind, tags, date, readTime, weight,
    flags, translationOf] */
const stories = [
  [
    'dhakar-ridarra-je-thikanar-manchitra-baniyeche',
    'ঢাকার রাইডাররা যে ঠিকানার মানচিত্র বানিয়েছে',
    'রাষ্ট্র যেখানে শহরের মানচিত্র শেষ করতে পারেনি, সেখানে ডেলিভারি রাইডাররা নিজেরাই একটি ঠিকানাব্যবস্থা তৈরি করেছেন। এখন তিনটি প্ল্যাটফর্ম সেই মানচিত্র কিনে নিতে চাইছে।',
    'AI in the Global South', 'nusrat', 'Investigation',
    ['ঢাকা', 'শ্রম', 'প্ল্যাটফর্ম'], '2026-09-17', 12, 1, { featured: true }, null
  ],
  [
    'chatbot-jokhon-sohokormi-hoye-othe',
    'চ্যাটবট যখন সহকর্মী হয়ে ওঠে',
    'একটি কল সেন্টারে সহায়তার জন্য একটি সহকারী চালু করা হয়েছিল। দেড় বছর পর কর্মীরা বলছেন, তাঁরা নিজেদের শিফট নিয়ে সেটির সঙ্গে দরকষাকষি করেন।',
    'Work After Automation', 'rafid', 'Report',
    ['শ্রম', 'কল সেন্টার'], '2026-09-16', 10, 1, { secondary: true },
    'what-happens-when-a-chatbot-becomes-your-co-worker'
  ],
  [
    'je-sromikera-jontroke-dekhte-shekhan',
    'যে শ্রমিকেরা যন্ত্রকে দেখতে শেখান',
    'ছবিতে দাগ বসানোর কাজ বড় শহর ছেড়ে ছোট শহরে সরে গেছে, যেখানে মজুরি কম আর চুক্তি স্বল্পমেয়াদি। শ্রমিকেরা বলছেন, কাজের গতি প্রতি মাসেই বাড়ছে।',
    'The Human Dataset', 'rafid', 'Investigation',
    ['শ্রম', 'প্রশিক্ষণ তথ্য'], '2026-09-16', 13, 1, {},
    'the-hidden-workers-teaching-machines-how-to-see'
  ],
  [
    'bidyut-niyei-hobe-porer-ai-protijogita',
    'বিদ্যুৎ নিয়েই হবে পরের এআই প্রতিযোগিতা',
    'প্রতিটি বড় গবেষণাগারে এখন এমন কর্মী আছেন যাঁদের একমাত্র কাজ বিদ্যুৎ খুঁজে বের করা। তাঁরা যে বিতরণ সংস্থাগুলোকে ফোন করছেন, সেগুলো এই আলোচনার জন্য প্রস্তুত নয়।',
    'Climate, Chips & Infrastructure', 'imrul', 'Analysis',
    ['বিদ্যুৎ', 'অবকাঠামো'], '2026-09-15', 9, 1, {},
    'the-next-ai-race-may-be-about-electricity-not-models'
  ],
  [
    'bangla-bhashar-model-toiri-korchen-jara',
    'বাংলা ভাষার মডেল তৈরি করছেন যাঁরা',
    'বড় মডেলগুলো বাংলা ভালোভাবে সামলাতে পারে না। যাঁরা এই ভাষায় কাজ করেন, তাঁরা আর অপেক্ষা করছেন না — নিজেরাই বানাচ্ছেন।',
    'Open Source and the Commons', 'tanvir', 'Feature',
    ['বাংলা', 'ওপেন সোর্স'], '2026-09-15', 14, 1, {}, null
  ],
  [
    'chattogramer-poshak-karkhanay-camera-ja-dekhe',
    'চট্টগ্রামের পোশাক কারখানায় ক্যামেরা যা দেখে',
    'উৎপাদন বাড়াতে বসানো ক্যামেরা এখন শ্রমিকদের হাতের গতিও মাপছে। কারখানা কর্তৃপক্ষ বলছে, এটি নিরাপত্তার জন্য।',
    'Machines and Power', 'rafid', 'Investigation',
    ['নজরদারি', 'পোশাকশিল্প'], '2026-09-14', 15, 1, {}, null
  ],
  [
    'sadharon-jiboner-tothyer-malik-ke',
    'সাধারণ জীবনের তথ্যের মালিক কে?',
    'জনপরিসর থেকে সংগ্রহ করা তথ্যের ওপর নাগরিকের দাবি আছে কি না, সেই প্রশ্ন এখন আদালতে।',
    'Machines and Power', 'nusrat', 'Report',
    ['গোপনীয়তা', 'আইন'], '2026-09-13', 8, 2, {}, null
  ],
  [
    'silheter-cha-bagane-drone-o-sromik',
    'সিলেটের চা-বাগানে ড্রোন ও শ্রমিক',
    'ফলন মাপতে আসা ড্রোন এখন কে কত তুলেছে তা-ও হিসাব করছে। শ্রমিকেরা বলছেন, হিসাবটা সবসময় মেলে না।',
    'Work After Automation', 'sadia', 'Dispatch',
    ['শ্রম', 'কৃষি'], '2026-09-12', 9, 2, {}, null
  ],
  [
    'data-centerer-panir-hisab-keu-prokash-kore-na',
    'ডেটা সেন্টারের পানির হিসাব কেউ প্রকাশ করে না',
    'আমরা সাতটি কর্তৃপক্ষের কাছে তথ্য চেয়েছিলাম। পাঁচটি জানিয়েছে, এই হিসাব প্রকাশযোগ্য নয়।',
    'Climate, Chips & Infrastructure', 'imrul', 'Investigation',
    ['পানি', 'ডেটা সেন্টার'], '2026-09-11', 11, 2, {}, null
  ],
  [
    'gramer-clinic-e-phone-je-siddhanta-nicche',
    'গ্রামের ক্লিনিকে ফোন যে সিদ্ধান্ত নিচ্ছে',
    'নিকটতম চিকিৎসক যেখানে চার ঘণ্টা দূরে, সেখানে একটি ফোনের মডেল এমন সিদ্ধান্ত নিতে শুরু করে যা কেউ তাকে দিতে চায়নি।',
    'AI & Everyday Life', 'sadia', 'Feature',
    ['স্বাস্থ্য', 'প্রবেশাধিকার'], '2026-09-10', 12, 1, {}, null
  ],
  [
    'nirbachone-bhuya-content-kothay-toiri-hoy',
    'নির্বাচনে ভুয়া কনটেন্ট কোথায় তৈরি হয়',
    'কয়েকটি পেজ থেকে ছড়ানো ভিডিওর উৎস খুঁজতে গিয়ে আমরা একই ধরনের কাজের ধারা পেয়েছি।',
    'Culture, Media & Synthetic Reality', 'nusrat', 'Investigation',
    ['নির্বাচন', 'ভুল তথ্য'], '2026-09-09', 16, 1, {}, null
  ],
  [
    'open-source-e-bangla-tothyer-obhab',
    'ওপেন সোর্সে বাংলা তথ্যের অভাব',
    'যে তথ্যভান্ডারগুলো দিয়ে মডেল তৈরি হয়, সেখানে বাংলার অংশ এক শতাংশেরও কম।',
    'Open Source and the Commons', 'desk', 'Explainer',
    ['বাংলা', 'প্রশিক্ষণ তথ্য'], '2026-09-08', 7, 2, {}, null
  ]
];

const body = `
এই প্রতিবেদনের কাজ শুরু হয়েছিল একটি প্রশ্ন আর একটি তথ্য আবেদন দিয়ে, যার উত্তর
আসতে চার মাস লেগেছে। নথিপত্রে যে প্রক্রিয়ার বর্ণনা পাওয়া গেছে, সে বিষয়ে
সংশ্লিষ্ট কেউ নাম প্রকাশ করে কথা বলতে রাজি হননি। তাই আমরা গিয়েছি তাঁদের কাছে,
যাঁদের ওপর এর প্রভাব পড়েছে।

## আমরা যা পেয়েছি

আঠারোটি সাক্ষাৎকার, তথ্য অধিকার আইনে পাওয়া কয়েকটি চুক্তি এবং দুই সপ্তাহের
সরেজমিন প্রতিবেদনের ভিত্তিতে এই লেখা। যেখানে স্বাধীনভাবে কোনো দাবি যাচাই করা
সম্ভব হয়নি, সেখানে আমরা তা স্পষ্ট করে উল্লেখ করেছি।

> "কেউ আমাদের জিজ্ঞেস করেনি। সবাই যেভাবে জেনেছে, আমরাও সেভাবেই জেনেছি।"

এই কথাটি, বা এর কাছাকাছি কিছু, প্রায় প্রতিটি আলাপেই উঠে এসেছে।

## এরপর কী

যে দুটি কর্তৃপক্ষের সঙ্গে আমরা যোগাযোগ করেছি, তারা বিষয়টি খতিয়ে দেখার কথা
জানিয়েছে। তৃতীয় একটি সংস্থা মন্তব্য করতে রাজি হয়নি। আমরা এই অনুসন্ধান চালিয়ে
যাচ্ছি — আপনি যদি এ বিষয়ে কিছু জানেন, পাতার নিচে আমাদের যোগাযোগের ঠিকানা আছে।
`.trim();

let n = 0;
for (const [slug, title, dek, section, key, kind, tags, date, readTime, weight, flags, tOf] of stories) {
  const [author, authorTitle, location] = A[key];
  const fm = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `dek: ${JSON.stringify(dek)}`,
    `section: ${JSON.stringify(section)}`,
    `kind: ${JSON.stringify(kind)}`,
    `author: ${JSON.stringify(author)}`,
    `authorTitle: ${JSON.stringify(authorTitle)}`,
    `location: ${JSON.stringify(location)}`,
    `tags: [${tags.map((t) => JSON.stringify(t)).join(', ')}]`,
    `date: ${date}`,
    `readTime: ${readTime}`,
    `weight: ${weight}`,
    `featured: ${!!flags.featured}`,
    `secondary: ${!!flags.secondary}`,
    `translationOf: ${tOf ? JSON.stringify(tOf) : 'null'}`,
    '---',
    ''
  ].join('\n');

  writeFileSync(resolve(outDir, `${slug}.md`), fm + body + '\n', 'utf8');
  n++;
}

console.log(`wrote ${n} Bangla articles to content/articles/bn/`);
