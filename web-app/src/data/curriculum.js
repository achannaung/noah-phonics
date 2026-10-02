export const STAGES = [
  {
    id: 1,
    name: 'First Steps',
    blurb: 'The very first sounds. Words you can blend with one sound at a time.',
    color: '#ff8c42',
    emoji: '🐣',
    sounds: ['s', 'a', 't', 'p', 'i', 'n'],
  },
  {
    id: 2,
    name: 'Fun and Friends',
    blurb: 'More sounds and lots of fun with friends and toys.',
    color: '#4ecdc4',
    emoji: '🎈',
    sounds: ['m', 'd', 'g', 'o', 'c', 'k'],
  },
  {
    id: 3,
    name: 'Plants and Animals',
    blurb: 'Animals, plants and new sounds all around us.',
    color: '#7bc043',
    emoji: '🐸',
    sounds: ['e', 'u', 'h', 'r', 'j', 'v', 'w', 'l', 'f', 'z'],
  },
  {
    id: 4,
    name: 'In the Village',
    blurb: 'Tricky letter teams like ch, sh and th. Real stories begin!',
    color: '#a78bfa',
    emoji: '🏡',
    sounds: ['ch', 'sh', 'th', 'ng', 'ai', 'ee', 'oa'],
  },
  {
    id: 5,
    name: 'Look Around!',
    blurb: 'Vowel teams and longer words. You are reading for real now!',
    color: '#f472b6',
    emoji: '🔭',
    sounds: ['oo', 'igh', 'ar', 'or', 'er', 'ir', 'ur', 'oy', 'ow'],
  },
  {
    id: 6,
    name: 'Our World',
    blurb: 'Blends, tricky letters and chapter books. Superstar territory!',
    color: '#f59e0b',
    emoji: '🚀',
    sounds: ['bl', 'br', 'cr', 'dr', 'fl', 'gr', 'qu', 'x', 'y', 'zz'],
  },
];

// Each sound: how to say it, example words with emoji, a decodable sentence
// and a parent cheat-sheet note.
export const SOUNDS = {
  s: { say: 'ssssss', words: [['sun', '☀️'], ['sock', '🧦'], ['sit', '🪑'], ['sand', '🏖️'], ['snake', '🐍']], sentence: 'Sam sat on a sun bed.', tip: 'Long hissing sound, like a snake: sssss.' },
  a: { say: 'a-a-a', words: [['apple', '🍎'], ['ant', '🐜'], ['ax', '🪓'], ['alligator', '🐊'], ['airplane', '✈️']], sentence: 'Ann and Al can see a big alligator.', tip: 'Short, open mouth: a-a-a. Not "ay".' },
  t: { say: 't-t-t', words: [['top', '🔝'], ['ten', '🔟'], ['tap', '👆'], ['tiger', '🐯'], ['tree', '🌳']], sentence: 'Tom has a tall teal tree.', tip: 'Tap the tip of your tongue: t-t-t.' },
  p: { say: 'p-p-p', words: [['pig', '🐷'], ['pot', '🍲'], ['pan', '🍳'], ['pop', '🎈'], ['pen', '🖊️']], sentence: 'Pip put a pie in the pot.', tip: 'Puff of air, then pop your lips: p-p-p.' },
  i: { say: 'iii', words: [['ink', '🖋️'], ['igloo', '🧊'], ['insect', '🐛'], ['island', '🏝️'], ['ice', '🧊']], sentence: 'Izzy has an igloo in the ice.', tip: 'Smile wide and hold it: iii.' },
  n: { say: 'nnnn', words: [['net', '🥅'], ['nap', '😴'], ['nest', '🪺'], ['nose', '👃'], ['nut', '🌰']], sentence: 'Nell can see a nut in a net.', tip: 'Nasal hum through your nose: nnnn.' },
  m: { say: 'mmmm', words: [['moon', '🌙'], ['mat', '🟫'], ['map', '🗺️'], ['man', '👨'], ['mud', '🟤']], sentence: 'Mum and I can see the moon.', tip: 'Lips together, hum: mmmm.' },
  d: { say: 'ddd', words: [['dog', '🐕'], ['duck', '🦆'], ['drum', '🥁'], ['door', '🚪'], ['dinosaur', '🦖']], sentence: 'Dad and I can dig a big deep hole.', tip: 'Quick tap of the tongue: d-dd.' },
  g: { say: 'gggg', words: [['goat', '🐐'], ['gull', '🕊️'], ['gum', '🍬'], ['game', '🎮'], ['green', '🟢']], sentence: 'Greg got a green goat.', tip: 'Tickly sound in your throat: g-gg.' },
  o: { say: 'o-o-o', words: [['octopus', '🐙'], ['orange', '🍊'], ['otter', '🦦'], ['ox', '🐂'], ['open', '🔓']], sentence: 'Ollie got an octopus on top of a rock.', tip: 'Round open mouth: o-o-o.' },
  c: { say: 'c-c-c', words: [['cat', '🐈'], ['car', '🚗'], ['cup', '🥤'], ['corn', '🌽'], ['cake', '🎂']], sentence: 'Cat and can can come to see the cake.', tip: 'c before a, o, u says "ck".' },
  k: { say: 'kkk', words: [['kite', '🪁'], ['key', '🔑'], ['king', '👑'], ['kangaroo', '🦘'], ['kick', '⚽']], sentence: 'Kim can kick a big kite.', tip: 'Back of the tongue, quick: k-ck.' },
  e: { say: 'e-e-e', words: [['elephant', '🐘'], ['egg', '🥚'], ['eel', '🐟'], ['earth', '🌍'], ['ear', '👂']], sentence: 'Ellie sees an elephant and an egg.', tip: 'Flat, relaxed mouth: e-e-e.' },
  u: { say: 'u-u-u', words: [['umbrella', '☂️'], ['up', '⬆️'], ['uncle', '🧑'], ['unhappy', '😢'], ['unicorn', '🦄']], sentence: 'Up goes Umbrella the unicorn!', tip: 'Small round mouth, short: u-u-u.' },
  h: { say: 'h-h-h', words: [['hat', '🎩'], ['hen', '🐔'], ['hand', '✋'], ['hill', '⛰️'], ['house', '🏠']], sentence: 'Hugo has a hat and a hen.', tip: 'Just a soft puff of air first.' },
  r: { say: 'rrr', words: [['rabbit', '🐇'], ['red', '🔴'], ['rope', '🪢'], ['ring', '💍'], ['run', '🏃']], sentence: 'Rex ran with a red rabbit.', tip: 'R makes your tongue wiggle: rrr.' },
  j: { say: 'j-j-j', words: [['jam', '🍯'], ['jet', '✈️'], ['jar', '🫙'], ['jump', '🤸'], ['juice', '🧃']], sentence: 'Jill and Jim jump for joy.', tip: 'j is a noisy j: jjj. Never "y".' },
  v: { say: 'vvvv', words: [['van', '🚐'], ['vet', '👩‍⚕️'], ['vine', '🌿'], ['volcano', '🌋'], ['vase', '🏺']], sentence: 'Victor put a van near the volcano.', tip: 'Top teeth on bottom lip, buzz: vvvv.' },
  w: { say: 'wwww', words: [['water', '💧'], ['window', '🪟'], ['wagon', '🛒'], ['wind', '🌬️'], ['worm', '🪱']], sentence: 'We can wash the window with water.', tip: 'Round your lips fast: w-w-w.' },
  l: { say: 'lll', words: [['leaf', '🍃'], ['lion', '🦁'], ['lolly', '🍭'], ['lamp', '💡'], ['leg', '🦵']], sentence: 'Lucy put a lamp on the leaf.', tip: 'Tongue behind your top teeth: lll.' },
  f: { say: 'ffff', words: [['fish', '🐟'], ['fun', '🎈'], ['frog', '🐸'], ['fan', '🌀'], ['fox', '🦊']], sentence: 'Finn has a fish and a fan.', tip: 'F is ff when long: fff-ffff.' },
  z: { say: 'zzz', words: [['zebra', '🦓'], ['zoo', '🦁'], ['zip', '🔹'], ['zap', '⚡'], ['fizz', '🫧']], sentence: 'Zebras zig-zag at the zoo.', tip: 'Buzzing sound: zzz-zzzz.' },
  ch: { say: 'ch-ch', words: [['chip', '🍟'], ['chat', '💬'], ['chick', '🐤'], ['chair', '🪑'], ['cheese', '🧀']], sentence: 'Chas has a chair and a chip.', tip: 'ch is two letters, one sound. One touch, no gap.' },
  sh: { say: 'sh-sh', words: [['ship', '🚢'], ['shop', '🏪'], ['fish', '🐟'], ['shell', '🐚'], ['sheep', '🐑']], sentence: 'Shay can see a ship and a sheep.', tip: 'Like telling someone to be quiet: shhh!' },
  th: { say: 'th-th', words: [['this', '👇'], ['that', '👉'], ['three', '3️⃣'], ['thin', '🪶'], ['bath', '🛁']], sentence: 'This is the third thin bath.', tip: 'Tongue between the teeth. Not "f" or "s".' },
  ng: { say: 'ng-ng', words: [['sing', '🎤'], ['king', '👑'], ['ring', '💍'], ['long', '📏'], ['spring', '🌸']], sentence: 'King Sing is singing a long song.', tip: 'ng sits at the end. Never start a word with ng.' },
  ai: { say: 'ay', words: [['rain', '🌧️'], ['train', '🚂'], ['paint', '🎨'], ['tail', '🐕'], ['snail', '🐌']], sentence: 'Milo paints a train in the rain.', tip: 'ai and ay always say "ay".' },
  ee: { say: 'ee', words: [['tree', '🌳'], ['bee', '🐝'], ['green', '🟢'], ['sleep', '😴'], ['feet', '🦶']], sentence: 'Three green trees and a bee.', tip: 'ee and ea both say "ee".' },
  oa: { say: 'oh', words: [['boat', '⛵'], ['coat', '🧥'], ['road', '🛣️'], ['goat', '🐐'], ['toast', '🍞']], sentence: 'Boats float on the road.', tip: 'oa and ow both say "oh".' },
  oo: { say: 'oooo', words: [['moon', '🌙'], ['food', '🍎'], ['zoo', '🦁'], ['book', '📖'], ['spoon', '🥄']], sentence: 'The moon looks like a spoon in a book.', tip: 'oo says "oooo". oo with k says "uh" as in book.' },
  igh: { say: 'eye', words: [['night', '🌃'], ['light', '💡'], ['high', '🏔️'], ['kite', '🪁'], ['fly', '🦋']], sentence: 'The kite flies high at night.', tip: 'Say "igh" and hold the last sound.' },
  ar: { say: 'ar', words: [['car', '🚗'], ['star', '⭐'], ['park', '🅿️'], ['farm', '🚜'], ['shark', '🦈']], sentence: 'The car parks at the farm.', tip: 'Long, relaxed "ar".' },
  or: { say: 'or', words: [['for', '4️⃣'], ['horse', '🐴'], ['corn', '🌽'], ['short', '📏'], ['more', '➕']], sentence: 'Four short horses in the corn.', tip: 'Round your mouth: o-or.' },
  er: { say: 'er', words: [['her', '👧'], ['water', '💧'], ['tiger', '🐯'], ['dinner', '🍽️'], ['finger', '👆']], sentence: 'Her tiger drinks her dinner water.', tip: 'er, ir and ur all say "er".' },
  ir: { say: 'er', words: [['bird', '🐦'], ['girl', '👧'], ['shirt', '👕'], ['first', '1️⃣'], ['skirt', '👗']], sentence: 'The first girl has a blue shirt.', tip: 'Same sound as er and ur.' },
  ur: { say: 'er', words: [['nurse', '💉'], ['turtle', '🐢'], ['turn', '↩️'], ['hurt', '🩹'], ['purple', '🟣']], sentence: 'The purple turtle turns to the nurse.', tip: 'Same sound as er and ir.' },
  oy: { say: 'oy', words: [['boy', '👦'], ['toy', '🧸'], ['enjoy', '😊'], ['noise', '📢'], ['royal', '👑']], sentence: 'The boy enjoys his new toy.', tip: 'oy and oi say "oy".' },
  ow: { say: 'oh', words: [['cow', '🐄'], ['bow', '🎀'], ['window', '🪟'], ['snow', '❄️'], ['grow', '🌱']], sentence: 'The cow looks out of the window.', tip: 'ow can say "oh" (snow) or "ow" (cow).' },
  bl: { say: 'bl', words: [['blue', '🔵'], ['block', '🧱'], ['black', '⚫'], ['bloom', '🌸'], ['blow', '💨']], sentence: 'Blue blocks bloom on the black block.', tip: 'Two sounds stuck together: b-l.' },
  br: { say: 'br', words: [['brown', '🟤'], ['brush', '🖌️'], ['bread', '🍞'], ['branch', '🌿'], ['brother', '👦']], sentence: 'Brown bread on the branch.', tip: 'Pucker your lips for br.' },
  cr: { say: 'cr', words: [['crayon', '🖍️'], ['cross', '✝️'], ['crab', '🦀'], ['cry', '😭'], ['cream', '🍦']], sentence: 'The crab and the crayon cross the cream.', tip: 'Say c-r quickly together.' },
  dr: { say: 'dr', words: [['drum', '🥁'], ['dress', '👗'], ['draw', '🎨'], ['drink', '🥤'], ['dry', '🏜️']], sentence: 'Draw a dress and a drum.', tip: 'Say d-r quickly together.' },
  fl: { say: 'fl', words: [['fly', '🦋'], ['flag', '🚩'], ['flame', '🔥'], ['floor', '🪵'], ['flute', '🎶']], sentence: 'The flag flaps on the floor.', tip: 'Say f-l quickly together.' },
  gr: { say: 'gr', words: [['green', '🟢'], ['grass', '🌱'], ['grape', '🍇'], ['grip', '✊'], ['grow', '🌳']], sentence: 'Green grapes grow on the grass.', tip: 'Say g-r quickly together.' },
  qu: { say: 'qu', words: [['queen', '👸'], ['quick', '⚡'], ['quiet', '🤫'], ['question', '❓'], ['quilt', '🛏️']], sentence: 'The quiet queen is quick!', tip: 'Always says "kw". Followed by a vowel.' },
  x: { say: 'ks', words: [['box', '📦'], ['fox', '🦊'], ['six', '6️⃣'], ['mix', '🥛'], ['fix', '🔧']], sentence: 'Six foxes in a box.', tip: 'x usually says "ks". Usually at the end.' },
  y: { say: 'y', words: [['yes', '✅'], ['you', '👉'], ['yellow', '💛'], ['year', '📅'], ['yoyo', '🪀']], sentence: 'Yes! You yell yellow.', tip: 'y at the end says "ee" as in happy.' },
  zz: { say: 'zz', words: [['fizz', '🫧'], ['buzz', '🐝'], ['jazz', '🎷'], ['pizza', '🍕'], ['fuzz', '🧶']], sentence: 'The jazz buzz is a pizza fuzz.', tip: 'zz always says "zz".' },
};

// Reference library of Oxford Reading Tree titles grouped by stage.
export const BOOKS = {
  1: [
    { title: 'First Words', note: 'Just the words. Point, say, move on.' },
    { title: 'Black Cat', note: 'Our very first sound: s.' },
    { title: 'The Toy Box', note: 'Short a, t, p, i, n words.' },
  ],
  2: [
    { title: 'What is it?', note: 'Question words and simple answers.' },
    { title: 'The Ball', note: 'Blending c, a, t into cat.' },
    { title: 'The Tree', note: 'Short e and repeated words.' },
    { title: 'The Hat', note: 'Reading with expression.' },
    { title: 'The Flag', note: 'Rhyming and fun to repeat.' },
    { title: 'Little Bug, Big Bug', note: 'Opposites and size words.' },
    { title: 'The Teddy Bear', note: 'Two-syllable words.' },
    { title: 'Come and Play', note: 'Reading with a partner.' },
  ],
  3: [
    { title: 'Come On, Frog!', note: 'Repeated refrains and fun sounds.' },
    { title: 'At the Zoo', note: 'Animals and short vowels.' },
    { title: 'Up and Down', note: 'Opposites and positions.' },
    { title: 'Rosie\'s Walk', note: 'A fun story with a surprise ending.' },
    { title: 'The Monster', note: 'Description words.' },
    { title: 'The Garden', note: 'Plants, growing and new sounds.' },
    { title: 'Where\'s My Teddy?', note: 'Problem and solution.' },
    { title: 'The New Puppy', note: 'Story with a beginning, middle, end.' },
  ],
  4: [
    { title: 'Up the Tree', note: 'New sound teams and questions.' },
    { title: 'The Dinner', note: 'Longer sentences, reading fluency.' },
    { title: 'Noah\'s Ark', note: 'Two sounds together: sh, ch, th.' },
    { title: 'The Sleepy Dog', note: 'Repeated pattern reading.' },
    { title: 'Stuck in the Mud', note: 'Wider vocabulary.' },
    { title: 'Robin in the Garden', note: 'Nature and descriptive text.' },
    { title: 'The Toy Train', note: 'Reading with expression.' },
    { title: 'Well Done, Dad!', note: 'Completing the story together.' },
  ],
  5: [
    { title: 'Look Around!', note: 'Vowel teams: ai, ee, oa.' },
    { title: 'The Abominable Snowman', note: 'Repeated words for fluency.' },
    { title: 'The Secret Garden', note: 'Longer chapter book.' },
    { title: 'Little Red Riding Hood', note: 'Classic tale retold.' },
    { title: 'The Bunyip', note: 'Australian tale, big words.' },
    { title: 'The Book of Trains', reference: true, note: 'Non-fiction and information.' },
    { title: 'The Cat in the Hat Comes Back', note: 'R-controlled vowels.' },
  ],
  6: [
    { title: 'Rocks and Mountains', note: 'Non-fiction and science facts.' },
    { title: 'The Treasure', note: 'A proper chapter story.' },
    { title: 'A Child\'s Garden', note: 'Poetry and rhythm.' },
    { title: 'Jack and the Beanstalk', note: 'Longer words, blending.' },
    { title: 'The Three Little Pigs', note: 'Retelling a story from memory.' },
    { title: 'At the Park', note: 'New sound blends br, cr, dr.' },
    { title: 'Our Solar System', note: 'Space and non-fiction.' },
  ],
};

export const DIFFICULT_SOUNDS = ['th', 'sh', 'ch', 'ng', 'v', 'w', 'z', 'j', 'f', 'r'];

export function getStage(stageId) {
  return STAGES.find((s) => s.id === Number(stageId));
}

export function allUnits() {
  return STAGES.flatMap((stage) =>
    stage.sounds.map((sound) => ({ stage: stage.id, stageName: stage.name, sound })),
  );
}

export function unitFor(stageId, sound) {
  return { stage: Number(stageId), sound, ...SOUNDS[sound] };
}