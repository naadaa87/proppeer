(function () {
  "use strict";

  /* mobile nav */
  var nav = document.getElementById("nav");
  var burger = document.getElementById("navBurger");
  var links = document.getElementById("navLinks");
  if (nav && burger && links) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* scroll reveal */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var rvs = [].slice.call(document.querySelectorAll(".rv"));
  if (reduced || !("IntersectionObserver" in window)) {
    rvs.forEach(function (el) { el.classList.add("on"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("on"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    rvs.forEach(function (el) { io.observe(el); });
  }

  /* home: profile card explainer */
  var prows = [].slice.call(document.querySelectorAll(".prow[data-x]"));
  var peT = document.getElementById("peTitle");
  var peB = document.getElementById("peBody");
  if (prows.length && peT && peB) {
    var pExplain = {
      v: { t: "검증등급 V0–V5", b: "좋은 사람 순위가 아니라, 정보가 얼마나 깊게 확인되었는지를 뜻합니다. V4는 프로젝트 2건 이상과 역할 증빙까지 확인된 상태이고, 등급마다 근거·검증일·만료일이 함께 기록됩니다." },
      r: { t: "거래증빙 후기", b: "실제 거래 상대만 남길 수 있는 기록입니다. 익명 후기와 소문은 받지 않고, 한 거래에 한 번만 씁니다. 표본 수와 최근성을 함께 표시해 평균만 보고 판단하지 않게 합니다." },
      d: { t: "차원별 평점", b: "총점 하나로 사람을 줄 세우지 않습니다. 정보를 투명하게 줬는지, 계약을 지켰는지, 문제가 생겼을 때 어떻게 대응했는지를 나눠서 보여줍니다." },
      s: { t: "분쟁 상태와 반론권", b: "부정적 기록에는 당사자의 소명과 해결 경과를 나란히 싣습니다. 확정되지 않은 사안을 단정하지 않고, 합의나 이행 같은 회복 과정도 기록으로 남깁니다." },
      m: { t: "멤버십 — 결제와 신뢰의 분리", b: "멤버십은 검색·리포트·딜 기능의 이용권일 뿐입니다. 돈을 낸다고 검증등급이나 평점이 오르지 않으며, 화면에서도 신뢰 표시와 색과 위치를 분리해 둡니다." }
    };
    prows.forEach(function (btn) {
      btn.addEventListener("click", function () {
        prows.forEach(function (b) { b.classList.remove("on"); b.setAttribute("aria-pressed", "false"); });
        btn.classList.add("on");
        btn.setAttribute("aria-pressed", "true");
        var d = pExplain[btn.getAttribute("data-x")];
        if (d) { peT.textContent = d.t; peB.textContent = d.b; }
      });
    });
  }

  /* trust: V0–V5 ladder */
  var vsteps = [].slice.call(document.querySelectorAll(".v-step"));
  var vpC = document.getElementById("vpCode");
  if (vsteps.length && vpC) {
    var vpN = document.getElementById("vpName");
    var vpD = document.getElementById("vpDesc");
    var vpR = document.getElementById("vpReq");
    var vpS = document.getElementById("vpShow");
    var vpCy = document.getElementById("vpCycle");
    var vData = [
      { c: "V0", n: "미소유 · 미확인", d: "비회원이거나 프로필 소유가 확인되지 않은 상태입니다. 회색으로 표시되고 공개 범위가 제한됩니다. 이 상태의 인물에 대해서는 공개 별점이나 자유서술 부정후기를 받지 않습니다.", req: "비회원 또는 소유 미확인", show: "회색 · 공개 제한", cy: "—" },
      { c: "V1", n: "본인확인", d: "휴대폰 본인인증으로 실명이 확인된 상태입니다. 프롭피어의 모든 활동은 여기서 출발합니다. 익명으로는 후기를 쓸 수 없습니다.", req: "휴대폰 본인인증", show: "본인확인", cy: "상시 유지" },
      { c: "V2", n: "소속확인", d: "회사 이메일, 기업 관리자 확인, 사업자 확인 중 하나로 현재 소속이 검증된 상태입니다. 퇴사하거나 갱신하지 않으면 만료됩니다.", req: "회사 이메일 · 기업 관리자 · 사업자 확인", show: "소속확인", cy: "6~12개월마다 갱신" },
      { c: "V3", n: "전문자격확인", d: "공인중개사, 건축사 같은 전문자격이나 등록·사업영역이 공식 조회로 확인된 상태입니다. 자격이 정지되거나 취소되면 상태가 바로 바뀝니다.", req: "자격 · 등록 · 사업영역 중 1개 이상", show: "전문확인", cy: "공식 조회 상태 기준" },
      { c: "V4", n: "프로젝트확인", d: "프로젝트 2건 이상과 각 프로젝트에서 맡은 역할의 증빙이 확인된 상태입니다. '참여했다'는 말이 아니라 발주처, 수행 기간, 역할, 결과를 기준으로 봅니다.", req: "프로젝트 2건 이상 + 역할 증빙", show: "실적확인", cy: "프로젝트별 검증" },
      { c: "V5", n: "거래검증", d: "플랫폼 안에서 완료된 거래 3건 이상과 상대방 확인이 있는 상태입니다. V5는 더 좋은 사람이라는 뜻이 아니라, 확인된 거래 데이터가 그만큼 많다는 뜻입니다.", req: "완료 거래 3건 이상 + 상대방 확인", show: "거래검증", cy: "최근 24개월 기준" }
    ];
    vsteps.forEach(function (btn) {
      btn.addEventListener("click", function () {
        vsteps.forEach(function (b) { b.classList.remove("on"); b.setAttribute("aria-selected", "false"); });
        btn.classList.add("on");
        btn.setAttribute("aria-selected", "true");
        var d = vData[parseInt(btn.getAttribute("data-v"), 10)];
        vpC.textContent = d.c; vpN.textContent = d.n; vpD.textContent = d.d;
        vpR.textContent = d.req; vpS.textContent = d.show; vpCy.textContent = d.cy;
      });
    });
  }

  /* trust: rating bars */
  var chart = document.getElementById("dimChart");
  if (chart) {
    var fillBars = function () {
      [].slice.call(chart.querySelectorAll(".dim-bar i")).forEach(function (bar) {
        bar.style.width = bar.getAttribute("data-w") + "%";
      });
    };
    if (reduced || !("IntersectionObserver" in window)) {
      fillBars();
    } else {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { fillBars(); io2.disconnect(); } });
      }, { threshold: 0.3 });
      io2.observe(chart);
    }
  }

  /* join: pre-registration form (mailto) */
  var CONTACT = "founding@proppeer.kr"; /* TODO: 실제 접수 이메일로 교체하세요 */
  var form = document.getElementById("joinForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var name = form.name.value.trim();
      var role = form.role.value;
      var org = form.org.value.trim();
      var email = form.email.value.trim();
      var msg = form.msg.value.trim();
      var subject = "[프롭피어 가입 신청] " + name;
      var body = "이름: " + name + "\n역할군: " + role + "\n소속·직함: " + (org || "-") + "\n이메일: " + email + "\n\n전하실 말씀:\n" + (msg || "-") + "\n\n— PROPPEER 가입 신청 페이지에서 작성되었습니다.";
      window.location.href = "mailto:" + CONTACT + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }

  /* footer year */
  var yy = document.getElementById("yy");
  if (yy) yy.textContent = new Date().getFullYear();
})();
