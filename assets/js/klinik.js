/* Kolektif — tek kaynak. Site ve uygulama iletişim/saat bilgisini buradan okur.
   Bir bilgi değişirse yalnız bu dosya düzeltilir. */
const KLINIK = {
  ad: "Özel Kolektif Ağız ve Diş Sağlığı Polikliniği",
  kisaAd: "Kolektif Kavaklıdere",
  site: "https://kolektifdentalclinics.com",
  tel: "0312 557 01 06",
  telLink: "tel:+903125570106",
  mobil: "0554 253 69 06",
  mobilLink: "tel:+905542536906",
  whatsapp: "905542536906",
  // Numarataj 16.01.2023: 233A = bağımsız bölüm 52. Posta kodu 06680 (Google İşletme kaydıyla aynı).
  sokak: "Remzi Oğuz Arık Mah. Atatürk Bulvarı No: 233A",
  semtAd: "Kavaklıdere",
  postaKodu: "06680",
  ilce: "Çankaya",
  il: "Ankara",
  adres: "Remzi Oğuz Arık Mah. Atatürk Bulvarı No: 233A, Kavaklıdere, 06680 Çankaya / Ankara",
  semt: "Kavaklıdere · Ankara",
  harita: "https://www.google.com/maps/search/?api=1&query=Kolektif+Kavakl%C4%B1dere+Atat%C3%BCrk+Bulvar%C4%B1+233A+%C3%87ankaya+Ankara",
  instagram: "kolektifclinic.kavaklidere",
  instagramMarka: "kolektifdentalclinics",
  hekimler: ["Dt. Deniz Baran Bek", "Dt. Esra Yavuz"],
  // 0 = Pazar. [açılış, kapanış] saat olarak; null = kapalı
  // 25.10.2026 (Deniz): Pzt–Cmt 09–22, Pazar kapalı. Google İşletme Profili de bununla aynı olmalı.
  saatler: { 0: null, 1: [9, 22], 2: [9, 22], 3: [9, 22], 4: [9, 22], 5: [9, 22], 6: [9, 22] },
  saatMetni: "Pazartesi – Cumartesi · 09.00 – 22.00",
  saatAralik: "09.00 – 22.00",
  gunMetni: "Pazartesi – Cumartesi",
  editor: "Dt. Deniz Baran Bek",
  slogan: "Sağlıkla • Güvenle • Birlikte",
  guncelleme: "25.10.2026",
};

const GUNLER = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

/** Şu an açık mı; değilse bir sonraki açılış ne zaman. Ankara saati cihaz saatinden okunur. */
function klinikDurumu(simdi = new Date()) {
  const g = simdi.getDay(), s = simdi.getHours() + simdi.getMinutes() / 60;
  const bugun = KLINIK.saatler[g];
  if (bugun && s >= bugun[0] && s < bugun[1]) {
    return { acik: true, metin: `Şu an açık · ${String(bugun[1]).padStart(2, "0")}.00'a kadar` };
  }
  for (let i = 0; i < 7; i++) {
    const gun = (g + i) % 7, aralik = KLINIK.saatler[gun];
    if (!aralik) continue;
    if (i === 0 && s >= aralik[0]) continue;
    const saat = String(aralik[0]).padStart(2, "0") + ".00";
    const ne = i === 0 ? "bugün" : i === 1 ? "yarın" : GUNLER[gun];
    return { acik: false, metin: `Şu an kapalı · ${ne} ${saat}'da açılır` };
  }
  return { acik: false, metin: "Şu an kapalı" };
}
