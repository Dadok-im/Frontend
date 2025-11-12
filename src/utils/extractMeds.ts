// 약명 패턴 추출 유틸: 설명어 및 수량 제거 후 약명만 반환

const FORM = "(서방정|장용정|정(?!제)|연질캡슐|캡슐|당의정)";
const FORM_RE = /(서방정|장용정|정|연질캡슐|캡슐|당의정)$/;

const PSYCH_BASE_WHITELIST = new Set<string>([
  "씨프로바이",
  "화록소",
  "라니드",
  "부스코판당의",
  "에스시탈로프람",
  "세르트랄린",
  "플루옥세틴",
  "파록세틴",
  "벤라팍신",
  "듀록세틴",
  "아미트립틸린",
  "미르타자핀",
  "트라조돈",
  "로라제팜",
  "알프라졸람",
  "클로나제팜",
  "디아제팜",
  "쿠에티아핀",
  "올란자핀",
  "아리피프라졸",
  "리스페리돈",
]);

const PSYCH_FULL_WHITELIST = new Set<string>([
  "씨프로바이정",
  "화록소정",
  "라니드정",
  "부스코판당의정",
]);

function isInPsychWhitelist(name: string): boolean {
  if (PSYCH_FULL_WHITELIST.has(name)) return true;
  const base = name.replace(FORM_RE, "");
  return PSYCH_BASE_WHITELIST.has(base);
}

export function extractMedsFromText(raw: string): string[] {
  if (!raw) return [];

  const text = raw
    .replace(/[［\[\(].*?[］\)\]]/g, " ")
    .replace(/[㎎]/g, "mg")
    .replace(/[^\S\r\n]+/g, " ")
    .trim();

  const RE = new RegExp(
    `([가-힣A-Za-z][가-힣A-Za-z\\-]{1,})\\s*(?:\\d+\\s*(?:mg|mcg|㎍|mL|IU))?\\s*${FORM}(?=$|[\\s)\\].,:;!?\\d])`,
    "gu",
  );

  const STOPWORDS = new Set([
    "백색",
    "백색의",
    "무색",
    "분홍색",
    "황색",
    "갈색",
    "청색",
    "원형",
    "장방형",
    "타원형",
    "장축",
    "정제",
    "캡슐제",
    "질환",
    "치료제",
    "예방약",
    "조절제",
    "보관",
    "실온보관",
    "임의중단",
    "명의중단",
    "확장",
    "투약",
    "용량",
    "정량",
    "성분",
    "효능",
    "효과",
    "주의",
    "경고",
    "신경전달물질",
    "환자",
    "복용",
    "제형",
  ]);
  const SUFFIX_BLOCK = ["의", "색", "형"];

  const out: string[] = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;

  while ((m = RE.exec(text)) !== null) {
    const base = m[1];
    const form = m[2];

    if (/^\d+$/.test(base)) continue;
    if (base.length < 2) continue;
    if (STOPWORDS.has(base)) continue;
    if (SUFFIX_BLOCK.some((s) => base.endsWith(s))) continue;

    const name = `${base}${form}`;
    if (!seen.has(name)) {
      seen.add(name);
      out.push(name);
    }
  }

  const whitelisted = out.filter(isInPsychWhitelist);
  return whitelisted.length > 0 ? whitelisted : out;
}
