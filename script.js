/* ==========================================================================
   Olive & Ember — script.js
   Plain script (no modules). Depends on js/menu-data.js being loaded first.
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NAV_BREAKPOINT = 1100;
  var SCROLL_OFFSET = 88;

  var headerEl = document.getElementById("site-header");

  /* ------------------------------------------------------------------
     1. Header scroll state
     ------------------------------------------------------------------ */
  if (headerEl) {
    var SCROLL_THRESHOLD = 80;
    var headerTicking = false;
    var updateHeaderState = function () {
      var isScrolled = window.scrollY > SCROLL_THRESHOLD;
      headerEl.classList.toggle("is-scrolled", isScrolled);
      headerTicking = false;
    };
    var requestHeaderUpdate = function () {
      if (!headerTicking) {
        window.requestAnimationFrame(updateHeaderState);
        headerTicking = true;
      }
    };
    window.addEventListener("scroll", requestHeaderUpdate, { passive: true });
    updateHeaderState();
  }

  /* ------------------------------------------------------------------
     2. Mobile overlay menu
     ------------------------------------------------------------------ */
  var mobileNav = document.getElementById("mobile-nav");
  var navToggle = document.querySelector(".nav-toggle");
  var navClose = mobileNav ? mobileNav.querySelector(".mobile-nav__close") : null;
  var lastFocused = null;
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  var openMenu = function () {
    if (!mobileNav) return;
    lastFocused = document.activeElement;
    mobileNav.classList.add("is-open");
    document.body.classList.add("is-locked");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Close menu");
    }
    if (navClose) window.setTimeout(function () { navClose.focus(); }, 30);
  };
  var closeMenu = function () {
    if (!mobileNav) return;
    mobileNav.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
    }
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  };
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      if (mobileNav.classList.contains("is-open")) closeMenu();
      else openMenu();
    });
  }
  if (navClose) navClose.addEventListener("click", closeMenu);
  if (mobileNav) {
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { closeMenu(); });
    });
    document.addEventListener("keydown", function (event) {
      if (!mobileNav.classList.contains("is-open")) return;
      if (event.key === "Escape") { event.preventDefault(); closeMenu(); return; }
      if (event.key === "Tab") {
        var focusables = Array.prototype.filter.call(
          mobileNav.querySelectorAll(FOCUSABLE),
          function (el) { return el.offsetParent !== null; }
        );
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        } else if (!mobileNav.contains(document.activeElement)) {
          event.preventDefault(); first.focus();
        }
      }
    });
  }
  var lastViewportWidth = window.innerWidth;
  window.addEventListener("resize", function () {
    if (window.innerWidth === lastViewportWidth) return;
    lastViewportWidth = window.innerWidth;
    if (window.innerWidth >= NAV_BREAKPOINT && mobileNav && mobileNav.classList.contains("is-open")) closeMenu();
  });

  /* ------------------------------------------------------------------
     3. Smooth anchor scrolling
     ------------------------------------------------------------------ */
  var scrollToTarget = function (target) {
    if (!target) return;
    var headerHeight = headerEl ? headerEl.offsetHeight : SCROLL_OFFSET;
    var effective = Math.min(headerHeight, SCROLL_OFFSET);
    var top = target.getBoundingClientRect().top + window.pageYOffset - effective - 8;
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
  };
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (event) {
      var href = anchor.getAttribute("href");
      if (!href || href === "#" || href.length < 2) return;
      var target = document.getElementById(href.slice(1));
      if (!target) return;
      event.preventDefault();
      scrollToTarget(target);
      if (history.replaceState) history.replaceState(null, "", href);
    });
  });

  /* ------------------------------------------------------------------
     4. Scroll-spy
     ------------------------------------------------------------------ */
  var spyLinks = document.querySelectorAll(".header-nav__link");
  var spySections = [];
  spyLinks.forEach(function (link) {
    var href = link.getAttribute("href");
    if (!href || href.charAt(0) !== "#" || href.length < 2) return;
    var target = document.getElementById(href.slice(1));
    if (target) spySections.push({ el: target, link: link });
  });
  if (spySections.length) {
    var updateActive = function () {
      var headerHeight = headerEl ? headerEl.offsetHeight : SCROLL_OFFSET;
      var probe = headerHeight + 24;
      var current = null;
      for (var i = 0; i < spySections.length; i++) {
        var rect = spySections[i].el.getBoundingClientRect();
        if (rect.top - probe <= 0) current = spySections[i];
      }
      var atBottom = window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 4;
      if (atBottom) current = spySections[spySections.length - 1];
      spySections.forEach(function (item) {
        var isActive = item === current;
        item.link.classList.toggle("is-active", isActive);
        if (isActive) item.link.setAttribute("aria-current", "true");
        else item.link.removeAttribute("aria-current");
      });
    };
    var spyTicking = false;
    var requestSpy = function () {
      if (!spyTicking) {
        window.requestAnimationFrame(function () { updateActive(); spyTicking = false; });
        spyTicking = true;
      }
    };
    window.addEventListener("scroll", requestSpy, { passive: true });
    window.addEventListener("resize", requestSpy);
    updateActive();
  }

  /* ------------------------------------------------------------------
     5. Menu — data, rendering, tabs, filters
     ------------------------------------------------------------------ */
  var menuPanel  = document.getElementById("menu-panel");
  var menuList   = document.getElementById("menu-list");
  var menuCount  = document.getElementById("menu-count");
  var tablist    = document.getElementById("menu-tablist");
  var tabButtons = tablist ? Array.prototype.slice.call(tablist.querySelectorAll(".menu-tab")) : [];
  var indicator  = tablist ? tablist.querySelector(".menu-tabs__indicator") : null;
  var chipButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));

  var activeCategory = tabButtons.length ? tabButtons[0].dataset.category : "starters";
  var activeDiets = [];
  var fadeTimer = null;

  var TAG_LABELS = { V: "Vegetarian", VG: "Vegan", GF: "Gluten-free", SPICY: "Spicy" };

  var CHILI_SVG =
    '<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true" focusable="false">' +
      '<path d="M7 1.2 Q 7.2 0.5 7.8 0.5 L 8.5 0.5 Q 8.2 1.1 7.6 1.5 Q 9 3 9.4 5.4 Q 9.8 7.6 8.3 9.2 Q 6.7 10.8 4.8 10 Q 3 9.3 3.2 7.4 Q 3.4 5.4 5 4.3 Q 6 3.6 6.5 2.6 Q 6.9 1.9 7 1.2 Z" fill="currentColor"/>' +
    '</svg>';

  var STAR_SVG =
    '<svg viewBox="0 0 12 12" width="13" height="13" aria-hidden="true" focusable="false">' +
      '<path d="M6 0.6 L 7.4 4.2 L 11.2 4.5 L 8.3 7.0 L 9.1 10.8 L 6 8.8 L 2.9 10.8 L 3.7 7.0 L 0.8 4.5 L 4.6 4.2 Z" fill="currentColor"/>' +
    '</svg>';

  function formatPrice(value) {
    var currency = typeof CURRENCY === "string" ? CURRENCY : "";
    var amount = Number(value);
    if (!isFinite(amount)) return currency;
    return currency + " " + amount.toLocaleString("en-US");
  }

  function createBadge(tag) {
    var el = document.createElement("span");
    el.className = "menu-item__badge menu-item__badge--" + tag.toLowerCase();
    var label = TAG_LABELS[tag] || tag;
    el.setAttribute("title", label);
    el.setAttribute("aria-label", label);
    if (tag === "SPICY") el.innerHTML = CHILI_SVG;
    else el.textContent = tag;
    return el;
  }

  function buildMenuItem(item) {
    var li = document.createElement("li");
    li.className = "menu-item";
    if (item.chefsPick) li.classList.add("menu-item--pick");

    var head = document.createElement("div");
    head.className = "menu-item__head";

    var name = document.createElement("h4");
    name.className = "menu-item__name";

    if (item.chefsPick) {
      var star = document.createElement("span");
      star.className = "menu-item__star";
      star.setAttribute("aria-hidden", "true");
      star.innerHTML = STAR_SVG;
      name.appendChild(star);
    }

    var nameText = document.createElement("span");
    nameText.className = "menu-item__label";
    nameText.textContent = item.name;
    name.appendChild(nameText);

    var dots = document.createElement("span");
    dots.className = "menu-item__dots";
    dots.setAttribute("aria-hidden", "true");

    var price = document.createElement("span");
    price.className = "menu-item__price";
    price.textContent = formatPrice(item.price);

    head.appendChild(name);
    head.appendChild(dots);
    head.appendChild(price);
    li.appendChild(head);

    if (item.description) {
      var desc = document.createElement("p");
      desc.className = "menu-item__desc";
      desc.textContent = item.description;
      li.appendChild(desc);
    }

    var meta = document.createElement("div");
    meta.className = "menu-item__meta";
    if (Array.isArray(item.tags) && item.tags.length) {
      item.tags.forEach(function (tag) { meta.appendChild(createBadge(tag)); });
    }
    if (item.chefsPick) {
      var pick = document.createElement("span");
      pick.className = "menu-item__pick";
      pick.textContent = "Chef's pick";
      meta.appendChild(pick);
    }
    if (meta.childNodes.length) li.appendChild(meta);

    return li;
  }

  function renderMenu(items) {
    if (!menuList) return;
    menuList.innerHTML = "";
    if (!items.length) {
      var empty = document.createElement("li");
      empty.className = "menu-empty";
      empty.textContent = "No dishes match those filters. Try removing one.";
      menuList.appendChild(empty);
      updateCount(0);
      return;
    }
    var fragment = document.createDocumentFragment();
    items.forEach(function (item) { fragment.appendChild(buildMenuItem(item)); });
    menuList.appendChild(fragment);
    updateCount(items.length);
  }

  function updateCount(n) {
    if (!menuCount) return;
    menuCount.textContent = "Showing " + n + (n === 1 ? " dish" : " dishes");
  }

  function filterMenu(category, dietary) {
    var diets = Array.isArray(dietary)
      ? dietary.map(function (d) { return String(d).toUpperCase(); })
      : [];
    var menu = (typeof MENU !== "undefined" && Array.isArray(MENU)) ? MENU : [];

    var items = menu.filter(function (item) {
      if (item.category !== category) return false;
      if (!diets.length) return true;
      if (!item.tags || !item.tags.length) return false;
      for (var i = 0; i < diets.length; i++) {
        if (item.tags.indexOf(diets[i]) === -1) return false;
      }
      return true;
    });

    if (!menuPanel || reduceMotion) { renderMenu(items); return; }
    menuPanel.classList.add("is-fading");
    window.clearTimeout(fadeTimer);
    fadeTimer = window.setTimeout(function () {
      renderMenu(items);
      menuPanel.classList.remove("is-fading");
    }, 125);
  }

  function moveIndicator() {
    if (!indicator || !tablist) return;
    var active = tabButtons.filter(function (b) { return b.classList.contains("is-active"); })[0];
    if (!active) return;
    indicator.style.width = active.offsetWidth + "px";
    indicator.style.transform = "translateX(" + active.offsetLeft + "px)";
    tablist.classList.add("is-ready");
  }

  function setActiveTab(tab, focus) {
    tabButtons.forEach(function (b) {
      var on = b === tab;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
    if (menuPanel) menuPanel.setAttribute("aria-labelledby", tab.id);
    activeCategory = tab.dataset.category;
    moveIndicator();
    filterMenu(activeCategory, activeDiets);
    if (focus) tab.focus();
  }

  tabButtons.forEach(function (tab) {
    tab.addEventListener("click", function () {
      if (tab.classList.contains("is-active")) return;
      setActiveTab(tab, false);
    });
  });

  if (tablist) {
    tablist.addEventListener("keydown", function (event) {
      var i = tabButtons.indexOf(document.activeElement);
      if (i === -1) return;
      var last = tabButtons.length - 1;
      var next = null;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          next = tabButtons[(i + 1) % tabButtons.length]; break;
        case "ArrowLeft":
        case "ArrowUp":
          next = tabButtons[(i - 1 + tabButtons.length) % tabButtons.length]; break;
        case "Home": next = tabButtons[0]; break;
        case "End":  next = tabButtons[last]; break;
        default: return;
      }
      event.preventDefault();
      setActiveTab(next, true);
    });
  }

  chipButtons.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var diet = chip.dataset.diet;
      var on = chip.getAttribute("aria-pressed") === "true";
      var next = !on;
      chip.setAttribute("aria-pressed", next ? "true" : "false");
      if (next) {
        if (activeDiets.indexOf(diet) === -1) activeDiets.push(diet);
      } else {
        activeDiets = activeDiets.filter(function (d) { return d !== diet; });
      }
      filterMenu(activeCategory, activeDiets);
    });
  });

  var indicatorTicking = false;
  window.addEventListener("resize", function () {
    if (indicatorTicking) return;
    indicatorTicking = true;
    window.requestAnimationFrame(function () { moveIndicator(); indicatorTicking = false; });
  });

  if (menuList) {
    var initialTab = tabButtons.filter(function (b) { return b.classList.contains("is-active"); })[0] || tabButtons[0];
    if (initialTab) activeCategory = initialTab.dataset.category;
    filterMenu(activeCategory, activeDiets);
    window.requestAnimationFrame(moveIndicator);
  }

  /* ------------------------------------------------------------------
     6. Story gallery lightbox
     ------------------------------------------------------------------ */
  var lightbox = document.getElementById("lightbox");
  var galleryButtons = Array.prototype.slice.call(document.querySelectorAll(".story__gallery-item"));

  if (lightbox && galleryButtons.length) {
    var lightboxImg     = lightbox.querySelector(".lightbox__img");
    var lightboxCaption = lightbox.querySelector(".lightbox__caption");
    var lightboxCounter = lightbox.querySelector(".lightbox__counter");
    var prevBtn         = lightbox.querySelector(".lightbox__arrow--prev");
    var nextBtn         = lightbox.querySelector(".lightbox__arrow--next");
    var closeBtn        = lightbox.querySelector(".lightbox__close");
    var lbLastTrigger   = null;
    var currentIndex    = 0;

    var lbItems = galleryButtons.map(function (btn) {
      var img = btn.querySelector("img");
      var cap = img ? (img.getAttribute("alt") || "") : "";
      return {
        src: img ? (img.currentSrc || img.src) : "",
        alt: cap,
        caption: cap,
        trigger: btn
      };
    });

    var renderSlide = function (index) {
      var n = lbItems.length;
      var i = ((index % n) + n) % n;
      currentIndex = i;
      var item = lbItems[i];

      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt;
      lightboxCaption.textContent = item.caption;
      lightboxCounter.textContent = (i + 1) + " / " + n;
    };

    var openLightbox = function (index, trigger) {
      lbLastTrigger = trigger || null;
      renderSlide(index);
      if (typeof lightbox.showModal === "function") {
        lightbox.showModal();
      } else {
        lightbox.setAttribute("open", "");
      }
      if (closeBtn) window.setTimeout(function () { closeBtn.focus(); }, 30);
    };

    var closeLightbox = function () {
      if (typeof lightbox.close === "function" && lightbox.open) {
        lightbox.close();
      } else {
        lightbox.removeAttribute("open");
      }
      if (lbLastTrigger && typeof lbLastTrigger.focus === "function") lbLastTrigger.focus();
    };

    galleryButtons.forEach(function (btn, i) {
      btn.addEventListener("click", function () { openLightbox(i, btn); });
    });

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (prevBtn) prevBtn.addEventListener("click", function () { renderSlide(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { renderSlide(currentIndex + 1); });

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });
    lightbox.addEventListener("close", function () {
      if (lbLastTrigger && typeof lbLastTrigger.focus === "function") lbLastTrigger.focus();
    });
    lightbox.addEventListener("cancel", function () {
      window.setTimeout(function () {
        if (lbLastTrigger && typeof lbLastTrigger.focus === "function") lbLastTrigger.focus();
      }, 0);
    });
    /* Native <dialog> keeps focus inside the dialog, but does not wrap
       Tab from last → first. This handler adds the wrap. */
    lightbox.addEventListener("keydown", function (event) {
      if (!lightbox.open) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        renderSlide(currentIndex - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        renderSlide(currentIndex + 1);
      } else if (event.key === "Tab") {
        var focusables = Array.prototype.slice.call(
          lightbox.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')
        ).filter(function (el) { return !el.hasAttribute("disabled"); });
        if (!focusables.length) return;
        var first = focusables[0];
        var last  = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
    });
  }

  /* ------------------------------------------------------------------
     7. Reveal-on-scroll
     ------------------------------------------------------------------ */
  var revealItems = document.querySelectorAll(".reveal");
  if (!reduceMotion && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -80px 0px" });
    revealItems.forEach(function (el) { observer.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ------------------------------------------------------------------
     8. Date inputs — no past dates
     ------------------------------------------------------------------ */
  var todayISO = (function () {
    var n = new Date();
    return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  })();
  document.querySelectorAll('input[type="date"]').forEach(function (input) {
    input.min = todayISO;
  });

  /* ------------------------------------------------------------------
     9. Reservation form — validation, sending, success
     ------------------------------------------------------------------ */
  var bookingForm = document.getElementById("reservation-form");
  var summaryEl   = document.getElementById("reservation-summary");
  var successEl   = document.getElementById("reservation-success");

  var RES_FIELDS = ["name", "phone", "email", "date", "time", "guests"];

  var RES_MESSAGES = {
    name: "Please enter your name (at least 2 characters).",
    phone: "Please enter a valid phone number.",
    email: "Please enter a valid email address.",
    date: "Please choose a date that is today or later.",
    time: "Please choose a time.",
    guests: "Please choose the number of guests."
  };

  function resValue(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value : "";
  }

  function isValidName(v) { return String(v).trim().length >= 2; }

  function isValidPhone(v) {
    var s = String(v).trim();
    if (!s) return false;
    if (!/^[+\d\s\-().]+$/.test(s)) return false;
    var digits = (s.match(/\d/g) || []).length;
    return digits >= 7 && digits <= 15;
  }

  function isValidEmail(v) {
    var s = String(v).trim();
    if (!s) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
  }

  function isValidDate(v) {
    if (!v) return false;
    var parsed = new Date(v + "T00:00:00");
    if (isNaN(parsed.getTime())) return false;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    return parsed.getTime() >= today.getTime();
  }

  function isValidTime(v) { return !!v; }
  function isValidGuests(v) { return !!v; }

  var RES_VALIDATORS = {
    name: isValidName,
    phone: isValidPhone,
    email: isValidEmail,
    date: isValidDate,
    time: isValidTime,
    guests: isValidGuests
  };

  function clearErrorFor(form, name) {
    var fieldEl = form.querySelector('[name="' + name + '"]');
    var errorEl = document.getElementById("res-" + name + "-error");
    if (fieldEl) {
      fieldEl.removeAttribute("aria-invalid");
      if (errorEl) fieldEl.removeAttribute("aria-describedby");
    }
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.hidden = true;
    }
  }

  function showErrorFor(form, name, message) {
    var fieldEl = form.querySelector('[name="' + name + '"]');
    var errorEl = document.getElementById("res-" + name + "-error");
    if (fieldEl) {
      fieldEl.setAttribute("aria-invalid", "true");
      if (errorEl) fieldEl.setAttribute("aria-describedby", errorEl.id);
    }
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
  }

  function clearAllResErrors() {
    if (!bookingForm) return;
    RES_FIELDS.forEach(function (name) { clearErrorFor(bookingForm, name); });
    if (summaryEl) {
      summaryEl.innerHTML = "";
      summaryEl.hidden = true;
    }
  }

  function syncSummaryVisibility() {
    if (!bookingForm || !summaryEl || summaryEl.hidden) return;
    var remaining = bookingForm.querySelectorAll('[aria-invalid="true"]');
    if (!remaining.length) {
      summaryEl.innerHTML = "";
      summaryEl.hidden = true;
    }
  }

  if (bookingForm) {
    bookingForm.addEventListener("submit", function (event) {
      event.preventDefault();
      clearAllResErrors();

      var errors = [];
      RES_FIELDS.forEach(function (name) {
        if (!RES_VALIDATORS[name](resValue(bookingForm, name))) {
          errors.push({ name: name, message: RES_MESSAGES[name] });
        }
      });

      if (errors.length) {
        if (summaryEl) {
          var strong = document.createElement("strong");
          strong.textContent = errors.length === 1
            ? "Please check this field:"
            : "Please check these fields:";
          summaryEl.appendChild(strong);

          var list = document.createElement("ul");
          errors.forEach(function (err) {
            var li = document.createElement("li");
            li.textContent = err.message;
            list.appendChild(li);
          });
          summaryEl.appendChild(list);
          summaryEl.hidden = false;
        }

        errors.forEach(function (err) {
          showErrorFor(bookingForm, err.name, err.message);
        });

        var firstInvalid = bookingForm.querySelector('[name="' + errors[0].name + '"]');
        if (firstInvalid) {
          try { firstInvalid.focus({ preventScroll: true }); }
          catch (e) { firstInvalid.focus(); }
          if (firstInvalid.scrollIntoView) {
            firstInvalid.scrollIntoView({
              behavior: reduceMotion ? "auto" : "smooth",
              block: "center"
            });
          }
        }
        return;
      }

      var submitBtn = bookingForm.querySelector(".reservation__submit");
      var originalLabel = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      window.setTimeout(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }

        bookingForm.hidden = true;

        if (successEl) {
          successEl.hidden = false;
          void successEl.offsetWidth;
          successEl.classList.add("is-visible");

          var title = successEl.querySelector(".reservation__success-title");
          if (title) {
            try { title.focus({ preventScroll: true }); }
            catch (e) { title.focus(); }
          }
        }
      }, 900);
    });

    var liveClear = function (event) {
      var target = event.target;
      if (!target || !target.name) return;
      if (target.getAttribute("aria-invalid") === "true") {
        clearErrorFor(bookingForm, target.name);
      }
      syncSummaryVisibility();
    };
    bookingForm.addEventListener("input", liveClear);
    bookingForm.addEventListener("change", liveClear);
  }

  /* ------------------------------------------------------------------
     10. Quick reservation bar → prefills the main reservation form
     ------------------------------------------------------------------ */
  var quickForm = document.getElementById("quick-reserve");

  if (quickForm && bookingForm) {
    quickForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var pairs = [
        ["quick-date", "res-date"],
        ["quick-time", "res-time"],
        ["quick-guests", "res-guests"]
      ];
      pairs.forEach(function (pair) {
        var from = document.getElementById(pair[0]);
        var to = document.getElementById(pair[1]);
        if (from && to && from.value) to.value = from.value;
      });

      clearAllResErrors();
      scrollToTarget(document.getElementById("reservation"));

      var nameField = document.getElementById("res-name");
      if (nameField) {
        window.setTimeout(function () {
          try { nameField.focus({ preventScroll: true }); }
          catch (e) { nameField.focus(); }
        }, reduceMotion ? 0 : 420);
      }
    });
  }

  /* ------------------------------------------------------------------
     11. Footer newsletter
     ------------------------------------------------------------------ */
  var newsletterForm = document.getElementById("footer-newsletter");

  if (newsletterForm) {
    var nlInput   = document.getElementById("newsletter-email");
    var nlMessage = document.getElementById("newsletter-message");
    var nlButton  = newsletterForm.querySelector(".newsletter__button");

    var setNlMessage = function (text, state) {
      if (!nlMessage) return;
      nlMessage.textContent = text || "";
      nlMessage.classList.remove("is-error", "is-success");
      if (state === "error")   nlMessage.classList.add("is-error");
      if (state === "success") nlMessage.classList.add("is-success");
    };
    var clearNlError = function () {
      if (!nlInput) return;
      nlInput.removeAttribute("aria-invalid");
    };

    newsletterForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var value = nlInput ? nlInput.value.trim() : "";
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

      if (!valid) {
        if (nlInput) nlInput.setAttribute("aria-invalid", "true");
        setNlMessage("Please enter a valid email address.", "error");
        if (nlInput) {
          try { nlInput.focus({ preventScroll: true }); }
          catch (e) { nlInput.focus(); }
        }
        return;
      }

      clearNlError();
      setNlMessage("Thanks — this is a demo form, so nothing was sent.", "success");

      if (nlButton) {
        nlButton.disabled = true;
        window.setTimeout(function () { nlButton.disabled = false; }, 900);
      }

      newsletterForm.reset();
    });

    if (nlInput) {
      nlInput.addEventListener("input", function () {
        if (nlInput.getAttribute("aria-invalid") === "true" && nlInput.value.trim()) {
          clearNlError();
        }
      });
    }
  }

  /* ------------------------------------------------------------------
     12. Back to top
     ------------------------------------------------------------------ */
  var backToTop = document.querySelector(".footer-backtop");
  if (backToTop) {
    backToTop.addEventListener("click", function (event) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ------------------------------------------------------------------
     13. Footer year
     ------------------------------------------------------------------ */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
/* ==========================================================================
   Motion layer (added): intro, split titles, parallax, embers, count-up,
   tilt, magnetic buttons, floating CTA, scroll progress
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var motion = root.classList.contains("motion") && !reduce;

  /* ---- 1. Intro loader -> is-ready ---- */
  var loader = document.getElementById("loader");
  var finishIntro = function () {
    body.classList.add("is-ready");
    body.classList.remove("is-locked");
    try { sessionStorage.setItem("oe-intro", "1"); } catch (e) {}
    if (loader) {
      loader.classList.add("is-done");
      window.setTimeout(function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 1300);
    }
  };
  if (!motion) {
    body.classList.add("is-ready");
    if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
  } else if (root.classList.contains("intro") && loader) {
    body.classList.add("is-locked");
    window.setTimeout(finishIntro, 1900);
  } else {
    window.requestAnimationFrame(function () { window.requestAnimationFrame(finishIntro); });
  }
  window.setTimeout(function () { body.classList.add("is-ready"); }, 4200);

  /* ---- 2. Split-word titles ---- */
  var splitWords = function (el) {
    var index = 0;
    var label = el.textContent.replace(/\s+/g, " ").trim();
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var outer = document.createElement("span");
            outer.className = "w";
            outer.setAttribute("aria-hidden", "true");
            var inner = document.createElement("span");
            inner.className = "w__i";
            inner.style.setProperty("--i", String(index++));
            inner.textContent = part;
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
    el.classList.add("split");
    el.setAttribute("aria-label", label);
  };
  if (motion) {
    document.querySelectorAll(".hero__title, .menu-head__title, .signature-head__title, .story__title, .reservation__title")
      .forEach(splitWords);
  }

  /* ---- 3. Hero embers ---- */
  var hero = document.querySelector(".hero");
  var heroMedia = document.querySelector(".hero__media");
  var heroContent = document.querySelector(".hero__content");
  if (motion && hero) {
    var layer = document.createElement("div");
    layer.className = "hero__embers";
    layer.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 22; i++) {
      var ember = document.createElement("i");
      ember.className = "ember";
      ember.style.setProperty("--x", (Math.random() * 100).toFixed(1) + "%");
      ember.style.setProperty("--s", (2 + Math.random() * 4).toFixed(1) + "px");
      ember.style.setProperty("--d", (9 + Math.random() * 9).toFixed(1) + "s");
      ember.style.setProperty("--dl", (-Math.random() * 16).toFixed(1) + "s");
      ember.style.setProperty("--dx", ((Math.random() - 0.5) * 160).toFixed(0) + "px");
      layer.appendChild(ember);
    }
    var scrim = hero.querySelector(".hero__scrim");
    if (scrim && scrim.parentNode) scrim.parentNode.insertBefore(layer, scrim.nextSibling);
  }

  /* ---- 4. Scroll: progress bar, hero parallax, element parallax, floating CTA ---- */
  var progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  body.appendChild(progress);

  var floatBtn = document.querySelector(".float-reserve");
  var reservation = document.getElementById("reservation");
  var footerEl = document.getElementById("site-footer");

  var parallaxItems = [];
  var addParallax = function (selector, speed, minWidth) {
    document.querySelectorAll(selector).forEach(function (el) {
      parallaxItems.push({ el: el, speed: speed, min: minWidth, y: 0 });
    });
  };
  addParallax(".story__inset", -0.09, 860);
  addParallax(".story__badge", 0.06, 860);
  addParallax(".signature-card:nth-child(1)", 0.05, 860);
  addParallax(".signature-card:nth-child(3)", 0.08, 860);

  var heroX = 0;
  var heroY = 0;
  var ticking = false;

  var update = function () {
    ticking = false;
    var y = window.pageYOffset;
    var vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    progress.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ")";

    if (motion && heroMedia && y < vh * 1.6) {
      heroMedia.style.transform = "translate3d(" + heroX.toFixed(1) + "px," + (y * 0.28 + heroY).toFixed(1) + "px,0)";
    }
    if (motion && heroContent && y < vh * 1.2) {
      heroContent.style.transform = "translate3d(0," + (y * 0.18).toFixed(1) + "px,0)";
      heroContent.style.opacity = String(Math.max(0, 1 - y / (vh * 0.75)).toFixed(3));
    }

    if (motion) {
      parallaxItems.forEach(function (item) {
        if (window.innerWidth < item.min) {
          if (item.y !== 0) { item.el.style.translate = ""; item.y = 0; }
          return;
        }
        var rect = item.el.getBoundingClientRect();
        if (rect.bottom < -300 || rect.top > vh + 300) return;
        var baseCenter = rect.top - item.y + rect.height / 2;
        var next = -(baseCenter - vh / 2) * item.speed;
        next = Math.max(-90, Math.min(90, next));
        item.el.style.translate = "0 " + next.toFixed(1) + "px";
        item.y = next;
      });
    }

    if (floatBtn) {
      var inReservation = false;
      if (reservation) {
        var rr = reservation.getBoundingClientRect();
        inReservation = rr.top < vh * 0.6 && rr.bottom > 0;
      }
      var inFooter = footerEl ? footerEl.getBoundingClientRect().top < vh - 80 : false;
      var show = y > vh * 0.9 && !inReservation && !inFooter;
      floatBtn.classList.toggle("is-shown", show);
      floatBtn.setAttribute("tabindex", show ? "0" : "-1");
    }
  };
  var requestUpdate = function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();

  if (motion && fine && hero) {
    hero.addEventListener("pointermove", function (event) {
      var r = hero.getBoundingClientRect();
      heroX = ((event.clientX - r.left) / r.width - 0.5) * -18;
      heroY = ((event.clientY - r.top) / r.height - 0.5) * -12;
      requestUpdate();
    }, { passive: true });
    hero.addEventListener("pointerleave", function () { heroX = 0; heroY = 0; requestUpdate(); });
  }

  /* ---- 5. Count-up numbers ---- */
  var counters = document.querySelectorAll("[data-count]");
  if (motion && counters.length && "IntersectionObserver" in window) {
    var animateCount = function (el) {
      var target = Number(el.getAttribute("data-count")) || 0;
      var duration = 1600;
      var start = null;
      var step = function (now) {
        if (start === null) start = now;
        var t = Math.min(1, (now - start) / duration);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.round(target * eased));
        if (t < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    };
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countObserver.unobserve(entry.target);
        animateCount(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) {
      el.textContent = "0";
      countObserver.observe(el);
    });
  }

  /* ---- 6. Signature cards: tilt + glare ---- */
  if (motion && fine) {
    document.querySelectorAll(".signature-card__media").forEach(function (media) {
      media.addEventListener("pointermove", function (event) {
        var r = media.getBoundingClientRect();
        var px = (event.clientX - r.left) / r.width;
        var py = (event.clientY - r.top) / r.height;
        media.style.setProperty("--ry", ((px - 0.5) * 10).toFixed(2) + "deg");
        media.style.setProperty("--rx", ((0.5 - py) * 10).toFixed(2) + "deg");
        media.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
        media.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
        media.classList.add("is-tilting");
      });
      media.addEventListener("pointerleave", function () {
        media.style.setProperty("--rx", "0deg");
        media.style.setProperty("--ry", "0deg");
        media.classList.remove("is-tilting");
      });
    });
  }

  /* ---- 7. Magnetic buttons ---- */
  if (motion && fine) {
    document.querySelectorAll(".btn-solid, .btn-line, .btn-reserve:not(.btn-reserve--block)").forEach(function (btn) {
      btn.addEventListener("pointermove", function (event) {
        var r = btn.getBoundingClientRect();
        var x = (event.clientX - (r.left + r.width / 2)) * 0.22;
        var y = (event.clientY - (r.top + r.height / 2)) * 0.3;
        btn.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });
  }
})();