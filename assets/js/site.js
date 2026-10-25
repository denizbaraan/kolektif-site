/* Kolektif — site davranışı. Önce assets/js/klinik.js yüklenir (tek kaynak).
   1) iletişim alanları  2) açık/kapalı  3) üst bar + menü
   4) bölme: harf harf başlık, kelime kelime h2
   5) hareket: belirme, şerit, yolculuk çizgisi, yatay galeri, paralaks, açılışın uzaklaşması, mıknatıs düğmeler, okuma çubuğu.
   Hareket istemeyen kullanıcıda (prefers-reduced-motion) kaydırmaya bağlı hareketler çalışmaz, her şey yerinde durur. */
(() => {
  const $ = (s, k = document) => k.querySelector(s);
  const $$ = (s, k = document) => [...k.querySelectorAll(s)];
  const sakin = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const masaustu = matchMedia("(min-width: 1001px)");
  const sinir = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

  /* 1 — iletişim alanları (uret.py bunları statik de yazar; burada güncel değer basılır) */
  if (typeof KLINIK !== "undefined") {
    const yaz = (s, f) => $$(s).forEach(f);
    yaz("[data-tel]", a => a.href = KLINIK.telLink);
    yaz("[data-tel-metin]", a => a.textContent = KLINIK.tel);
    yaz("[data-wa]", a => { a.href = "https://wa.me/" + KLINIK.whatsapp; a.target = "_blank"; a.rel = "noopener"; });
    yaz("[data-ig]", a => { a.href = "https://instagram.com/" + KLINIK.instagram; a.textContent = "@" + KLINIK.instagram; });
    yaz("[data-harita]", a => a.href = KLINIK.harita);
    yaz("[data-adres]", e => e.textContent = KLINIK.adres);
    yaz("[data-saat]", e => e.textContent = KLINIK.saatMetni);
    yaz("[data-saat-aralik]", e => e.textContent = KLINIK.saatAralik);
    yaz("[data-gun]", e => e.textContent = KLINIK.gunMetni);
    yaz("[data-ad]", e => e.textContent = KLINIK.ad);
    yaz("[data-editor]", e => e.textContent = KLINIK.editor);
    yaz("[data-guncelleme]", e => e.textContent = KLINIK.guncelleme);

    /* 2 — açık/kapalı */
    const d = klinikDurumu();
    $$("[data-durum]").forEach(el => {
      el.querySelector("span").textContent = d.metin + (el.dataset.durum ? " · " + el.dataset.durum : "");
      el.classList.toggle("acik", d.acik);
    });
  }

  /* 3 — üst bar ve menü */
  const bar = $(".bar"), cubuk = $(".alt-cubuk"), ilerleme = $(".ilerleme");
  const btn = $(".menu-ac"), menu = $("#menu");
  btn?.addEventListener("click", () => {
    const acik = menu.classList.toggle("acik");
    btn.setAttribute("aria-expanded", acik);
    bar.classList.add("dolu");
  });
  menu?.addEventListener("click", e => { if (e.target.tagName === "A") { menu.classList.remove("acik"); btn.setAttribute("aria-expanded", false); } });
  const adres = location.pathname.replace(/index\.html$/, "");
  $$(".menu a").forEach(a => { const h = new URL(a.href).pathname; if (h !== "/" && !a.hash && adres.startsWith(h)) a.setAttribute("aria-current", "page"); });

  /* 4 — bölme */
  const kac = s => s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  $$("[data-harf]").forEach(el => {                 // harf harf: okuyucu için düz metin gizli kopyada kalır
    const metin = el.textContent.trim(); let c = 0;
    const kelimeler = metin.split(" ").map(k => `<span class="harf-k">${[...k].map(h => `<span class="harf" style="--c:${c++}">${kac(h)}</span>`).join("")}</span>`);
    el.innerHTML = `<span class="gizli">${kac(metin)}</span><span aria-hidden="true">${kelimeler.join(" ")}</span>`;
  });
  $$("h2[data-r]:not([data-r='perde'])").forEach(el => {   // kelime kelime
    let w = 0;
    [...el.childNodes].forEach(n => {
      if (n.nodeType !== 3) return;
      const parca = document.createElement("span"); parca.style.display = "contents";
      parca.innerHTML = n.textContent.split(/(\s+)/).map(k => k.trim() ? `<span class="k"><span style="--w:${w++}">${kac(k)}</span></span>` : k).join("");
      n.replaceWith(parca);
    });
    el.dataset.r = "kelime";
  });
  $$("[data-sira]").forEach(k => [...k.children].forEach((c, i) => { c.setAttribute("data-r", c.getAttribute("data-r") || ""); c.style.setProperty("--i", i % 6); }));

  /* 5a — belirme */
  if (sakin || !("IntersectionObserver" in window)) $$("[data-r]").forEach(e => e.classList.add("gor"));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("gor"); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    $$("[data-r]").forEach(e => io.observe(e));
  }

  /* 5b — şerit: kendi hızında akar, kaydırma hızıyla hızlanır */
  const seritler = $$(".serit-ic").map(el => { el.innerHTML += el.innerHTML; return { el, x: 0 }; });
  let hiz = 0, onceki = scrollY;
  if (!sakin && seritler.length) {
    const ak = () => {
      const fark = scrollY - onceki; onceki = scrollY;
      hiz += (Math.min(Math.abs(fark), 80) * .06 - hiz) * .1;
      seritler.forEach(s => {
        const w = s.el.scrollWidth / 2;
        s.x -= .45 + hiz * 2.4;
        if (s.x <= -w) s.x += w;
        s.el.style.transform = `translate3d(${s.x}px,0,0)`;
      });
      requestAnimationFrame(ak);
    };
    requestAnimationFrame(ak);
  }

  /* 5c — yatay galeri (yalnız masaüstü) */
  const galeri = $(".galeri"), ray = galeri && $(".galeri-ray", galeri);
  let fazla = 0;
  const galeriOlc = () => {
    if (!galeri) return;
    const yatay = masaustu.matches && !sakin;
    galeri.classList.toggle("yatay", yatay);
    if (!yatay) { galeri.style.height = ""; ray.style.transform = ""; return; }
    fazla = Math.max(0, ray.scrollWidth - innerWidth);
    galeri.style.height = innerHeight + fazla + "px";
  };
  galeriOlc(); addEventListener("resize", () => { galeriOlc(); hareket(); }); masaustu.addEventListener?.("change", galeriOlc);

  /* 5d — mıknatıs düğmeler (fare kullananlarda) */
  if (!sakin && matchMedia("(pointer: fine)").matches) $$(".miknatis").forEach(b => {
    b.addEventListener("mousemove", e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
    });
    b.addEventListener("mouseleave", () => b.style.transform = "");
  });

  /* 5e — kaydırmaya bağlı her şey tek karede */
  const yol = $(".yol");
  const paralaks = $$("[data-paralaks]"), kacan = $("[data-kac]");
  const basliklar = $$(".metin h2[id]"), toc = $$(".icindekiler a");
  let son = scrollY, kare = false;

  function hareket() {
    const y = scrollY, h = innerHeight;
    if (yol) {
      const r = yol.getBoundingClientRect();
      yol.style.setProperty("--p", sinir((h * .62 - r.top) / r.height));
    }
    if (galeri?.classList.contains("yatay")) {
      const r = galeri.getBoundingClientRect(), p = sinir(-r.top / (r.height - h));
      ray.style.transform = `translate3d(${-p * fazla}px,0,0)`;
      $$("img", ray).forEach((im, k) => im.style.transform = `translate3d(${(p - .5) * 40 - k * 2}px,0,0)`);
    }
    paralaks.forEach(e => {
      const r = e.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > h) return;
      e.style.transform = `translate3d(0,${((r.top + r.height / 2 - h / 2) / h) * parseFloat(e.dataset.paralaks) * -100}px,0)`;
    });
    if (kacan && y < h * 1.2) {
      kacan.style.transform = `translate3d(0,${y * .18}px,0)`;
      kacan.style.opacity = sinir(1 - y / (h * .95));
    }
    if (toc.length) {
      let a = 0; basliklar.forEach((b, k) => { if (b.getBoundingClientRect().top < 160) a = k; });
      toc.forEach((t, k) => t.classList.toggle("yan", k === a));
    }
  }

  const kaydir = () => {
    kare = false;
    const y = scrollY, asagi = y > son + 4, yukari = y < son - 4;
    bar.classList.toggle("dolu", y > 40);
    if (!menu?.classList.contains("acik")) {
      if (asagi && y > 400) bar.classList.add("sakla");
      else if (yukari || y < 400) bar.classList.remove("sakla");
    }
    if (cubuk) cubuk.classList.toggle("gor", y > innerHeight * .7 && (innerHeight + y) < document.body.scrollHeight - 320);
    if (ilerleme) {
      const r = $(".metin").getBoundingClientRect();
      ilerleme.style.transform = `scaleX(${sinir(-r.top / (r.height - innerHeight * .6))})`;
    }
    son = y;
    if (!sakin) hareket();
  };
  addEventListener("scroll", () => { if (!kare) { kare = true; requestAnimationFrame(kaydir); } }, { passive: true });
  kaydir();
})();
