/* =========================================================
   PROPPEER · connect.js
   전문가 연결 — 상담 요청 폼
   ?e={slug} 로 들어오면 해당 전문가 정보를 불러와 채웁니다.
   정식 오픈 전에는 결제 없이 요청 접수만 진행합니다.
   ========================================================= */
(function () {
  "use strict";

  var track = window.ppTrack || function () {};
  var box = document.getElementById("cn-expert");
  var form = document.querySelector("form[data-pp-form='consult-request']");
  if (!form) return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var qs = new URLSearchParams(window.location.search);
  var slug = qs.get("e") || "";
  var product = qs.get("p") || "";

  /* 진단 결과가 저장되어 있으면 요청서에 함께 붙입니다 */
  function attachDiagnosis() {
    var store = window.ppStore;
    if (!store) return;
    var raw = store.get("pp_diagnosis_v1");
    if (!raw) return;
    try {
      var o = JSON.parse(raw);
      var a = o && o.a;
      if (!a || !a.problem) return;

      var summary = [
        "문제: " + (a.problem || ""),
        "자산: " + (a.asset || ""),
        "입장: " + (a.stance || ""),
        "세부: " + (a.details || []).join(", "),
        "목표: " + (a.goal || ""),
        "시점: " + (a.timing || ""),
        "지역: " + (a.region || ""),
        "보유자료: " + (a.docs || []).join(", "),
        a.memo ? "추가: " + a.memo : ""
      ].filter(Boolean).join(" / ");

      var hid = form.querySelector("input[name=진단내용]");
      if (hid) hid.value = summary;

      var note = document.getElementById("cn-diag");
      if (note) {
        note.hidden = false;
        note.innerHTML =
          '<div class="note note--green"><div class="note__t">저장된 진단 내용을 함께 보냅니다</div>' +
          "<p>" + esc(summary) + "</p>" +
          '<p style="margin-top:8px"><label class="agree" style="margin:0"><input type="checkbox" id="cn-diag-off"> <span>진단 내용은 빼고 보내기</span></label></p></div>';

        var off = document.getElementById("cn-diag-off");
        off.addEventListener("change", function () {
          if (hid) hid.value = off.checked ? "" : summary;
        });
      }
    } catch (e) {}
  }

  /* 전문가 정보 표시 */
  function renderExpert() {
    if (!box) return;

    if (!slug) {
      box.innerHTML =
        '<div class="cn-pick"><span class="ex-av" aria-hidden="true">?</span>' +
        '<div><p class="ex-name" style="font-size:var(--pp-fs-h3)">전문가를 지정하지 않은 요청</p>' +
        '<p class="ex-role">운영팀이 내용을 보고 조건에 맞는 전문가를 찾아 안내드립니다.</p></div>' +
        '<a class="btn btn--ghost btn--sm cn-pick__x" href="/experts">전문가 직접 고르기</a></div>';
      return;
    }

    fetch("/assets/data/experts.json", { cache: "no-cache" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var e = null;
        (d.experts || []).forEach(function (x) { if (x.slug === slug) e = x; });

        if (!e) {
          box.innerHTML =
            '<div class="cn-pick"><div><p class="ex-name" style="font-size:var(--pp-fs-h3)">전문가를 찾지 못했습니다</p>' +
            '<p class="ex-role">주소가 바뀌었을 수 있습니다. 목록에서 다시 선택해주세요.</p></div>' +
            '<a class="btn btn--ghost btn--sm cn-pick__x" href="/experts">전문가 목록으로</a></div>';
          return;
        }

        var st = e.verification.state;
        var cls = st === "검증 완료" ? "ok" : st === "부분 검증" ? "part" : st === "검토 중" ? "wait" : "self";

        box.innerHTML =
          '<div class="cn-pick">' +
          '<span class="ex-av" aria-hidden="true">' + esc(e.name.charAt(0)) + "</span>" +
          "<div><p class=\"ex-name\" style=\"font-size:var(--pp-fs-h3)\">" + esc(e.name) +
          '<span class="vbadge vbadge--' + cls + '">' + esc(st) + "</span></p>" +
          '<p class="ex-role">' + esc(e.title) + " · " + esc(e.org) + " · " + esc((e.methods || []).join(", ")) + " 상담 가능</p></div>" +
          '<a class="btn btn--ghost btn--sm cn-pick__x" href="/experts">다른 전문가 보기</a></div>' +
          ((e.interests && e.interests.length)
            ? '<div class="note note--gold" style="margin-bottom:24px"><div class="note__t">상담 전 알려드립니다</div><p>' +
              esc(e.interests[0].t) + " — " + esc(e.interests[0].d) + "</p></div>"
            : "");

        var hid = form.querySelector("input[name=전문가]");
        if (hid) hid.value = e.name + " (" + e.slug + ")";

        // 상담 방식 선택지를 이 전문가가 가능한 것만 남깁니다
        var wrap = document.getElementById("cn-methods");
        if (wrap && e.methods && e.methods.length) {
          wrap.innerHTML = e.methods.map(function (m, i) {
            return '<label class="chip"><input type="radio" name="상담방식" value="' + esc(m) + '"' +
              (i === 0 ? " checked" : "") + "><span>" + esc(m) + "</span></label>";
          }).join("");
        }

        track("connect_view", { expert: e.slug });
      })
      .catch(function () {
        box.innerHTML =
          '<div class="cn-pick"><div><p class="ex-name" style="font-size:var(--pp-fs-h3)">전문가 정보를 불러오지 못했습니다</p>' +
          '<p class="ex-role">요청은 그대로 보내실 수 있고, 운영팀이 확인해 연결해 드립니다.</p></div></div>';
      });
  }

  if (product) {
    var ph = form.querySelector("select[name=상담상품]");
    if (ph) ph.value = product;
  }

  renderExpert();
  attachDiagnosis();
})();
