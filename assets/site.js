/* Northeast Diamonds Baseball — page behaviour. No dependencies.
   Everything degrades to a fully readable page. */
(function () {
  "use strict";

  /* ---- Always land at the top of a new page ----
     Browsers (and the artifact viewer) will otherwise restore the previous
     scroll position, so a click on "Tryout Form" can open halfway down. */
  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}

  function toTop() {
    if (window.location.hash) return;          /* an #anchor link is deliberate */
    window.scrollTo(0, 0);
  }
  toTop();
  window.addEventListener("pageshow", toTop);

  var root = document.documentElement;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduced) root.classList.add("js");

  /* ---- Sticky header state ---- */
  function header() {
    var h = document.querySelector(".hdr");
    if (!h) return;
    var on = false;
    function tick() {
      var want = window.scrollY > 24;
      if (want !== on) { on = want; h.classList.toggle("solid", on); }
    }
    tick();
    window.addEventListener("scroll", tick, { passive: true });
  }

  /* ---- Reveal on scroll ---- */
  function revealAll() {
    var all = document.querySelectorAll("[data-rv]");
    for (var i = 0; i < all.length; i++) all[i].classList.add("in");
  }

  function reveals() {
    var items = document.querySelectorAll("[data-rv]");
    if (!items.length) return;
    if (reduced || !("IntersectionObserver" in window)) { revealAll(); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -7% 0px", threshold: 0.06 });

    for (var i = 0; i < items.length; i++) io.observe(items[i]);
    setTimeout(revealAll, 4000);
  }

  /* ---- Count the record band up once it is on screen ---- */
  function counters() {
    var els = document.querySelectorAll("[data-count]");
    if (!els.length) return;
    if (reduced || !("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target;
        var to = parseInt(el.getAttribute("data-count"), 10);
        if (isNaN(to)) return;
        var t0 = null, dur = 1100;
        function step(t) {
          if (t0 === null) t0 = t;
          var p = Math.min((t - t0) / dur, 1);
          el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        }
        el.textContent = "0";
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });

    for (var i = 0; i < els.length; i++) io.observe(els[i]);
  }

  /* ---- Mobile drawer ---- */
  function drawer() {
    var burger = document.getElementById("burger");
    var panel = document.getElementById("mnav");
    if (!burger || !panel) return;

    function set(open) {
      panel.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
      if (open) { var a = panel.querySelector("a"); if (a) a.focus({ preventScroll: true }); }
      else burger.focus({ preventScroll: true });
    }

    burger.addEventListener("click", function () { set(!panel.classList.contains("open")); });
    panel.addEventListener("click", function (e) { if (e.target.tagName === "A") set(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("open")) set(false);
    });
  }

  /* ---- Hero video ---- */
  function hero() {
    var v = document.querySelector(".hero-media video");
    if (!v) return;
    v.muted = true;
    v.setAttribute("playsinline", "");
    var go = v.play();
    if (go && go.catch) go.catch(function () { /* autoplay refused; the poster stays */ });
  }

  function init() { toTop(); header(); drawer(); hero(); reveals(); counters(); }
  window.addEventListener("load", toTop);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
