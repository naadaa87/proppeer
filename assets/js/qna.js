/* =========================================================
   PROPPEER · qna.js
   무료 상담 — 목록 필터 / 질문 작성 폼 검증
   ========================================================= */
(function () {
  "use strict";

  var track = window.ppTrack || function () {};

  /* ---------------- 목록 필터 ---------------- */
  var list = document.getElementById("qa-list");
  if (list) {
    var cards = Array.prototype.slice.call(list.querySelectorAll(".qa-card"));
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-qafilter]"));
    var countEl = document.getElementById("qa-count");
    var empty = document.getElementById("qa-empty");
    var state = { cat: "all", status: "all" };

    function paint() {
      var n = 0;
      cards.forEach(function (c) {
        var okCat = state.cat === "all" || c.getAttribute("data-cat") === state.cat;
        var okSt = state.status === "all" || c.getAttribute("data-status") === state.status;
        var on = okCat && okSt;
        c.hidden = !on;
        if (on) n += 1;
      });
      if (countEl) countEl.textContent = String(n);
      if (empty) empty.hidden = n > 0;
    }

    chips.forEach(function (ch) {
      ch.addEventListener("click", function () {
        var kind = ch.getAttribute("data-qakind");
        var val = ch.getAttribute("data-qafilter");
        state[kind] = state[kind] === val ? "all" : val;
        chips.forEach(function (x) {
          if (x.getAttribute("data-qakind") !== kind) return;
          x.setAttribute(
            "aria-pressed",
            String(x.getAttribute("data-qafilter") === state[kind])
          );
        });
        paint();
        track("qna_filter", { kind: kind, value: state[kind] });
      });
    });

    // URL 로 분야가 넘어온 경우
    var qs = new URLSearchParams(window.location.search);
    var cat = qs.get("cat");
    if (cat) {
      var target = chips.filter(function (x) {
        return x.getAttribute("data-qakind") === "cat" && x.getAttribute("data-qafilter") === cat;
      })[0];
      if (target) target.click();
    }
    paint();
  }

  /* ---------------- 질문 작성 폼 ---------------- */
  var ask = document.querySelector("form[data-pp-form='qna-ask']");
  if (!ask) return;

  var MIN_TITLE = 10;
  var MIN_BODY = 200;

  function bindCounter(input, counterId, min) {
    var c = document.getElementById(counterId);
    if (!input || !c) return;
    function upd() {
      var n = (input.value || "").trim().length;
      c.setAttribute("data-ok", String(n >= min));
      c.textContent = n + " / 최소 " + min + "자";
    }
    input.addEventListener("input", upd);
    upd();
  }

  var title = ask.querySelector("[name=제목]");
  var body = ask.querySelector("[name=내용]");
  bindCounter(title, "cnt-title", MIN_TITLE);
  bindCounter(body, "cnt-body", MIN_BODY);

  /* 개인정보가 들어갈 만한 패턴을 미리 알려줍니다 (막지는 않습니다) */
  var PATTERNS = [
    { re: /01[016789][-\s]?\d{3,4}[-\s]?\d{4}/, t: "휴대폰 번호" },
    { re: /\d{6}[-\s]?[1-4]\d{6}/, t: "주민등록번호" },
    { re: /[\w.+-]+@[\w-]+\.[\w.]{2,}/, t: "이메일 주소" },
    { re: /\d{2,3}[-\s]\d{3,4}[-\s]\d{4}/, t: "전화번호" }
  ];

  var warn = document.getElementById("qa-privacy-warn");
  function checkPrivacy() {
    if (!warn) return;
    var text = (title ? title.value : "") + " " + (body ? body.value : "");
    var hit = PATTERNS.filter(function (p) {
      return p.re.test(text);
    }).map(function (p) {
      return p.t;
    });
    if (hit.length) {
      warn.hidden = false;
      warn.textContent =
        "본문에 " + hit.join(", ") + "로 보이는 내용이 있습니다. 공개 게시판이니 지우고 올려주세요.";
    } else {
      warn.hidden = true;
    }
  }
  if (title) title.addEventListener("input", checkPrivacy);
  if (body) body.addEventListener("input", checkPrivacy);

  /* 제출 전 추가 검증 — main.js 의 공통 검증보다 먼저 걸립니다 */
  ask.addEventListener(
    "submit",
    function (e) {
      var tLen = title ? title.value.trim().length : 0;
      var bLen = body ? body.value.trim().length : 0;
      var bad = null;

      if (tLen < MIN_TITLE) bad = { el: title, msg: "제목을 " + MIN_TITLE + "자 이상 적어주세요." };
      else if (bLen < MIN_BODY)
        bad = { el: body, msg: "상황을 " + MIN_BODY + "자 이상 알려주셔야 전문가가 답변할 수 있습니다." };

      if (bad) {
        e.preventDefault();
        e.stopImmediatePropagation();
        var wrap = bad.el.closest(".field");
        if (wrap) wrap.classList.add("field--err");
        var msg = ask.querySelector(".form__msg[role=status]");
        if (msg) {
          msg.setAttribute("data-type", "err");
          msg.textContent = bad.msg;
        }
        bad.el.focus();
        return false;
      }
      track("qna_submit", {});
    },
    true
  );
})();
