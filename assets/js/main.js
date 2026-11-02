/* Blush Hues — shared interactions */
(function () {
  "use strict";

  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");

  /* nav background on scroll */
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  if (burger) {
    burger.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("locked", open);
    });
    document.querySelectorAll(".mobile-menu a").forEach((a) =>
      a.addEventListener("click", () => {
        document.body.classList.remove("menu-open", "locked");
        burger.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* year */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* reveal on scroll */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* card spotlight + tilt */
  const canHover = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (canHover) {
    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("mousemove", (ev) => {
        const r = card.getBoundingClientRect();
        const x = ev.clientX - r.left;
        const y = ev.clientY - r.top;
        card.style.setProperty("--mx", x + "px");
        card.style.setProperty("--my", y + "px");
        const rx = ((y / r.height) - 0.5) * -6;
        const ry = ((x / r.width) - 0.5) * 6;
        card.style.transform = `translateY(-8px) perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });

    /* hero collage parallax */
    const collage = document.getElementById("collage");
    const hero = document.querySelector(".hero");
    if (collage && hero) {
      hero.addEventListener("mousemove", (ev) => {
        const x = (ev.clientX / window.innerWidth - 0.5) * 2;
        const y = (ev.clientY / window.innerHeight - 0.5) * 2;
        collage.style.transform = `rotateY(${x * 5}deg) rotateX(${y * -4}deg) translateZ(0)`;
      });
      hero.addEventListener("mouseleave", () => {
        collage.style.transform = "";
      });
    }
  }

  /* ---------------- Lightbox ---------------- */
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    const img = lightbox.querySelector("img");
    const count = lightbox.querySelector(".lb-count");
    const items = Array.from(document.querySelectorAll("[data-lightbox]"));
    let index = 0;

    const show = (i) => {
      index = (i + items.length) % items.length;
      const el = items[index];
      const full = el.getAttribute("data-full") || el.querySelector("img").src;
      img.src = full;
      img.alt = el.querySelector("img") ? el.querySelector("img").alt : "";
      if (count) count.textContent = `${index + 1} / ${items.length}`;
      lightbox.classList.add("open");
      document.body.classList.add("locked");
    };
    const close = () => {
      lightbox.classList.remove("open");
      document.body.classList.remove("locked");
    };

    items.forEach((el, i) =>
      el.addEventListener("click", (ev) => {
        ev.preventDefault();
        show(i);
      })
    );
    lightbox.querySelector(".lb-close").addEventListener("click", close);
    lightbox.querySelector(".lb-prev").addEventListener("click", () => show(index - 1));
    lightbox.querySelector(".lb-next").addEventListener("click", () => show(index + 1));
    lightbox.addEventListener("click", (ev) => {
      if (ev.target === lightbox) close();
    });
    document.addEventListener("keydown", (ev) => {
      if (!lightbox.classList.contains("open")) return;
      if (ev.key === "Escape") close();
      if (ev.key === "ArrowLeft") show(index - 1);
      if (ev.key === "ArrowRight") show(index + 1);
    });
  }

  /* ---------------- Demo forms ---------------- */
  document.querySelectorAll("form[data-demo]").forEach((form) => {
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      if (!form.reportValidity()) return;
      const success = form.parentElement.querySelector(".form-success");
      form.style.display = "none";
      if (success) {
        success.classList.add("show");
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });
})();
