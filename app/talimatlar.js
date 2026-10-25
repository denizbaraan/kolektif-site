/* Tedavi sonrası talimatlar — Standart 1.5.11'in uygulama hâli.
   🔴 TASLAK: hekim onayı bekliyor. Metin değişikliği yalnız bu dosyada yapılır.
   zaman: işlem bitişinden itibaren dakika. */
const TALIMATLAR = [
  {
    id: "cekim",
    ad: "Diş çekimi",
    ozet: "Pıhtıyı korumak ilk 24 saatin işi.",
    zaman: [
      { dk: 0, baslik: "Gazlı bezi sıkıca ısırın", metin: "45 dakika boyunca çıkarmayın, konuşmamaya çalışın." },
      { dk: 45, baslik: "Gazlı bezi çıkarın", metin: "Sızıntı sürüyorsa temiz bir gazlı bezle 30 dakika daha bastırın." },
      { dk: 150, baslik: "Uyuşukluk geçtiyse yiyebilirsiniz", metin: "Ilık ve yumuşak yiyecekler; çekim tarafıyla çiğnemeyin. Uyuşukken yanağınızı ısırabilirsiniz." },
      { dk: 1440, baslik: "Ilık tuzlu suyla çalkalamaya başlayın", metin: "Yemeklerden sonra, nazikçe. Dişlerinizi fırçalamaya devam edin; çekim bölgesine fırçayı değdirmeyin." },
      { dk: 4320, baslik: "Şişlik azalmaya başlar", metin: "Şişlik genellikle 2–3. günde en yüksek seviyeye çıkar, sonra iner." },
    ],
    yapin: ["Reçetedeki ilaçları yazıldığı gibi kullanın.", "İlk gün yanağınızın dışına 15 dakika soğuk kompres, 15 dakika ara.", "Başınız yüksek yastıkta yatın.", "Bol sıvı için."],
    yapmayin: ["İlk 24 saat çalkalamayın, tükürmeyin.", "Pipet kullanmayın.", "En az 48 saat sigara içmeyin.", "Alkol ve ağır egzersizden kaçının.", "Yarayı dilinizle ya da parmağınızla yoklamayın."],
    normal: ["İlk gün tükürükte pembe renk.", "2–3 gün süren şişlik.", "Birkaç gün hassasiyet, hafif morarma."],
    arayin: ["30 dakika sıkıca bastırmaya rağmen durmayan kanama.", "38 °C üstü ateş.", "3. günden sonra azalmak yerine artan ağrı.", "Kötü tat ya da koku ile birlikte şiddetli ağrı.", "24 saati geçen uyuşukluk."],
  },
  {
    id: "implant",
    ad: "İmplant ve ağız cerrahisi",
    ozet: "Dikişler ve yara yeri birkaç gün dinlenmek ister.",
    zaman: [
      { dk: 0, baslik: "Gazlı bezi sıkıca ısırın", metin: "30–45 dakika çıkarmayın." },
      { dk: 150, baslik: "Uyuşukluk geçtiyse yiyebilirsiniz", metin: "Soğuk ya da ılık, yumuşak yiyecekler. Ameliyat tarafıyla çiğnemeyin." },
      { dk: 1440, baslik: "Ağız bakımına başlayın", metin: "Hekiminiz gargara verdiyse yazıldığı gibi kullanın; yoksa ılık tuzlu suyla nazikçe çalkalayın." },
      { dk: 4320, baslik: "Şişlik azalmaya başlar", metin: "Şişlik ve morarma 2–3. günde en belirgin hâlini alır." },
      { dk: 10080, baslik: "Dikiş kontrolü", metin: "Dikişler genellikle 7–14 gün içinde kontrol edilir ya da alınır. Randevunuzu kaçırmayın." },
    ],
    yapin: ["Antibiyotik ve ağrı kesiciyi reçetedeki gibi, saatinde kullanın.", "İlk gün aralıklı soğuk kompres.", "Birkaç gün yumuşak beslenin.", "Başınız yüksek yatın."],
    yapmayin: ["Hekiminiz izin verene kadar hareketli protezinizi takmayın.", "Pipet kullanmayın, sigara içmeyin.", "İlk 24 saat çalkalamayın, tükürmeyin.", "Birkaç gün ağır egzersiz yapmayın.", "Dikişlerle oynamayın."],
    normal: ["2–3 gün şişlik ve hafif morarma.", "İlk gün hafif sızıntı.", "Birkaç gün ağız açmada kısıtlılık."],
    arayin: ["Durmayan kanama.", "38 °C üstü ateş.", "3. günden sonra artan ağrı ya da şişlik.", "Dudak, çene ya da dilde 24 saati geçen uyuşukluk.", "Dikişlerin açılması."],
  },
  {
    id: "kanal",
    ad: "Kanal tedavisi",
    ozet: "Diş birkaç gün hassas olabilir; asıl iş kalıcı dolguya kadar korumak.",
    zaman: [
      { dk: 0, baslik: "Uyuşukluk geçene kadar yemeyin", metin: "Dudağınızı ya da yanağınızı ısırabilirsiniz. Geçici dolgu varsa en az 1 saat yemeyin." },
      { dk: 150, baslik: "Yiyebilirsiniz", metin: "Tedavi edilen tarafla sert ve yapışkan yiyecekleri çiğnemeyin." },
      { dk: 1440, baslik: "Biz sizi arıyoruz", metin: "Kanal tedavisinden sonra 24–48 saat içinde klinik sizi arar (Standart 1.5.12)." },
    ],
    yapin: ["Ağrı kesiciyi hekiminizin önerdiği gibi kullanın.", "Dişlerinizi her zamanki gibi fırçalayın.", "Kalıcı dolgu ya da kaplama randevusunu geciktirmeyin; tedavili diş kırılmaya daha yatkındır."],
    yapmayin: ["Kalıcı dolgu yapılana kadar o tarafla sert şey ısırmayın (kuruyemiş, buz, kemik).", "Sakız çiğnemeyin."],
    normal: ["Birkaç gün ısırırken hassasiyet.", "Hafif sızlama; günden güne azalır."],
    arayin: ["Yüzde ya da diş etinde şişlik.", "Ateş.", "Günden güne artan ağrı.", "Geçici dolgunun düşmesi.", "Ağzınızı kapattığınızda dişin 'yüksek' hissettirmesi."],
  },
  {
    id: "dolgu",
    ad: "Dolgu",
    ozet: "Dolgu hemen sertleşir; dikkat gereken şey uyuşukluk.",
    zaman: [
      { dk: 0, baslik: "Uyuşukluk geçene kadar dikkat", metin: "Sıcak içecek içmeyin, dudağınızı ve yanağınızı ısırmayın. Çocuklarda özellikle takip edin." },
      { dk: 150, baslik: "Normal beslenebilirsiniz", metin: "Uyuşukluk geçtiyse her şeyi yiyebilirsiniz." },
    ],
    yapin: ["Her zamanki gibi fırçalayın ve diş ipi kullanın."],
    yapmayin: ["Uyuşukken sıcak yiyecek ve içecek almayın."],
    normal: ["Birkaç gün sıcak ve soğuğa hassasiyet."],
    arayin: ["Isırırken dolgunun 'yüksek' hissettirmesi.", "2 haftadan uzun süren ya da artan hassasiyet.", "Kendiliğinden başlayan, zonklayan ağrı."],
  },
  {
    id: "temizlik",
    ad: "Diş taşı temizliği",
    ozet: "Birkaç gün diş eti hassas olabilir; bakımı bırakmayın.",
    zaman: [
      { dk: 0, baslik: "Normal hayatınıza dönebilirsiniz", metin: "İlk gün çok sıcak ve çok soğuk yiyeceklerde hassasiyet olabilir." },
      { dk: 2880, baslik: "Hassasiyet geçmiş olmalı", metin: "Diş eti kanaması ve hassasiyet genellikle 1–2 günde azalır." },
    ],
    yapin: ["Fırçalamaya ve diş arası temizliğine devam edin; hafif kanama bırakma sebebi değil.", "Yumuşak fırça kullanın."],
    yapmayin: ["Kanıyor diye diş etinin o bölgesini fırçalamayı bırakmayın."],
    normal: ["1–2 gün diş eti hassasiyeti ve hafif kanama.", "Soğuğa geçici hassasiyet."],
    arayin: ["Birkaç günden uzun süren kanama ya da şişlik.", "Ateş."],
  },
  {
    id: "beyazlatma",
    ad: "Diş beyazlatma",
    ozet: "İlk 48 saat renkli yiyecek ve içecekten uzak durun.",
    zaman: [
      { dk: 0, baslik: "Renk veren yiyeceklerden kaçının", metin: "Kahve, çay, kırmızı şarap, kola, salça, nar, pancar." },
      { dk: 2880, baslik: "48 saat doldu", metin: "Normal beslenmeye dönebilirsiniz." },
    ],
    yapin: ["Hassasiyet için hekiminizin önerdiği macunu kullanın.", "Renkli içeceklerden sonra suyla çalkalayın."],
    yapmayin: ["İlk 48 saat sigara içmeyin.", "Renkli yiyecek ve içecek tüketmeyin."],
    normal: ["1–2 gün soğuğa ve sıcağa hassasiyet."],
    arayin: ["Diş etinde geçmeyen yanma ya da beyaz leke.", "Birkaç günden uzun süren şiddetli hassasiyet."],
  },
];

const ACIL = [
  {
    ad: "Diş yerinden çıktı",
    adimlar: ["Dişi kökünden değil, taç kısmından tutun.", "Kirliyse süt ya da soğuk suyla birkaç saniye durulayın; fırçalamayın, silmeyin.", "Yapabiliyorsanız yerine yerleştirip temiz bir bezi ısırın. Yapamıyorsanız süt içinde taşıyın.", "Hemen arayın — ilk saat belirleyici."],
    not: "Süt dişleri yerine konmaz; yine de arayın.",
  },
  {
    ad: "Diş kırıldı",
    adimlar: ["Kırılan parçayı saklayın.", "Ilık suyla ağzınızı çalkalayın.", "Şişlik varsa yanağın dışına soğuk kompres.", "Aynı gün arayın."],
  },
  {
    ad: "Kanama durmuyor",
    adimlar: ["Temiz, nemli bir gazlı bezi yaranın üstüne koyup 30 dakika sıkıca ısırın.", "Başınızı yüksek tutun, konuşmayın.", "Durmuyorsa arayın."],
  },
  {
    ad: "Şişlik ve ateş",
    adimlar: ["Aynı gün arayın.", "Sıcak kompres uygulamayın."],
    not: "Nefes almakta ya da yutkunmakta güçlük, göze veya boyuna yayılan şişlik varsa 112'yi arayın.",
  },
];
