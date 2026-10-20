/* =========================================================
   MAĞAZA AYARLARI
   Bu dosya Yönetim Paneli tarafından yazılır (Yonetim Paneli.bat → İletişim & Ayarlar).
   Köşeli parantezli [ALANLAR] henüz doldurulmamış bilgilerdir.
   ========================================================= */
window.MAGAZA = {
  ad: "ZyN Zeyno",
  slogan: "Toptan Kadın Giyim",

  // Sitenin yayındaki adresi
  siteAdresi: "https://zynzeyno.com",
  // Cloudflare Pages proje adı (Yayınla butonu bu projeye yükler)
  cloudflareProje: "zynzeyno",

  // WhatsApp numarası: ülke koduyla, boşluksuz, + olmadan (örn. 905321234567)
  whatsapp: "905000000000",
  telefonGorunen: "0500 000 00 00",

  adres: "[MAĞAZA ADRESİ]",
  // Her satır ayrı gösterilir
  calismaSaatleri: [
    "Pazartesi – Cuma · 07:30 – 18:00",
    "Cumartesi · 07:30 – 15:00"
  ],
  haritaLinki: "",

  // Sosyal medya: tam adres yazın. Boş bırakılan ("") hesap sitede görünmez.
  instagram: "",
  facebook: "",
  tiktok: "",

  // false yaparsanız fiyatlar gizlenir, "Fiyat için WhatsApp'tan sorun" yazar
  fiyatGoster: true,
  paraBirimi: "₺",

  // Ana sayfadaki kısa notlar
  notlar: [
    "Türkiye'nin her yerine kargo",
    "Her hafta yeni sezon ürünler"
  ],

  /* ---------- Yasal bilgiler (KVKK ve Gizlilik sayfalarında kullanılır) ---------- */
  firma: {
    unvan: "[FİRMA TİCARİ UNVANI]",
    vergiDairesiNo: "[VERGİ DAİRESİ / NO]",
    mersisNo: "",
    eposta: "[E-POSTA]",
    saklamaSuresi: "[SAKLAMA SÜRESİ — örn. ticari ilişki süresince ve sonrasında yasal süre (10 yıl)]"
  },
  // Metinler bir hukuk uzmanınca kontrol edilip bilgiler doldurulunca true yapın (taslak uyarısı kalkar)
  yasalMetinOnaylandi: false
};
