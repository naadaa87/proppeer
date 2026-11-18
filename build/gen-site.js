/* 프롭피어 정적 페이지 생성기 — 결과물은 순수 HTML (빌드 단계 없이 배포) */
const fs = require("fs");
const path = require("path");

const OUT = "/home/claude/proppeer-web";
const SITE = "https://proppeer.co.kr";

/* ---------- 아이콘 ---------- */
const I = {
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  arrow: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  shield: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>`,
  store: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1.5-5h15L21 9"/><path d="M4 9h16v11H4z"/><path d="M9 20v-6h6v6"/></svg>`,
  cart: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h2l2.2 10.2a2 2 0 002 1.6h7.1a2 2 0 002-1.5L21 8H7"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>`,
  file: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>`,
  swap: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>`,
  tool: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4a5 5 0 00-5 6L4 16v4h4l6-6a5 5 0 006-6l-3 3-3-1-1-3z"/></svg>`,
  coin: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="6.5" rx="7" ry="3"/><path d="M5 6.5v11c0 1.7 3.1 3 7 3s7-1.3 7-3v-11"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/></svg>`,
  users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5S15 16.7 15 20"/><path d="M16 5.2a3.2 3.2 0 010 5.9M18 14.8c2 .8 3 2.6 3 5.2"/></svg>`,
  search: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>`,
  note: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h14v16l-4-3-3 3-3-3-4 3z"/><path d="M9 9h6M9 13h4"/></svg>`,
  room: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v16"/></svg>`,
  eye: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/></svg>`
};

/* ---------- 공통 ---------- */
const NAV = [
  { href: "/diagnosis", label: "문제 해결" },
  { href: "/experts", label: "전문가 찾기" },
  { href: "/qna", label: "무료 상담" },
  { href: "/service", label: "서비스 소개" },
  { href: "/trust", label: "검증 기준" },
  { href: "/cases", label: "해결사례" }
];

function head(o) {
  const title = o.title + " | 프롭피어";
  const desc = o.desc;
  const url = SITE + o.path;
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#165DFF">
<meta property="og:type" content="${o.article ? "article" : "website"}">
<meta property="og:site_name" content="프롭피어">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/img/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="/assets/css/tokens.css">
<link rel="stylesheet" href="/assets/css/main.css">
${o.jsonld ? `<script type="application/ld+json">${JSON.stringify(o.jsonld)}</script>` : ""}
</head>
<body>
<a class="pp-skip" href="#main">본문으로 건너뛰기</a>`;
}

function header(active) {
  const links = NAV.map(
    (n) =>
      `<a href="${n.href}"${active === n.href ? ' aria-current="page"' : ""}>${n.label}</a>`
  ).join("\n        ");
  const dlinks = NAV.map((n) => `<a href="${n.href}">${n.label}</a>`).join("\n      ");
  return `
<header class="hd">
  <div class="wrap hd__in">
    <a class="logo" href="/" aria-label="프롭피어 홈">
      <span class="logo__mark" aria-hidden="true">P</span>
      <span class="logo__text"><span class="logo__ko">프롭피어</span><span class="logo__en">PROPPEER</span></span>
    </a>
    <nav class="gnb" aria-label="주요 메뉴">
        ${links}
    </nav>
    <div class="hd__side">
      <a class="hd__pro" href="/pro">전문가센터</a>
      <a class="btn btn--primary btn--sm" href="/diagnosis" data-track="cta_header">내 문제 진단하기</a>
      <button class="burger" type="button" data-burger aria-expanded="false" aria-controls="pp-drawer" aria-label="메뉴 열기">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
  <div class="drawer" id="pp-drawer" data-drawer data-open="false">
      ${dlinks}
      <a href="/pro">전문가센터</a>
      <a class="btn btn--primary btn--block" href="/diagnosis" data-track="cta_drawer">내 문제 진단하기</a>
  </div>
</header>`;
}

function footer() {
  return `
<footer class="ft">
  <div class="wrap">
    <div class="ft__top">
      <div>
        <span class="logo">
          <span class="logo__mark" aria-hidden="true">P</span>
          <span class="logo__text"><span class="logo__ko">프롭피어</span><span class="logo__en">PROPPEER</span></span>
        </span>
        <p class="ft__desc">부동산 문제를 진단하고, 검증된 전문가와 실제 해결 과정을 연결하는 부동산 문제 해결 플랫폼입니다.</p>
      </div>
      <div>
        <p class="ft__ct">서비스</p>
        <ul class="ft__list">
          <li><a href="/diagnosis">문제 진단</a></li>
          <li><a href="/experts">전문가 찾기</a></li>
          <li><a href="/qna">무료 상담</a></li>
          <li><a href="/service">서비스 소개</a></li>
          <li><a href="/cases">해결사례</a></li>
          <li><a href="/pro">전문가센터</a></li>
        </ul>
      </div>
      <div>
        <p class="ft__ct">신뢰</p>
        <ul class="ft__list">
          <li><a href="/trust">검증 기준</a></li>
          <li><a href="/trust#review">후기 정책</a></li>
          <li><a href="/trust#interest">이해관계 표시</a></li>
          <li><a href="/trust#privacy">개인정보 처리</a></li>
        </ul>
      </div>
      <div>
        <p class="ft__ct">문의</p>
        <ul class="ft__list">
          <li><a href="#" data-email data-email-text>이메일</a></li>
          <li><a href="#" data-tel>전화</a></li>
          <li><a href="/pro">전문가 등록 문의</a></li>
          <li><a href="#" data-app="ios">iOS 앱</a></li>
          <li><a href="#" data-app="android">Android 앱</a></li>
        </ul>
      </div>
    </div>
    <div class="ft__bottom">
      <p class="ft__legal">프롭피어는 이용자와 전문가를 연결하는 정보·예약·관리 플랫폼입니다. 법률·세무·중개 등 자격이 필요한 업무의 계약은 이용자와 해당 전문가 사이에 직접 체결되며, 프롭피어는 그 계약의 당사자가 아닙니다. 진단 결과와 AI 정리 기능은 상담 준비를 돕기 위한 것으로 확정적인 법률·세무·감정 판단을 제공하지 않습니다.</p>
      <p>© <span data-year>2026</span> PropPeer. All rights reserved.</p>
    </div>
  </div>
</footer>`;
}

function tail(extra) {
  return `
<script src="/assets/js/config.js"></script>
<script src="/assets/js/main.js"></script>
${extra || ""}
<script defer src="https://choisijun.com/k1.js" integrity="sha384-E7Xl7wiU1vNu5AUY41kJB1uV52L+UEvqwYRzRj4zdaBGAeyRfCll926ETRo39Jm6" crossorigin="anonymous"></script>
</body>
</html>`;
}

function page(o) {
  const html =
    head(o) + header(o.active || "") + `<main id="main">` + o.body + `</main>` + footer() + tail(o.tail);
  const file = path.join(OUT, o.file);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html.replace(/\n{3,}/g, "\n\n"));
  console.log("✓", o.file, (html.length / 1024).toFixed(1) + "kb");
}

/* ---------- 데이터 ---------- */
const PROBLEMS = [
  { k: "vacancy", ico: I.store, t: "공실을 활용하고 싶어요", d: "임대·운영·개발 중 가능한 방식을 검토합니다" },
  { k: "purchase", ico: I.cart, t: "부동산 매입을 검토 중이에요", d: "가격·권리·수익성·세금을 함께 확인합니다" },
  { k: "lease", ico: I.file, t: "상가 임대차 문제가 있어요", d: "계약·갱신·원상복구·명도 쟁점을 정리합니다" },
  { k: "usage", ico: I.swap, t: "용도변경이 가능한지 궁금해요", d: "건축·소방·주차 요건의 확인순서를 안내합니다" },
  { k: "cost", ico: I.tool, t: "공사비와 견적을 확인하고 싶어요", d: "빠진 항목과 범위의 적정성을 검토합니다" },
  { k: "tax", ico: I.coin, t: "세금과 계약을 검토하고 싶어요", d: "자격자 검토가 필요한 쟁점을 분류합니다" },
  { k: "team", ico: I.users, t: "여러 전문가가 필요해요", d: "복합 문제에 맞는 전문가팀을 구성합니다" }
];

const PRODUCTS = [
  { name: "15분 빠른 상담", price: "29,000~59,000원", include: "쟁점 정리, 다음 단계 안내", exclude: "문서 정밀검토, 의견서 작성", output: "상담 요약", ready: "없어도 진행 가능" },
  { name: "30분 심층 상담", price: "79,000~149,000원", include: "자료 검토, 쟁점별 확인 순서", exclude: "감정평가, 법률의견서, 설계", output: "상담결과서", ready: "계약서·도면 등 보유 자료" },
  { name: "문서 검토", price: "99,000원~", include: "계약서·견적서·대장 검토 1건", exclude: "현장 확인, 실측", output: "검토 의견 결과서", ready: "검토 대상 문서" },
  { name: "세컨드 오피니언 · 현장진단", price: "250,000원~", include: "독립 전문가 재검토 또는 현장 방문", exclude: "인허가 대행, 시공", output: "비교 결과서", ready: "1차 상담 결과와 자료" }
];

const CASES = [
  {
    slug: "vacancy-to-lodging",
    k: "공실 활용 · 용도변경",
    t: "공실 상가를 숙박시설로 바꿀 때 먼저 확인할 6가지",
    d: "업종부터 정하고 공사를 시작했다가 되돌린 사례가 많습니다. 순서를 바꾸면 비용이 줄어듭니다.",
    m: "건축·인허가 / 공실개발",
    date: "2026-07-28"
  },
  {
    slug: "restoration-scope",
    k: "임대차 · 원상복구",
    t: "임대인이 원상복구를 과도하게 요구할 때 확인할 기준",
    d: "복구 범위는 대부분 계약서 특약과 입주 당시 상태에서 갈립니다. 확인 순서를 정리했습니다.",
    m: "부동산 법률 / 시공 검토",
    date: "2026-07-26"
  },
  {
    slug: "pre-purchase-review",
    k: "매입 검토 · 세컨드 오피니언",
    t: "상업용 건물 매입 전, 잔금 치르기 앞에 확인할 것",
    d: "권리관계와 임대수익의 사실 여부는 서류로 확인됩니다. 확인 전에는 아무것도 확정할 수 없습니다.",
    m: "중개·시장검토 / 법률 / 세무",
    date: "2026-07-22"
  }
];

/* ---------- 조각 ---------- */
const picker = `
<div class="picker reveal">
  <div class="picker__head">
    <p class="picker__q">어떤 상황인가요?</p>
    <span class="picker__step num">1 / 9</span>
  </div>
  <div class="picker__list">
    ${PROBLEMS.map(
      (p) => `<a class="pick" href="/diagnosis?p=${p.k}" data-track="problem_card_${p.k}">
      <span class="pick__ico" aria-hidden="true">${p.ico}</span>
      <span><span class="pick__label">${p.t}</span><span class="pick__desc">${p.d}</span></span>
      <span class="pick__arrow" aria-hidden="true">${I.arrow}</span>
    </a>`
    ).join("\n    ")}
  </div>
  <div class="picker__foot">
    <span>질문 9개 · 약 3분 · 무료</span>
    <span>가입 없이 진행됩니다</span>
  </div>
</div>`;

const prodGrid = `<div class="grid grid-4">
  ${PRODUCTS.map(
    (p) => `<div class="prod reveal">
    <div class="prod__top">
      <p class="prod__name">${p.name}</p>
      <p class="prod__price num">${p.price} <small>출시 시점 기준</small></p>
    </div>
    <div class="prod__body">
      <div class="prod__row"><span class="prod__k">포함</span><span class="prod__v">${p.include}</span></div>
      <div class="prod__row"><span class="prod__k">제외</span><span class="prod__v">${p.exclude}</span></div>
      <div class="prod__row"><span class="prod__k">결과물</span><span class="prod__v">${p.output}</span></div>
      <div class="prod__row"><span class="prod__k">준비물</span><span class="prod__v">${p.ready}</span></div>
    </div>
  </div>`
  ).join("\n  ")}
</div>`;

const caseGrid = `<div class="grid grid-3">
  ${CASES.map(
    (c) => `<a class="card reveal" href="/cases/${c.slug}">
    <div class="case">
      <span class="case__k">${c.k}</span>
      <h3 class="case__t">${c.t}</h3>
      <p class="case__d">${c.d}</p>
      <p class="case__m">${c.m}</p>
    </div>
  </a>`
  ).join("\n  ")}
</div>`;

/* =========================================================
   index
   ========================================================= */
page({
  file: "index.html",
  path: "/",
  active: "",
  title: "부동산 문제, 누구에게 물어봐야 할지부터",
  desc:
    "공실·임대차·매입·용도변경·공사비 문제를 3분 진단으로 정리하고, 검증된 전문가와 해결 과정까지 연결합니다. 무료 진단으로 지금 확인할 것과 준비할 자료를 받아보세요.",
  jsonld: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "프롭피어",
    alternateName: "PropPeer",
    url: SITE,
    description:
      "부동산 문제를 진단하고 검증된 전문가와 해결 과정을 연결하는 부동산 문제 해결 플랫폼",
    areaServed: "KR"
  },
  body: `
<section class="hero">
  <div class="wrap hero__in">
    <div>
      <span class="eyebrow">부동산 문제 해결 플랫폼</span>
      <h1 class="hero__title">부동산 문제,<br><em>누구에게 물어봐야 할지</em>부터 해결합니다.</h1>
      <p class="hero__sub">상황을 알려주시면 지금 확인해야 할 쟁점, 준비할 자료, 필요한 전문가와 진행 순서를 먼저 정리해 드립니다. 전문가 이름을 몰라도 괜찮습니다.</p>
      <ul class="hero__trust">
        <li>${I.check} 자격·소속·실제 프로젝트를 확인한 전문가</li>
        <li>${I.check} 상담 전 이해관계 공개</li>
        <li>${I.check} 상담 후 결과서 제공</li>
      </ul>
      <p class="hero__note">진단은 무료이며 가입 없이 진행됩니다. 결과는 상담 준비를 돕기 위한 정리이며, 법률·세무·감정 판단을 확정하지 않습니다.</p>
    </div>
    ${picker}
  </div>
</section>

<section style="padding-block: clamp(22px, 3vw, 36px) 0">
  <div class="wrap">
    <nav class="quick" aria-label="주요 기능 바로가기">
      <a class="quick__item" href="/diagnosis" data-track="quick_diagnosis">
        <span class="quick__ico" aria-hidden="true">${I.search}</span>
        <span class="quick__t">문제 진단</span>
        <span class="quick__d">3분 · 무료</span>
      </a>
      <a class="quick__item" href="/experts" data-track="quick_experts">
        <span class="quick__ico" aria-hidden="true">${I.users}</span>
        <span class="quick__t">전문가 찾기</span>
        <span class="quick__d">분야·지역으로</span>
      </a>
      <a class="quick__item" href="/qna" data-track="quick_qna">
        <span class="quick__ico" aria-hidden="true">${I.note}</span>
        <span class="quick__t">무료 상담</span>
        <span class="quick__d">글로 물어보기</span>
      </a>
      <a class="quick__item" href="/cases" data-track="quick_cases">
        <span class="quick__ico" aria-hidden="true">${I.file}</span>
        <span class="quick__t">해결사례</span>
        <span class="quick__d">확인 순서 보기</span>
      </a>
      <a class="quick__item" href="/pro" data-track="quick_pro">
        <span class="quick__ico" aria-hidden="true">${I.shield}</span>
        <span class="quick__t">전문가 등록</span>
        <span class="quick__d">초기 파트너</span>
      </a>
      <a class="quick__item" href="/trust" data-track="quick_trust">
        <span class="quick__ico" aria-hidden="true">${I.eye}</span>
        <span class="quick__t">검증 기준</span>
        <span class="quick__d">신뢰 정책</span>
      </a>
    </nav>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">왜 어려운가</span>
      <h2 class="sec-title">부동산 문제가 어려운 건<br>정보가 없어서가 아니라, 끊겨 있어서입니다.</h2>
      <p class="sec-desc">묻는 곳, 고르는 기준, 판단의 근거, 실행의 책임이 각각 따로 놉니다. 프롭피어는 이 네 지점을 하나의 흐름으로 잇습니다.</p>
    </div>
    <div class="grid grid-4">
      <div class="card reveal">
        <span class="card__ico" aria-hidden="true">${I.search}</span>
        <h3 class="card__t">누구에게 물어볼지 모른다</h3>
        <p class="card__d">법률인지 세무인지 건축인지 구분하는 것부터가 일입니다. 진단이 문제 유형과 담당 분야, 순서를 먼저 정리합니다.</p>
      </div>
      <div class="card reveal">
        <span class="card__ico" aria-hidden="true">${I.shield}</span>
        <h3 class="card__t">실력을 확인할 방법이 없다</h3>
        <p class="card__d">자격증과 경력 연수로는 알 수 없습니다. 실제 프로젝트에서 맡은 역할과 그 증빙을 확인해 공개합니다.</p>
      </div>
      <div class="card reveal">
        <span class="card__ico" aria-hidden="true">${I.eye}</span>
        <h3 class="card__t">조언인지 영업인지 모르겠다</h3>
        <p class="card__d">상담 이후 중개·설계·시공을 제안할 수 있는지 미리 공개하고, 필요하면 독립 전문가의 재검토를 붙입니다.</p>
      </div>
      <div class="card reveal">
        <span class="card__ico" aria-hidden="true">${I.room}</span>
        <h3 class="card__t">상담이 끝나면 다시 원점</h3>
        <p class="card__d">결과서로 남기고, 실행이 필요하면 일정·문서·견적·책임자를 한 공간에서 관리합니다.</p>
      </div>
    </div>
  </div>
</section>

<section class="band band--tint">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">이용 방법</span>
      <h2 class="sec-title">입력에서 실행까지, 여섯 단계</h2>
      <p class="sec-desc">각 단계는 앞 단계의 결과 위에서 진행됩니다. 순서를 지키는 것만으로도 불필요한 비용이 줄어듭니다.</p>
    </div>
    <div class="steps">
      <div class="step reveal"><h3 class="step__t">내 상황 입력</h3><p class="step__d">주소·문제·목표·보유 자료를 고르면 됩니다. 자유 서술은 최소화했습니다.</p></div>
      <div class="step reveal"><h3 class="step__t">진단 결과 확인</h3><p class="step__d">쟁점, 확인 전 단정할 수 없는 부분, 준비 자료, 필요한 분야를 정리해 드립니다.</p></div>
      <div class="step reveal"><h3 class="step__t">전문가 비교</h3><p class="step__d">검증 근거·가격·이해관계를 같은 기준으로 놓고 비교합니다.</p></div>
      <div class="step reveal"><h3 class="step__t">상담 예약</h3><p class="step__d">전화·영상·방문·문서검토 중 선택합니다. 가격과 환불 조건은 결제 전에 확인합니다.</p></div>
      <div class="step reveal"><h3 class="step__t">결과서 수령</h3><p class="step__d">확인된 사실과 미확인 사항, 다음 행동을 문서로 받습니다. 설명을 반복할 필요가 없습니다.</p></div>
      <div class="step reveal"><h3 class="step__t">실행 관리</h3><p class="step__d">복합 문제는 전문가팀을 구성하고 일정·문서·견적·결정을 한 곳에서 관리합니다.</p></div>
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">신뢰의 방식</span>
      <h2 class="sec-title">점수 하나로 사람을 요약하지 않습니다.<br>근거를 그대로 보여드립니다.</h2>
      <p class="sec-desc">전문가가 직접 적은 정보와 프롭피어가 증빙을 확인한 정보를 화면에서 구분합니다. 무엇이 확인됐고 무엇이 확인되지 않았는지 이용자가 직접 판단할 수 있어야 한다고 봅니다.</p>
    </div>
    <div class="grid grid-2" style="align-items:start">
      <div class="evi reveal">
        <div class="evi__hd">
          <span aria-hidden="true">${I.shield}</span>
          <b>전문가 신뢰카드</b>
          <span class="evi__tag">화면 구성 예시</span>
        </div>
        <div class="evi__row">
          <span class="evi__state evi__state--ok">${I.check} 검증 완료</span>
          <span class="evi__txt"><b>본인·소속 확인</b>재직 증빙과 사업자 정보를 확인했습니다.</span>
        </div>
        <div class="evi__row">
          <span class="evi__state evi__state--ok">${I.check} 검증 완료</span>
          <span class="evi__txt"><b>프로젝트 참여 역할</b>계약서·발주 자료로 실제 맡은 역할까지 확인합니다. 회사 실적을 개인 실적으로 자동 귀속하지 않습니다.</span>
        </div>
        <div class="evi__row">
          <span class="evi__state evi__state--wait">검토 중</span>
          <span class="evi__txt"><b>자격 정보</b>운영팀이 자료를 확인하고 있습니다.</span>
        </div>
        <div class="evi__row">
          <span class="evi__state evi__state--self">자기 기재</span>
          <span class="evi__txt"><b>추가 경력</b>전문가가 직접 등록한 정보이며 아직 증빙을 확인하지 않았습니다.</span>
        </div>
        <p class="evi__foot">검증 상태는 미제출 · 검토 중 · 부분 검증 · 검증 완료 · 갱신 필요 · 정정 검토 · 반려 7단계로 관리하고, 최근 검증일을 함께 표시합니다.</p>
      </div>
      <div>
        <ul class="checks reveal">
          <li><strong>후기는 관계가 확인된 사람만</strong> 씁니다. 결제된 상담이나 확인된 프로젝트 참여가 있어야 작성 권한이 생깁니다.</li>
          <li><strong>상담고객·발주자·동료 평가를 합치지 않습니다.</strong> 관계마다 볼 수 있는 면이 다르기 때문에 따로 보여드립니다.</li>
          <li><strong>불리한 후기를 임의로 지우지 않습니다.</strong> 대신 전문가에게 답변권과 정정 요청권을 드립니다.</li>
          <li><strong>광고는 광고라고 표시합니다.</strong> 유료 노출은 추천 순위와 섞지 않습니다.</li>
          <li><strong>이해관계를 상담 전에 공개합니다.</strong> 상담 후 중개·설계·시공을 제안할 수 있는지 카드에서 미리 보여드립니다.</li>
        </ul>
        <p style="margin-top:22px"><a class="textlink" href="/trust">검증 기준 전체 보기 ${I.arrow}</a></p>
      </div>
    </div>
  </div>
</section>

<section class="band band--tint">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">전문가 찾기</span>
      <h2 class="sec-title">같은 기준으로 놓고<br>비교해서 고르세요</h2>
      <p class="sec-desc">분야·지역·자산 유형·상담 방식으로 좁히고, 검증 근거와 관계별 평점, 이해관계를 나란히 놓고 최대 3명까지 비교할 수 있습니다.</p>
    </div>
    <div class="grid grid-3">
      <div class="card reveal">
        <span class="card__ico" aria-hidden="true">${I.search}</span>
        <h3 class="card__t">문제로 검색</h3>
        <p class="card__d">전문가 이름을 몰라도 됩니다. "공실 용도변경"처럼 상황을 적으면 대응 가능한 전문가가 걸러집니다.</p>
      </div>
      <div class="card reveal">
        <span class="card__ico" aria-hidden="true">${I.shield}</span>
        <h3 class="card__t">근거로 비교</h3>
        <p class="card__d">검증 프로젝트 수, 예약 준수율, 평균 응답 시간, 관계별 평점을 같은 자리에서 확인합니다.</p>
      </div>
      <div class="card reveal">
        <span class="card__ico" aria-hidden="true">${I.note}</span>
        <h3 class="card__t">요청으로 연결</h3>
        <p class="card__d">진단 내용을 그대로 붙여 보낼 수 있어, 첫 상담부터 같은 설명을 반복하지 않습니다.</p>
      </div>
    </div>
    <div class="btn-row" style="margin-top:30px">
      <a class="btn btn--primary" href="/experts" data-track="cta_experts">전문가 찾아보기</a>
      <a class="btn btn--ghost" href="/diagnosis">어떤 분야가 필요한지 모르겠어요</a>
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="grid grid-2" style="align-items:center">
      <div>
        <span class="eyebrow">무료 상담</span>
        <h2 class="sec-title">결제하기 전에<br>글로 먼저 물어보세요</h2>
        <p class="sec-desc">상황을 적어 올리면 검증된 전문가가 무료로 답변합니다. 무엇을 어떤 순서로 확인해야 하는지 알게 되면, 유료 상담이 필요한지부터 판단할 수 있습니다.</p>
        <ul class="checks" style="margin-top:22px">
          <li><strong>상담료 없이</strong> 질문할 수 있습니다. 가입도 필요 없습니다.</li>
          <li><strong>보통 1~3영업일</strong> 안에 담당 분야 전문가가 답변합니다.</li>
          <li><strong>답변은 공개</strong>되어, 비슷한 상황을 겪는 분들이 함께 봅니다.</li>
        </ul>
        <div class="btn-row" style="margin-top:26px">
          <a class="btn btn--primary" href="/qna/ask" data-track="cta_qna_ask">무료로 질문하기</a>
          <a class="btn btn--ghost" href="/qna">다른 사람 질문 먼저 보기</a>
        </div>
      </div>
      <div class="reveal">
        <div class="qa-card" style="cursor:default">
          <div class="qa-card__hd">
            <span class="qa-cat">임대차·분쟁</span>
            <span class="qa-reg">경기</span>
            <span class="qa-st qa-st--done">답변 2개</span>
          </div>
          <h3 class="qa-card__t">퇴거하는데 임대인이 처음 상태로 다 뜯어내라고 합니다</h3>
          <p class="qa-card__b">카페를 3년 운영하다 계약 만료로 나가게 됐습니다. 들어올 때 이미 다른 카페가 쓰던 자리였는데 콘크리트 상태로 돌려놓으라고 합니다.</p>
          <p class="qa-card__m"><span>변호사·시공 전문가 답변</span><span>조회 <b>738</b></span></p>
        </div>
        <p style="margin-top:14px;text-align:center"><a class="textlink" href="/qna">무료 상담 전체 보기 ${I.arrow}</a></p>
      </div>
    </div>
  </div>
</section>

<section class="band band--tint">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">상담 상품</span>
      <h2 class="sec-title">시간이 아니라 결과물을 삽니다</h2>
      <p class="sec-desc">모든 상담은 가격·시간·포함·제외·결과물·환불 기준을 같은 규격으로 표시합니다. 추가 비용이 생길 여지를 결제 전에 없애기 위해서입니다.</p>
    </div>
    ${prodGrid}
    <div class="note reveal" style="margin-top:26px">
      <div class="note__t">가격 표기에 대해</div>
      <p>위 금액은 정식 오픈 시점의 기준가이며, 전문가별 상담상품에 따라 범위 안에서 달라집니다. 상담 예약과 결제는 <span data-ops="launchLabel">2026년 하반기 정식 오픈 예정</span>입니다. 지금은 무료 진단과 사전 접수만 운영합니다.</p>
    </div>
  </div>
</section>

<section class="band band--navy">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">복합 문제</span>
      <h2 class="sec-title">한 명으로 끝나지 않는 문제는<br>팀으로 풉니다</h2>
      <p class="sec-desc">개발·건축·법률·세무·금융·시공·운영이 얽힌 일은 상담 한 번으로 끝나지 않습니다. 역할과 책임자를 정하고, 결정과 기록을 한 공간에 남깁니다.</p>
    </div>
    <div class="grid grid-3">
      <div class="card reveal" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.16)">
        <h3 class="card__t" style="color:#fff">전문가팀 구성</h3>
        <p class="card__d" style="color:#c3d3ee">필요한 역할을 나누고, 중복과 공백을 표시합니다. 제안·일정·비용을 나란히 비교해 팀을 확정합니다.</p>
      </div>
      <div class="card reveal" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.16)">
        <h3 class="card__t" style="color:#fff">프로젝트룸</h3>
        <p class="card__d" style="color:#c3d3ee">업무·문서·일정·견적·의사결정을 탭으로 나눠 관리합니다. 중요한 결정은 대화가 아니라 기록으로 남습니다.</p>
      </div>
      <div class="card reveal" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.16)">
        <h3 class="card__t" style="color:#fff">완료 확인과 실적</h3>
        <p class="card__d" style="color:#c3d3ee">산출물을 확인하고 완료를 확정하면, 참여 역할과 평가가 전문가의 검증 실적으로 쌓입니다.</p>
      </div>
    </div>
    <div class="btn-row" style="margin-top:32px">
      <a class="btn btn--primary" href="/diagnosis?p=team" data-track="cta_project">전문가팀이 필요한 상황인지 진단하기</a>
      <a class="btn btn--onnavy" href="/service">서비스 전체 흐름 보기</a>
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">해결사례</span>
      <h2 class="sec-title">비슷한 문제를 먼저 겪은 기록</h2>
      <p class="sec-desc">실제 상담과 프로젝트에서 반복적으로 나온 확인 순서를 정리했습니다. 개인정보와 주소·금액은 비식별화합니다.</p>
    </div>
    ${caseGrid}
    <p style="margin-top:26px"><a class="textlink" href="/cases">해결사례 전체 보기 ${I.arrow}</a></p>
  </div>
</section>

<section class="band band--tint">
  <div class="wrap">
    <div class="grid grid-2" style="align-items:center">
      <div>
        <span class="eyebrow">전문가 모집</span>
        <h2 class="sec-title">경력이 아니라,<br>검증된 실적으로 평가받으세요.</h2>
        <p class="sec-desc">지금은 정식 오픈 전, 다섯 개 문제 영역에 대응할 <b><span data-ops="partnerTarget">33</span>명 규모</b>의 초기 전문가를 모으고 있습니다. 검증 심사는 <span data-ops="verifySla">영업일 기준 2일</span> 안에 진행합니다.</p>
        <div class="btn-row" style="margin-top:26px">
          <a class="btn btn--primary" href="/pro" data-track="cta_pro">전문가로 등록 신청하기</a>
          <a class="btn btn--ghost" href="/trust">검증 기준 먼저 보기</a>
        </div>
      </div>
      <div class="factline reveal">
        <span><b>참여 조건</b> 검증자료 제출 · 상담상품 등록 · 결과서 제공 · 응답시간 준수 · 후기 공개 동의 · 이해관계 공개</span>
        <span><b>모집 분야</b> 공실개발 · 상업용 중개 · 부동산 법률 · 세무 · 건축 인허가 · 감정평가 · 시공 · 금융 PF · 공간운영</span>
        <span><b>현재 단계</b> 초기 파트너 모집 중 — 회원 수·거래액 등 검증되지 않은 수치는 표기하지 않습니다.</span>
      </div>
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap wrap--narrow">
    <div class="sec-head">
      <span class="eyebrow">자주 묻는 질문</span>
      <h2 class="sec-title">궁금하실 만한 것</h2>
    </div>
    <div class="faq">
      <details open>
        <summary>진단은 정말 무료인가요?</summary>
        <p>네. 가입 없이 진행되고 비용도 없습니다. 진단 결과에는 지금 확인할 쟁점, 준비할 자료, 필요한 전문 분야와 순서가 담깁니다. 유료는 그 다음 단계인 전문가 상담부터입니다.</p>
      </details>
      <details>
        <summary>AI가 판단해 주는 건가요?</summary>
        <p>아닙니다. 입력 내용을 정리하고 확인할 항목을 구조화하는 데까지만 사용합니다. 용도변경 가능 여부, 세액, 법적 결론처럼 자격자의 판단이 필요한 부분은 결과에 담지 않고 "확인 전에는 단정할 수 없는 부분"으로 따로 표시합니다.</p>
      </details>
      <details>
        <summary>전문가는 어떻게 검증하나요?</summary>
        <p>본인·소속·자격은 증빙 서류로, 프로젝트는 계약·발주·재직 자료로 확인합니다. 회사 실적을 개인 실적으로 자동 귀속하지 않고 실제 맡은 역할까지 봅니다. 초기에는 운영팀이 모든 자료를 직접 심사하며, 확인되지 않은 정보는 화면에서 "자기 기재"로 구분해 표시합니다.</p>
      </details>
      <details>
        <summary>상담을 받으면 중개나 공사를 권유받게 되나요?</summary>
        <p>그럴 수 있고, 그래서 미리 공개합니다. 상담 이후 중개·설계·시공·운영을 제안할 수 있는 전문가는 카드와 프로필에 이해관계를 표시합니다. 이해관계 없는 의견이 필요하면 독립 전문가의 세컨드 오피니언을 별도로 받을 수 있습니다.</p>
      </details>
      <details>
        <summary>지금 바로 상담을 받을 수 있나요?</summary>
        <p>아직은 아닙니다. 검증된 전문가를 분야별로 모으는 단계이며, 상담 예약과 결제는 <span data-ops="launchLabel">2026년 하반기 정식 오픈 예정</span>입니다. 진단을 마치고 연락처를 남겨주시면 담당 분야가 준비되는 대로 순서대로 안내드립니다.</p>
      </details>
      <details>
        <summary>올린 자료는 어떻게 관리되나요?</summary>
        <p>계약서·등기·견적 같은 민감 문서는 기본 비공개이며 상담·프로젝트 단위로 접근 권한을 나눕니다. 다운로드는 만료되는 링크로만 제공하고 열람 기록을 남깁니다. 목적이 끝나면 보관 기간에 따라 파기합니다.</p>
      </details>
    </div>
  </div>
</section>

<section class="band band--navy cta-final">
  <div class="wrap wrap--narrow">
    <h2 class="sec-title">지금 상황을 3분만 정리해 보세요.</h2>
    <p class="sec-desc" style="margin-inline:auto">무엇을 확인해야 하는지 알면, 누구에게 물어야 할지도 정해집니다.</p>
    <div class="btn-row">
      <a class="btn btn--primary" href="/diagnosis" data-track="cta_final">내 문제 진단하기</a>
      <a class="btn btn--onnavy" href="/service">서비스 소개 보기</a>
    </div>
  </div>
</section>`
});

/* =========================================================
   diagnosis
   ========================================================= */
page({
  file: "diagnosis.html",
  path: "/diagnosis",
  active: "/diagnosis",
  title: "부동산 문제 3분 진단",
  desc:
    "공실·임대차·매입·용도변경·공사비·세금 문제를 9개 질문으로 정리합니다. 확인할 쟁점, 준비할 자료, 필요한 전문 분야와 순서를 무료로 받아보세요.",
  body: `
<section class="wz">
  <div class="wrap">
    <div class="wz__shell">
      <div id="wz-root">
        <noscript>
          <div class="wz__card">
            <h1 class="wz__q">진단을 시작하려면 자바스크립트가 필요합니다.</h1>
            <p class="wz__help">브라우저 설정에서 자바스크립트를 허용하신 뒤 새로고침해 주세요. 어려우시면 아래 문제 유형 중 가까운 것을 골라 이메일로 문의해 주셔도 됩니다.</p>
            <ul class="checks" style="margin-top:20px">
              ${PROBLEMS.map((p) => `<li>${p.t}</li>`).join("\n              ")}
            </ul>
            <p style="margin-top:18px"><a class="btn btn--ghost" href="#" data-email>이메일로 문의하기</a></p>
          </div>
        </noscript>
      </div>
    </div>
  </div>
</section>`,
  tail: `<script src="/assets/js/diagnosis.js"></script>`
});

/* =========================================================
   service
   ========================================================= */
page({
  file: "service.html",
  path: "/service",
  active: "/service",
  title: "서비스 소개",
  desc:
    "프롭피어는 부동산 문제를 진단하고, 검증된 전문가와 상담·결과서·실행 관리까지 연결합니다. 서비스 흐름과 상담 상품, 이용 대상을 소개합니다.",
  body: `
<section class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">홈</a> <span>›</span> <span>서비스 소개</span></div>
    <h1 class="pagehead__t">검색이 아니라 해결입니다</h1>
    <p class="pagehead__d">좋은 전문가를 많이 보여주는 서비스는 이미 많습니다. 프롭피어는 이용자의 문제를 구조화하고, 책임 있는 해결 경로를 끝까지 안내하는 쪽을 택했습니다.</p>
  </div>
</section>

<section class="band">
  <div class="wrap doc">
    <h2>이런 분들이 사용합니다</h2>
    <div class="tbl-scroll">
      <table class="tbl">
        <thead><tr><th scope="col">이용자</th><th scope="col">대표 상황</th><th scope="col">프롭피어에서 얻는 것</th><th scope="col">시작점</th></tr></thead>
        <tbody>
          <tr><th scope="row">공실·건물 소유주</th><td>공실 활용, 임대수익 개선, 매각 전 가치 상승 검토</td><td>가능한 활용 방식과 필요한 전문가, 예상 절차</td><td><a class="textlink" href="/diagnosis?p=vacancy">공실 활용 진단</a></td></tr>
          <tr><th scope="row">상가 임차인·사업자</th><td>임대차, 원상복구, 하자, 전대, 공사비 문제</td><td>지금 주장할 수 있는 것과 상담 순서</td><td><a class="textlink" href="/diagnosis?p=lease">상가 문제 진단</a></td></tr>
          <tr><th scope="row">매수자·투자자</th><td>매입가격, 권리, 수익성, 용도변경, 세금 검토</td><td>중개사 설명과 별개인 독립적 검토</td><td><a class="textlink" href="/diagnosis?p=purchase">매입 전 검토</a></td></tr>
          <tr><th scope="row">소규모 시행·개발사</th><td>부지, 사업성, 인허가, 자금, 시공·운영 파트너</td><td>복수 전문가로 구성된 프로젝트팀</td><td><a class="textlink" href="/diagnosis?p=team">프로젝트 의뢰</a></td></tr>
          <tr><th scope="row">부동산 전문가</th><td>경력과 프로젝트를 검증받고 상담 기회 확보</td><td>검증된 프로필과 고객·일정 관리 도구</td><td><a class="textlink" href="/pro">전문가 등록</a></td></tr>
          <tr><th scope="row">기업·기관</th><td>검증된 자문단과 수행사를 빠르게 구성</td><td>조건에 맞는 전문가 추천과 프로젝트 관리</td><td><a class="textlink" href="#" data-email>기업 문의</a></td></tr>
        </tbody>
      </table>
    </div>

    <h2>진행 흐름</h2>
    <p>모든 단계는 앞 단계의 결과 위에서 진행됩니다. 순서를 지키면 이미 쓴 비용이 매몰되는 상황을 줄일 수 있습니다.</p>
    <div class="steps" style="margin-top:22px">
      <div class="step"><h3 class="step__t">문제 진단</h3><p class="step__d">9개 질문으로 상황을 구조화합니다. 무료이며 가입이 필요 없습니다.</p></div>
      <div class="step"><h3 class="step__t">결과 확인</h3><p class="step__d">쟁점, 확인 전 단정할 수 없는 것, 준비 자료, 담당 분야와 순서를 정리해 드립니다.</p></div>
      <div class="step"><h3 class="step__t">전문가 비교</h3><p class="step__d">검증 근거·가격·이해관계를 같은 기준으로 놓고 최대 3명까지 비교합니다.</p></div>
      <div class="step"><h3 class="step__t">상담과 결제</h3><p class="step__d">전화·영상·방문·문서검토 중 선택합니다. 환불 기준은 결제 전에 확인합니다.</p></div>
      <div class="step"><h3 class="step__t">상담결과서</h3><p class="step__d">확인된 사실과 미확인 사항, 다음 행동을 문서로 받습니다. <span data-ops="resultSla">상담 종료 후 24시간</span> 안에 제출됩니다.</p></div>
      <div class="step"><h3 class="step__t">실행과 재검토</h3><p class="step__d">필요하면 세컨드 오피니언을 붙이거나 전문가팀을 구성해 프로젝트로 이어갑니다.</p></div>
    </div>

    <h2>상담 상품</h2>
    <p>상담은 시간이 아니라 결과물 기준으로 구성했습니다. 모든 상품이 같은 항목을 같은 순서로 표시하므로 비교가 쉽습니다.</p>
    ${prodGrid}
    <div class="note">
      <div class="note__t">지금 이용 가능한 범위</div>
      <p>무료 진단과 사전 접수는 지금 바로 이용하실 수 있습니다. 상담 예약·결제와 전문가 프로필 공개는 검증된 전문가 확보 이후 <span data-ops="launchLabel">2026년 하반기 정식 오픈 예정</span>입니다.</p>
    </div>

    <h2>다른 서비스와 무엇이 다른가</h2>
    <div class="tbl-scroll">
      <table class="tbl">
        <thead><tr><th scope="col">구분</th><th scope="col">일반 전문가 플랫폼</th><th scope="col">프롭피어</th></tr></thead>
        <tbody>
          <tr><th scope="row">시작점</th><td>직종 또는 서비스 검색</td><td>이용자의 문제와 목표 입력</td></tr>
          <tr><th scope="row">전문가 범위</th><td>범용 프리랜서·전문가</td><td>중개·개발·건축·법률·세무·금융·시공·운영</td></tr>
          <tr><th scope="row">신뢰 기준</th><td>별점·후기·경력연수</td><td>실제 프로젝트 역할·증빙·관계별 평가·이해관계</td></tr>
          <tr><th scope="row">상담 이후</th><td>연락 또는 견적 전달</td><td>결과서 → 재검토 → 전문가팀 → 실행 관리</td></tr>
        </tbody>
      </table>
    </div>

    <h2>플랫폼의 역할</h2>
    <p>프롭피어는 중립적인 정보·예약·관리 인프라입니다. 법률·세무·중개처럼 자격이 필요한 업무의 계약은 이용자와 해당 전문가 사이에 직접 체결되며, 프롭피어는 그 계약의 당사자가 아닙니다. 성사 금액에 연동한 수수료를 받지 않는 구조를 택한 것도 같은 이유에서입니다.</p>
    <div class="note note--gold">
      <div class="note__t">AI 기능의 범위</div>
      <p>입력 내용 요약, 문제 유형 분류, 상담 전 질문과 준비자료 정리까지만 사용합니다. 용도변경 가능성, 세액, 투자수익, 법적 결론을 확정적으로 제시하지 않으며, 전문가 확인 없이 결과서를 자동 확정하지 않습니다.</p>
    </div>

    <div class="btn-row" style="margin-top:34px">
      <a class="btn btn--primary" href="/diagnosis" data-track="cta_service">3분 진단 시작하기</a>
      <a class="btn btn--ghost" href="/trust">검증 기준 보기</a>
    </div>
  </div>
</section>`
});

/* =========================================================
   trust
   ========================================================= */
page({
  file: "trust.html",
  path: "/trust",
  active: "/trust",
  title: "검증 기준과 신뢰 정책",
  desc:
    "프롭피어가 전문가를 어떻게 검증하는지, 후기와 이해관계를 어떻게 표시하는지, 자료를 어떻게 보관하는지 공개합니다.",
  body: `
<section class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">홈</a> <span>›</span> <span>검증 기준</span></div>
    <h1 class="pagehead__t">무엇을 확인했고, 무엇을 확인하지 않았는지<br>그대로 밝힙니다</h1>
    <p class="pagehead__d">신뢰는 점수가 아니라 근거에서 나옵니다. 프롭피어가 어떤 자료로 무엇을 확인하는지, 확인되지 않은 정보는 어떻게 표시하는지 공개합니다.</p>
  </div>
</section>

<section class="band">
  <div class="wrap doc">
    <h2 id="verify">전문가 검증</h2>
    <p>전문가가 직접 적은 정보와 프롭피어가 증빙으로 확인한 정보를 분리합니다. 초기에는 자동 심사 없이 운영팀이 모든 자료를 직접 검토합니다.</p>
    <div class="tbl-scroll">
      <table class="tbl">
        <thead><tr><th scope="col">항목</th><th scope="col">확인 자료</th><th scope="col">공개 방식</th></tr></thead>
        <tbody>
          <tr><th scope="row">본인 확인</th><td>휴대폰 본인확인</td><td>확인 완료 여부만 표시</td></tr>
          <tr><th scope="row">소속</th><td>재직 증빙, 사업자등록 정보</td><td>회사명과 확인일 표시</td></tr>
          <tr><th scope="row">자격</th><td>자격증 원본과 유효기간</td><td>자격명과 확인일 표시, 만료 시 갱신 필요로 전환</td></tr>
          <tr><th scope="row">프로젝트 실적</th><td>계약서, 발주 자료, 재직 확인서, 발주자 확인</td><td>실제 맡은 역할 단위로 표시. 비공개 요청 시 범주화</td></tr>
          <tr><th scope="row">참여 관계</th><td>상대방 계정 확인 또는 별도 인증</td><td>발주자·동료·협력사 등 관계 유형 표시</td></tr>
          <tr><th scope="row">이해관계</th><td>본인 신고와 운영팀 확인</td><td>상담 이후 중개·설계·시공 제안 가능 여부 표시</td></tr>
        </tbody>
      </table>
    </div>

    <h3>검증 상태 7단계</h3>
    <div class="tbl-scroll">
      <table class="tbl">
        <thead><tr><th scope="col">상태</th><th scope="col">의미</th><th scope="col">화면 표시</th></tr></thead>
        <tbody>
          <tr><th scope="row">미제출</th><td>자료가 등록되지 않음</td><td>미검증 정보</td></tr>
          <tr><th scope="row">검토 중</th><td>운영팀이 자료를 확인하는 중</td><td>검토 중 배지</td></tr>
          <tr><th scope="row">부분 검증</th><td>일부 항목만 확인됨</td><td>확인된 항목만 체크 표시</td></tr>
          <tr><th scope="row">검증 완료</th><td>필수 근거와 관계가 확인됨</td><td>검증 완료 배지와 검증일</td></tr>
          <tr><th scope="row">갱신 필요</th><td>유효기간이 지났거나 소속이 바뀔 수 있음</td><td>갱신 필요 표시</td></tr>
          <tr><th scope="row">정정 검토</th><td>당사자나 관계자가 이의를 제기함</td><td>일시적 공개 제한</td></tr>
          <tr><th scope="row">반려</th><td>근거가 부족하거나 과장·허위가 확인됨</td><td>외부에 공개하지 않음</td></tr>
        </tbody>
      </table>
    </div>
    <div class="note">
      <div class="note__t">심사 기간</div>
      <p>자료 제출 후 <span data-ops="verifySla">영업일 기준 2일</span> 안에 1차 심사 결과를 안내합니다. 발주자·동료 확인이 필요한 실적은 3~5영업일이 더 걸릴 수 있습니다. 소속·자격·활동 상태는 6~12개월마다 다시 점검합니다.</p>
    </div>

    <h2 id="review">후기와 평판</h2>
    <ul class="checks">
      <li><strong>관계가 확인된 사람만 씁니다.</strong> 결제된 상담, 확인된 프로젝트 참여, 또는 플랫폼이 관계를 검증한 경우에만 작성 권한이 생깁니다.</li>
      <li><strong>관계별로 나눠서 보여드립니다.</strong> 상담고객, 발주자, 동료의 평가를 하나의 점수로 합산하지 않습니다. 각자 볼 수 있는 면이 다르기 때문입니다.</li>
      <li><strong>사실과 평가를 구분합니다.</strong> 분쟁·징계 같은 민감한 내용은 공개 근거를 확인한 뒤에만 다룹니다.</li>
      <li><strong>부정적인 후기를 지우지 않습니다.</strong> 대신 전문가에게 답변권과 정정 요청권을 드립니다.</li>
      <li><strong>신고가 들어와도 바로 삭제하지 않습니다.</strong> 공개 제한 → 자료 보존 → 당사자 소명 → 운영팀 판단 순으로 처리합니다.</li>
    </ul>

    <h2 id="interest">이해관계와 광고 표시</h2>
    <p>상담을 한 전문가가 이후 중개·설계·시공·운영 업무를 제안할 수 있다면, 그 사실을 상담 전에 알아야 조언을 제대로 판단할 수 있습니다. 프롭피어는 이 정보를 전문가 카드와 상담상품 화면에 표시합니다.</p>
    <ul class="checks">
      <li><strong>유료 노출은 광고로 명시합니다.</strong> 자연 추천 순위와 섞지 않고 영역과 배지를 분리합니다.</li>
      <li><strong>추천 이유를 함께 표시합니다.</strong> 왜 이 전문가가 추천됐는지, 어떤 검증 정보가 아직 없는지 카드에서 밝힙니다.</li>
      <li><strong>독점 노출을 막습니다.</strong> 특정 전문가만 반복 노출되지 않도록 비교 선택지를 충분히 제공합니다.</li>
      <li><strong>플랫폼의 이해관계도 공개합니다.</strong> 제휴나 관계사가 얽힌 추천은 그 사실을 표시합니다.</li>
    </ul>
    <div class="note note--gold">
      <div class="note__t">세컨드 오피니언</div>
      <p>이해관계 없는 판단이 필요한 결정에는 독립 전문가의 재검토를 붙일 수 있습니다. 재검토 전문가는 해당 건과 이해관계가 없는지 확인한 뒤 배정하며, 1차 전문가에게 자동으로 알리지 않습니다. 공유 여부는 이용자가 정합니다.</p>
    </div>

    <h2 id="privacy">자료와 개인정보</h2>
    <ul class="checks">
      <li><strong>민감 문서는 기본 비공개입니다.</strong> 계약서·등기·자격·견적 자료는 상담과 프로젝트 단위로 접근 권한을 나눕니다.</li>
      <li><strong>다운로드는 만료되는 링크로만 제공합니다.</strong> 열람과 다운로드 기록을 보관합니다.</li>
      <li><strong>검증용 원본과 공개용 정보를 분리 보관합니다.</strong> 저장 영역과 접근 권한이 다릅니다.</li>
      <li><strong>운영자도 기록을 남깁니다.</strong> 민감자료 접근은 목적과 사유, 시간을 로그로 남기고 최소 권한만 부여합니다.</li>
      <li><strong>목적이 끝나면 파기합니다.</strong> 탈퇴, 상담·프로젝트 종료, 법정 보존기간에 따라 파기와 보관 기준을 구분합니다.</li>
      <li><strong>AI 처리 범위를 고지합니다.</strong> 어떤 내용이 정리에 사용되는지, 외부 모델을 쓰는지, 학습에 사용하는지 밝힙니다. 동의 없이 민감정보를 외부로 보내지 않습니다.</li>
    </ul>

    <h2>이 정책에 대해 알려주실 것이 있다면</h2>
    <p>검증 기준과 후기 정책은 서비스가 커지면서 계속 다듬어야 하는 부분입니다. 기준이 불합리하거나 빠진 부분이 보이면 알려주세요. 변경할 때는 변경 내용과 시점을 이 페이지에 남깁니다.</p>
    <div class="btn-row" style="margin-top:26px">
      <a class="btn btn--ghost" href="#" data-email>정책에 대해 의견 보내기</a>
      <a class="btn btn--primary" href="/diagnosis" data-track="cta_trust">3분 진단 시작하기</a>
    </div>
  </div>
</section>`
});

/* =========================================================
   pro (전문가 등록)
   ========================================================= */
page({
  file: "pro.html",
  path: "/pro",
  active: "",
  title: "전문가센터 · 초기 파트너 모집",
  desc:
    "경력 연수가 아니라 검증된 프로젝트로 평가받는 부동산 전문가 네트워크. 초기 파트너 33명을 모집합니다. 검증 심사는 영업일 기준 2일 안에 진행합니다.",
  body: `
<section class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">홈</a> <span>›</span> <span>전문가센터</span></div>
    <h1 class="pagehead__t">경력이 아니라,<br>검증된 실적으로 평가받으세요</h1>
    <p class="pagehead__d">"경력 15년"보다 "검증된 프로젝트 12건"이 더 설득력 있다고 봅니다. 프롭피어는 실제로 맡은 역할을 증빙으로 확인해 프로필에 남기고, 그 기록으로 의뢰가 연결되게 만듭니다.</p>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="grid grid-3">
      <div class="card"><span class="card__ico" aria-hidden="true">${I.shield}</span><h3 class="card__t">실적이 자산이 됩니다</h3><p class="card__d">참여한 프로젝트의 역할을 증빙으로 확인해 남깁니다. 회사 실적이 아니라 본인이 실제로 한 일이 기록됩니다.</p></div>
      <div class="card"><span class="card__ico" aria-hidden="true">${I.note}</span><h3 class="card__t">준비된 의뢰가 옵니다</h3><p class="card__d">이용자가 진단을 마치고 오기 때문에 상황과 자료가 정리된 상태입니다. 첫 상담부터 본론으로 들어갈 수 있습니다.</p></div>
      <div class="card"><span class="card__ico" aria-hidden="true">${I.room}</span><h3 class="card__t">업무 도구를 함께 씁니다</h3><p class="card__d">일정, 자료 수신, 상담 상태, 결과서 작성, 정산까지 한 곳에서 관리합니다. 광고 지면이 아니라 일하는 도구입니다.</p></div>
    </div>
  </div>
</section>

<section class="band band--tint">
  <div class="wrap doc">
    <h2>지금 모집하는 분야</h2>
    <p>정식 오픈 전, 다섯 개 집중 문제 영역(공실 활용 · 상가 임대차 · 매입 검토 · 용도변경 · 공사견적)에 대응할 수 있는 <b><span data-ops="partnerTarget">33</span>명 규모</b>의 초기 파트너를 모으고 있습니다. 인원을 늘리는 것보다 각 문제에 확실히 답할 수 있는 구성을 먼저 만드는 것이 목표입니다.</p>
    <div class="tbl-scroll">
      <table class="tbl">
        <thead><tr><th scope="col">분야</th><th scope="col">모집</th><th scope="col">분야</th><th scope="col">모집</th><th scope="col">분야</th><th scope="col">모집</th></tr></thead>
        <tbody>
          <tr><th scope="row">공실개발·공간기획</th><td class="num">5명</td><th scope="row">상업용 중개</th><td class="num">5명</td><th scope="row">부동산 변호사</th><td class="num">3명</td></tr>
          <tr><th scope="row">세무사</th><td class="num">3명</td><th scope="row">건축·인허가</th><td class="num">5명</td><th scope="row">감정평가</th><td class="num">2명</td></tr>
          <tr><th scope="row">시공·인테리어</th><td class="num">4명</td><th scope="row">금융·PF</th><td class="num">3명</td><th scope="row">숙박·공간운영</th><td class="num">3명</td></tr>
        </tbody>
      </table>
    </div>

    <h2>참여 조건</h2>
    <p>아래 여섯 가지에 동의해 주시는 분만 프로필을 공개합니다. 이용자가 믿고 결제할 수 있는 최소 기준이라고 보기 때문입니다.</p>
    <ul class="checks">
      <li><strong>검증자료 제출</strong> — 본인·소속·자격과 프로젝트 증빙을 제출합니다.</li>
      <li><strong>상담상품 등록</strong> — 가격·시간·포함·제외·결과물을 미리 공개합니다.</li>
      <li><strong>결과서 제공</strong> — 상담 후 <span data-ops="resultSla">상담 종료 후 24시간</span> 안에 결과서를 제출합니다.</li>
      <li><strong>응답시간 준수</strong> — 예약과 자료 요청에 정해진 시간 안에 응답합니다.</li>
      <li><strong>후기 공개 동의</strong> — 관계가 확인된 후기를 공개하는 데 동의합니다. 답변권과 정정 요청권이 함께 주어집니다.</li>
      <li><strong>이해관계 공개</strong> — 상담 이후 중개·설계·시공을 제안할 수 있다면 미리 밝힙니다.</li>
    </ul>

    <h2>등록 절차</h2>
    <div class="steps" style="margin-top:22px">
      <div class="step"><h3 class="step__t">신청서 제출</h3><p class="step__d">아래 폼으로 기본 정보와 전문 분야를 보내주시면 됩니다. 2~3분이면 충분합니다.</p></div>
      <div class="step"><h3 class="step__t">자료 확인</h3><p class="step__d">운영팀이 연락드려 증빙 자료를 안내합니다. 1차 결과는 <span data-ops="verifySla">영업일 기준 2일</span> 안에 알려드립니다.</p></div>
      <div class="step"><h3 class="step__t">프로필 공개</h3><p class="step__d">검증 항목과 최근 검증일을 표시해 공개합니다. 정식 오픈 시점에 상담상품이 함께 노출됩니다.</p></div>
    </div>

    <div class="note note--gold">
      <div class="note__t">비용과 수수료</div>
      <p>초기 파트너는 정식 오픈 후 일정 기간 프로필 이용료 없이 참여하실 수 있습니다. 프롭피어는 성사 금액에 연동한 수수료를 받지 않으며, 수익 구조는 상담 결제와 이용료를 기준으로 합니다. 구체적인 조건은 심사 과정에서 서면으로 안내드립니다.</p>
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap wrap--narrow">
    <div class="sec-head">
      <span class="eyebrow">등록 신청</span>
      <h2 class="sec-title">초기 파트너로 참여하기</h2>
      <p class="sec-desc">제출해 주신 정보는 검증 심사와 연락 목적으로만 사용합니다. 증빙 자료는 이 단계에서 받지 않고, 운영팀이 확인 후 별도로 안내드립니다.</p>
    </div>

    <form class="form" data-pp-form="expert-signup" data-pp-subject="전문가 등록 신청">
      <div class="grid grid-2">
        <div class="field">
          <label for="pro-name">이름</label>
          <input id="pro-name" name="이름" type="text" required placeholder="홍길동">
          <span class="field__err">이름을 입력해주세요.</span>
        </div>
        <div class="field">
          <label for="pro-company">소속 / 직함</label>
          <input id="pro-company" name="소속" type="text" required placeholder="○○부동산중개법인 / 대표">
          <span class="field__err">소속과 직함을 입력해주세요.</span>
        </div>
      </div>

      <div class="grid grid-2">
        <div class="field">
          <label for="pro-email">이메일</label>
          <input id="pro-email" name="이메일" type="email" required placeholder="name@example.com">
          <span class="field__err">연락 가능한 이메일을 입력해주세요.</span>
        </div>
        <div class="field">
          <label for="pro-tel">휴대폰</label>
          <input id="pro-tel" name="휴대폰" type="tel" required placeholder="010-0000-0000">
          <span class="field__err">휴대폰 번호를 입력해주세요.</span>
        </div>
      </div>

      <div class="field">
        <label>전문 분야 <span class="field__hint">(복수 선택 가능)</span></label>
        <div class="chips">
          ${[
            "공실개발·공간기획",
            "상업용 중개",
            "부동산 법률",
            "세무",
            "건축·인허가",
            "감정평가",
            "시공·인테리어",
            "금융·PF",
            "숙박·공간운영"
          ]
            .map(
              (t) =>
                `<label class="chip"><input type="checkbox" name="전문분야" value="${t}"><span>${t}</span></label>`
            )
            .join("\n          ")}
        </div>
      </div>

      <div class="grid grid-2">
        <div class="field">
          <label for="pro-career">경력</label>
          <select id="pro-career" name="경력" required>
            <option value="">선택해주세요</option>
            <option>3년 미만</option><option>3~5년</option><option>5~10년</option>
            <option>10~15년</option><option>15년 이상</option>
          </select>
          <span class="field__err">경력을 선택해주세요.</span>
        </div>
        <div class="field">
          <label for="pro-area">주요 활동 지역</label>
          <select id="pro-area" name="활동지역" required>
            <option value="">선택해주세요</option>
            <option>서울</option><option>경기·인천</option><option>지방 광역시</option>
            <option>그 외 지역</option><option>전국</option>
          </select>
          <span class="field__err">활동 지역을 선택해주세요.</span>
        </div>
      </div>

      <div class="field">
        <label>대응 가능한 문제 <span class="field__hint">(이용자가 진단 결과에서 찾게 되는 기준입니다)</span></label>
        <div class="chips">
          ${[
            "공실 활용",
            "매입 검토",
            "임대차·원상복구",
            "용도변경",
            "공사비·견적",
            "세금·계약",
            "전문가팀·프로젝트"
          ]
            .map(
              (t) =>
                `<label class="chip"><input type="checkbox" name="대응문제" value="${t}"><span>${t}</span></label>`
            )
            .join("\n          ")}
        </div>
      </div>

      <div class="field">
        <label>주로 다루는 자산 유형</label>
        <div class="chips">
          ${["상가·근린생활시설", "오피스·업무시설", "주택·다가구", "토지·부지", "숙박·물류·기타"]
            .map(
              (t) =>
                `<label class="chip"><input type="checkbox" name="자산유형" value="${t}"><span>${t}</span></label>`
            )
            .join("\n          ")}
        </div>
      </div>

      <div class="field">
        <label>가능한 상담 방식</label>
        <div class="chips">
          ${["전화", "영상", "방문", "문서검토"]
            .map(
              (t, i) =>
                `<label class="chip"><input type="checkbox" name="상담방식" value="${t}"${i < 2 ? " checked" : ""}><span>${t}</span></label>`
            )
            .join("\n          ")}
        </div>
      </div>

      <div class="field">
        <label for="pro-project">대표 프로젝트와 맡은 역할 <span class="field__hint">(검증 심사에서 확인할 내용입니다)</span></label>
        <textarea id="pro-project" name="대표실적" placeholder="예: 강남 오피스 리모델링 임대 전환 / 사업성 검토와 임차인 유치 담당 / 2024년 / 연면적 1,200㎡"></textarea>
        <span class="field__hint">회사 실적이 아니라 <b>본인이 실제로 맡은 역할</b>을 적어주세요. 계약서·발주 자료로 확인합니다.</span>
      </div>

      <div class="field">
        <label>이해관계 공개 <span class="field__hint">(상담 이후 제안할 수 있는 업무를 미리 밝힙니다)</span></label>
        <div class="chips">
          ${[
            "중개 수주 가능",
            "설계·인허가 수주 가능",
            "시공 수주 가능",
            "운영·위탁 수주 가능",
            "사건 수임 가능",
            "기장·신고 대리 수주 가능",
            "해당 없음"
          ]
            .map(
              (t) =>
                `<label class="chip"><input type="checkbox" name="이해관계" value="${t}"><span>${t}</span></label>`
            )
            .join("\n          ")}
        </div>
        <span class="field__hint">공개하는 쪽이 상담 신뢰를 높입니다. 숨겨진 이해관계가 나중에 확인되면 노출이 제한될 수 있습니다.</span>
      </div>

      <div class="field">
        <label for="pro-intro">이용자에게 보여줄 소개 <span class="field__hint">(선택 · 나중에 다듬으셔도 됩니다)</span></label>
        <textarea id="pro-intro" name="소개" placeholder="어떤 문제를 주로 다루는지, 상담에서 무엇을 먼저 확인하는지 적어주시면 이용자가 고르기 쉬워집니다."></textarea>
      </div>

      <label class="agree">
        <input type="checkbox" name="참여조건동의" value="동의" required>
        <span>위 여섯 가지 참여 조건에 동의하며, 검증 자료 제출과 후기 공개에 동의합니다.</span>
      </label>
      <label class="agree">
        <input type="checkbox" name="개인정보동의" value="동의" required>
        <span>제출한 정보를 검증 심사와 연락 목적으로 수집·이용하는 데 동의합니다. 목적 달성 후 파기하며 동의는 언제든 철회할 수 있습니다. <a href="/trust#privacy">처리 기준 보기</a></span>
      </label>

      <div class="form__msg" role="status"></div>
      <button type="submit" class="btn btn--primary btn--block" data-track="pro_submit">등록 신청 보내기</button>
      <p class="field__hint" style="text-align:center">신청 후 <span data-ops="verifySla">영업일 기준 2일</span> 안에 운영팀이 연락드립니다.</p>
    </form>
  </div>
</section>`
});

/* =========================================================
   cases index
   ========================================================= */
page({
  file: "cases/index.html",
  path: "/cases",
  active: "/cases",
  title: "해결사례와 가이드",
  desc:
    "공실 활용, 원상복구, 매입 검토 등 실제로 반복되는 부동산 문제의 확인 순서를 정리했습니다. 개인정보와 주소·금액은 비식별화합니다.",
  body: `
<section class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">홈</a> <span>›</span> <span>해결사례</span></div>
    <h1 class="pagehead__t">비슷한 문제를 먼저 겪은 기록</h1>
    <p class="pagehead__d">상담과 프로젝트에서 반복적으로 나온 확인 순서를 정리했습니다. 결론을 단정하는 대신, 무엇을 어떤 순서로 확인해야 하는지에 집중했습니다.</p>
  </div>
</section>

<section class="band">
  <div class="wrap">
    ${caseGrid}
    <div class="note" style="margin-top:32px">
      <div class="note__t">사례 작성 기준</div>
      <p>모든 사례는 고객 동의와 비식별화를 원칙으로 하며 정확한 주소·금액·개인정보를 공개하지 않습니다. 법률·세무·감정·중개 등 자격 분야 내용은 해당 자격자의 검수를 거쳐 발행하고, 작성일과 업데이트일을 함께 표시합니다.</p>
    </div>
  </div>
</section>`
});

/* =========================================================
   case articles
   ========================================================= */
const ART = {
  "vacancy-to-lodging": {
    title: "공실 상가를 숙박시설로 바꿀 때 먼저 확인할 6가지",
    desc:
      "업종부터 정하고 공사를 시작하면 되돌리는 비용이 큽니다. 용도, 주차, 소방, 위반사항, 절차, 회수 기간을 어떤 순서로 확인해야 하는지 정리했습니다.",
    k: "공실 활용 · 용도변경",
    date: "2026-07-28",
    fields: "건축·인허가 / 공실개발",
    p: "vacancy",
    body: `
<p>공실이 길어지면 "차라리 직접 운영해 보자"는 판단으로 이어지는 경우가 많습니다. 숙박, 스터디카페, 창고형 매장이 대표적입니다. 그런데 인테리어 견적부터 받고 시작했다가, 뒤늦게 용도변경이 막히거나 주차 대수를 못 맞춰 되돌리는 사례가 반복됩니다. 순서를 바꾸면 대부분 피할 수 있는 비용입니다.</p>

<h2>1. 현재 용도와 희망 업종이 어느 시설군인지</h2>
<p>건축물대장에 적힌 현재 용도와 하려는 업종의 용도가 같은 시설군 안에 있는지, 다른 시설군으로 넘어가는지에 따라 절차가 갈립니다. 같은 군 안에서의 변경과 군을 넘는 변경은 필요한 서류와 기간이 다릅니다. 이 확인이 첫 단계인 이유는, 여기서 막히면 뒤의 모든 계획이 의미가 없어지기 때문입니다.</p>
<ul>
  <li>확인 자료: 건축물대장, 건축 도면</li>
  <li>담당 분야: 건축사(인허가)</li>
</ul>

<h2>2. 주차 대수를 추가로 확보할 수 있는지</h2>
<p>용도가 바뀌면 요구되는 주차 대수가 늘어나는 경우가 많습니다. 기존 건물에서 주차 면을 새로 만들 여지가 없으면 여기서 계획이 멈춥니다. 인근 부설주차장 확보나 기계식 설치 같은 대안이 가능한지, 비용은 얼마인지가 실제 판단 변수입니다.</p>

<h2>3. 소방·피난·정화조가 감당되는지</h2>
<p>숙박이나 다중이용 업종은 피난 동선과 소방 설비 기준이 달라집니다. 스프링클러, 방화구획, 비상조명, 피난계단 폭 같은 항목이 공사비의 큰 부분을 차지하고, 정화조 용량이 부족하면 증설이 필요합니다. 인테리어 견적에는 대개 빠져 있는 항목들입니다.</p>

<h2>4. 기존 위반사항이 등재되어 있는지</h2>
<p>건축물대장에 위반건축물로 등재되어 있으면 대부분 그 해소가 선행 조건입니다. 옥탑 증축, 발코니 확장, 무단 용도변경이 흔합니다. 매입 단계라면 이 부분이 가격 협상의 근거가 되기도 합니다.</p>

<h2>5. 절차와 기간이 입점 계획과 맞는지</h2>
<p>설계, 접수, 보완, 사용승인까지 걸리는 기간을 계산해야 합니다. 임차인이 정해져 있거나 오픈 시점이 정해져 있다면, 인허가 일정이 그 계획 안에 들어오는지부터 확인해야 합니다. 여기서 어긋나면 임대료 손실이 공사비보다 커지는 경우도 있습니다.</p>

<h2>6. 투입비를 몇 년에 회수하는지</h2>
<p>앞의 다섯 가지가 가능하다고 확인된 다음에야 수지 계산이 의미를 가집니다. 공사비와 인허가 비용을 합친 총 투입비를, 바뀐 용도에서 기대되는 임대료나 운영수익의 증가분으로 나눠 회수 기간을 봅니다. 이때 기대 임대료는 희망 금액이 아니라 인근에서 실제로 거래되는 조건을 기준으로 잡아야 합니다.</p>

<h2>정리하면</h2>
<p>확인 순서는 <strong>용도 → 주차 → 소방·설비 → 위반사항 → 절차·기간 → 수지</strong>입니다. 앞 단계가 막히면 뒤 단계는 계산할 필요가 없고, 앞 단계 결과에 따라 뒤 단계의 숫자가 크게 달라집니다. 견적서를 먼저 받는 순간 이 순서가 뒤집히기 때문에, 건축사 확인을 첫 단계에 두는 편이 결과적으로 비용을 아낍니다.</p>`
  },

  "restoration-scope": {
    title: "임대인이 원상복구를 과도하게 요구할 때 확인할 기준",
    desc:
      "원상복구 범위는 계약서 특약과 입주 당시 상태에서 갈립니다. 요구받은 견적이 타당한지 판단하기 위해 확인해야 할 것을 순서대로 정리했습니다.",
    k: "임대차 · 원상복구",
    date: "2026-07-26",
    fields: "부동산 법률 / 시공 검토",
    p: "lease",
    body: `
<p>계약 종료가 다가오면 원상복구 범위를 두고 다툼이 자주 생깁니다. 임차인은 "쓰던 대로 두고 나가면 된다"고 보고, 임대인은 "처음 상태로 되돌려 달라"고 합니다. 둘 다 틀린 말은 아니어서, 결국 계약서 문구와 입주 당시 상태로 돌아가 확인하게 됩니다.</p>

<h2>1. 계약서의 원상복구 조항과 특약</h2>
<p>가장 먼저 볼 것은 본문 조항이 아니라 특약입니다. 실무에서는 특약에 "임차인은 원상복구 후 명도한다"처럼 한 줄만 있는 경우가 많은데, 그 한 줄을 어떻게 해석하느냐가 금액 전체를 좌우합니다. 인테리어 잔존물의 처리, 시설 승계 여부, 철거 범위가 특약에 어떻게 적혀 있는지 확인합니다.</p>

<h2>2. "원상"의 기준 시점</h2>
<p>원래 상태라는 것이 언제의 상태인지가 핵심입니다. 골조만 있던 상태인지, 전 임차인의 시설이 남아 있던 상태인지에 따라 복구 범위가 크게 달라집니다. 입주 당시 사진이 있다면 이 논의가 훨씬 빨리 끝납니다. 없다면 계약 당시 주고받은 문자나 중개 자료가 근거가 될 수 있습니다.</p>
<ul>
  <li>확인 자료: 계약서 전문과 특약, 입주 당시 사진, 전 임차인 시설 인수 내역</li>
</ul>

<h2>3. 통상적인 사용에 따른 손모의 구분</h2>
<p>사용하면서 자연히 생기는 마모와, 임차인이 만든 변경은 성격이 다릅니다. 벽지 변색이나 바닥 마모 같은 항목과 구조 변경·설비 증설을 같은 선에서 다루면 협의가 어려워집니다. 견적서의 항목을 이 기준으로 나눠 보면 논점이 좁혀집니다.</p>

<h2>4. 요구받은 견적의 항목별 타당성</h2>
<p>총액만 적힌 견적서는 검토가 불가능합니다. 항목·물량·단가로 나뉘어 있는지 먼저 확인하고, 실제 필요한 공사 범위와 맞는지 항목 단위로 봅니다. 철거와 폐기물 처리, 전기 원복, 도장 범위에서 금액 차이가 크게 벌어지는 편입니다. 필요하면 별도 업체의 견적을 받아 비교합니다.</p>

<h2>5. 시점 관리</h2>
<p>갱신 요구나 권리금 관련 통지는 정해진 기간 안에 해야 효력이 유지됩니다. 원상복구 협의에 집중하다 이 시점을 놓치면 다른 권리까지 함께 잃을 수 있습니다. 계약 종료일을 기준으로 언제까지 무엇을 해야 하는지 달력에 먼저 표시해 두는 편이 안전합니다.</p>

<h2>6. 기록 남기기</h2>
<p>협의 과정의 문자, 이메일, 통지문, 현장 사진은 그대로 근거가 됩니다. 구두로만 합의하면 나중에 같은 이야기를 다시 하게 됩니다. 합의가 되면 범위와 금액, 완료 시점을 문서로 정리해 서로 확인하는 것이 마지막 단계입니다.</p>

<h2>정리하면</h2>
<p>확인 순서는 <strong>특약 문구 → 원상의 기준 시점 → 손모 구분 → 견적 항목 검토 → 통지 시점 → 합의 문서화</strong>입니다. 다만 이 글은 쟁점을 정리하기 위한 것이고, 실제 대응은 계약서 전문과 사실관계를 확인한 자격 전문가의 검토를 거치는 편이 안전합니다. 상대방에게 보내는 문서의 근거로 그대로 사용하기에는 적절하지 않습니다.</p>`
  },

  "pre-purchase-review": {
    title: "상업용 건물 매입 전, 잔금 치르기 앞에 확인할 것",
    desc:
      "권리관계와 임대수익의 사실 여부는 서류로 확인됩니다. 매입 결정 전에 무엇을 어떤 순서로 확인해야 하는지 정리했습니다.",
    k: "매입 검토 · 세컨드 오피니언",
    date: "2026-07-22",
    fields: "중개·시장검토 / 법률 / 세무",
    p: "purchase",
    body: `
<p>매입 검토에서 가장 흔한 실수는 수익률 계산부터 시작하는 것입니다. 수익률은 임대수익이 사실일 때만 의미가 있고, 임대수익은 계약서와 입금 내역으로 확인되기 전까지는 주장에 불과합니다. 순서를 권리와 사실 확인부터 시작하면 협상 근거도 함께 생깁니다.</p>

<h2>1. 등기부로 권리관계 확인</h2>
<p>근저당 설정 금액과 순위, 가압류·가처분, 신탁 등기 여부를 봅니다. 신탁이 걸려 있으면 계약 상대방이 누구인지부터 달라집니다. 매매 대금으로 어떤 권리를 언제 말소할 것인지가 계약서 특약에 명확히 들어가야 합니다.</p>

<h2>2. 임대차 현황의 사실 확인</h2>
<p>제시받은 임대료가 실제 입금 기준인지, 렌트프리나 미납이 있는지 확인합니다. 임차인의 계약 잔여기간과 갱신요구권 행사 가능 여부는 인수 후 운영 계획에 직접 영향을 줍니다. 대항력 있는 임차인의 보증금은 실질적인 인수 부담이 됩니다.</p>
<ul>
  <li>확인 자료: 임대차계약서 전부, 임대료 입금 내역, 임대차 현황표</li>
</ul>

<h2>3. 건축물대장으로 위반사항 확인</h2>
<p>위반건축물로 등재되어 있으면 대출 조건과 이후 용도 활용에 영향을 줍니다. 대장과 현장이 다른 경우도 흔해서, 도면과 실제 사용 현황을 비교해 보는 것이 좋습니다. 확인된 위반사항은 해소 비용을 산정해 가격 협상에 반영할 수 있습니다.</p>

<h2>4. 가격의 근거 만들기</h2>
<p>인근 실거래 사례와 현재 임대료 수준을 기준으로 제시가격이 어느 위치인지 봅니다. 여기서 중요한 건 "싸다/비싸다"의 결론이 아니라, 협상 자리에서 쓸 수 있는 비교 근거를 갖추는 일입니다. 공실 구간이 있다면 회복까지 걸리는 기간도 함께 계산합니다.</p>

<h2>5. 세금과 자금 일정</h2>
<p>취득 단계 세금, 명의 구조(개인·공동·법인)에 따른 차이, 상업용이라면 부가세 처리와 포괄양수도 요건 충족 여부를 확인합니다. 대출 실행 일정이 잔금일과 맞물리므로, 조건부 승인 상태와 필요 서류를 미리 정리해 둡니다.</p>

<h2>6. 이해관계 없는 재검토</h2>
<p>매도인 측 중개사의 설명은 사실일 수 있지만, 그 사람의 이해관계는 거래 성사에 있습니다. 금액이 큰 결정일수록 거래에 이해관계가 없는 전문가에게 같은 자료를 다시 보여주고 의견을 듣는 편이 안전합니다. 1차 의견과 재검토 의견이 어디서 갈리는지가 곧 확인이 더 필요한 지점입니다.</p>

<h2>정리하면</h2>
<p>확인 순서는 <strong>권리관계 → 임대차 사실 확인 → 위반사항 → 가격 근거 → 세금·자금 → 독립 재검토</strong>입니다. 이 순서를 지키면 잔금 전에 되돌릴 수 없는 항목부터 정리됩니다. 다만 등기부와 대장을 확인하기 전에는 권리나 위반 여부를 단정할 수 없고, 개별 세액은 자료를 확인한 세무사만 계산할 수 있습니다.</p>`
  }
};

Object.keys(ART).forEach((slug) => {
  const a = ART[slug];
  const others = CASES.filter((c) => c.slug !== slug);
  page({
    file: "cases/" + slug + ".html",
    path: "/cases/" + slug,
    active: "/cases",
    title: a.title,
    desc: a.desc,
    article: true,
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: a.title,
      description: a.desc,
      datePublished: a.date,
      dateModified: a.date,
      inLanguage: "ko",
      author: { "@type": "Organization", name: "프롭피어" },
      publisher: { "@type": "Organization", name: "프롭피어" },
      mainEntityOfPage: SITE + "/cases/" + slug
    },
    body: `
<section class="pagehead">
  <div class="wrap wrap--narrow">
    <div class="crumb"><a href="/">홈</a> <span>›</span> <a href="/cases">해결사례</a> <span>›</span> <span>${a.k}</span></div>
    <h1 class="pagehead__t">${a.title}</h1>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <article class="article">
      <div class="article__meta">
        <span>${a.k}</span>
        <span>담당 분야 · ${a.fields}</span>
        <span>작성 <span class="num">${a.date}</span></span>
        <span>운영팀 검수</span>
      </div>
      ${a.body}

      <div class="note" style="margin-top:34px">
        <div class="note__t">이 글의 범위</div>
        <p>일반적인 확인 순서를 정리한 내용이며, 개별 사안의 결론은 자료와 현장을 확인한 자격 전문가의 검토가 필요합니다. 이 글은 확정적인 법률·세무·감정 판단을 제공하지 않습니다.</p>
      </div>

      <div class="btn-row" style="margin-top:30px">
        <a class="btn btn--primary" href="/diagnosis?p=${a.p}" data-track="cta_case_${slug}">내 상황으로 3분 진단하기</a>
        <a class="btn btn--ghost" href="/cases">다른 사례 보기</a>
      </div>
    </article>
  </div>
</section>

<section class="band band--tint">
  <div class="wrap">
    <div class="sec-head"><span class="eyebrow">함께 보면 좋은 글</span><h2 class="sec-title">이어서 확인할 사례</h2></div>
    <div class="grid grid-2">
      ${others
        .map(
          (c) => `<a class="card" href="/cases/${c.slug}">
        <div class="case">
          <span class="case__k">${c.k}</span>
          <h3 class="case__t">${c.t}</h3>
          <p class="case__d">${c.d}</p>
        </div>
      </a>`
        )
        .join("\n      ")}
    </div>
  </div>
</section>`
  });
});

/* =========================================================
   404
   ========================================================= */
page({
  file: "404.html",
  path: "/404",
  active: "",
  title: "페이지를 찾을 수 없습니다",
  desc: "요청하신 주소의 페이지가 없습니다. 홈이나 문제 진단으로 이동해 주세요.",
  body: `
<section class="state">
  <p class="state__code num">404</p>
  <h1 class="state__t">이 주소에는 페이지가 없습니다</h1>
  <p class="state__d">주소가 바뀌었거나, 아직 열리지 않은 페이지일 수 있습니다. 전문가 찾기와 상담 예약은 정식 오픈 시점에 열립니다.</p>
  <div class="btn-row" style="justify-content:center;margin-top:10px">
    <a class="btn btn--primary" href="/diagnosis">내 문제 진단하기</a>
    <a class="btn btn--ghost" href="/">홈으로 가기</a>
  </div>
</section>`
});

/* =========================================================
   전문가 찾기 · 프로필 · 연결 페이지
   ========================================================= */
const EX = require("./gen-experts.js");
EX.expertsIndex(page);
EX.DATA.experts.forEach((e) => EX.expertProfile(page, e, PRODUCTS.map((p, i) => ({
  id: ["quick15", "deep30", "docs", "second"][i], ...p
}))));
EX.connectPage(page, PRODUCTS.map((p, i) => ({
  id: ["quick15", "deep30", "docs", "second"][i], ...p
})));

const QN = require("./gen-qna.js");
QN.buildAll(page);

console.log("\n생성 완료");
