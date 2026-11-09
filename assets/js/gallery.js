/* Blush Hues — the lookbook: editorial index, masonry, cursor preview, lightbox */
(function () {
  "use strict";

  const grid = document.getElementById("galleryGrid");
  const filters = document.getElementById("filters");
  const peek = document.getElementById("peek");
  const peekImg = peek ? peek.querySelector("img") : null;
  if (!grid || !filters) return;

  const INTRO = {
    all: "Choose a chapter — or wander through all of it.",
    wedding: "Soft florals, candlelight and tables set for the people you love.",
    misaaq: "An intimate nikkah — blush, gold and quiet detail.",
    birthday: "Balloons, backdrops and cake-table styling for the big day.",
    "baby-showers": "Pastel welcomes for the smallest guest of honour.",
  };

  let data = [];
  let active = "all";
  let lbList = [];
  let lbIndex = 0;

  const lb = document.createElement("div");
  lb.className = "lb";
  lb.setAttribute("aria-hidden", "true");
  lb.innerHTML = `
    <button class="lb-btn lb-close" aria-label="Close">✕</button>
    <button class="lb-btn lb-prev" aria-label="Previous photo">‹</button>
    <figure><img alt=""><figcaption><span class="lb-cat"></span><span class="lb-num"></span></figcaption></figure>
    <button class="lb-btn lb-next" aria-label="Next photo">›</button>`;
  document.body.appendChild(lb);
  const lbImg = lb.querySelector("img");
  const lbCat = lb.querySelector(".lb-cat");
  const lbNum = lb.querySelector(".lb-num");

  function open(i) {
    lbList = data.filter((p) => active === "all" || p.cat === active);
    if (!lbList.length) return;
    lbIndex = (i + lbList.length) % lbList.length;
    paint();
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("locked");
  }

  function paint() {
    const p = lbList[lbIndex];
    lbImg.src = p.src;
    lbImg.alt = `${p.category} — Blush Hues event decor`;
    lbCat.textContent = p.category;
    lbNum.textContent = `${lbIndex + 1} / ${lbList.length}`;
  }

  function close() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("locked");
  }

  function move(d) {
    if (!lbList.length) return;
    lbIndex = (lbIndex + d + lbList.length) % lbList.length;
    paint();
  }

  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", () => move(-1));
  lb.querySelector(".lb-next").addEventListener("click", () => move(1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") move(-1);
    if (e.key === "ArrowRight") move(1);
  });

  let touchX = null;
  lb.addEventListener("touchstart", (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) move(dx > 0 ? -1 : 1);
    touchX = null;
  }, { passive: true });

  function renderGrid() {
    grid.innerHTML = data.map((p, i) => `
      <figure class="m-item enter" data-cat="${p.cat}" data-i="${i}" style="animation-delay:${Math.min(i * 28, 380)}ms">
        <img src="${p.thumb}" alt="${p.category} — Blush Hues event decor" loading="lazy" decoding="async" width="${p.w}" height="${p.h}">
        <figcaption class="m-cap"><b>${p.category}</b><i>View</i></figcaption>
      </figure>`).join("");
    grid.querySelectorAll(".m-item").forEach((el) => {
      el.addEventListener("click", () => {
        const visible = [...grid.querySelectorAll(".m-item")].filter((x) => !x.classList.contains("is-hidden"));
        open(visible.indexOf(el));
      });
    });
  }

  function renderIndex() {
    const counts = {};
    data.forEach((p) => { counts[p.cat] = (counts[p.cat] || 0) + 1; });
    const cats = [{ id: "all", name: "All work", count: data.length, cover: data[0] }];
    Object.keys(counts).forEach((id) => {
      cats.push({ id, name: data.find((p) => p.cat === id).category, count: counts[id], cover: data.find((p) => p.cat === id) });
    });
    filters.innerHTML = cats.map((c, i) => `
      <button class="idx ${c.id === active ? "is-active" : ""}" data-cat="${c.id}" data-cover="${c.cover ? c.cover.thumb : ""}">
        <img class="idx__img" src="${c.cover ? c.cover.thumb : ""}" alt="" loading="lazy">
        <span class="idx__num">0${i + 1}</span>
        <span class="idx__name">${c.name}</span>
        <span class="idx__count">${c.count}</span>
        <span class="idx__line"></span>
      </button>`).join("");

    filters.querySelectorAll(".idx").forEach((b) => {
      b.addEventListener("click", () => apply(b.dataset.cat));
      if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
        b.addEventListener("mouseenter", () => {
          if (!peek || !peekImg) return;
          peekImg.src = b.dataset.cover;
          peek.classList.add("on");
        });
        b.addEventListener("mousemove", (e) => {
          if (!peek) return;
          const pad = 130;
          const x = Math.min(window.innerWidth - 100, e.clientX + pad);
          const y = Math.min(window.innerHeight - 130, Math.max(130, e.clientY));
          peek.style.left = x + "px";
          peek.style.top = y + "px";
        });
        b.addEventListener("mouseleave", () => peek && peek.classList.remove("on"));
      }
    });
  }

  function apply(cat) {
    active = cat;
    filters.querySelectorAll(".idx").forEach((b) => b.classList.toggle("is-active", b.dataset.cat === cat));
    let shown = 0;
    grid.querySelectorAll(".m-item").forEach((el) => {
      const hide = cat !== "all" && el.dataset.cat !== cat;
      el.classList.toggle("is-hidden", hide);
      if (!hide) {
        shown++;
        el.classList.remove("enter");
        void el.offsetWidth;
        el.style.animationDelay = Math.min(shown * 18, 260) + "ms";
        el.classList.add("enter");
      }
    });
    const lede = document.getElementById("lookbookLede");
    if (lede) lede.textContent = INTRO[cat] || INTRO.all;
    if (peek) peek.classList.remove("on");
    const y = filters.getBoundingClientRect().top + window.scrollY - 96;
    if (window.scrollY > y) window.scrollTo({ top: y, behavior: "smooth" });
  }

  fetch("assets/img/gallery.json")
    .then((r) => { if (!r.ok) throw new Error("gallery data missing"); return r.json(); })
    .then((json) => {
      data = json.photos || [];
      renderIndex();
      renderGrid();
    })
    .catch((e) => {
      const lede = document.getElementById("lookbookLede");
      if (lede) lede.textContent = "The lookbook is loading — please refresh.";
      console.error(e);
    });
})();
