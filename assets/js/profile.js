/* =========================================================
   PROPPEER · profile.js
   기능명세서 EX-02 전문가 프로필 / RV-01 후기·레퍼런스
   - 후기는 관계별로 분리해 보여주고 합산하지 않습니다
   - 후기 작성은 실제 관계가 확인된 경우에만 가능합니다
   ========================================================= */
(function () {
  "use strict";

  var track = window.ppTrack || function () {};
  var CFG = window.PROPPEER || {};

  /* ---------- 후기 관계 탭 ---------- */
  var tabs = document.querySelectorAll("[data-rvtab]");
  var groups = document.querySelectorAll("[data-rvgroup]");

  if (tabs.length) {
    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        var rel = t.getAttribute("data-rvtab");
        tabs.forEach(function (x) { x.setAttribute("aria-selected", String(x === t)); });
        groups.forEach(function (g) {
          var on = rel === "all" || g.getAttribute("data-rvgroup") === rel;
          g.hidden = !on;
        });
        track("review_tab", { relation: rel });
      });
    });
  }

  /* ---------- 후기 작성 게이트 ---------- */
  /* 결제된 상담 또는 확인된 프로젝트 참여가 있어야 작성 권한이 생깁니다.
     지금은 운영팀이 상담 완료 후 발급하는 확인코드로 관계를 확인합니다. */
  var gate = document.querySelector("[data-gate]");
  if (gate) {
    var form = gate.querySelector("form");
    var input = gate.querySelector("input[name=코드]");
    var msg = gate.querySelector(".gate__msg");
    var expert = gate.getAttribute("data-expert") || "";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var code = (input.value || "").trim();

      if (!code) {
        msg.setAttribute("data-t", "err");
        msg.textContent = "상담 완료 후 받으신 확인코드를 입력해주세요.";
        input.focus();
        return;
      }

      // 형식 확인 (PP-XXXX-XXXX). 실제 유효성은 운영팀이 대조합니다.
      if (!/^PP-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/.test(code)) {
        msg.setAttribute("data-t", "err");
        msg.textContent = "코드 형식이 맞지 않습니다. PP-0000-0000 형태로 입력해주세요.";
        input.focus();
        return;
      }

      var btn = form.querySelector("[type=submit]");
      var label = btn.textContent;
      btn.disabled = true;
      btn.textContent = "확인 중…";

      var payload = {
        _form: "review-request",
        _page: window.location.pathname,
        _at: new Date().toISOString(),
        전문가: expert,
        확인코드: code
      };

      function ok() {
        btn.disabled = false;
        btn.textContent = label;
        msg.setAttribute("data-t", "ok");
        msg.textContent =
          "확인 요청을 접수했습니다. 운영팀이 상담 기록과 대조한 뒤 후기 작성 링크를 보내드립니다.";
        form.reset();
        track("review_gate_submit", { expert: expert });
      }
      function fail() {
        btn.disabled = false;
        btn.textContent = label;
        msg.setAttribute("data-t", "err");
        msg.textContent = "요청이 전송되지 않았습니다. 잠시 후 다시 시도하거나 이메일로 알려주세요.";
      }

      var ep = (CFG.forms && CFG.forms.endpoint) || "";
      if (ep) {
        fetch(ep, {
          method: (CFG.forms && CFG.forms.method) || "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload)
        })
          .then(function (r) { if (!r.ok) throw new Error("bad"); ok(); })
          .catch(fail);
      } else {
        var to = (CFG.channels && CFG.channels.email) || "";
        if (!to) return fail();
        var body = Object.keys(payload).map(function (k) { return k + ": " + payload[k]; }).join("\n");
        window.location.href =
          "mailto:" + to + "?subject=" + encodeURIComponent("[프롭피어] 후기 작성 확인 요청") +
          "&body=" + encodeURIComponent(body);
        ok();
      }
    });
  }

  /* ---------- 비교함 담기 (프로필에서) ---------- */
  var cmpBtn = document.querySelector("[data-pfcmp]");
  if (cmpBtn) {
    var store = window.ppStore || { get: function () { return null; }, set: function () {} };
    var KEY = "pp_compare_v1";
    var slug = cmpBtn.getAttribute("data-pfcmp");

    function readCmp() {
      try { return JSON.parse(store.get(KEY) || "[]"); } catch (e) { return []; }
    }
    function paint() {
      cmpBtn.textContent = readCmp().indexOf(slug) > -1 ? "비교함에서 빼기" : "비교함 담기";
    }
    paint();

    cmpBtn.addEventListener("click", function () {
      var list = readCmp();
      var i = list.indexOf(slug);
      if (i > -1) list.splice(i, 1);
      else {
        if (list.length >= 3) {
          alert("비교함에는 최대 3명까지 담을 수 있습니다.");
          return;
        }
        list.push(slug);
        track("expert_compare_add", { slug: slug, via: "profile" });
      }
      store.set(KEY, JSON.stringify(list));
      paint();
    });
  }
})();
