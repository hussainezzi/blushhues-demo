/* Blush Hues — gallery: category filters, masonry, lightbox */
(function () {
  "use strict";

  const grid = document.getElementById("galleryGrid");
  const filters = document.getElementById("filters");
  const intro = document.getElementById("galleryIntro");
  if (!grid || !filters) return;

  const DESCRIPTIONS = {
    all: "A little of everything — weddings, misaaq, birthdays and baby showers.",
    wedding: "Soft florals, candlelight and tables set for the people you love.",
    misaaq: "An intimate nikkah — blush, gold and quiet detail.",
    birthday: "Balloons, backdrops and cake-table styling for the big day.",
    "baby-showers": "Pastel welcomes for the smallest guest of honour.",
  };

  let data = [];
  let active = "all";
  let lbIndex = 0;
  let lbList = [];

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
    const p = lbList[lbIndex];
    lbImg.src = p.src;
    lbImg.alt = `${p.category} — Blush Hues event decor`;
    lbCat.textContent = p.category;
    lbNum.textContent = `${lbIndex + 1} / ${lbList.length}`;
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("locked");
  }

  function close() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("locked");
  }

  function move(d) {
    if (!lbList.length) return;
    lbIndex = (lbIndex + d + lbList.length) % lbList.length;
    const p = lbList[lbIndex];
    lbImg.src = p.src;
    lbImg.alt = `${p.category} — Blush Hues event decor`;
    lbCat.textContent = p.category;
    lbNum.textContent = `${lbIndex + 1} / ${lbList.length}`;
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

  function render() {
    grid.innerHTML = data.map((p, i) => `
      <figure class="m-item" data-cat="${p.cat}" data-i="${i}" style="animation-delay:${Math.min(i * 35, 420)}ms">
        <img src="${p.thumb}" alt="${p.category} — Blush Hues event decor" loading="lazy" decoding="async" width="${p.w}" height="${p.h}">
        <figcaption class="m-cap"><b>${p.category}</b><i>View</i></figcaption>
      </figure>`).join("");
    grid.querySelectorAll(".m-item").forEach((el) => {
      el.addEventListener("click", () => {
        const visible = [...grid.querySelectorAll(".m-item")].filter((x) => !x.hidden);
        open(visible.indexOf(el));
      });
    });
  }

  function apply(cat) {
    active = cat;
    filters.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-active", c.dataset.cat === cat));
    grid.querySelectorAll(".m-item").forEach((el) => {
      el.hidden = cat !== "all" && el.dataset.cat !== cat;
    });
    intro.textContent = DESCRIPTIONS[cat] || "";
    window.scrollTo({ top: Math.min(window.scrollY, filters.offsetTop - 90), behavior: "smooth" });
  }

  function chips() {
    const counts = {};
    data.forEach((p) => { counts[p.cat] = (counts[p.cat] || 0) + 1; });
    const cats = [{ id: "all", name: "All" }, ...Object.keys(counts).map((id) => ({ id, name: data.find((p) => p.cat === id).category }))];
    filters.innerHTML = cats.map((c) => `
      <button class="chip ${c.id === active ? "is-active" : ""}" data-cat="${c.id}">
        ${c.name}<span>${c.id === "all" ? data.length : counts[c.id]}</span>
      </button>`).join("");
    filters.querySelectorAll(".chip").forEach((b) => b.addEventListener("click", () => apply(b.dataset.cat)));
  }

  fetch("assets/img/gallery.json")
    .then((r) => { if (!r.ok) throw new Error("gallery data missing"); return r.json(); })
    .then((json) => {
      data = json.photos || [];
      chips();
      render();
      intro.textContent = DESCRIPTIONS.all;
    })
    .catch((e) => {
      intro.textContent = "Gallery is loading — please refresh.";
      console.error(e);
    });
})();
