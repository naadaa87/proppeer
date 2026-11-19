/* =========================================================
   PROPPEER · main.js
   공통 동작: 모바일 메뉴 / 스크롤 리빌 / 설정 반영 /
             폼 접수 / 분석 이벤트 (제작지시서 22.2)
   ========================================================= */
(function () {
  "use strict";

  var CFG = window.PROPPEER || {};

  /* ---------- 안전한 저장소 (차단 환경에서도 죽지 않게) ---------- */
  var store = {
    get: function (k) {
      try {
        return window.localStorage.getItem(k);
      } catch (e) {
        return null;
      }
    },
    set: function (k, v) {
      try {
        window.localStorage.setItem(k, v);
        return true;
      } catch (e) {
        return false;
      }
    },
    del: function (k) {
      try {
        window.localStorage.removeItem(k);
      } catch (e) {}
    }
  };
  window.ppStore = store;

  /* ---------- 분석 이벤트 ---------- */
  function track(name, params) {
    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", name, params || {});
      }
      if (window.location.hostname === "localhost") {
        console.log("[track]", name, params || {});
      }
    } catch (e) {}
  }
  window.ppTrack = track;

  /* ---------- 모바일 메뉴 ---------- */
  function initNav() {
    var burger = document.querySelector("[data-burger]");
    var drawer = document.querySelector("[data-drawer]");
    if (!burger || !drawer) return;

    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      drawer.setAttribute("data-open", String(!open));
    });

    drawer.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        burger.setAttribute("aria-expanded", "false");
        drawer.setAttribute("data-open", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
        burger.setAttribute("aria-expanded", "false");
        drawer.setAttribute("data-open", "false");
        burger.focus();
      }
    });
  }

  /* ---------- 스크롤 리빌 ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 60 + "ms";
      io.observe(el);
    });
  }

  /* ---------- 설정값 화면 반영 ---------- */
  function initConfig() {
    // 이메일
    var email = (CFG.channels && CFG.channels.email) || "";
    document.querySelectorAll("[data-email]").forEach(function (el) {
      if (!email) {
        el.remove();
        return;
      }
      el.setAttribute("href", "mailto:" + email);
      if (el.hasAttribute("data-email-text")) el.textContent = email;
    });

    // 전화
    var tel = (CFG.channels && CFG.channels.tel) || "";
    document.querySelectorAll("[data-tel]").forEach(function (el) {
      if (!tel) {
        el.remove();
        return;
      }
      el.setAttribute("href", "tel:" + tel.replace(/[^0-9+]/g, ""));
      el.textContent = tel;
    });

    // 앱스토어 링크 (미출시 시 숨김)
    document.querySelectorAll("[data-app]").forEach(function (el) {
      var key = el.getAttribute("data-app");
      var url = (CFG.apps && CFG.apps[key]) || "";
      if (!url) el.remove();
      else el.setAttribute("href", url);
    });

    // 운영 문구 치환
    document.querySelectorAll("[data-ops]").forEach(function (el) {
      var key = el.getAttribute("data-ops");
      var val = CFG.ops && CFG.ops[key];
      if (val !== undefined && val !== null && val !== "") el.textContent = val;
    });

    // 올해 연도
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------- 분석 스크립트 로드 ---------- */
  function initAnalytics() {
    var a = CFG.analytics || {};
    if (a.ga4) {
      var s = document.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + a.ga4;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", a.ga4);
    }
    if (a.cfBeacon) {
      var b = document.createElement("script");
      b.defer = true;
      b.src = "https://static.cloudflareinsights.com/beacon.min.js";
      b.setAttribute("data-cf-beacon", '{"token":"' + a.cfBeacon + '"}');
      document.head.appendChild(b);
    }
  }

  /* ---------- 폼 접수 ---------- */
  function fieldWrap(input) {
    return input.closest(".field") || input.closest(".agree");
  }

  function markError(input, on) {
    var w = fieldWrap(input);
    if (!w) return;
    w.classList.toggle("field--err", !!on);
  }

  function validate(form) {
    var ok = true;
    var first = null;
    form.querySelectorAll("[required]").forEach(function (el) {
      var bad = false;
      if (el.type === "checkbox") bad = !el.checked;
      else bad = !String(el.value || "").trim();
      if (!bad && el.type === "email") {
        bad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim());
      }
      markError(el, bad);
      if (bad) {
        ok = false;
        if (!first) first = el;
      }
    });
    if (first) first.focus();
    return ok;
  }

  function collect(form) {
    var data = {};
    var fd = new FormData(form);
    fd.forEach(function (v, k) {
      if (data[k] === undefined) data[k] = v;
      else if (Array.isArray(data[k])) data[k].push(v);
      else data[k] = [data[k], v];
    });
    return data;
  }

  function toText(data) {
    return Object.keys(data)
      .map(function (k) {
        var v = Array.isArray(data[k]) ? data[k].join(", ") : data[k];
        return k + ": " + v;
      })
      .join("\n");
  }

  function showMsg(form, type, text) {
    var box = form.querySelector(".form__msg[role=status]") || form.querySelector(".form__msg");
    if (!box) return;
    box.setAttribute("data-type", type);
    box.textContent = text;
    box.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function initForms() {
    document.querySelectorAll("form[data-pp-form]").forEach(function (form) {
      form.setAttribute("novalidate", "novalidate");

      form.addEventListener("input", function (e) {
        if (e.target.matches("[required]")) markError(e.target, false);
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validate(form)) {
          showMsg(form, "err", "표시된 항목을 확인해주세요.");
          return;
        }

        var kind = form.getAttribute("data-pp-form");
        var data = collect(form);
        data._form = kind;
        data.kind = form.getAttribute("data-pp-subject") || kind;
        data._page = window.location.pathname;
        data._at = new Date().toISOString();

        var btn = form.querySelector("[type=submit]");
        var label = btn ? btn.textContent : "";
        if (btn) {
          btn.disabled = true;
          btn.textContent = "보내는 중…";
        }

        function done(okMsg) {
          if (btn) {
            btn.disabled = false;
            btn.textContent = label;
          }
          showMsg(form, "ok", okMsg);
          form.reset();
          track("form_submit", { form: kind });
        }

        function fail() {
          if (btn) {
            btn.disabled = false;
            btn.textContent = label;
          }
          showMsg(
            form,
            "err",
            "전송이 완료되지 않았습니다. 잠시 후 다시 시도하거나 이메일로 보내주세요."
          );
        }

        var endpoint = (CFG.forms && CFG.forms.endpoint) || "";

        if (endpoint) {
          fetch(endpoint, {
            method: (CFG.forms && CFG.forms.method) || "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(data)
          })
            .then(function (r) {
              if (!r.ok) throw new Error("bad status");
              done("접수됐습니다. 확인 후 순서대로 연락드리겠습니다.");
            })
            .catch(fail);
        } else {
          // 접수 서버 연결 전: 메일 초안으로 대체 (Phase 0)
          var to = (CFG.channels && CFG.channels.email) || "";
          var subject = "[프롭피어] " + (form.getAttribute("data-pp-subject") || kind);
          var body = toText(data);
          if (to) {
            window.location.href =
              "mailto:" +
              to +
              "?subject=" +
              encodeURIComponent(subject) +
              "&body=" +
              encodeURIComponent(body);
            done("메일 앱이 열립니다. 내용을 확인하고 보내주시면 접수됩니다.");
          } else {
            fail();
          }
        }
      });
    });
  }

  /* ---------- CTA 클릭 추적 ---------- */
  function initTracking() {
    document.addEventListener("click", function (e) {
      var el = e.target.closest("[data-track]");
      if (!el) return;
      track(el.getAttribute("data-track"), {
        label: (el.textContent || "").trim().slice(0, 40)
      });
    });
  }

  /* ---------- 시작 ---------- */
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    initConfig();
    initNav();
    initReveal();
    initForms();
    initTracking();
    initAnalytics();
  });
})();
