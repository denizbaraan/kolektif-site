/* Kolektif uygulaması. Sunucu yok; bütün veri bu cihazın localStorage'ında. */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ── depolama (gizli pencerede ya da kapalıyken sessizce boş döner) ── */
const depo = {
  oku(k, v) { try { const x = localStorage.getItem("kolektif." + k); return x ? JSON.parse(x) : v; } catch { return v; } },
  yaz(k, v) { try { localStorage.setItem("kolektif." + k, JSON.stringify(v)); } catch {} },
  sil(k) { try { localStorage.removeItem("kolektif." + k); } catch {} },
};

const iki = n => String(n).padStart(2, "0");
const saatYaz = d => `${iki(d.getHours())}.${iki(d.getMinutes())}`;
function gunYaz(d, simdi = new Date()) {
  const a = new Date(simdi); a.setHours(0, 0, 0, 0);
  const b = new Date(d); b.setHours(0, 0, 0, 0);
  const fark = Math.round((b - a) / 864e5);
  if (fark === 0) return "Bugün";
  if (fark === 1) return "Yarın";
  if (fark === -1) return "Dün";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });
}
function bildir(m) {
  const b = $("#bildirim"); b.textContent = m; b.classList.add("goster");
  clearTimeout(bildir.t); bildir.t = setTimeout(() => b.classList.remove("goster"), 2400);
}

/* ── ortak alanlar ── */
$$("[data-tel]").forEach(a => a.href = KLINIK.telLink);
$$("[data-tel-metin]").forEach(a => a.textContent = KLINIK.tel);
$$("[data-wa]").forEach(a => { a.href = "https://wa.me/" + KLINIK.whatsapp; a.target = "_blank"; a.rel = "noopener"; });
$$("[data-harita]").forEach(a => { a.href = KLINIK.harita; a.target = "_blank"; a.rel = "noopener"; });
$$("[data-adres]").forEach(e => e.textContent = KLINIK.adres);
$$("[data-saat]").forEach(e => e.textContent = KLINIK.saatMetni);
$$("[data-ad]").forEach(e => e.textContent = KLINIK.ad);
$$("[data-editor]").forEach(e => e.textContent = KLINIK.editor);
$$("[data-guncelleme]").forEach(e => e.textContent = KLINIK.guncelleme);

/* ── gezinme ── */
let sekme = "bugun";
function git(id, { gecmis = true } = {}) {
  $$(".ekran").forEach(e => e.classList.toggle("aktif", e.id === id));
  const ana = id === "detay" ? "bakim" : id;
  $$("nav.sekme button").forEach(b => b.setAttribute("aria-selected", b.dataset.sekme === ana));
  $("#ust").classList.toggle("alt-sayfa", id === "detay");
  sekme = id;
  window.scrollTo(0, 0);
  if (gecmis) history.pushState({ id }, "", id === "bugun" ? "#" : "#" + id);
  if (id === "bugun") cizBugun();
}
$$("nav.sekme button").forEach(b => b.addEventListener("click", () => git(b.dataset.sekme)));
$$("[data-git]").forEach(b => b.addEventListener("click", () => {
  git(b.dataset.git);
  if (b.hasAttribute("data-acil")) setTimeout(() => $("#acilBaslik").scrollIntoView({ behavior: "smooth" }), 50);
}));
$("#geri").addEventListener("click", () => history.length > 1 ? history.back() : git("bakim"));
addEventListener("popstate", e => {
  const h = location.hash.slice(1);
  if (h.startsWith("talimat-")) return acTalimat(h.slice(8), { gecmis: false });
  git(e.state?.id || h || "bugun", { gecmis: false });
});
addEventListener("scroll", () => $("#ust").classList.toggle("golge", scrollY > 4), { passive: true });

/* ── BUGÜN ── */
function cizBugun() {
  const d = klinikDurumu(), el = $("#durum");
  el.querySelector("span").textContent = d.metin;
  el.classList.toggle("acik", d.acik);
  const s = new Date().getHours();
  $("#selam").textContent = s < 6 ? "İyi geceler." : s < 12 ? "Günaydın." : s < 18 ? "İyi günler." : "İyi akşamlar.";

  // aktif talimat
  const ak = depo.oku("aktif", null), kutu = $("#aktifTalimat");
  const t = ak && TALIMATLAR.find(x => x.id === ak.id);
  if (t) {
    const bas = new Date(ak.t), simdi = Date.now();
    const sonraki = t.zaman.find(z => bas.getTime() + z.dk * 6e4 > simdi);
    const son = t.zaman[t.zaman.length - 1];
    if (simdi - bas.getTime() > (son.dk + 1440) * 6e4) { depo.sil("aktif"); kutu.innerHTML = ""; }
    else {
      const z = sonraki || son, zt = new Date(bas.getTime() + z.dk * 6e4);
      kutu.innerHTML = `<h2>Tedavi sonrası</h2>
        <button class="kart koyu dokunur" id="aktifAc"><span>
          <span class="etiket">${esc(t.ad)} · ${saatYaz(bas)}</span>
          <span class="buyuk" style="display:block">${sonraki ? `${gunYaz(zt) === "Bugün" ? "" : gunYaz(zt) + " "}${saatYaz(zt)} — ` : ""}${esc(z.baslik)}</span>
          <span class="aciklama">${esc(z.metin)}</span></span></button>`;
      $("#aktifAc").onclick = () => acTalimat(t.id);
    }
  } else kutu.innerHTML = "";

  // sıradaki randevu
  const r = gelecekRandevular()[0];
  $("#siradaki").innerHTML = r
    ? `<div class="kart"><span class="etiket">${esc(gunYaz(r.tarih))}</span><div class="buyuk">${saatYaz(r.tarih)}</div><p class="aciklama">${esc(r.ne || "Randevu")} · ${esc(KLINIK.kisaAd)}</p></div>`
    : `<button class="kart dokunur" data-yeni-randevu><span><h3>Kayıtlı randevunuz yok</h3><span class="aciklama">Randevu talep edin ya da kliniğin verdiği saati ekleyin.</span></span></button>`;
  const y = $("[data-yeni-randevu]"); if (y) y.onclick = () => git("randevu");
}

/* ── RANDEVU: talep ── */
$$(".cipler").forEach(grup => grup.addEventListener("click", e => {
  const c = e.target.closest(".cip"); if (!c) return;
  if (grup.dataset.tek) grup.querySelectorAll(".cip").forEach(x => x.setAttribute("aria-pressed", x === c));
  else c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") !== "true");
}));
$$(".cip").forEach(c => c.addEventListener("keydown", e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); c.click(); } }));
const secili = ad => $$(`[data-${ad}] .cip[aria-pressed="true"]`).map(c => c.textContent);

$("#tAd").value = depo.oku("ad", "");
$("#talepForm").addEventListener("submit", e => {
  e.preventDefault();
  const ad = $("#tAd").value.trim();
  depo.yaz("ad", ad);
  const satirlar = [
    "Merhaba, randevu almak istiyorum.",
    "",
    `Ad soyad: ${ad}`,
    `Konu: ${secili("tek=konu")[0] || "İlk muayene"}`,
  ];
  const gun = secili("coklu=gun"), saat = secili("coklu=saat");
  if (gun.length) satirlar.push(`Uygun günler: ${gun.join(", ")}`);
  if (saat.length) satirlar.push(`Uygun saat: ${saat.join(", ")}`);
  const not = $("#tNot").value.trim(); if (not) satirlar.push(`Not: ${not}`);
  satirlar.push("", "(Kolektif uygulamasından gönderildi)");
  window.open(`https://wa.me/${KLINIK.whatsapp}?text=${encodeURIComponent(satirlar.join("\n"))}`, "_blank", "noopener");
});

/* ── RANDEVU: kayıtlı randevular ── */
const randevular = () => depo.oku("randevular", []).map(r => ({ ...r, tarih: new Date(r.t) }));
const gelecekRandevular = () => randevular().filter(r => r.tarih.getTime() > Date.now() - 36e5).sort((a, b) => a.tarih - b.tarih);

function cizRandevular() {
  const liste = gelecekRandevular(), kutu = $("#randevuListe");
  if (!liste.length) { kutu.innerHTML = `<p class="bos-durum">Kayıtlı randevu yok.</p>`; return; }
  kutu.innerHTML = liste.map(r => `<div class="kart"><div class="randevu-satir">
      <div><div class="tarih">${esc(gunYaz(r.tarih))} · ${saatYaz(r.tarih)}</div><div class="aciklama">${esc(r.ne || "Randevu")}</div></div>
      <div style="text-align:right"><button class="mini" data-ics="${r.t}">Takvime ekle</button><br><button class="mini" data-sil="${r.t}">Sil</button></div>
    </div></div>`).join("");
}
$("#randevuListe").addEventListener("click", e => {
  const s = e.target.dataset.sil, i = e.target.dataset.ics;
  if (s) { depo.yaz("randevular", depo.oku("randevular", []).filter(r => r.t !== s)); cizRandevular(); bildir("Randevu silindi."); }
  if (i) { const r = randevular().find(x => x.t === i); if (r) icsIndir(r); }
});
$("#randevuForm").addEventListener("submit", e => {
  e.preventDefault();
  const t = new Date(`${$("#rTarih").value}T${$("#rSaat").value}`);
  if (isNaN(t)) return;
  const l = depo.oku("randevular", []);
  l.push({ t: t.toISOString(), ne: $("#rNe").value.trim() });
  depo.yaz("randevular", l);
  e.target.reset(); $("#randevuEkleKutu").open = false;
  cizRandevular(); bildir("Randevu kaydedildi.");
});

function icsIndir(r) {
  const utc = d => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const bas = r.tarih, bit = new Date(bas.getTime() + 45 * 6e4);
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Kolektif//Uygulama//TR", "BEGIN:VEVENT",
    `UID:${utc(bas)}@kolektifdentalclinics.com`, `DTSTAMP:${utc(new Date())}`,
    `DTSTART:${utc(bas)}`, `DTEND:${utc(bit)}`,
    `SUMMARY:Kolektif · ${(r.ne || "Diş hekimi randevusu").replace(/[,;]/g, " ")}`,
    `LOCATION:${KLINIK.adres.replace(/,/g, "\\,")}`,
    `DESCRIPTION:${KLINIK.ad} · ${KLINIK.tel}`,
    "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", "DESCRIPTION:Kolektif randevunuz", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = "kolektif-randevu.ics"; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/* ── BAKIM ── */
$("#islemListe").innerHTML = TALIMATLAR.map(t =>
  `<button class="kart dokunur" data-islem="${t.id}"><span><h3>${esc(t.ad)}</h3><span class="aciklama">${esc(t.ozet)}</span></span></button>`).join("");
$("#islemListe").addEventListener("click", e => { const b = e.target.closest("[data-islem]"); if (b) acTalimat(b.dataset.islem); });

$("#acilListe").innerHTML = ACIL.map(a => `<details class="kart uyari"><summary style="cursor:pointer;list-style:none"><h3>${esc(a.ad)}</h3></summary>
  <ol class="liste kirmizi" style="margin-top:8px">${a.adimlar.map(x => `<li>${esc(x)}</li>`).join("")}</ol>
  ${a.not ? `<p class="not"><b>${esc(a.not)}</b></p>` : ""}
  <div class="dugmeler"><a class="dugme" href="${KLINIK.telLink}">Kliniği arayın</a></div></details>`).join("");

const liste = (baslik, maddeler, tur) => maddeler?.length
  ? `<h2>${baslik}</h2><div class="kart${tur === "kirmizi" ? " uyari" : ""}"><ul class="liste ${tur}">${maddeler.map(m => `<li>${esc(m)}</li>`).join("")}</ul></div>` : "";

function acTalimat(id, { gecmis = true } = {}) {
  const t = TALIMATLAR.find(x => x.id === id); if (!t) return git("bakim");
  const ak = depo.oku("aktif", null), aktif = ak && ak.id === id ? new Date(ak.t) : null;
  const simdi = Date.now();
  let simdiIsaret = false;
  const cizelge = t.zaman.map(z => {
    let sinif = "", saat = z.dk === 0 ? "Hemen" : sureYaz(z.dk) + " sonra";
    if (aktif) {
      const zt = new Date(aktif.getTime() + z.dk * 6e4);
      saat = `${gunYaz(zt) === "Bugün" ? "" : gunYaz(zt) + " · "}${saatYaz(zt)}`;
      if (zt.getTime() <= simdi) sinif = "gecti";
      else if (!simdiIsaret) { sinif = "simdi"; simdiIsaret = true; }
    }
    return `<li class="${sinif}"><span class="saat">${saat}</span><h3>${esc(z.baslik)}</h3><p>${esc(z.metin)}</p></li>`;
  }).join("");

  $("#detay").innerHTML = `
    <span class="etiket">Tedavi sonrası</span>
    <h1>${esc(t.ad)}</h1>
    <p class="aciklama">${esc(t.ozet)}</p>
    <div class="kart ${aktif ? "koyu" : ""}" style="margin-top:16px">
      ${aktif
        ? `<span class="etiket">İşlem bitişi</span><div class="buyuk">${gunYaz(aktif)} · ${saatYaz(aktif)}</div>
           <div class="dugmeler"><button class="dugme acik" id="tBitir">Takibi bitir</button></div>`
        : `<h3>İşleminiz ne zaman bitti?</h3>
           <p class="aciklama">Saati girin; aşağıdaki adımlar gerçek saatleriyle görünsün.</p>
           <div class="iki" style="margin-top:4px"><div><label for="tBasT">Tarih</label><input type="date" id="tBasT"></div><div><label for="tBasS">Saat</label><input type="time" id="tBasS"></div></div>
           <div class="dugmeler"><button class="dugme" id="tBasla">Takibi başlat</button></div>`}
    </div>
    <h2>Zaman çizelgesi</h2>
    <div class="kart"><ol class="cizelge">${cizelge}</ol></div>
    ${liste("Yapın", t.yapin, "evet")}
    ${liste("Yapmayın", t.yapmayin, "hayir")}
    ${liste("Normal sayılır", t.normal, "")}
    ${liste("Hemen arayın", t.arayin, "kirmizi")}
    <div class="dugmeler"><a class="dugme" href="${KLINIK.telLink}">Kliniği arayın · ${esc(KLINIK.tel)}</a></div>
    <p class="not">Nefes almakta ya da yutkunmakta güçlük, hızla büyüyen şişlik varsa 112'yi arayın.<br>Bu bilgiler geneldir; hekiminizin size verdiği yazılı talimat önceliklidir.</p>`;

  if (!aktif) {
    const n = new Date();
    $("#tBasT").value = `${n.getFullYear()}-${iki(n.getMonth() + 1)}-${iki(n.getDate())}`;
    $("#tBasS").value = `${iki(n.getHours())}:${iki(n.getMinutes())}`;
    $("#tBasla").onclick = () => {
      const b = new Date(`${$("#tBasT").value}T${$("#tBasS").value}`);
      if (isNaN(b)) return bildir("Tarih ve saati kontrol edin.");
      depo.yaz("aktif", { id, t: b.toISOString() });
      acTalimat(id, { gecmis: false }); bildir("Takip başladı. Ana ekranda da görünür.");
    };
  } else {
    $("#tBitir").onclick = () => { depo.sil("aktif"); acTalimat(id, { gecmis: false }); bildir("Takip bitirildi."); };
  }
  $("#geri").textContent = "‹ Bakım";
  if (gecmis) history.pushState({ id: "detay" }, "", "#talimat-" + id);
  $$(".ekran").forEach(e => e.classList.toggle("aktif", e.id === "detay"));
  $$("nav.sekme button").forEach(b => b.setAttribute("aria-selected", b.dataset.sekme === "bakim"));
  $("#ust").classList.add("alt-sayfa");
  sekme = "detay";
  window.scrollTo(0, 0);
}
function sureYaz(dk) {
  if (dk < 60) return `${dk} dakika`;
  if (dk < 1440) { const s = dk / 60; return `${Number.isInteger(s) ? s : s.toFixed(1).replace(".", ",")} saat`; }
  return `${Math.round(dk / 1440)} gün`;
}

/* ── FIRÇALAMA ── */
const F = { toplam: 120, kalan: 120, zamanlayici: null, sira: [0, 1, 3, 2] };
const yay = $("#fircaYay"), CEVRE = 282.74;
function fircaCiz() {
  const gecen = F.toplam - F.kalan;
  $("#fircaSayi").textContent = `${Math.floor(F.kalan / 60)}:${iki(F.kalan % 60)}`;
  yay.style.strokeDashoffset = CEVRE * (1 - gecen / F.toplam);
  const bolum = Math.min(3, Math.floor(gecen / 30)), spans = $$("#bolgeler span");
  spans.forEach(s => s.className = "");
  F.sira.forEach((idx, i) => { if (i < bolum || F.kalan === 0) spans[idx].className = "bitti"; else if (i === bolum && F.zamanlayici) spans[idx].className = "aktif"; });
}
function fircaDur() { clearInterval(F.zamanlayici); F.zamanlayici = null; }
$("#fircaAc").onclick = () => { $("#firca").classList.add("acik"); fircaCiz(); };
$("#fircaKapat").onclick = () => { fircaDur(); F.kalan = F.toplam; $("#fircaBasla").textContent = "Başla"; $("#firca").classList.remove("acik"); };
$("#fircaBasla").onclick = () => {
  if (F.zamanlayici) { fircaDur(); $("#fircaBasla").textContent = "Devam"; fircaCiz(); return; }
  if (F.kalan === 0) F.kalan = F.toplam;
  $("#fircaBasla").textContent = "Duraklat";
  F.zamanlayici = setInterval(() => {
    F.kalan--;
    if (F.kalan % 30 === 0 && navigator.vibrate) navigator.vibrate(F.kalan === 0 ? [200, 100, 200] : 120);
    if (F.kalan <= 0) { F.kalan = 0; fircaDur(); $("#fircaBasla").textContent = "Yeniden"; bildir("Tamam. Tükürün, çalkalamayın."); }
    fircaCiz();
  }, 1000);
  fircaCiz();
};

/* ── ana ekrana ekleme ── */
let kurIstem = null;
const kurulu = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
function cizKurulum() {
  const k = $("#kurulum");
  if (kurulu) { k.innerHTML = ""; return; }
  if (kurIstem) {
    k.innerHTML = `<h2>Ana ekrana ekleyin</h2><div class="kart"><p class="aciklama">Uygulama gibi açılır, internet yokken de talimatlar görünür.</p><div class="dugmeler"><button class="dugme" id="kurBtn">Ana ekrana ekle</button></div></div>`;
    $("#kurBtn").onclick = async () => { kurIstem.prompt(); await kurIstem.userChoice; kurIstem = null; cizKurulum(); };
  } else if (ios) {
    k.innerHTML = `<h2>Ana ekrana ekleyin</h2><div class="kart"><p class="aciklama">Safari'de alttaki <b>Paylaş</b> düğmesine, ardından <b>Ana Ekrana Ekle</b>'ye dokunun. Uygulama gibi açılır, internet yokken de talimatlar görünür.</p></div>`;
  } else k.innerHTML = "";
}
addEventListener("beforeinstallprompt", e => { e.preventDefault(); kurIstem = e; cizKurulum(); });
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js");

/* ── açılış ── */
cizRandevular();
cizKurulum();
const ilk = location.hash.slice(1);
if (ilk.startsWith("talimat-")) acTalimat(ilk.slice(8), { gecmis: false });
else git(["randevu", "bakim", "klinik"].includes(ilk) ? ilk : "bugun", { gecmis: false });
history.replaceState({ id: sekme }, "", location.hash || "#");
setInterval(() => { if (sekme === "bugun") cizBugun(); }, 60000);
