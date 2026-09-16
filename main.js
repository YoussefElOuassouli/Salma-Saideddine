/* ==========================================================================
   Mei-Lin Zhao — portfolio interactions
   main.js · no dependencies, no build step
   --------------------------------------------------------------------------
   1. Theme (light / dark)
   2. Site language (EN / 中文)
   3. Header, mobile navigation, active link
   4. Scroll reveal, counters, hero typing
   5. Work filters
   6. Contact form validation
   7. Small niceties (copy email, back to top, year)
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* 1. Theme ------------------------------------------------------------- */
  var STORE_THEME = "mlz-theme";
  var themeToggle = $("#themeToggle");
  var metaTheme = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme, persist) {
    root.setAttribute("data-theme", theme);
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
    var salmaPortrait = $("#salmaPortrait");

if (salmaPortrait) {
  salmaPortrait.src = theme === "dark"
    ? "salma-dark.jpeg"
    : "salma.jpeg";
}
    if (metaTheme) metaTheme.setAttribute("content", theme === "dark" ? "#121010" : "#DE5B7D");
    if (persist) { try { localStorage.setItem(STORE_THEME, theme); } catch (e) {} }
  }

  var savedTheme = null;
  try { savedTheme = localStorage.getItem(STORE_THEME); } catch (e) {}
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme || (prefersDark ? "dark" : "light"), false);

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
    });
  }

  /* 2. Site language ----------------------------------------------------- */
  var STORE_LANG = "mlz-lang";
  var langToggle = $("#langToggle");
  var langCurrent = $(".lang-current", langToggle || document);
  var langNext = $(".lang-next", langToggle || document);
  var i18nNodes = $$("[data-en][data-zh]");
  var phNodes = $$("[data-ph-en][data-ph-zh]");

  function applyLang(lang, persist) {
    var zh = lang === "zh";
    root.setAttribute("lang", zh ? "zh-Hans" : "en");

    i18nNodes.forEach(function (el) {
      var value = zh ? el.getAttribute("data-zh") : el.getAttribute("data-en");
      if (value === null) return;
      if (el.hasAttribute("data-html")) { el.innerHTML = value; } else { el.textContent = value; }
    });

    phNodes.forEach(function (el) {
      var value = zh ? el.getAttribute("data-ph-zh") : el.getAttribute("data-ph-en");
      if (value !== null) el.setAttribute("placeholder", value);
    });

    $$("[data-lang-attr]").forEach(function (el) {
      var value = zh ? el.getAttribute("data-zh-attr") : el.getAttribute("data-en-attr");
      if (value) el.setAttribute("aria-label", value);
    });

    if (langCurrent) langCurrent.textContent = zh ? "中文" : "EN";
    if (langNext) langNext.textContent = zh ? "EN" : "中文";
    if (langToggle) langToggle.setAttribute("aria-label", zh ? "切换到英文" : "Switch site language to Chinese");

    if (persist) { try { localStorage.setItem(STORE_LANG, lang); } catch (e) {} }
  }

  var savedLang = null;
  try { savedLang = localStorage.getItem(STORE_LANG); } catch (e) {}
  var browserZh = (navigator.language || "").toLowerCase().indexOf("zh") === 0;
  applyLang(savedLang || (browserZh ? "zh" : "en"), false);

  if (langToggle) {
    langToggle.addEventListener("click", function () {
      applyLang(root.getAttribute("lang") === "zh-Hans" ? "en" : "zh", true);
    });
  }

  /* 3. Header, mobile navigation, active link ---------------------------- */
  var header = $("#siteHeader");
  var menuBtn = $("#menuBtn");
  var mobileNav = $("#mobileNav");

  function closeMenu() {
    if (!mobileNav || !menuBtn) return;
    mobileNav.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
  }

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", function () {
      var open = menuBtn.getAttribute("aria-expanded") === "true";
      if (open) { closeMenu(); return; }
      mobileNav.hidden = false;
      menuBtn.setAttribute("aria-expanded", "true");
      menuBtn.setAttribute("aria-label", "Close menu");
    });
    $$("a", mobileNav).forEach(function (link) { link.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  var ticking = false;
  function onScroll() {
    if (header) header.classList.toggle("is-stuck", window.scrollY > 12);
    if (backTop) backTop.classList.toggle("is-visible", window.scrollY > 640);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });

  var navLinks = $$(".nav a[href^='#']");
  var sections = navLinks.map(function (link) {
    var id = link.getAttribute("href").slice(1);
    return document.getElementById(id);
  });

  if ("IntersectionObserver" in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (section) { if (section) navObserver.observe(section); });
  }

  /* 4. Scroll reveal ----------------------------------------------------- */
  var revealNodes = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        entry.target.style.transitionDelay = Math.min(i * 70, 260) + "ms";
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealNodes.forEach(function (node) { revealObserver.observe(node); });
  } else {
    revealNodes.forEach(function (node) { node.classList.add("is-visible"); });
  }

  /* 4b. Animated counters ------------------------------------------------ */
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = reduceMotion ? 0 : 1500;
    var start = performance.now();
    var final = target.toFixed(decimals) + suffix;

    function tick(now) {
      var progress = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (progress < 1) { window.requestAnimationFrame(tick); }
      else { el.setAttribute("data-counted", "true"); }
    }
    window.requestAnimationFrame(tick);

    /* Safety net: if the frame loop is paused (throttled rendering, background
       tab, headless printing) the final figure still appears on screen. */
    window.setTimeout(function () {
      if (el.getAttribute("data-counted") !== "true") el.textContent = final;
    }, duration + 300);
  }

  var counters = $$("[data-count]");
  if ("IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* 4c. Hero typing effect ---------------------------------------------- */
  var typedEl = $("#typedLang");
  if (typedEl) {
    var words = ["English", "Français", "Español", "Deutsch", "Italiano", "日本語", "한국어", "Русский"];
    if (reduceMotion) {
      typedEl.textContent = "English";
    } else {
      var wordIndex = 0, charIndex = 0, deleting = false;
      (function type() {
        var word = words[wordIndex];
        charIndex += deleting ? -1 : 1;
        typedEl.textContent = word.slice(0, charIndex);
        var delay = deleting ? 55 : 105;
        if (!deleting && charIndex === word.length) { deleting = true; delay = 1500; }
        else if (deleting && charIndex === 0) { deleting = false; wordIndex = (wordIndex + 1) % words.length; delay = 260; }
        window.setTimeout(type, delay);
      })();
    }
  }

  /* 5. Work filters ------------------------------------------------------ */
  var filterBtns = $$("[data-filter]");
  var workCards = $$("[data-cat]");
  var workCount = $("#workCount");

  function currentLangKey() { return root.getAttribute("lang") === "zh-Hans" ? "zh" : "en"; }

  function applyFilter(cat) {
    var shown = 0;
    workCards.forEach(function (card) {
      var match = cat === "all" || card.getAttribute("data-cat") === cat;
      card.classList.toggle("is-hidden", !match);
      if (match) shown++;
    });
    if (workCount) {
      workCount.textContent = currentLangKey() === "zh"
        ? "显示 " + shown + " 个项目"
        : shown + (shown === 1 ? " project shown" : " projects shown");
    }
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });
      applyFilter(btn.getAttribute("data-filter"));
    });
  });
  if (filterBtns.length) applyFilter("all");

  /* 6. Contact form ------------------------------------------------------ */
  var form = $("#projectForm");
  var formNote = $("#formNote");

  function setFieldError(field, message) {
    var wrap = field.closest(".field");
    if (!wrap) return;
    wrap.classList.toggle("has-error", Boolean(message));
    var errorEl = $(".field-error", wrap);
    if (errorEl) errorEl.textContent = message || "";
    field.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function validateField(field) {
    var value = (field.value || "").trim();
    if (field.hasAttribute("required") && !value) {
      setFieldError(field, currentLangKey() === "zh" ? "请填写这一项。" : "This field is required.");
      return false;
    }
    if (field.getAttribute("type") === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setFieldError(field, currentLangKey() === "zh" ? "请填写有效的邮箱地址。" : "Please enter a valid email address.");
      return false;
    }
    setFieldError(field, "");
    return true;
  }

  if (form) {
    var fields = $$("input, textarea, select", form).filter(function (el) {
      return el.type !== "submit" && el.type !== "checkbox";
    });
    var consent = $("input[type='checkbox'][required]", form);

    fields.forEach(function (field) {
      field.addEventListener("blur", function () { validateField(field); });
      field.addEventListener("input", function () {
        var wrap = field.closest(".field");
        if (wrap && wrap.classList.contains("has-error")) validateField(field);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = fields.map(validateField).every(Boolean);
      if (consent && !consent.checked) {
        ok = false;
        setFieldError(consent, currentLangKey() === "zh" ? "请先勾选同意条款。" : "Please accept the privacy note first.");
      }
      if (!ok) {
        if (formNote) {
          formNote.textContent = currentLangKey() === "zh"
            ? "请检查标红的字段后再试一次。"
            : "Please check the highlighted fields and try again.";
          formNote.className = "form-note is-error";
        }
        var firstError = $(".has-error input, .has-error textarea, .has-error select", form);
        if (firstError) firstError.focus();
        return;
      }

      var submitBtn = $("button[type='submit']", form);
      if (submitBtn) { submitBtn.disabled = true; submitBtn.classList.add("is-busy"); }

      /* Demo only: no backend is attached. Point the form action at your own
         endpoint (Formspree / Netlify Forms / your API) to receive real mail. */
      window.setTimeout(function () {
        form.reset();
        fields.forEach(function (f) { setFieldError(f, ""); });
        if (consent) setFieldError(consent, "");
        if (submitBtn) { submitBtn.disabled = false; submitBtn.classList.remove("is-busy"); }
        if (formNote) {
          formNote.textContent = currentLangKey() === "zh"
            ? "谢谢！需求已收到，我通常会在 12 小时内回复（周一至周六）。"
            : "Thank you! Your brief is in — I usually reply within 12 hours (Mon–Sat).";
          formNote.className = "form-note is-success";
        }
      }, 900);
    });
  }

  /* 7. Small niceties ---------------------------------------------------- */
  var backTop = $("#toTop");
  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* Résumé: "Download CV (PDF)" — opens the browser's print / save-as-PDF
     dialog. The @media print rules in styles.css turn the page into a clean
     CV (About + Résumé only, no chrome). */
  $$("[data-print]").forEach(function (btn) {
    btn.addEventListener("click", function () { window.print(); });
  });

  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      var done = function () {
        btn.classList.add("is-copied");
        btn.textContent = currentLangKey() === "zh" ? "已复制 ✓" : "Copied ✓";
        window.setTimeout(function () {
          btn.classList.remove("is-copied");
          btn.textContent = currentLangKey() === "zh"
            ? (btn.getAttribute("data-zh") || "复制")
            : (btn.getAttribute("data-en") || "Copy");
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done, done);
      } else { done(); }
    });
  });

  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Re-run the filter counter whenever the site language changes */
  var baseApplyLang = applyLang;
  applyLang = function (lang, persist) {
    baseApplyLang(lang, persist);
    var activeFilter = $("[data-filter].is-active");
    applyFilter(activeFilter ? activeFilter.getAttribute("data-filter") : "all");
  };
  applyLang(root.getAttribute("lang") === "zh-Hans" ? "zh" : "en", false);

  onScroll();
})();