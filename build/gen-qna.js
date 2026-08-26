/* 무료 상담(Q&A) 목록·상세·질문작성 페이지 생성 */
const fs = require("fs");
const path = require("path");

const QNA = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../assets/data/qna.json"), "utf8")
);
const EXP = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../assets/data/experts.json"), "utf8")
);

const T = EXP.taxonomy;
const SAMPLE = QNA.meta.mode === "sample";

const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

const ICO = {
  info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>`,
  check: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  arrow: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`
};

const sampleBar = SAMPLE
  ? `<div class="samplebar"><div class="wrap">${ICO.info}<span>지금 보이는 상담글과 답변은 화면 구성을 확인하기 위한 <b>예시 데이터</b>입니다. 실제 질문과 전문가 답변으로 교체한 뒤 공개합니다.</span></div></div>`
  : "";

const expertBySlug = (s) => EXP.experts.find((e) => e.slug === s);

const CATS = (T.categories || []).map((c) => ({ id: c.id, t: c.t }));

/* 요약 발췌 */
function excerpt(t, n) {
  const s = String(t).replace(/\n+/g, " ").trim();
  return s.length > n ? s.slice(0, n) + "…" : s;
}

/* ---------- 목록 ---------- */
function qnaIndex(page) {
  const items = QNA.items.slice().sort((a, b) => (a.asked < b.asked ? 1 : -1));

  const cards = items
    .map(
      (q) => `<a class="qa-card" href="/qna/${esc(q.slug)}" data-cat="${esc(q.cat)}" data-status="${esc(q.status)}">
        <div class="qa-card__hd">
          <span class="qa-cat">${esc(q.catLabel)}</span>
          <span class="qa-reg">${esc(q.region)}</span>
          ${
            q.status === "answered"
              ? `<span class="qa-st qa-st--done">${ICO.check} 답변 ${q.answers.length}개</span>`
              : `<span class="qa-st qa-st--wait">답변 대기</span>`
          }
        </div>
        <h3 class="qa-card__t">${esc(q.title)}</h3>
        <p class="qa-card__b">${esc(excerpt(q.body, 110))}</p>
        <p class="qa-card__m">
          <span>질문 <b>${esc(q.asked)}</b></span>
          ${q.answered ? `<span>답변 <b>${esc(q.answered)}</b></span>` : ""}
          <span>조회 <b>${q.views}</b></span>
        </p>
      </a>`
    )
    .join("\n      ");

  page({
    file: "qna/index.html",
    path: "/qna",
    active: "/qna",
    title: "무료 상담",
    desc:
      "부동산 문제를 글로 올리면 검증된 전문가가 무료로 답변합니다. 공실·임대차·매입·용도변경·공사비·세금 상담 사례를 확인하세요.",
    body: `
${sampleBar}
<section class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">홈</a> <span>›</span> <span>무료 상담</span></div>
    <h1 class="pagehead__t">글로 물어보고,<br>전문가 답변을 무료로 받으세요</h1>
    <p class="pagehead__d">상담료 없이 질문할 수 있습니다. 검증된 전문가가 직접 답변하고, 답변은 다른 분들도 볼 수 있게 공개됩니다. 비슷한 상황을 먼저 겪은 사람의 질문부터 찾아보셔도 됩니다.</p>
    <div class="btn-row" style="margin-top:22px">
      <a class="btn btn--primary" href="/qna/ask" data-track="qna_ask_from_list">무료로 질문하기</a>
      <a class="btn btn--ghost" href="/diagnosis">먼저 3분 진단하기</a>
    </div>
  </div>
</section>

<section class="band" style="padding-top:clamp(28px,3.4vw,44px)">
  <div class="wrap">
    <div class="qa-bar">
      <button type="button" class="qa-chip" data-qakind="status" data-qafilter="answered" aria-pressed="false">답변 완료</button>
      <button type="button" class="qa-chip" data-qakind="status" data-qafilter="waiting" aria-pressed="false">답변 대기</button>
      <span style="width:1px;height:22px;background:var(--pp-line);margin-inline:4px"></span>
      ${CATS.map(
        (c) =>
          `<button type="button" class="qa-chip" data-qakind="cat" data-qafilter="${esc(c.id)}" aria-pressed="false">${esc(c.t)}</button>`
      ).join("\n      ")}
    </div>

    <p class="ex-count" style="margin-bottom:16px">전체 <b class="num" id="qa-count">${items.length}</b>건</p>

    <div class="qa-list" id="qa-list">
      ${cards}
    </div>

    <div class="ex-empty" id="qa-empty" hidden style="margin-top:14px">
      <h3>조건에 맞는 상담글이 없습니다</h3>
      <p>다른 분야를 선택하시거나, 직접 질문을 올려보세요. 아직 아무도 묻지 않은 문제라면 더 정확한 답변을 받으실 수 있습니다.</p>
      <div class="btn-row" style="justify-content:center;margin-top:20px">
        <a class="btn btn--primary" href="/qna/ask">무료로 질문하기</a>
      </div>
    </div>
  </div>
</section>

<section class="band band--tint">
  <div class="wrap wrap--narrow">
    <div class="sec-head">
      <span class="eyebrow">이용 안내</span>
      <h2 class="sec-title">어떻게 진행되나요</h2>
    </div>
    <div class="steps">
      <div class="step"><h3 class="step__t">질문 작성</h3><p class="step__d">분야와 지역을 고르고 상황을 적어주세요. 자세할수록 답변이 정확해집니다.</p></div>
      <div class="step"><h3 class="step__t">전문가 배정</h3><p class="step__d">운영팀이 해당 분야의 검증된 전문가에게 전달합니다. 보통 1~3영업일이 걸립니다.</p></div>
      <div class="step"><h3 class="step__t">답변 확인</h3><p class="step__d">답변이 등록되면 알려드립니다. 더 깊은 검토가 필요하면 유료 상담으로 이어갈 수 있습니다.</p></div>
    </div>
    <div class="note note--gold" style="margin-top:26px">
      <div class="note__t">무료 답변으로 할 수 있는 것과 없는 것</div>
      <p>무료 답변은 <strong>무엇을 어떤 순서로 확인해야 하는지</strong>를 알려드리는 데까지입니다. 계약서 전문 검토, 현장 확인, 세액 계산, 법적 결론처럼 자료와 사실관계를 봐야 하는 판단은 유료 상담에서 다룹니다. 답변에서 그 경계를 분명히 밝혀드립니다.</p>
    </div>
  </div>
</section>`,
    tail: `<script src="/assets/js/qna.js"></script>`
  });
}

/* ---------- 상세 ---------- */
function qnaDetail(page, q) {
  const answers = (q.answers || [])
    .map((a) => {
      const e = expertBySlug(a.expert);
      if (!e) return "";
      const st = e.verification.state;
      const cls =
        st === "검증 완료" ? "ok" : st === "부분 검증" ? "part" : st === "검토 중" ? "wait" : "self";
      return `<article class="qa-a">
        <div class="qa-a__hd">
          <span class="ex-av" aria-hidden="true">${esc(e.name.charAt(0))}</span>
          <div class="qa-a__who">
            <p class="qa-a__name"><a href="/experts/${esc(e.slug)}">${esc(e.name)}</a>
              <span class="vbadge vbadge--${cls}">${st === "검증 완료" ? ICO.check + " " : ""}${esc(st)}</span>
            </p>
            <p class="qa-a__org">${esc(e.title)} · ${esc(e.org)}</p>
          </div>
          <span class="qa-a__date">${esc(a.date)}</span>
        </div>
        <div class="qa-a__body">${esc(a.body)}</div>
        <div class="qa-a__foot">
          <a class="btn btn--primary btn--sm" href="/connect?e=${esc(e.slug)}" data-track="qna_to_connect">이 전문가에게 상담 요청</a>
          <a class="btn btn--ghost btn--sm" href="/experts/${esc(e.slug)}">프로필 보기</a>
        </div>
      </article>`;
    })
    .join("\n      ");

  const related = QNA.items
    .filter((x) => x.slug !== q.slug && x.cat === q.cat)
    .slice(0, 2);

  page({
    file: `qna/${q.slug}.html`,
    path: `/qna/${q.slug}`,
    active: "/qna",
    title: q.title,
    desc: excerpt(q.body, 120),
    article: true,
    jsonld: {
      "@context": "https://schema.org",
      "@type": "QAPage",
      mainEntity: {
        "@type": "Question",
        name: q.title,
        text: q.body,
        dateCreated: q.asked,
        answerCount: (q.answers || []).length,
        ...((q.answers || []).length
          ? {
              acceptedAnswer: {
                "@type": "Answer",
                text: q.answers[0].body,
                dateCreated: q.answers[0].date,
                author: {
                  "@type": "Person",
                  name: (expertBySlug(q.answers[0].expert) || {}).name || ""
                }
              }
            }
          : {})
      }
    },
    body: `
${sampleBar}
<section class="pagehead">
  <div class="wrap wrap--narrow">
    <div class="crumb"><a href="/">홈</a> <span>›</span> <a href="/qna">무료 상담</a> <span>›</span> <span>${esc(q.catLabel)}</span></div>
    <div class="qa-card__hd" style="margin-bottom:14px">
      <span class="qa-cat">${esc(q.catLabel)} · ${esc(q.sub)}</span>
      <span class="qa-reg">${esc(q.region)}</span>
      ${
        q.status === "answered"
          ? `<span class="qa-st qa-st--done">${ICO.check} 답변 ${q.answers.length}개</span>`
          : `<span class="qa-st qa-st--wait">답변 대기</span>`
      }
    </div>
    <h1 class="pagehead__t" style="font-size:clamp(1.5rem,1.2rem+1.4vw,2.1rem)">${esc(q.title)}</h1>
    <p class="pagehead__d" style="font-size:var(--pp-fs-caption)">질문 ${esc(q.asked)}${q.answered ? ` · 답변 ${esc(q.answered)}` : ""} · 조회 ${q.views}</p>
  </div>
</section>

<section class="band">
  <div class="wrap wrap--narrow">
    <div class="qa-q">
      <p style="font-size:var(--pp-fs-caption);font-weight:800;color:var(--pp-text-3)">질문</p>
      <div class="qa-q__body">${esc(q.body)}</div>
    </div>

    ${
      (q.answers || []).length
        ? `<h2 class="pf-sec__t">전문가 답변 <small>${q.answers.length}개</small></h2>
    ${answers}
    <div class="note" style="margin-top:22px">
      <div class="note__t">답변의 범위</div>
      <p>공개 답변은 확인할 항목과 순서를 알려드리는 데까지입니다. 계약서 전문, 현장, 자료를 봐야 하는 판단은 상담에서 다룹니다. 이 글을 상대방에게 보내는 문서의 근거로 그대로 쓰시는 건 권하지 않습니다.</p>
    </div>`
        : `<div class="qa-wait">
      <h3>아직 답변이 등록되지 않았습니다</h3>
      <p>운영팀이 해당 분야의 검증된 전문가에게 전달했습니다. 보통 1~3영업일 안에 답변이 올라옵니다.</p>
      <div class="btn-row" style="justify-content:center;margin-top:20px">
        <a class="btn btn--ghost" href="/experts?field=${esc(encodeURIComponent(((T.categories.find((c) => c.id === q.cat) || {}).items || [])[0]?.fields?.[0] || ""))}">이 분야 전문가 보기</a>
      </div>
    </div>`
    }

    <div class="btn-row" style="margin-top:32px">
      <a class="btn btn--primary" href="/qna/ask" data-track="qna_ask_from_detail">나도 무료로 질문하기</a>
      <a class="btn btn--ghost" href="/qna">다른 상담글 보기</a>
    </div>
  </div>
</section>

${
  related.length
    ? `<section class="band band--tint">
  <div class="wrap">
    <div class="sec-head"><span class="eyebrow">같은 분야</span><h2 class="sec-title">이어서 볼 상담글</h2></div>
    <div class="grid grid-2">
      ${related
        .map(
          (r) => `<a class="qa-card" href="/qna/${esc(r.slug)}">
        <div class="qa-card__hd"><span class="qa-cat">${esc(r.catLabel)}</span><span class="qa-reg">${esc(r.region)}</span></div>
        <h3 class="qa-card__t">${esc(r.title)}</h3>
        <p class="qa-card__b">${esc(excerpt(r.body, 90))}</p>
      </a>`
        )
        .join("\n      ")}
    </div>
  </div>
</section>`
    : ""
}`
  });
}

/* ---------- 질문 작성 ---------- */
function qnaAsk(page) {
  page({
    file: "qna/ask.html",
    path: "/qna/ask",
    active: "/qna",
    title: "무료로 질문하기",
    desc: "부동산 문제를 글로 남기면 검증된 전문가가 무료로 답변합니다. 상담료 없이 이용하실 수 있습니다.",
    body: `
<section class="pagehead">
  <div class="wrap wrap--narrow">
    <div class="crumb"><a href="/">홈</a> <span>›</span> <a href="/qna">무료 상담</a> <span>›</span> <span>질문하기</span></div>
    <h1 class="pagehead__t">무료로 질문하기</h1>
    <p class="pagehead__d">상담료는 없습니다. 상황을 자세히 적어주실수록 전문가가 정확하게 답변할 수 있습니다. 답변은 다른 분들도 볼 수 있도록 공개됩니다.</p>
  </div>
</section>

<section class="band">
  <div class="wrap wrap--narrow">
    <form class="form" data-pp-form="qna-ask" data-pp-subject="무료 상담 질문">

      <div class="field">
        <label for="qa-title">제목 <span class="field__hint">(10자 이상)</span></label>
        <input id="qa-title" name="제목" type="text" required placeholder="궁금한 것 하나를 구체적으로 적어주세요">
        <p class="counter" id="cnt-title" data-ok="false">0 / 최소 10자</p>
        <span class="field__err">제목을 10자 이상 적어주세요.</span>
      </div>

      <div class="grid grid-2">
        <div class="field">
          <label for="qa-cat">분야</label>
          <select id="qa-cat" name="분야" required>
            <option value="">선택해주세요</option>
            ${(T.categories || [])
              .map((c) => `<option value="${esc(c.t)}">${esc(c.t)}</option>`)
              .join("\n            ")}
          </select>
          <span class="field__err">분야를 선택해주세요.</span>
        </div>
        <div class="field">
          <label for="qa-region">지역</label>
          <select id="qa-region" name="지역" required>
            <option value="">선택해주세요</option>
            ${T.regions
              .filter((r) => r !== "전국")
              .map((r) => `<option value="${esc(r)}">${esc(r)}</option>`)
              .join("\n            ")}
          </select>
          <span class="field__err">지역을 선택해주세요.</span>
        </div>
      </div>

      <div class="field">
        <label for="qa-when">문제가 생긴 시점 <span class="field__hint">(정확하지 않아도 됩니다)</span></label>
        <select id="qa-when" name="발생시점">
          <option>최근 1개월 안</option>
          <option>1~3개월 전</option>
          <option>3~6개월 전</option>
          <option>6개월~1년 전</option>
          <option>1년 이상 전</option>
          <option>아직 생기지 않음 (사전 검토)</option>
        </select>
      </div>

      <div class="field">
        <label for="qa-body">내용 <span class="field__hint">(200자 이상)</span></label>
        <textarea id="qa-body" name="내용" required rows="10" placeholder="아래 내용이 들어가면 답변이 정확해집니다.

· 대상 부동산 (예: 1층 상가 40평, 5층 건물 중 2개 층)
· 지금 어떤 상황인지 (예: 8개월째 공실, 계약 만료 2개월 전)
· 무엇을 결정하려는지 (예: 숙박업 전환 가능 여부)
· 이미 확인한 것과 받은 자료 (예: 인테리어 견적 1건)"></textarea>
        <p class="counter" id="cnt-body" data-ok="false">0 / 최소 200자</p>
        <p class="field__err">상황을 200자 이상 알려주세요.</p>
        <p class="privacy-warn" id="qa-privacy-warn" role="alert" hidden></p>
      </div>

      <div class="rules">
        <b>올리기 전에 확인해주세요</b>
        <ol>
          <li>이 게시판은 <strong>공개</strong>됩니다. 이름, 연락처, 정확한 주소, 계좌번호, 상대방을 특정할 수 있는 정보는 지우고 올려주세요.</li>
          <li>답변은 <strong>확인할 항목과 순서를 알려드리는 범위</strong>입니다. 계약서 전문 검토, 현장 확인, 세액 계산 같은 판단은 유료 상담에서 다룹니다.</li>
          <li>전문가 답변은 <strong>법률·세무·감정 결론을 확정하지 않습니다.</strong> 상대방에게 보내는 문서의 근거로 그대로 쓰지 마세요.</li>
          <li>답변까지 보통 <strong>1~3영업일</strong>이 걸립니다. 분야에 따라 더 걸릴 수 있습니다.</li>
          <li>질문 제목은 답변받기 좋은 형태로 운영팀이 다듬을 수 있습니다. 내용은 고치지 않습니다.</li>
          <li>같은 질문을 반복해 올리거나 광고·홍보 목적의 글은 공개되지 않습니다.</li>
        </ol>
      </div>

      <div class="field">
        <label for="qa-nick">표시할 이름 <span class="field__hint">(게시판에 보이는 이름입니다)</span></label>
        <input id="qa-nick" name="표시이름" type="text" placeholder="예: 상가 임차인 (비워두시면 '질문자'로 표시됩니다)">
      </div>

      <div class="field">
        <label for="qa-contact">답변 알림 받을 곳</label>
        <input id="qa-contact" name="연락처" type="text" required placeholder="이메일 또는 휴대폰 번호">
        <span class="field__hint">답변이 등록되면 알려드리는 용도로만 씁니다. 게시판에 공개되지 않습니다.</span>
        <span class="field__err">연락받으실 방법을 입력해주세요.</span>
      </div>

      <label class="agree">
        <input type="checkbox" name="공개동의" value="동의" required>
        <span>질문 내용과 답변이 공개 게시판에 게시되는 데 동의합니다. 개인을 특정할 수 있는 정보는 직접 제거했음을 확인합니다.</span>
      </label>
      <label class="agree">
        <input type="checkbox" name="개인정보동의" value="동의" required>
        <span>답변 알림을 위해 연락처를 수집·이용하는 데 동의합니다. 목적 달성 후 파기하며 동의는 언제든 철회할 수 있습니다. <a href="/trust#privacy">처리 기준 보기</a></span>
      </label>

      <div class="form__msg" role="status"></div>
      <button type="submit" class="btn btn--primary btn--block" data-track="qna_submit_btn">무료 질문 등록하기</button>
      <p class="field__hint" style="text-align:center">등록 후 운영팀이 해당 분야 전문가에게 전달합니다.</p>
    </form>
  </div>
</section>`,
    tail: `<script src="/assets/js/qna.js"></script>`
  });
}

function buildAll(page) {
  qnaIndex(page);
  QNA.items.forEach((q) => qnaDetail(page, q));
  qnaAsk(page);
}

module.exports = { QNA, buildAll, SAMPLE };
