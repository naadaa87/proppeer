/* =========================================================
   PROPPEER · browse.js
   전문가 찾기의 '분야로 찾기 / 지역으로 찾기' 탐색 패널
   선택하면 아래 목록의 필터가 걸리고 결과로 이동합니다.
   ========================================================= */
(function () {
  "use strict";

  var track = window.ppTrack || function () {};
  var panel = document.getElementById("bw");
  if (!panel) return;

  /* ---------- 탭 ---------- */
  var tabs = panel.querySelectorAll("[data-bwtab]");
  var panes = panel.querySelectorAll("[data-bwpane]");

  function showTab(name) {
    tabs.forEach(function (t) {
      t.setAttribute("aria-selected", String(t.getAttribute("data-bwtab") === name));
    });
    panes.forEach(function (p) {
      p.hidden = p.getAttribute("data-bwpane") !== name;
    });
    track("browse_tab", { tab: name });
  }

  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      showTab(t.getAttribute("data-bwtab"));
    });
  });

  /* ---------- 분야 트리: 대분류 좌측 메뉴 ---------- */
  var navs = panel.querySelectorAll("[data-catnav]");
  var groups = panel.querySelectorAll("[data-catgroup]");

  navs.forEach(function (n) {
    n.addEventListener("click", function () {
      var id = n.getAttribute("data-catnav");
      navs.forEach(function (x) {
        x.setAttribute("aria-selected", String(x === n));
      });
      var target = panel.querySelector('[data-catgroup="' + id + '"]');
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      track("browse_category", { id: id });
    });
  });

  // 스크롤에 따라 좌측 메뉴 활성 표시
  if ("IntersectionObserver" in window && groups.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var id = en.target.getAttribute("data-catgroup");
          navs.forEach(function (x) {
            x.setAttribute("aria-selected", String(x.getAttribute("data-catnav") === id));
          });
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    groups.forEach(function (g) {
      io.observe(g);
    });
  }

  /* ---------- 선택 → 필터 적용 ---------- */
  function apply(params, label) {
    if (window.ppApplyBrowse) {
      window.ppApplyBrowse(params, label);
    } else {
      // 목록 스크립트가 아직 없으면 URL 로 넘깁니다
      var qs = new URLSearchParams(params).toString();
      window.location.href = "/experts?" + qs;
    }
  }

  // 중분류 클릭
  panel.querySelectorAll("[data-pickfield]").forEach(function (b) {
    b.addEventListener("click", function () {
      var fields = (b.getAttribute("data-pickfield") || "").split("|").filter(Boolean);
      var label = b.getAttribute("data-picklabel") || "";
      apply({ field: fields.join("|"), label: label }, label);
      track("browse_pick_field", { label: label });
    });
  });

  // 지도 / 지역 칩 클릭
  panel.querySelectorAll("[data-pickregion]").forEach(function (b) {
    b.addEventListener("click", function () {
      var r = b.getAttribute("data-pickregion");
      apply({ region: r, label: r }, r);
      track("browse_pick_region", { region: r });
    });
    // 지도 도형은 키보드 접근을 위해 Enter/Space 처리
    if (b.tagName.toLowerCase() === "g") {
      b.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          b.click();
        }
      });
    }
  });

  /* ---------- 전체 보기 ---------- */
  panel.querySelectorAll("[data-showall]").forEach(function (b) {
    b.addEventListener("click", function () {
      apply({}, "전체 전문가");
      track("browse_show_all", {});
    });
  });

  /* ---------- 지역별 전문가 수 표시 ---------- */
  fetch("/assets/data/experts.json", { cache: "no-cache" })
    .then(function (r) {
      return r.json();
    })
    .then(function (d) {
      var count = {};
      (d.experts || []).forEach(function (e) {
        (e.regions || []).forEach(function (r) {
          count[r] = (count[r] || 0) + 1;
        });
      });
      var national = count["전국"] || 0;

      panel.querySelectorAll("[data-pickregion]").forEach(function (el) {
        var r = el.getAttribute("data-pickregion");
        var n = (count[r] || 0) + (r === "전국" ? 0 : national);
        var slot = el.querySelector("[data-rcount]");
        if (slot) slot.textContent = n + "명";
        if (el.tagName.toLowerCase() === "g") {
          el.setAttribute("data-empty", n === 0 ? "true" : "false");
          var title = el.querySelector("title");
          if (title) title.textContent = r + " · 전문가 " + n + "명";
        }
      });
    })
    .catch(function () {});

  /* ---------- 시작 상태 ---------- */
  // URL 에 조건이 있으면 탐색 패널을 접고 결과부터 보여줍니다
  var qs = new URLSearchParams(window.location.search);
  if (qs.get("field") || qs.get("region") || qs.get("q")) {
    panel.hidden = true;
  }
  window.ppBrowsePanel = panel;
})();
