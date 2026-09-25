/*
 * One-page navigation for the masthead.
 *
 * - Scroll-spy: the nav item for the section currently in view gets
 *   `.is-active` and aria-current. While a click-triggered smooth scroll is
 *   running, the clicked item stays active instead of flickering through the
 *   sections in between.
 * - Compact mode: when the full row of items does not fit, the bar shows only
 *   the active item (the others are hidden, not moved) and the hamburger
 *   opens a full-width panel under the bar (#nav-more, a direct child of
 *   .masthead). That panel lists every section in a fixed order; a single
 *   gold indicator line sits under the current one and slides to the next as
 *   the page scrolls. With a mouse (or keyboard focus) it follows the hovered
 *   item instead, and slides back to the current section on leaving. While the panel is open the bar's own label is hidden
 *   (.masthead.nav-open), so bar and panel read as one sheet with just the
 *   close button on top.
 * - Motion: the compact bar label swaps with a short vertical slide and fade
 *   whose direction follows the scroll. Everything animated is skipped for
 *   prefers-reduced-motion.
 *
 * This replaces the theme's greedy-nav collapse, which is disabled by giving
 * the <nav> a different id (see _includes/masthead.html).
 */
(function () {
  "use strict";

  var nav = document.getElementById("site-nav-onepage");
  var menu = document.getElementById("nav-more");
  if (!nav || !menu) return;

  var bar = nav.querySelector(".visible-links");
  var list = menu.querySelector(".nav-menu__list");
  var body = menu.querySelector(".nav-menu__body") || menu;
  var button = nav.querySelector("button");
  var masthead = document.querySelector(".masthead");
  var items = Array.prototype.slice.call(bar.children); // original order

  var DURATION = 220;
  var EASING = "cubic-bezier(0.2, 0.7, 0.2, 1)";
  var reduceMotion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  function motionOK() {
    return typeof Element.prototype.animate === "function" && !(reduceMotion && reduceMotion.matches);
  }

  // Pair each bar item with its section and build its fixed-order menu copy.
  // "#top" means the first section.
  var entries = items.map(function (li) {
    var a = li.querySelector("a");
    var href = (a && a.getAttribute("href")) || "";
    var hash = href.split("#")[1] || "";
    var section = null;
    if (hash === "top") section = document.querySelector(".home-section");
    else if (hash) section = document.getElementById(hash);

    var menuLi = document.createElement("li");
    menuLi.className = "masthead__menu-item nav-menu__item";
    var menuA = document.createElement("a");
    menuA.href = href;
    var label = document.createElement("span");
    label.className = "nav-menu__label";
    label.textContent = a ? a.textContent.trim() : "";
    menuA.appendChild(label);
    menuLi.appendChild(menuA);
    list.appendChild(menuLi);

    return { li: li, a: a, section: section, menuLi: menuLi, menuA: menuA, label: label };
  });
  var spied = entries.filter(function (e) { return e.section; });

  var indicator = document.createElement("span");
  indicator.className = "nav-menu__indicator";
  indicator.setAttribute("aria-hidden", "true");
  body.appendChild(indicator);

  var active = null;
  var compact = false;
  var lockedTo = null;
  var lockTimer = 0;
  var ghost = null;
  var hovered = null; // menu entry under the mouse / keyboard focus, if any

  /* ---- menu open / close ------------------------------------------------ */

  function isOpen() {
    return menu.classList.contains("is-open");
  }

  function setOpen(open) {
    hovered = null;
    if (open) placeIndicator(false); // already in place when the panel appears
    menu.classList.toggle("is-open", open);
    if (masthead) masthead.classList.toggle("nav-open", open);
    button.classList.toggle("close", open);
    button.setAttribute("aria-expanded", open ? "true" : "false");
  }

  /* ---- gold indicator under the hovered / current menu item ------------- */

  function placeIndicator(animate) {
    var target = hovered || active;
    if (!target) { indicator.style.opacity = "0"; return; }
    var box = body.getBoundingClientRect();
    var r = target.label.getBoundingClientRect();
    if (!r.width) return;
    var jump = !animate || !motionOK();
    if (jump) indicator.classList.add("no-anim");
    indicator.style.opacity = "1";
    indicator.style.width = r.width + "px";
    indicator.style.transform = "translate(" + (r.left - box.left) + "px, " + (r.bottom - box.top) + "px)";
    if (jump) {
      indicator.getBoundingClientRect(); // commit the jump before re-enabling transitions
      indicator.classList.remove("no-anim");
    }
  }

  /* ---- layout: full row vs. compact ------------------------------------- */

  function arrange() {
    var current = active ? active.li : items[0];
    items.forEach(function (li) {
      li.classList.toggle("nav-collapsed", compact && li !== current);
    });
    nav.classList.toggle("nav-compact", compact);
    button.classList.toggle("hidden", !compact);
    if (!compact) setOpen(false);
  }

  function measure() {
    // The panel's frosted background starts below the bar row (see _custom.scss).
    if (masthead) menu.style.setProperty("--bar-h", masthead.offsetHeight + "px");
    // Show every item in the bar and check whether the row fits.
    items.forEach(function (li) { li.classList.remove("nav-collapsed"); });
    var cs = window.getComputedStyle(nav);
    var available = nav.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    compact = bar.getBoundingClientRect().width > available + 0.5;
    arrange();
    placeIndicator(false);
  }

  /* ---- compact mode: animated swap of the bar item ----------------------- */

  function swapCompact(from, to) {
    // no label animation while the panel is open: the bar label is hidden then
    if (!motionOK() || isOpen()) { arrange(); return; }

    var order = function (e) { return e ? items.indexOf(e.li) : -1; };
    var dir = order(to) < order(from) ? -1 : 1; // 1: moving down the page
    var navBox = nav.getBoundingClientRect();
    var oldBox = from && !from.li.classList.contains("nav-collapsed") ? from.li.getBoundingClientRect() : null;

    arrange();

    // outgoing label: a non-interactive clone that slides and fades away
    if (ghost) { ghost.remove(); ghost = null; }
    if (oldBox && from !== to) {
      var g = from.li.cloneNode(true);
      g.classList.remove("nav-collapsed");
      g.classList.add("is-active", "nav-ghost");
      g.setAttribute("aria-hidden", "true");
      var ga = g.querySelector("a");
      if (ga) { ga.tabIndex = -1; ga.removeAttribute("aria-current"); }
      g.style.left = (oldBox.left - navBox.left) + "px";
      g.style.top = (oldBox.top - navBox.top) + "px";
      g.style.width = oldBox.width + "px";
      bar.appendChild(g);
      ghost = g;
      g.animate([
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(" + (-10 * dir) + "px)" }
      ], { duration: DURATION, easing: EASING, fill: "forwards" }).onfinish = function () {
        g.remove();
        if (ghost === g) ghost = null;
      };
    }

    // incoming label slides in from the direction of travel
    if (to && to.a) {
      to.a.animate([
        { opacity: 0, transform: "translateY(" + (10 * dir) + "px)" },
        { opacity: 1, transform: "translateY(0)" }
      ], { duration: DURATION, easing: EASING });
    }
  }

  /* ---- scroll-spy ------------------------------------------------------- */

  function sectionInView() {
    if (!spied.length) return null;
    var doc = document.documentElement;
    if (window.innerHeight + window.pageYOffset >= doc.scrollHeight - 2) {
      return spied[spied.length - 1]; // at the very bottom: last section
    }
    var line = (masthead ? masthead.offsetHeight : 0) + Math.min(200, window.innerHeight * 0.25);
    var current = spied[0];
    spied.forEach(function (e) {
      if (e.section.getBoundingClientRect().top <= line) current = e;
    });
    return current;
  }

  function mark(entry, on) {
    entry.li.classList.toggle("is-active", on);
    entry.menuLi.classList.toggle("is-active", on);
    [entry.a, entry.menuA].forEach(function (a) {
      if (!a) return;
      if (on) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  }

  function setActive(entry) {
    if (entry === active) return;
    var previous = active;
    if (previous) mark(previous, false);
    active = entry;
    if (active) mark(active, true);
    if (compact) swapCompact(previous, active);
    placeIndicator(isOpen());
  }

  function update() {
    setActive(lockedTo || sectionInView());
  }

  /* ---- events ----------------------------------------------------------- */

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { ticking = false; update(); });
  }

  function unlock() {
    lockedTo = null;
    window.clearTimeout(lockTimer);
    update();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("scrollend", function () { if (lockedTo) unlock(); });
  // Re-measure only when the width changes: mobile browsers fire height-only
  // resizes while their toolbars collapse during scrolling, and re-measuring
  // then would make the menu indicator jump instead of slide.
  var lastWidth = window.innerWidth;
  window.addEventListener("resize", function () {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    window.requestAnimationFrame(function () { measure(); update(); });
  });

  button.addEventListener("click", function (ev) {
    ev.stopPropagation();
    setOpen(!isOpen());
  });

  function onLinkClick(ev) {
    var a = ev.target.closest ? ev.target.closest("a") : null;
    if (!a) return;
    var entry = null;
    entries.forEach(function (e) { if ((e.a === a || e.menuA === a) && e.section) entry = e; });
    if (entry) {
      // keep the clicked item highlighted while the smooth scroll runs
      lockedTo = entry;
      setActive(entry);
      window.clearTimeout(lockTimer);
      lockTimer = window.setTimeout(unlock, 1200); // fallback where scrollend is unsupported
    }
    setOpen(false);
  }
  nav.addEventListener("click", onLinkClick);
  menu.addEventListener("click", onLinkClick);

  // indicator follows the mouse (and keyboard focus) inside the open menu
  function entryForMenuTarget(el) {
    var li = el && el.closest ? el.closest(".nav-menu__item") : null;
    var found = null;
    if (li) entries.forEach(function (e) { if (e.menuLi === li) found = e; });
    return found;
  }

  function hoverTo(entry) {
    if (entry === hovered) return;
    hovered = entry;
    placeIndicator(true);
  }

  list.addEventListener("pointerover", function (ev) {
    if (ev.pointerType === "touch") return; // taps navigate straight away
    var entry = entryForMenuTarget(ev.target);
    if (entry) hoverTo(entry); // gaps between rows keep the last item
  });
  list.addEventListener("pointerleave", function (ev) {
    if (ev.pointerType === "touch") return;
    hoverTo(null);
  });
  list.addEventListener("focusin", function (ev) {
    var entry = entryForMenuTarget(ev.target);
    if (entry) hoverTo(entry);
  });
  list.addEventListener("focusout", function (ev) {
    if (!list.contains(ev.relatedTarget)) hoverTo(null);
  });

  document.addEventListener("click", function (ev) {
    if (isOpen() && !nav.contains(ev.target) && !menu.contains(ev.target)) setOpen(false);
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && isOpen()) { setOpen(false); button.focus(); }
  });

  // initial state; re-measure once web fonts have loaded
  update();
  measure();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); update(); });
})();
