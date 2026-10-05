// ===== ДВИЖОК ПРАВИЛ =====
const ALPHA = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
const idx = c => ALPHA.indexOf(c);
const VOW = "АЕЁИОУЫЭЮЯ";
const cnt = (w, c) => w.split(c).length - 1;
const L = fn => w => [...w].map((c, i) => fn(c, i, w));
const W = fn => w => [fn(w) ? "g" : "r"];
const inSet = s => L(c => (s.includes(c) ? "g" : "r"));
const rev = w => [...w].reverse().join("");
const NUMBERS = ["ОДИН","ДВА","ТРИ","ЧЕТЫРЕ","ПЯТЬ","ШЕСТЬ","СЕМЬ","ВОСЕМЬ","ДЕВЯТЬ","ДЕСЯТЬ","СТО"];
const ANIMALS = ["КОТ","ЛЕВ","РАК","УЖ","ОСА","ЯК","КИТ","ВОЛ","ЁЖ","СОМ","ЛОСЬ","ПЁС","ЕНОТ","ЗУБР","ГУСЬ","СЛОН","ТИГР","ОСЁЛ","ЖУК","ЛАНЬ","ПУМА","ВОЛК","ЛИС","БЫК","ОВЦА","ТЮЛЕНЬ"];
const REVERSE_WORDS = ["ТОК","КОТ","СОН","НОС","СЕЛ","ЛЕС","РОВ","ВОР","КОД","ДОК","ПОТ","ТОП","ЗАЛ","ЛАЗ"];
const ROW1 = "ЙЦУКЕНГШЩЗХЪ", ROW2 = "ФЫВАПРОЛДЖЭ", ROW3 = "ЯЧСМИТЬБЮ";

const RULES = {
  vowels:      { kind: "letter", f: inSet(VOW) },
  repetition:  { kind: "letter", f: L((c, i, w) => { const n = cnt(w, c); return n === 1 ? "g" : n === 2 ? "y" : "r"; }) },
  closed:      { kind: "letter", f: inSet("АБВДОРФЯЮЬЪЫ") },
  halves:      { kind: "letter", f: L((c, i, w) => { const n = w.length; if (n % 2 && i === (n - 1) / 2) return "y"; return i < n / 2 ? "g" : "r"; }) },
  latinLook:   { kind: "letter", f: inSet("АВЕКМНОРСТХ") },
  alphaHalves: { kind: "letter", f: L(c => (idx(c) <= idx("П") ? "g" : "r")) },
  straight:    { kind: "letter", f: inSet("АГЕЖИКМНПТХЦШЩ") },
  doubles:     { kind: "letter", f: L((c, i, w) => (w[i - 1] === c || w[i + 1] === c ? "y" : VOW.includes(c) ? "g" : "r")) },
  keyboard:    { kind: "letter", f: L(c => (ROW1.includes(c) ? "g" : ROW2.includes(c) ? "y" : "r")) },
  symmetric:   { kind: "letter", f: inSet("АЖМНОПТФХШ") },
  rising:      { kind: "letter", f: L((c, i, w) => (i === 0 || c === w[i - 1] ? "y" : idx(c) > idx(w[i - 1]) ? "g" : "r")) },
  upsideDown:  { kind: "letter", f: inSet("ЖИНОФХ") },

  palindrome:   { kind: "word", f: W(w => w === rev(w)) },
  sameEnds:     { kind: "word", f: W(w => w[0] === w[w.length - 1]) },
  isogram:      { kind: "word", f: W(w => new Set(w).size === w.length) },
  moreVowels:   { kind: "word", f: W(w => { const v = [...w].filter(c => VOW.includes(c)).length; return v > w.length - v; }) },
  hiddenNumber: { kind: "word", f: W(w => NUMBERS.some(n => w.includes(n))) },
  hiddenAnimal: { kind: "word", f: W(w => ANIMALS.some(a => w.includes(a))) },
  alphabetical: { kind: "word", f: W(w => [...w].every((c, i) => i === 0 || idx(c) >= idx(w[i - 1]))) },
  oneRow:       { kind: "word", f: W(w => [ROW1, ROW2, ROW3].some(r => [...w].every(c => r.includes(c)))) },
  reversible:   { kind: "word", f: W(w => w !== rev(w) && REVERSE_WORDS.includes(rev(w))) },
};

// Правила-подозреваемые: используются только валидатором
const ALT_RULES = {
  firstLast:   { kind: "letter", f: L((c, i, w) => (i === 0 || i === w.length - 1 ? "g" : "r")) },
  evenIndex:   { kind: "letter", f: L((c, i) => (i % 2 ? "r" : "g")) },
  alphaOdd:    { kind: "letter", f: L(c => (idx(c) % 2 ? "r" : "g")) },
  thirds:      { kind: "letter", f: L(c => (idx(c) < 11 ? "g" : idx(c) < 22 ? "y" : "r")) },
  leftHand:    { kind: "letter", f: inSet("ЙЦУКЕФЫВАПЯЧСМИ") },
  repeatAny:   { kind: "letter", f: L((c, i, w) => (cnt(w, c) > 1 ? "y" : "g")) },
  adjacentDbl: { kind: "letter", f: L((c, i, w) => (w[i - 1] === c || w[i + 1] === c ? "y" : "g")) },
  nextToVowel: { kind: "letter", f: L((c, i, w) => (VOW.includes(w[i - 1] || "-") || VOW.includes(w[i + 1] || "-") ? "g" : "r")) },
  hasDouble:   { kind: "word", f: W(w => [...w].some((c, i) => c === w[i + 1])) },
  hasRepeat:   { kind: "word", f: W(w => new Set(w).size < w.length) },
  evenLength:  { kind: "word", f: W(w => w.length % 2 === 0) },
  long5:       { kind: "word", f: W(w => w.length > 5) },
  short3:      { kind: "word", f: W(w => w.length <= 3) },
  startsVowel: { kind: "word", f: W(w => VOW.includes(w[0])) },
  endsVowel:   { kind: "word", f: W(w => VOW.includes(w[w.length - 1])) },
  containsA:   { kind: "word", f: W(w => w.includes("А")) },
  containsO:   { kind: "word", f: W(w => w.includes("О")) },
  containsE:   { kind: "word", f: W(w => w.includes("Е")) },
};

// ===== УРОВНИ (цвета никогда не вводятся руками) =====
const LEVELS = [
  { id: 1, title: "Две семьи", rule: "vowels", examples: ["ЯБЛОКО","ДОМ","КРЕСЛО"], question: ["ВСТРЕЧА"],
    explain: "Зелёные буквы — гласные, красные — согласные.",
    hints: ["Каждая буква оценивается сама по себе, остальное слово не важно.", "Буквы делятся на две семьи, которые проходят в первом классе.", "А, О, У, Ы, Э, Я, Ё, Ю, И, Е."] },
  { id: 2, title: "Перевёртыш", rule: "palindrome", examples: ["ШАЛАШ","КАЗАК","ПОТОП","ТОСТ","КРЮК","КАТОК"], question: ["ДОХОД","ТРЕСТ","ЗАКАЗ"],
    explain: "Зелёные слова одинаково читаются слева направо и справа налево. ТОСТ, КРЮК и КАТОК начинаются и заканчиваются на одну букву, но это не палиндромы.",
    hints: ["Это правило про слово целиком, а не про отдельные буквы.", "Попробуйте прочитать зелёные слова в другом направлении.", "Прочитайте их задом наперёд."] },
  { id: 3, title: "Эхо", rule: "repetition", examples: ["ПАПКА","ЗАДАЧА"], question: ["БАРАБАН"],
    explain: "Зелёная буква встречается в слове один раз, жёлтая — два раза, красная — три и больше.",
    hints: ["Неважно, какая это буква. Важно, что ещё есть в слове.", "Сравните буквы, которые встречаются не один раз.", "Посчитайте каждую букву: один, два, три раза."] },
  { id: 4, title: "Дырки", rule: "closed", examples: ["СОБАКА","БРАТ","ЛИСА"], question: ["ЯБЛОКО"],
    explain: "У зелёных букв есть замкнутое пространство внутри: А, Б, В, О, Р, Ф, Я, Ю, Ь.",
    hints: ["Дело в том, как буква нарисована.", "Представьте, что наливаете в букву воду.", "У зелёных букв внутри есть закрытая дырка."] },
  { id: 5, title: "Края", rule: "sameEnds", examples: ["ТОСТ","АРЕНА","КУЛАК","ЛИСА","СТОЛ"], question: ["ОКНО","ВЕДРО","ТРЕСТ"],
    explain: "Зелёные слова начинаются и заканчиваются на одну и ту же букву. ТОСТ был красным два правила назад, а теперь он зелёный.",
    hints: ["Снова слова целиком. В каждом важны только две буквы.", "Посмотрите на края слова.", "Первая буква совпадает с последней."] },
  { id: 6, title: "Пополам", rule: "halves", examples: ["КОТ","ЗЕБРА","ВОРОНА"], question: ["ВЕЛОСИПЕД"],
    explain: "Сами буквы не важны. Первая половина слова зелёная, вторая — красная, а средняя буква в слове нечётной длины — жёлтая.",
    hints: ["Попробуйте не обращать внимания на то, какие это буквы.", "Важно только место буквы в слове.", "Разделите слово посередине."] },
  { id: 7, title: "Двойники", rule: "latinLook", examples: ["МЕТРО","КОШКА","ПИРОГ"], question: ["ХОККЕЙ"],
    explain: "Зелёные буквы выглядят точно так же, как буквы латиницы: А, В, Е, К, М, Н, О, Р, С, Т, Х.",
    hints: ["У некоторых букв есть двойная жизнь.", "Представьте, что клавиатура переключилась на английский.", "Зелёные буквы есть и в латинском алфавите."] },
  { id: 8, title: "Без повторов", rule: "isogram", examples: ["КНИГА","МУЗЫКА","ВАННА","БАНАН"], question: ["ТЕАТР","СТАНЦИЯ","КАССА"],
    explain: "В зелёных словах ни одна буква не повторяется. В БАНАНЕ и ТЕАТРЕ нет двойных букв подряд, но буквы всё равно повторяются.",
    hints: ["Слова целиком. Посмотрите на буквы внутри.", "В каждом красном слове что-то встречается дважды.", "Зелёные слова никогда не используют букву повторно."] },
  { id: 9, title: "От А до П", rule: "alphaHalves", examples: ["ВИЛКА","СТУЛ","МОРКОВЬ"], question: ["ПЕРЧИК"],
    explain: "Буквы от А до П — зелёные, от Р до Я — красные.",
    hints: ["Каждая буква оценивается сама по себе.", "Подумайте, где буква стоит в алфавите.", "Алфавит разделён на две половины."] },
  { id: 10, title: "Большинство", rule: "moreVowels", examples: ["ИДЕЯ","АУДИО","РАДИО","ТРАВА","АРБУЗ"], question: ["ОАЗИС","ПЛАНЕТА","ПИАНИНО"],
    explain: "Слово зелёное, если гласных в нём больше, чем согласных.",
    hints: ["Слова целиком. Разделите буквы на две команды.", "Гласные против согласных.", "Зелёное слово — где гласных больше."] },
  { id: 11, title: "Линейка", rule: "straight", examples: ["ТАКТИКА","СОБОР","ПАРТИЯ"], question: ["ШКАФ"],
    explain: "Зелёные буквы нарисованы только прямыми линиями. У красных есть хотя бы одна дуга.",
    hints: ["Дело в том, как буква нарисована.", "Можно ли нарисовать её одной линейкой?", "У зелёных букв нет ни одного изгиба."] },
  { id: 12, title: "Счёт", rule: "hiddenNumber", examples: ["СТОЛ","СТРИЖ","СЕМЬЯ","ДОМ","ЛИСА"], question: ["МЕСТО","ТРАВА","ЕДВА"],
    explain: "В каждом зелёном слове спрятано число: СТОл, сТРИж, СЕМЬя, меСТО, еДВА.",
    hints: ["Слова целиком. В зелёных что-то спрятано.", "Поищите внутри зелёного слова слово покороче.", "Спрятанное слово — число."] },
  { id: 13, title: "Близнецы", rule: "doubles", examples: ["ВАННА","ТЕРРАСА","БАНАН"], question: ["СУББОТА"],
    explain: "Буква рядом со своим близнецом — жёлтая. Остальные: гласные зелёные, согласные красные. В БАНАНЕ буквы повторяются, но не стоят рядом.",
    hints: ["Здесь смешаны две идеи.", "Зелёный и красный — разделение, которое вы уже встречали.", "Жёлтая буква стоит прямо рядом со своим близнецом."] },
  { id: 14, title: "Пальцы", rule: "keyboard", examples: ["ЦЕХ","ВОДА","МОСТИК"], question: ["КЛАВИША"],
    explain: "Цвета повторяют ряды клавиатуры ЙЦУКЕН: верхний ряд зелёный, средний жёлтый, нижний красный.",
    hints: ["Посмотрите на свои руки.", "Каждый цвет — семья букв, а не место в слове.", "Ряды клавиатуры."] },
  { id: 15, title: "Одна строка", rule: "oneRow", examples: ["ПРОВОД","ВОДА","ЦЕХ","ДОМ","ПЛАНЕТА"], question: ["ЖАЛО","КНИГА","ЛАПА"],
    explain: "Зелёное слово можно набрать, не уходя с одного ряда клавиатуры.",
    hints: ["Слова целиком. Вспомните правило про клавиатуру.", "Пальцы почти не двигаются, когда набираешь зелёные слова.", "Каждое зелёное слово помещается в один ряд клавиатуры."] },
  { id: 16, title: "Зеркало", rule: "symmetric", examples: ["ТОМАТ","ШАХМАТЫ","СОБАКА"], question: ["ПОТОЛОК"],
    explain: "Зелёные буквы не меняются в зеркале: их левая и правая половины совпадают.",
    hints: ["Дело в форме буквы.", "Поставьте рядом с буквой зеркало.", "У зелёных букв левая и правая половины одинаковые."] },
  { id: 17, title: "По порядку", rule: "alphabetical", examples: ["ГОРСТЬ","ДЕНЬ","ВЕРХ","ЛИСА","ДОМ"], question: ["БИТЬ","РУКА","ЕНОТ"],
    explain: "Буквы зелёного слова уже стоят в алфавитном порядке: Г-О-Р-С-Т-Ь.",
    hints: ["Слова целиком. Посмотрите на порядок букв.", "Представьте словарь, но внутри одного слова.", "Буквы зелёных слов идут по алфавиту."] },
  { id: 18, title: "Зоопарк", rule: "hiddenAnimal", examples: ["КОТЛЕТА","ЛЕВША","МАЯК","СТОЛ","ПЛАНЕТА"], question: ["РАКЕТА","ДИВАН","УЖИН"],
    explain: "В каждом зелёном слове живёт животное: КОТлета, ЛЕВша, маЯК, РАКета, УЖин.",
    hints: ["Слова целиком. В зелёных кто-то живёт.", "Поищите внутри зелёного слова слово покороче.", "Короткое слово — животное."] },
  { id: 19, title: "Ступеньки", rule: "rising", examples: ["ВЕСТЬ","КОФЕ","АЛЛЕЯ"], question: ["ТЕННИС"],
    explain: "Каждая буква сравнивается с предыдущей: дальше по алфавиту — зелёная, раньше — красная. Первая буква и повтор предыдущей — жёлтые.",
    hints: ["Каждая буква с чем-то сравнивается.", "Сравните букву с соседкой слева.", "Подумайте об алфавитном порядке соседей."] },
  { id: 20, title: "Вверх ногами", rule: "upsideDown", examples: ["ФОН","ХОР","НОЖИК"], question: ["ЖИЗНЬ"],
    explain: "Зелёные буквы выглядят так же, если перевернуть их вверх ногами: Ж, И, Н, О, Ф, Х.",
    hints: ["Дело в форме буквы.", "Попробуйте перевернуть телефон.", "Зелёные буквы переживают поворот на 180°."] },
  { id: 21, title: "Наоборот", rule: "reversible", examples: ["КОТ","НОС","ЗАЛ","СУП","ДЫМ"], question: ["ВОР","ЛУК","ДОК"],
    explain: "Прочитанное задом наперёд, зелёное слово превращается в другое слово: КОТ → ТОК, НОС → СОН, ЗАЛ → ЛАЗ, ВОР → РОВ, ДОК → КОД.",
    hints: ["Слова целиком. Попробуйте другое направление.", "Прочитайте зелёные слова задом наперёд.", "Задом наперёд зелёное слово становится новым словом."] },
];

// ===== ВАЛИДАТОР =====
function solve(level, words) { return words.map(w => RULES[level.rule].f(w)); }
function mapping(altOut, mainOut) {
  const m = {}, back = {};
  for (let i = 0; i < altOut.length; i++) for (let j = 0; j < altOut[i].length; j++) {
    const a = altOut[i][j], b = mainOut[i][j];
    if (m[a] && m[a] !== b) return null;
    if (back[b] && back[b] !== a) return null;
    m[a] = b; back[b] = a;
  }
  return m;
}
function validateLevel(level) {
  const issues = [];
  const rule = RULES[level.rule];
  if (!rule) return [`неизвестное правило «${level.rule}»`];
  const exOut = solve(level, level.examples), qOut = solve(level, level.question);
  const exColors = new Set(exOut.flat());
  const unseen = [...new Set(qOut.flat())].filter(c => !exColors.has(c));
  if (unseen.length) issues.push(`в ответе есть цвет, которого нет в примерах`);
  if (exColors.size < 2) issues.push("в примерах только один цвет");
  const pool = { ...RULES, ...ALT_RULES };
  for (const [name, alt] of Object.entries(pool)) {
    if (name === level.rule || alt.kind !== rule.kind) continue;
    const m = mapping(level.examples.map(w => alt.f(w)), exOut);
    if (!m) continue;
    const altQ = level.question.map(w => alt.f(w).map(c => m[c] || "?"));
    if (JSON.stringify(altQ) !== JSON.stringify(qOut)) issues.push(`правило «${name}» тоже объясняет примеры, но даёт другой ответ`);
  }
  return issues;
}
if (typeof module !== "undefined") module.exports = { RULES, LEVELS, validateLevel, solve };
