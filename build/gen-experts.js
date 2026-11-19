/* 전문가 찾기 / 프로필 / 연결 페이지 생성 — gen-site.js 에서 호출 */
const fs = require("fs");
const path = require("path");

const DATA = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../assets/data/experts.json"), "utf8")
);

const T = DATA.taxonomy;
const MAP = require("./korea-map.js");
let QNA = { items: [] };
try {
  QNA = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../assets/data/qna.json"), "utf8"));
} catch (e) {}

const ICO = {
  check: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  arrow: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  eye: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/></svg>`,
  info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>`
};

const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

const SAMPLE = DATA.meta.mode === "sample";

const sampleBar = SAMPLE
  ? `<div class="samplebar"><div class="wrap">${ICO.info}<span>지금 보이는 전문가 정보는 화면 구성을 확인하기 위한 <b>예시 데이터</b>입니다. 실제 검증이 끝난 전문가로 교체한 뒤 공개합니다.</span></div></div>`
  : "";

/* ---------- 계산 ---------- */
function rateByRelation(e) {
  const map = {};
  (e.reviews || []).forEach((r) => {
    if (!map[r.rel]) map[r.rel] = { sum: 0, n: 0, count: 0, items: {} };
    Object.keys(r.items || {}).forEach((k) => {
      map[r.rel].sum += r.items[k];
      map[r.rel].n += 1;
      if (!map[r.rel].items[k]) map[r.rel].items[k] = { s: 0, n: 0 };
      map[r.rel].items[k].s += r.items[k];
      map[r.rel].items[k].n += 1;
    });
    map[r.rel].count += 1;
  });
  Object.keys(map).forEach((k) => {
    map[k].avg = map[k].n ? Math.round((map[k].sum / map[k].n) * 10) / 10 : null;
  });
  return map;
}

function vbadge(state) {
  const cls =
    state === "검증 완료" ? "ok" : state === "부분 검증" ? "part" : state === "검토 중" ? "wait" : "self";
  const ico = state === "검증 완료" ? ICO.check + " " : "";
  return `<span class="vbadge vbadge--${cls}">${ico}${esc(state)}</span>`;
}

function stateBadge(s) {
  const m = {
    ok: ['vbadge--ok', ICO.check + " 검증 완료"],
    part: ['vbadge--part', "부분 검증"],
    wait: ['vbadge--wait', "검토 중"],
    self: ['vbadge--self', "자기 기재"]
  };
  const [cls, label] = m[s] || m.self;
  return `<span class="vbadge ${cls}">${label}</span>`;
}


/* ---------- 탐색 패널: 분야로 찾기 / 지역으로 찾기 ---------- */
function browsePanel() {
  const cats = T.categories || [];

  const nav = cats
    .map(
      (c, i) =>
        `<button type="button" class="cat__navbtn" data-catnav="${esc(c.id)}" aria-selected="${i === 0}">${esc(c.t)}</button>`
    )
    .join("\n        ");

  const groups = cats
    .map(
      (c) => `<div class="cat__group" data-catgroup="${esc(c.id)}">
          <div class="cat__gt"><b>${esc(c.t)}</b><span>${esc(c.d)}</span></div>
          <div class="cat__items">
            ${c.items
              .map(
                (it) => `<button type="button" class="cat__item" data-pickfield="${esc(it.fields.join("|"))}" data-picklabel="${esc(c.t)} · ${esc(it.t)}">
              <b>${esc(it.t)}</b><span>${esc(it.k)}</span>
            </button>`
              )
              .join("\n            ")}
          </div>
        </div>`
    )
    .join("\n        ");

  const mapSvg = `<svg viewBox="0 0 360 500" role="group" aria-label="지역 선택 지도">
          ${MAP.ORDER.map(
            (r) => `<g class="map__r" data-pickregion="${esc(r)}" role="button" tabindex="0" aria-label="${esc(r)} 전문가 보기">
            <title>${esc(r)}</title>
            <path d="${MAP.PATHS[r]}"/>
            <text x="${MAP.LABELS[r][0]}" y="${MAP.LABELS[r][1]}">${esc(r)}</text>
          </g>`
          ).join("\n          ")}
        </svg>`;

  const chips = T.regions
    .map(
      (r) =>
        `<button type="button" class="map__chip" data-pickregion="${esc(r)}">${esc(r)}<b data-rcount>·</b></button>`
    )
    .join("\n          ");

  return `
<div class="bw" id="bw">
  <div class="bw__tabs" role="tablist">
    <button type="button" class="bw__tab" data-bwtab="field" role="tab" aria-selected="true">분야로 찾기</button>
    <button type="button" class="bw__tab" data-bwtab="region" role="tab" aria-selected="false">지역으로 찾기</button>
    <button type="button" class="bw__tab" data-showall>전체 전문가 보기</button>
  </div>

  <div class="bw__panel" data-bwpane="field">
    <div class="cat">
      <div class="cat__nav">
        ${nav}
      </div>
      <div>
        ${groups}
      </div>
    </div>
  </div>

  <div class="bw__panel" data-bwpane="region" hidden>
    <div class="map">
      <p class="map__t">어느 지역의 부동산인가요?</p>
      <p class="map__d">지도를 누르면 그 지역에서 활동하는 전문가를 보여드립니다. 전국 단위로 일하는 전문가는 어느 지역을 고르셔도 함께 나옵니다.</p>
      ${mapSvg}
      <div class="map__list">
        ${chips}
      </div>
    </div>
  </div>

</div>`;
}

/* ---------- 목록 페이지 ---------- */
function expertsIndex(page) {
  page({
    file: "experts.html",
    path: "/experts",
    active: "/experts",
    title: "전문가 찾기",
    desc:
      "분야·지역·자산 유형·상담 방식으로 검증된 부동산 전문가를 찾고, 검증 근거와 관계별 평점을 같은 기준으로 비교하세요.",
    body: `
${sampleBar}
<section class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">홈</a> <span>›</span> <span>전문가 찾기</span></div>
    <h1 class="pagehead__t">분야로, 또는 지역으로<br>찾으세요</h1>
    <p class="pagehead__d">전문가마다 무엇이 확인됐고 무엇이 확인되지 않았는지, 상담 이후 어떤 이해관계가 생길 수 있는지를 같은 기준으로 보여드립니다. 어떤 분야가 필요한지 모르겠다면 <a class="textlink" href="/diagnosis">3분 진단</a>부터 시작하세요.</p>
  </div>
</section>

<section class="band" style="padding-top:clamp(28px,3.4vw,44px)">
  <div class="wrap">
    ${browsePanel()}
    <div id="ex-root"></div>
  </div>
</section>

<div class="tray" id="ex-tray" data-show="false" role="region" aria-label="비교함"></div>

<div class="modal" id="ex-modal" data-open="false" role="dialog" aria-modal="true" aria-label="전문가 비교">
  <div class="modal__box">
    <div class="modal__hd">
      <b>전문가 비교</b>
      <button type="button" class="modal__x" data-closecmp aria-label="비교 닫기">×</button>
    </div>
    <div class="modal__body"></div>
  </div>
</div>

<section class="band band--tint">
  <div class="wrap wrap--narrow">
    <div class="sec-head">
      <span class="eyebrow">비교 기준</span>
      <h2 class="sec-title">무엇을 보고 고르면 되나요?</h2>
    </div>
    <ul class="checks">
      <li><strong>검증 프로젝트 수</strong>를 먼저 보세요. 경력 연수보다 실제로 맡은 역할이 확인된 건수가 더 많은 것을 말해줍니다.</li>
      <li><strong>평점은 관계별로 나뉘어</strong> 있습니다. 상담고객 평점과 발주자·동료 평가를 합산하지 않습니다. 각자 볼 수 있는 면이 다르기 때문입니다.</li>
      <li><strong>이해관계 표시를 확인하세요.</strong> 상담 이후 중개·설계·시공을 제안할 수 있는 전문가는 그 사실을 미리 밝히고 있습니다.</li>
      <li><strong>검증되지 않은 항목도 그대로 보여드립니다.</strong> "자기 기재"는 전문가가 직접 적었고 아직 증빙을 확인하지 않은 정보입니다.</li>
      <li><strong>최대 3명까지 비교함</strong>에 담아 조건을 나란히 놓고 볼 수 있습니다.</li>
    </ul>
    <p style="margin-top:22px"><a class="textlink" href="/trust">검증 기준 전체 보기 ${ICO.arrow}</a></p>
  </div>
</section>`,
    tail: `<script src="/assets/js/experts.js"></script>\n<script src="/assets/js/browse.js"></script>`
  });
}

/* ---------- 프로필 페이지 ---------- */
function expertProfile(page, e, products) {
  const rel = rateByRelation(e);
  const relKeys = Object.keys(rel);
  const prods = (e.products || []).map((id) => products.find((p) => p.id === id)).filter(Boolean);

  const verifiedProjects = (e.projects || []).filter((p) => p.v).length;

  /* 검증 항목 */
  const vRows = e.verification.items
    .map(
      (i) => `<div class="evi__row">
        ${stateBadge(i.s)}
        <span class="evi__txt"><b>${esc(i.k)}</b>${esc(i.d)}</span>
      </div>`
    )
    .join("\n      ");

  /* 프로젝트 */
  const pjRows = (e.projects || [])
    .map(
      (p) => `<div class="pj">
        <div>
          <p class="pj__n">${esc(p.n)}</p>
          <p class="pj__r">맡은 역할 · ${esc(p.r)}</p>
          <p class="pj__m"><span>${esc(p.p)}</span><span>${esc(p.a)}</span><span>${esc(p.s)}</span></p>
        </div>
        <div>${p.v ? `<span class="vbadge vbadge--ok">${ICO.check} 증빙 확인</span>` : `<span class="vbadge vbadge--self">자기 기재</span>`}</div>
      </div>`
    )
    .join("\n      ");

  /* 관계별 평점 요약 */
  const rvSum = relKeys.length
    ? `<div class="rv-sum">
      ${relKeys
        .map(
          (k) => `<div class="rv-box">
        <p class="rv-box__k">${esc(k)} 평가</p>
        <p class="rv-box__v"><span class="num">${rel[k].avg ? rel[k].avg.toFixed(1) : "—"}</span><small>/ 5 · ${rel[k].count}건</small></p>
      </div>`
        )
        .join("\n      ")}
    </div>`
    : "";

  /* 항목별 막대 (관계 구분 없이 항목만 집계, 관계별 평점과 별개로 표시) */
  const itemAgg = {};
  (e.reviews || []).forEach((r) =>
    Object.keys(r.items || {}).forEach((k) => {
      if (!itemAgg[k]) itemAgg[k] = { s: 0, n: 0 };
      itemAgg[k].s += r.items[k];
      itemAgg[k].n += 1;
    })
  );
  const bars = Object.keys(itemAgg).length
    ? `<div class="bars" style="margin-bottom:24px">
      ${Object.keys(itemAgg)
        .map((k) => {
          const v = itemAgg[k].s / itemAgg[k].n;
          return `<div class="bar"><span class="bar__k">${esc(k)}</span><span class="bar__t"><i style="width:${(v / 5) * 100}%"></i></span><span class="bar__v num">${v.toFixed(1)}</span></div>`;
        })
        .join("\n      ")}
    </div>`
    : "";

  /* 후기 목록 */
  const rvList = (e.reviews || [])
    .map(
      (r) => `<div class="rv" data-rvgroup="${esc(r.rel)}">
        <div class="rv__hd">
          <span class="rv__rel">${esc(r.rel)}</span>
          <span class="rv__by">${esc(r.by)}</span>
          ${r.v ? `<span class="vbadge vbadge--ok">${ICO.check} 관계 확인</span>` : ""}
          <span class="rv__date num">${esc(r.date)}</span>
        </div>
        <p class="rv__t">${esc(r.t)}</p>
        <div class="rv__items">${Object.keys(r.items || {})
          .map((k) => `<b>${esc(k)} <em class="num">${r.items[k]}</em></b>`)
          .join("")}</div>
      </div>`
    )
    .join("\n      ");

  const rvTabs = relKeys.length
    ? `<div class="rv-tabs" role="tablist">
      <button type="button" class="rv-tab" data-rvtab="all" role="tab" aria-selected="true">전체 ${(e.reviews || []).length}</button>
      ${relKeys
        .map(
          (k) => `<button type="button" class="rv-tab" data-rvtab="${esc(k)}" role="tab" aria-selected="false">${esc(k)} ${rel[k].count}</button>`
        )
        .join("\n      ")}
    </div>`
    : "";

  const prodCards = prods.length
    ? `<div class="grid grid-2">
      ${prods
        .map(
          (p) => `<div class="prod">
        <div class="prod__top">
          <p class="prod__name">${esc(p.name)}</p>
          <p class="prod__price num">${esc(p.price)} <small>출시 시점 기준</small></p>
        </div>
        <div class="prod__body">
          <div class="prod__row"><span class="prod__k">포함</span><span class="prod__v">${esc(p.include)}</span></div>
          <div class="prod__row"><span class="prod__k">제외</span><span class="prod__v">${esc(p.exclude)}</span></div>
          <div class="prod__row"><span class="prod__k">결과물</span><span class="prod__v">${esc(p.output)}</span></div>
          <div class="prod__row"><span class="prod__k">준비물</span><span class="prod__v">${esc(p.ready)}</span></div>
          <a class="btn btn--ghost btn--sm" href="/connect?e=${esc(e.slug)}&p=${esc(p.id)}" style="margin-top:6px">이 상담으로 요청하기</a>
        </div>
      </div>`
        )
        .join("\n      ")}
    </div>`
    : "";

  page({
    file: `experts/${e.slug}.html`,
    path: `/experts/${e.slug}`,
    noindex: SAMPLE, // 예시 데이터인 동안은 검색에 올리지 않는다
    active: "/experts",
    title: `${e.name} ${e.title}`,
    desc: `${e.name} · ${e.org} · ${(e.fields || []).join(", ")}. ${String(e.intro).slice(0, 80)}`,
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: e.name,
      jobTitle: e.title,
      worksFor: { "@type": "Organization", name: e.org },
      knowsAbout: e.fields,
      url: `${process.env.SITE_URL || "https://proppeer.pages.dev"}/experts/${e.slug}`
    },
    body: `
${sampleBar}
<section class="pf-hero">
  <div class="wrap">
    <div class="crumb"><a href="/">홈</a> <span>›</span> <a href="/experts">전문가 찾기</a> <span>›</span> <span>${esc(e.name)}</span></div>
    <div class="pf-top">
      <span class="pf-av" aria-hidden="true">${esc(e.name.charAt(0))}</span>
      <div class="pf-id">
        <h1 class="pf-name">${esc(e.name)} ${vbadge(e.verification.state)}</h1>
        <p class="pf-role">${esc(e.title)} · ${esc(e.org)} · 경력 <span class="num">${e.career}</span>년 · ${esc((e.regions || []).join(", "))}</p>
        <div class="ex-fit" style="margin-top:14px">
          ${(e.problems || []).map((p) => `<b>${esc(T.problems[p])}</b>`).join("")}
          ${(e.fields || []).map((f) => `<i>${esc(f)}</i>`).join("")}
        </div>
        <div class="pf-actions">
          <a class="btn btn--primary" href="/connect?e=${esc(e.slug)}" data-track="connect_from_profile">상담 요청하기</a>
          <button type="button" class="btn btn--ghost" data-pfcmp="${esc(e.slug)}">비교함 담기</button>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="band" style="padding-top:clamp(30px,3.6vw,48px)">
  <div class="wrap">
    <div class="pf-layout">
      <div>
        <div class="pf-sec">
          <h2 class="pf-sec__t">소개</h2>
          <p style="font-size:var(--pp-fs-sm);color:var(--pp-text-2)">${esc(e.intro)}</p>
        </div>

        <div class="pf-sec">
          <h2 class="pf-sec__t">신뢰카드 <small>최근 확인 ${esc(e.verification.lastVerified)}</small></h2>
          <div class="evi">
            <div class="evi__hd">
              <b>무엇을 확인했나</b>
              <span class="evi__tag">${esc(e.verification.state)}</span>
            </div>
            ${vRows}
            <p class="evi__foot">"자기 기재"는 전문가가 직접 등록했고 프롭피어가 아직 증빙을 확인하지 않은 정보입니다. 확인이 끝나면 상태가 바뀌고 확인일이 갱신됩니다. <a href="/trust" style="color:var(--pp-blue)">검증 기준 보기</a></p>
          </div>
        </div>

        ${
          (e.interests || []).length
            ? `<div class="pf-sec">
          <h2 class="pf-sec__t">이해관계</h2>
          <div class="note note--gold">
            <div class="note__t">상담 전에 알려드립니다</div>
            ${(e.interests || []).map((i) => `<p><strong>${esc(i.t)}</strong> — ${esc(i.d)}</p>`).join("\n            ")}
            <p style="margin-top:10px">이해관계 없는 판단이 필요하시면 <a href="/connect" style="color:var(--pp-blue)">독립 전문가의 세컨드 오피니언</a>을 요청하실 수 있습니다.</p>
          </div>
        </div>`
            : ""
        }

        <div class="pf-sec">
          <h2 class="pf-sec__t">프로젝트 참여 이력 <small>증빙 확인 ${verifiedProjects}건 / 전체 ${(e.projects || []).length}건</small></h2>
          ${pjRows || '<p style="font-size:var(--pp-fs-sm);color:var(--pp-text-3)">등록된 프로젝트가 없습니다.</p>'}
          <p style="margin-top:16px;font-size:var(--pp-fs-caption);color:var(--pp-text-3)">회사의 실적을 개인 실적으로 자동 귀속하지 않습니다. 실제로 맡은 역할까지 계약·발주 자료로 확인합니다.</p>
        </div>

        ${
          prodCards
            ? `<div class="pf-sec">
          <h2 class="pf-sec__t">상담 상품</h2>
          ${prodCards}
          <p style="margin-top:16px;font-size:var(--pp-fs-caption);color:var(--pp-text-3)">금액은 정식 오픈 시점의 기준가입니다. 지금은 결제 없이 요청 접수만 진행하며, 일정과 조건을 확인한 뒤 안내드립니다.</p>
        </div>`
            : ""
        }

        ${(() => {
          const mine = (QNA.items || []).filter((q) =>
            (q.answers || []).some((a) => a.expert === e.slug)
          );
          if (!mine.length) return "";
          return `<div class="pf-sec">
          <h2 class="pf-sec__t">무료 상담 답변 <small>${mine.length}건</small></h2>
          <div class="qa-list">
            ${mine
              .map(
                (q) => `<a class="qa-card" href="/qna/${esc(q.slug)}">
              <div class="qa-card__hd"><span class="qa-cat">${esc(q.catLabel)}</span><span class="qa-reg">${esc(q.region)}</span></div>
              <h3 class="qa-card__t">${esc(q.title)}</h3>
            </a>`
              )
              .join("\n            ")}
          </div>
          <p style="margin-top:14px;font-size:var(--pp-fs-caption);color:var(--pp-text-3)">공개 게시판에 남긴 답변입니다. 이 전문가가 어떤 방식으로 설명하는지 미리 보실 수 있습니다.</p>
        </div>`;
        })()}

        <div class="pf-sec" id="reviews">
          <h2 class="pf-sec__t">후기와 레퍼런스 <small>${(e.reviews || []).length}건</small></h2>
          ${
            (e.reviews || []).length
              ? `<p style="font-size:var(--pp-fs-caption);color:var(--pp-text-3);margin-bottom:18px">상담고객·발주자·동료의 평가를 하나의 점수로 합치지 않고 관계별로 나눠 보여드립니다.</p>
          ${rvSum}
          ${bars}
          ${rvTabs}
          ${rvList}`
              : `<div class="ex-empty" style="padding:36px 24px"><h3>아직 등록된 후기가 없습니다</h3><p>후기는 결제된 상담이나 확인된 프로젝트 참여가 있는 분만 작성할 수 있어서, 초기에는 건수가 적습니다.</p></div>`
          }

          <div class="gate" data-gate data-expert="${esc(e.name)} (${esc(e.slug)})" style="margin-top:28px">
            <p class="gate__t">후기를 남기시려면</p>
            <p class="gate__d">프롭피어의 후기는 <strong>실제 상담이나 프로젝트 관계가 확인된 분</strong>만 작성할 수 있습니다. 누구나 쓸 수 있게 하면 후기의 의미가 사라지기 때문입니다. 상담이 끝나면 운영팀이 확인코드를 보내드리며, 그 코드로 관계를 확인한 뒤 작성 링크를 드립니다.</p>
            <form>
              <div class="gate__form">
                <input type="text" name="코드" placeholder="확인코드 입력 (예: PP-4821-73KD)" aria-label="상담 확인코드" autocomplete="off">
                <button type="submit" class="btn btn--primary">확인 요청하기</button>
              </div>
              <p class="gate__msg" role="status"></p>
            </form>
            <p style="margin-top:14px;font-size:var(--pp-fs-caption);color:var(--pp-text-3)">코드를 못 받으셨다면 <a href="#" data-email style="color:var(--pp-blue)">운영팀에 문의</a>해 주세요. 전문가에게는 답변권과 정정 요청권이 함께 주어지며, 불리한 후기라도 임의로 삭제하지 않습니다.</p>
          </div>
        </div>
      </div>

      <aside class="pf-side">
        <div class="sc sc--navy">
          <p class="sc__t">한눈에 보기</p>
          <div class="sc__row"><span class="sc__k">검증 프로젝트</span><span class="sc__v num">${e.stats.projectsVerified}건</span></div>
          <div class="sc__row"><span class="sc__k">예약 준수율</span><span class="sc__v num">${e.stats.keepRate}%</span></div>
          <div class="sc__row"><span class="sc__k">평균 응답</span><span class="sc__v num">${e.stats.responseHours}시간</span></div>
          <div class="sc__row"><span class="sc__k">누적 상담</span><span class="sc__v num">${e.stats.consult}건</span></div>
          <div class="sc__row"><span class="sc__k">상담 방식</span><span class="sc__v" style="font-weight:600">${esc((e.methods || []).join(", "))}</span></div>
          <a class="btn btn--primary btn--block" href="/connect?e=${esc(e.slug)}">상담 요청하기</a>
        </div>

        <div class="sc">
          <p class="sc__t">관계별 평점</p>
          ${
            relKeys.length
              ? relKeys
                  .map(
                    (k) =>
                      `<div class="sc__row"><span class="sc__k">${esc(k)} (${rel[k].count})</span><span class="sc__v num">${rel[k].avg ? rel[k].avg.toFixed(1) : "—"}</span></div>`
                  )
                  .join("\n          ")
              : `<p style="font-size:var(--pp-fs-caption);color:var(--pp-text-3)">아직 등록된 후기가 없습니다.</p>`
          }
          <p style="margin-top:12px;font-size:11px;color:var(--pp-text-3)">관계마다 볼 수 있는 면이 다르기 때문에 평균을 합산하지 않습니다.</p>
        </div>

        <div class="sc">
          <p class="sc__t">이 분야의 다른 전문가</p>
          ${DATA.experts
            .filter((x) => x.slug !== e.slug && x.fields.some((f) => e.fields.includes(f)))
            .slice(0, 3)
            .map(
              (x) =>
                `<div class="sc__row"><span class="sc__k"><a href="/experts/${esc(x.slug)}">${esc(x.name)}</a> · ${esc(x.title)}</span></div>`
            )
            .join("\n          ") || `<p style="font-size:var(--pp-fs-caption);color:var(--pp-text-3)">같은 분야의 다른 전문가를 모으고 있습니다.</p>`}
          <a class="btn btn--ghost btn--block btn--sm" href="/experts">전문가 전체 보기</a>
        </div>
      </aside>
    </div>
  </div>
</section>`,
    tail: `<script src="/assets/js/profile.js"></script>`
  });
}

/* ---------- 연결(상담 요청) 페이지 ---------- */
function connectPage(page, products) {
  page({
    file: "connect.html",
    path: "/connect",
    active: "/experts",
    title: "상담 요청",
    desc:
      "전문가에게 상담을 요청합니다. 진단 내용을 함께 보내면 첫 상담부터 본론으로 들어갈 수 있습니다.",
    body: `
<section class="pagehead">
  <div class="wrap wrap--narrow">
    <div class="crumb"><a href="/">홈</a> <span>›</span> <a href="/experts">전문가 찾기</a> <span>›</span> <span>상담 요청</span></div>
    <h1 class="pagehead__t">상담 요청하기</h1>
    <p class="pagehead__d">지금은 정식 오픈 전이라 결제 없이 요청만 접수합니다. 운영팀이 전문가의 일정과 상담 범위를 확인한 뒤, 가능한 시간과 조건을 안내드립니다.</p>
  </div>
</section>

<section class="band">
  <div class="wrap wrap--narrow">
    <div id="cn-expert"></div>
    <div id="cn-diag" hidden></div>

    <form class="form" data-pp-form="consult-request" data-pp-subject="상담 요청">
      <input type="hidden" name="전문가" value="">
      <input type="hidden" name="진단내용" value="">

      <div class="field">
        <label for="cn-prod">원하는 상담</label>
        <select id="cn-prod" name="상담상품">
          <option value="">아직 정하지 못했습니다 (운영팀 추천)</option>
          ${products.map((p) => `<option value="${esc(p.id)}">${esc(p.name)} · ${esc(p.price)}</option>`).join("\n          ")}
        </select>
        <span class="field__hint">고르지 않으셔도 됩니다. 내용을 보고 맞는 상담을 제안해 드립니다.</span>
      </div>

      <div class="field">
        <label>상담 방식</label>
        <div class="chips" id="cn-methods">
          ${["전화", "영상", "방문", "문서검토"]
            .map(
              (m, i) =>
                `<label class="chip"><input type="radio" name="상담방식" value="${m}"${i === 0 ? " checked" : ""}><span>${m}</span></label>`
            )
            .join("\n          ")}
        </div>
      </div>

      <div class="field">
        <label for="cn-content">어떤 상황인지 알려주세요</label>
        <textarea id="cn-content" name="상담내용" required placeholder="예: 1층 상가 40평이 6개월째 공실입니다. 숙박업으로 바꿀 수 있는지, 가능하다면 비용이 얼마나 드는지 알고 싶습니다."></textarea>
        <span class="field__err">상담받고 싶은 내용을 알려주세요.</span>
      </div>

      <div class="grid grid-2">
        <div class="field">
          <label for="cn-when">희망 시점</label>
          <select id="cn-when" name="희망시점" required>
            <option value="">선택해주세요</option>
            <option>가능한 빨리</option>
            <option>1주 안</option>
            <option>1개월 안</option>
            <option>아직 미정</option>
          </select>
          <span class="field__err">희망 시점을 선택해주세요.</span>
        </div>
        <div class="field">
          <label for="cn-time">연락 가능한 시간대</label>
          <select id="cn-time" name="연락시간">
            <option>평일 낮 (09~18시)</option>
            <option>평일 저녁 (18~21시)</option>
            <option>주말</option>
            <option>언제든 가능</option>
          </select>
        </div>
      </div>

      <div class="grid grid-2">
        <div class="field">
          <label for="cn-name">이름</label>
          <input id="cn-name" name="이름" type="text" required placeholder="홍길동">
          <span class="field__err">이름을 입력해주세요.</span>
        </div>
        <div class="field">
          <label for="cn-contact">연락처</label>
          <input id="cn-contact" name="연락처" type="text" required placeholder="이메일 또는 휴대폰 번호">
          <span class="field__err">연락받으실 방법을 입력해주세요.</span>
        </div>
      </div>

      <label class="agree">
        <input type="checkbox" name="개인정보동의" value="동의" required>
        <span>상담 연결을 위해 요청 내용과 연락처를 수집·이용하고, 배정된 전문가에게 제공하는 데 동의합니다. 목적 달성 후 파기하며 동의는 언제든 철회할 수 있습니다. <a href="/trust#privacy">처리 기준 보기</a></span>
      </label>

      <div class="note">
        <div class="note__t">요청 전에 알아두실 것</div>
        <p>프롭피어는 상담을 연결하는 플랫폼이며, 법률·세무·중개처럼 자격이 필요한 업무의 계약은 이용자와 해당 전문가 사이에 직접 체결됩니다. 요청을 보내셨다고 계약이 성립하지는 않습니다.</p>
      </div>

      <div class="form__msg" role="status"></div>
      <button type="submit" class="btn btn--primary btn--block" data-track="connect_submit">상담 요청 보내기</button>
      <p class="field__hint" style="text-align:center">보통 1~2영업일 안에 연락드립니다.</p>
    </form>
  </div>
</section>`,
    tail: `<script src="/assets/js/connect.js"></script>`
  });
}

module.exports = { DATA, T, expertsIndex, expertProfile, connectPage, SAMPLE, sampleBar };
