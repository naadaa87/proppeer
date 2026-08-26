/* =========================================================
   PROPPEER · experts.js
   기능명세서 EX-01 전문가 목록·필터 / EX-03 비교함
   experts.json 하나만 바꾸면 화면이 그대로 갱신됩니다.
   ========================================================= */
(function () {
  "use strict";

  var store = window.ppStore || { get: function () { return null; }, set: function () {}, del: function () {} };
  var track = window.ppTrack || function () {};
  var CMP_KEY = "pp_compare_v1";
  var MAX_CMP = 3;

  var root = document.getElementById("ex-root");
  if (!root) return;

  var DATA = null;
  var CMP = [];
  try {
    CMP = JSON.parse(store.get(CMP_KEY) || "[]");
  } catch (e) {
    CMP = [];
  }

  var F = { q: "", fields: [], regions: [], assets: [], methods: [], verifiedOnly: false, sort: "fit", label: "" };

  /* ---------- 유틸 ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }

  var ICO = {
    search: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    filter: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
    check: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    eye: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/></svg>'
  };

  /* ---------- 평점 계산 (관계별 분리, 합산하지 않음) ---------- */
  function rateByRelation(expert) {
    var map = {};
    (expert.reviews || []).forEach(function (r) {
      if (!map[r.rel]) map[r.rel] = { sum: 0, n: 0, count: 0 };
      var vals = Object.keys(r.items || {}).map(function (k) { return r.items[k]; });
      if (vals.length) {
        map[r.rel].sum += vals.reduce(function (a, b) { return a + b; }, 0);
        map[r.rel].n += vals.length;
      }
      map[r.rel].count += 1;
    });
    Object.keys(map).forEach(function (k) {
      map[k].avg = map[k].n ? Math.round((map[k].sum / map[k].n) * 10) / 10 : null;
    });
    return map;
  }
  window.ppRateByRelation = rateByRelation;

  function clientRate(expert) {
    var m = rateByRelation(expert);
    return m["상담고객"] || null;
  }

  /* ---------- 검색·필터 ---------- */
  function hasAny(arr, sel) {
    if (!sel.length) return true;
    return sel.some(function (v) { return (arr || []).indexOf(v) > -1; });
  }

  function matchRegion(e) {
    if (!F.regions.length) return true;
    // '전국' 활동 전문가는 어느 지역 조건에도 해당합니다
    if ((e.regions || []).indexOf("전국") > -1) return true;
    return hasAny(e.regions, F.regions);
  }

  function matches(e) {
    if (F.verifiedOnly && e.verification.state !== "검증 완료") return false;
    if (!hasAny(e.fields, F.fields)) return false;
    if (!matchRegion(e)) return false;
    if (!hasAny(e.assets, F.assets)) return false;
    if (!hasAny(e.methods, F.methods)) return false;

    var q = F.q.trim().toLowerCase();
    if (!q) return true;
    var hay = [
      e.name, e.title, e.org, e.intro,
      (e.fields || []).join(" "),
      (e.regions || []).join(" "),
      (e.assets || []).join(" "),
      (e.problems || []).map(function (p) { return DATA.taxonomy.problems[p] || ""; }).join(" "),
      (e.projects || []).map(function (p) { return p.n + " " + p.r; }).join(" ")
    ].join(" ").toLowerCase();
    return q.split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
  }

  /* 적합도: 검증 근거와 최근 활동이 없으면 상위 추천을 제한합니다 (명세서 16.4) */
  function fitScore(e) {
    var s = 0;
    if (e.verification.state === "검증 완료") s += 40;
    else if (e.verification.state === "부분 검증") s += 20;
    else if (e.verification.state === "검토 중") s += 5;
    s += Math.min(e.stats.projectsVerified, 10) * 3;
    s += Math.min(e.stats.keepRate || 0, 100) * 0.15;
    s += Math.max(0, 24 - (e.stats.responseHours || 24)) * 0.4;
    var c = clientRate(e);
    if (c && c.avg) s += c.avg * 2;
    return s;
  }

  function sortList(list) {
    var by = F.sort;
    return list.slice().sort(function (a, b) {
      if (by === "verified") return b.stats.projectsVerified - a.stats.projectsVerified;
      if (by === "response") return (a.stats.responseHours || 99) - (b.stats.responseHours || 99);
      if (by === "reviews") return (b.reviews || []).length - (a.reviews || []).length;
      if (by === "career") return (b.career || 0) - (a.career || 0);
      return fitScore(b) - fitScore(a);
    });
  }

  /* ---------- 렌더: 필터 ---------- */
  function countFor(key, val) {
    return DATA.experts.filter(function (e) { return (e[key] || []).indexOf(val) > -1; }).length;
  }

  function fgroup(title, key, values) {
    return (
      '<div class="fgroup"><p class="fgroup__t">' + esc(title) + "</p>" +
      values.map(function (v) {
        var n = countFor(key, v);
        return (
          '<label class="fopt"><input type="checkbox" data-f="' + key + '" value="' + esc(v) + '"' +
          (F[key].indexOf(v) > -1 ? " checked" : "") + "><span>" + esc(v) +
          '</span><span class="cnt num">' + n + "</span></label>"
        );
      }).join("") + "</div>"
    );
  }

  function renderFilters() {
    var t = DATA.taxonomy;
    return (
      '<button class="filters__toggle" type="button" data-ftoggle>' + ICO.filter + " 필터 열기</button>" +
      '<aside class="filters" data-filters data-open="false">' +
      '<div class="filters__hd"><b>필터</b><button type="button" class="filters__reset" data-reset>초기화</button></div>' +
      '<div class="filters__body">' +
      fgroup("전문 분야", "fields", t.fields) +
      fgroup("지역", "regions", t.regions) +
      fgroup("자산 유형", "assets", t.assets) +
      fgroup("상담 방식", "methods", t.methods) +
      '<div class="fgroup"><p class="fgroup__t">검증 상태</p>' +
      '<label class="fopt"><input type="checkbox" data-vonly' + (F.verifiedOnly ? " checked" : "") +
      "><span>검증 완료만 보기</span></label></div>" +
      "</div></aside>"
    );
  }

  /* ---------- 렌더: 카드 ---------- */
  function vbadge(state) {
    var cls = state === "검증 완료" ? "ok" : state === "부분 검증" ? "part" : state === "검토 중" ? "wait" : "self";
    var ico = state === "검증 완료" ? ICO.check + " " : "";
    return '<span class="vbadge vbadge--' + cls + '">' + ico + esc(state) + "</span>";
  }

  function why(e) {
    var bits = [];
    if (e.stats.projectsVerified > 0) bits.push("검증된 프로젝트 " + e.stats.projectsVerified + "건");
    if (e.stats.responseHours) bits.push("평균 " + e.stats.responseHours + "시간 내 응답");
    if (e.career) bits.push(e.career + "년 경력");
    var lack = [];
    if (e.stats.projectsVerified === 0) lack.push("프로젝트 증빙이 아직 확인되지 않았습니다");
    if (!(e.reviews || []).length) lack.push("아직 등록된 후기가 없습니다");
    return (
      '<p class="ex-why"><b>추천 이유</b> · ' + esc(bits.join(" · ")) +
      (lack.length ? '<br><span style="color:var(--pp-text-3)">확인되지 않은 정보 · ' + esc(lack.join(" / ")) + "</span>" : "") +
      "</p>"
    );
  }

  function card(e) {
    var c = clientRate(e);
    var picked = CMP.indexOf(e.slug) > -1;
    var probs = (e.problems || []).map(function (p) { return DATA.taxonomy.problems[p]; }).filter(Boolean);

    return (
      '<article class="ex-card">' +
      '<div class="ex-card__top">' +
      '<span class="ex-av" aria-hidden="true">' + esc(e.name.charAt(0)) + "</span>" +
      '<div class="ex-card__id">' +
      '<h3 class="ex-name"><a href="/experts/' + esc(e.slug) + '">' + esc(e.name) + "</a>" + vbadge(e.verification.state) + "</h3>" +
      '<p class="ex-role">' + esc(e.title) + " · " + esc(e.org) + " · " + esc((e.regions || []).join(", ")) + "</p>" +
      "</div></div>" +

      '<div class="ex-fit">' +
      probs.map(function (p) { return "<b>" + esc(p) + "</b>"; }).join("") +
      (e.fields || []).map(function (f) { return "<i>" + esc(f) + "</i>"; }).join("") +
      "</div>" +

      why(e) +

      '<div class="ex-stats">' +
      '<div class="ex-stat"><b class="num">' + e.stats.projectsVerified + "</b><span>검증 프로젝트</span></div>" +
      '<div class="ex-stat"><b class="num">' + e.stats.keepRate + "%</b><span>예약 준수율</span></div>" +
      '<div class="ex-stat"><b class="num">' + e.stats.responseHours + "시간</b><span>평균 응답</span></div>" +
      (c && c.avg
        ? '<div class="ex-stat"><span class="ex-rate"><em class="num">' + c.avg.toFixed(1) + '</em><i>/ 5</i></span><span>상담고객 평점 (' + c.count + ")</span></div>"
        : '<div class="ex-stat ex-stat--none"><b>—</b><span>상담고객 평점 없음</span></div>') +
      "</div>" +

      '<div class="ex-card__foot">' +
      '<a class="btn btn--primary btn--sm" href="/connect?e=' + esc(e.slug) + '" data-track="connect_from_list">상담 요청하기</a>' +
      '<a class="btn btn--ghost btn--sm" href="/experts/' + esc(e.slug) + '">프로필 보기</a>' +
      '<button type="button" class="btn btn--ghost btn--sm" data-cmp="' + esc(e.slug) + '">' +
      (picked ? "비교함에서 빼기" : "비교함 담기") + "</button>" +
      (e.interests && e.interests.length
        ? '<span class="ex-interest" title="' + esc(e.interests[0].d) + '">' + ICO.eye + " " + esc(e.interests[0].t) + "</span>"
        : "") +
      "</div></article>"
    );
  }

  /* ---------- 렌더: 전체 ---------- */
  function pickedBar() {
    var chosen = [];
    if (F.label) chosen.push(F.label);
    else {
      if (F.fields.length) chosen.push(F.fields.join(", "));
      if (F.regions.length) chosen.push(F.regions.join(", "));
    }
    if (!chosen.length) return "";
    return (
      '<div class="picked"><span class="picked__k">선택한 조건</span>' +
      '<span class="picked__v">' + esc(chosen.join(" · ")) + "</span>" +
      '<button type="button" class="btn btn--ghost btn--sm picked__x" data-rebrowse>다시 고르기</button></div>'
    );
  }

  function render() {
    var list = sortList(DATA.experts.filter(matches));

    root.innerHTML =
      pickedBar() +
      '<div class="ex-layout">' +
      renderFilters() +
      '<div><div class="ex-search">' + ICO.search +
      '<input type="search" id="ex-q" placeholder="분야, 지역, 문제로 검색 — 예: 공실 용도변경" value="' + esc(F.q) + '" aria-label="전문가 검색">' +
      "</div>" +
      '<div class="ex-keys">' +
      ["공실 활용", "용도변경", "원상복구", "매입 검토", "견적 검토", "세금"].map(function (k) {
        return '<button type="button" class="ex-key" data-key="' + esc(k) + '">' + esc(k) + "</button>";
      }).join("") + "</div>" +

      '<div class="ex-bar" style="margin-top:22px">' +
      '<p class="ex-count">전체 <b class="num">' + list.length + "</b>명" +
      (F.q || F.fields.length || F.regions.length || F.assets.length || F.methods.length || F.verifiedOnly
        ? ' <span style="color:var(--pp-text-3)">· 조건 적용됨</span>' : "") + "</p>" +
      '<select class="ex-sort" id="ex-sort" aria-label="정렬 기준">' +
      [["fit", "추천순 (적합도)"], ["verified", "검증 프로젝트순"], ["response", "응답 빠른순"], ["reviews", "후기 많은순"], ["career", "경력순"]]
        .map(function (o) { return '<option value="' + o[0] + '"' + (F.sort === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; })
        .join("") + "</select></div>" +

      (list.length
        ? '<div class="ex-grid">' + list.map(card).join("") + "</div>"
        : '<div class="ex-empty"><h3>조건에 맞는 전문가가 없습니다</h3>' +
          "<p>지역이나 상담 방식을 넓히면 결과가 늘어납니다. 조건을 그대로 두고 싶으시면 운영팀에 추천을 요청해 주세요.</p>" +
          '<div class="btn-row" style="justify-content:center;margin-top:20px">' +
          '<button type="button" class="btn btn--ghost" data-reset>조건 초기화</button>' +
          '<a class="btn btn--primary" href="/connect">운영팀에 추천 요청하기</a></div></div>') +

      "</div></div>";

    bind();
    renderTray();
  }

  /* ---------- 이벤트 ---------- */
  var qTimer = null;
  function bind() {
    var q = $("#ex-q");
    if (q) {
      q.addEventListener("input", function () {
        window.clearTimeout(qTimer);
        var pos = q.selectionStart;
        qTimer = window.setTimeout(function () {
          F.q = q.value;
          render();
          var nq = $("#ex-q");
          if (nq) { nq.focus(); try { nq.setSelectionRange(pos, pos); } catch (e) {} }
          track("expert_search", { q: F.q });
        }, 260);
      });
    }

    $$("[data-key]").forEach(function (b) {
      b.addEventListener("click", function () {
        F.q = b.getAttribute("data-key");
        render();
        track("expert_search", { q: F.q, via: "keyword" });
      });
    });

    $$("[data-f]").forEach(function (c) {
      c.addEventListener("change", function () {
        var k = c.getAttribute("data-f"), v = c.value;
        var i = F[k].indexOf(v);
        if (c.checked && i < 0) F[k].push(v);
        if (!c.checked && i > -1) F[k].splice(i, 1);
        render();
        track("expert_filter", { key: k, value: v });
      });
    });

    var vo = $("[data-vonly]");
    if (vo) vo.addEventListener("change", function () { F.verifiedOnly = vo.checked; render(); });

    var s = $("#ex-sort");
    if (s) s.addEventListener("change", function () { F.sort = s.value; render(); track("expert_sort", { by: F.sort }); });

    $$("[data-reset]").forEach(function (b) {
      b.addEventListener("click", function () {
        F = { q: "", fields: [], regions: [], assets: [], methods: [], verifiedOnly: false, sort: F.sort };
        render();
      });
    });

    var ft = $("[data-ftoggle]"), fl = $("[data-filters]");
    if (ft && fl) {
      ft.addEventListener("click", function () {
        var on = fl.getAttribute("data-open") === "true";
        fl.setAttribute("data-open", String(!on));
        ft.innerHTML = ICO.filter + (on ? " 필터 열기" : " 필터 닫기");
      });
    }

    $$("[data-cmp]").forEach(function (b) {
      b.addEventListener("click", function () { toggleCmp(b.getAttribute("data-cmp")); });
    });

    var rb = $("[data-rebrowse]");
    if (rb) {
      rb.addEventListener("click", function () {
        F = { q: "", fields: [], regions: [], assets: [], methods: [], verifiedOnly: false, sort: F.sort, label: "" };
        if (window.ppBrowsePanel) {
          window.ppBrowsePanel.hidden = false;
          window.ppBrowsePanel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        render();
      });
    }
  }

  /* ---------- 비교함 ---------- */
  function toggleCmp(slug) {
    var i = CMP.indexOf(slug);
    if (i > -1) CMP.splice(i, 1);
    else {
      if (CMP.length >= MAX_CMP) {
        alert("비교함에는 최대 " + MAX_CMP + "명까지 담을 수 있습니다. 한 명을 빼고 다시 담아주세요.");
        return;
      }
      CMP.push(slug);
      track("expert_compare_add", { slug: slug });
    }
    store.set(CMP_KEY, JSON.stringify(CMP));
    render();
  }

  function byslug(s) {
    var f = null;
    DATA.experts.forEach(function (e) { if (e.slug === s) f = e; });
    return f;
  }

  function renderTray() {
    var tray = $("#ex-tray");
    if (!tray) return;
    var items = CMP.map(byslug).filter(Boolean);
    tray.setAttribute("data-show", items.length ? "true" : "false");
    tray.innerHTML =
      '<div class="tray__list">' +
      items.map(function (e) {
        return '<span class="tray__chip">' + esc(e.name) +
          '<button type="button" class="tray__x" data-untray="' + esc(e.slug) + '" aria-label="' + esc(e.name) + ' 비교함에서 빼기">×</button></span>';
      }).join("") + "</div>" +
      '<button type="button" class="btn btn--primary btn--sm" data-opencmp' + (items.length < 2 ? " disabled" : "") + ">비교하기 (" + items.length + "/3)</button>";

    $$("[data-untray]", tray).forEach(function (b) {
      b.addEventListener("click", function () { toggleCmp(b.getAttribute("data-untray")); });
    });
    var oc = $("[data-opencmp]", tray);
    if (oc) oc.addEventListener("click", openCompare);
  }

  function openCompare() {
    var items = CMP.map(byslug).filter(Boolean);
    if (items.length < 2) return;
    var m = $("#ex-modal");
    var rows = [
      ["소속 · 직함", function (e) { return esc(e.title) + "<br>" + esc(e.org); }],
      ["검증 상태", function (e) { return vbadge(e.verification.state) + '<br><span style="font-size:11px;color:var(--pp-text-3)">최근 확인 ' + esc(e.verification.lastVerified) + "</span>"; }],
      ["전문 분야", function (e) { return esc((e.fields || []).join(", ")); }],
      ["대응 문제", function (e) { return esc((e.problems || []).map(function (p) { return DATA.taxonomy.problems[p]; }).join(", ")); }],
      ["지역", function (e) { return esc((e.regions || []).join(", ")); }],
      ["상담 방식", function (e) { return esc((e.methods || []).join(", ")); }],
      ["경력", function (e) { return e.career + "년"; }],
      ["검증 프로젝트", function (e) { return e.stats.projectsVerified + "건"; }],
      ["예약 준수율", function (e) { return e.stats.keepRate + "%"; }],
      ["평균 응답", function (e) { return e.stats.responseHours + "시간"; }],
      ["관계별 평점", function (e) {
        var m2 = rateByRelation(e);
        var ks = Object.keys(m2);
        if (!ks.length) return '<span style="color:var(--pp-text-3)">등록된 후기 없음</span>';
        return ks.map(function (k) { return esc(k) + " <b>" + (m2[k].avg ? m2[k].avg.toFixed(1) : "—") + "</b> (" + m2[k].count + ")"; }).join("<br>");
      }],
      ["이해관계", function (e) { return (e.interests || []).map(function (i) { return esc(i.t); }).join("<br>") || "없음"; }],
      ["", function (e) { return '<a class="btn btn--primary btn--sm" href="/connect?e=' + esc(e.slug) + '">상담 요청</a>'; }]
    ];

    m.querySelector(".modal__body").innerHTML =
      '<table class="tbl"><thead><tr><th scope="col">항목</th>' +
      items.map(function (e) { return '<th scope="col"><a href="/experts/' + esc(e.slug) + '" style="color:#fff">' + esc(e.name) + "</a></th>"; }).join("") +
      "</tr></thead><tbody>" +
      rows.map(function (r) {
        return "<tr><th scope=\"row\">" + r[0] + "</th>" + items.map(function (e) { return "<td>" + r[1](e) + "</td>"; }).join("") + "</tr>";
      }).join("") +
      "</tbody></table>";

    m.setAttribute("data-open", "true");
    document.body.style.overflow = "hidden";
    track("expert_compare_open", { n: items.length });
  }

  function closeCompare() {
    var m = $("#ex-modal");
    if (!m) return;
    m.setAttribute("data-open", "false");
    document.body.style.overflow = "";
  }

  /* ---------- 시작 ---------- */
  function boot() {
    var m = $("#ex-modal");
    if (m) {
      m.addEventListener("click", function (e) {
        if (e.target === m || e.target.closest("[data-closecmp]")) closeCompare();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeCompare();
      });
    }

    // 탐색 패널이 조건을 넘겨줄 때 쓰는 통로
    window.ppApplyBrowse = function (params, label) {
      F = {
        q: "",
        fields: params.field ? String(params.field).split("|").filter(Boolean) : [],
        regions: params.region ? [params.region] : [],
        assets: [],
        methods: [],
        verifiedOnly: false,
        sort: F.sort,
        label: label || ""
      };
      if (window.ppBrowsePanel) window.ppBrowsePanel.hidden = true;
      render();
      var top = root.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    };

    // URL 파라미터로 초기 조건 설정 (진단 결과·외부 링크에서 넘어오는 경로)
    var qs = new URLSearchParams(window.location.search);
    if (qs.get("q")) F.q = qs.get("q");
    if (qs.get("field")) F.fields = String(qs.get("field")).split("|").filter(Boolean);
    if (qs.get("region")) F.regions = [qs.get("region")];
    if (qs.get("label")) F.label = qs.get("label");

    root.innerHTML = '<p style="padding:60px 0;text-align:center;color:var(--pp-text-3)">전문가 목록을 불러오는 중입니다…</p>';

    fetch("/assets/data/experts.json", { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("load fail");
        return r.json();
      })
      .then(function (d) {
        DATA = d;
        window.ppExperts = d;
        if (!d.experts || !d.experts.length) {
          root.innerHTML =
            '<div class="ex-empty"><h3>검증된 전문가를 등록하는 중입니다</h3>' +
            "<p>지금은 분야별 초기 파트너를 모으고 있습니다. 진단을 마치고 연락처를 남겨주시면 담당 분야가 준비되는 대로 먼저 안내드립니다.</p>" +
            '<div class="btn-row" style="justify-content:center;margin-top:20px">' +
            '<a class="btn btn--primary" href="/diagnosis">3분 진단 시작하기</a>' +
            '<a class="btn btn--ghost" href="/pro">전문가로 등록하기</a></div></div>';
          return;
        }
        render();
      })
      .catch(function () {
        root.innerHTML =
          '<div class="ex-empty"><h3>목록을 불러오지 못했습니다</h3>' +
          "<p>잠시 후 새로고침해 주세요. 계속 같은 화면이 보이면 운영팀에 알려주시면 확인하겠습니다.</p>" +
          '<div class="btn-row" style="justify-content:center;margin-top:20px">' +
          '<button type="button" class="btn btn--primary" onclick="location.reload()">새로고침</button>' +
          '<a class="btn btn--ghost" href="#" data-email>운영팀에 알리기</a></div></div>';
      });
  }

  boot();
})();
