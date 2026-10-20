# ZyN Zeyno — Toptan Kadın Giyim Sitesi

Statik site (HTML + CSS + JavaScript). Sunucu tarafı kod, veritabanı, üyelik veya ödeme yoktur;
siparişler WhatsApp üzerinden alınır. Adres: **https://zynzeyno.com** (Cloudflare).

## Klasör düzeni
```
ZyN Zeyno\
├── ZyN Zeyno\                  ← WEB SİTESİ (müşterilerin gördüğü dosyalar)
│   ├── index.html              Ana sayfa: hero + ürünler + iletişim
│   ├── urun.html               Ürün detayı (urun.html?id=...), seri seçimi, WhatsApp siparişi
│   ├── kvkk.html, gizlilik-ve-cerez-politikasi.html, 404.html
│   ├── robots.txt, sitemap.xml, site.webmanifest     (Yayınla/Kontrol ile otomatik üretilir)
│   ├── _headers (Cloudflare güvenlik başlıkları), .htaccess (Apache/Hostinger için)
│   └── assets\
│       ├── css\style.css
│       ├── js\config.js        Ayarlar (panelden düzenlenir)
│       ├── js\data.js          Kategoriler + ürünler (panelden düzenlenir)
│       ├── js\app.js, ana.js, urun.js
│       └── img\                Logo, hero çizimi, paylaşım görseli, ikonlar, urunler\ (ürün fotoğrafları)
│
└── ZyN Zeyno Yönetim\          ← YÖNETİM (internete gitmez)
    ├── Yonetim Paneli.bat      ← çift tıklayın: panel açılır
    ├── README.md, PROMPT.md
    ├── Orijinal Logolar\       Kaynak logo dosyaları
    └── program\
        ├── sunucu.js           Panel sunucusu (sadece bu bilgisayarda çalışır)
        ├── panel\              Panel arayüzü
        ├── yayina-hazirla.js   Kontrol + sitemap/robots + yükleme kopyası
        ├── yayin\              Cloudflare'e yüklenen kopya (otomatik üretilir, elle düzenlemeyin)
        └── yedekler\           Her kayıttan önce alınan yedekler (son 40)
```
**İki klasör hep yan yana durmalı.** Taşırken ana `ZyN Zeyno` klasörünü bütün olarak taşıyın.

## Yönetim Paneli
**`ZyN Zeyno Yönetim\Yonetim Paneli.bat`** dosyasına çift tıklayın → tarayıcıda panel açılır (http://127.0.0.1:5199).
Siyah pencere açık kaldığı sürece panel çalışır; işiniz bitince pencereyi kapatın.

| Sekme | Ne yapılır |
|---|---|
| **Ürünler** | Ürün ekle / düzenle / sil, sırayı değiştir, fotoğraf ekle (otomatik küçültülür, ilk fotoğraf kapak) |
| **Kategoriler** | Kategori ekle, yeniden adlandır, sırala, sil (içinde ürün olan kategori silinemez) |
| **İletişim & Ayarlar** | WhatsApp, adres, çalışma saatleri, sosyal medya, fiyat gösterimi, KVKK firma bilgileri |
| **Yayınla** | Cloudflare'e bağlan (ilk sefer) → **Şimdi Yayınla** ile site birkaç dakikada güncellenir |
| **Siteyi Önizle** | Yayınlamadan önce değişiklikleri bilgisayarda görün |

- Panel **sadece o bilgisayarda** çalışır; internete ve ağdaki diğer cihazlara kapalıdır.
- Gerekli: bilgisayarda **Node.js (LTS)** kurulu olmalı. Kurulu değilse .bat dosyası indirme sayfasını açar.
- İlk "Cloudflare'e Bağlan"da tarayıcıda Cloudflare açılır; hesapla giriş yapıp **Allow** deyin.
- Köşeli parantezli `[ALANLAR]` doldurulmamış bilgilerdir; sitede sarı işaretle görünürler.

## Yayından önce
1. Panel → **İletişim & Ayarlar**: firma unvanı, vergi dairesi/no, saklama süresi.
2. KVKK ve Gizlilik metinlerini bir hukuk uzmanına kontrol ettirin, sonra "Yasal metinler kontrol edildi" kutusunu işaretleyin.
3. Örnek ürünleri silip gerçek ürünleri girin.
4. **Yayınla → Şimdi Yayınla.**

## Yayın (Cloudflare)
- Yayınla butonu önce kontrol eder, `program\yayin` klasörünü hazırlar ve Cloudflare Pages'e yükler.
- Elle yüklemek gerekirse: Cloudflare → Workers & Pages → zynzeyno → **Create deployment** → `program\yayin` klasörü.
- Cloudflare adresleri `.html` uzantısı olmadan sunar (`/kvkk`); sitemap buna göre üretilir.
- Bir güncelleme hatalı çıkarsa Cloudflare → Deployments → önceki sürüm → **Rollback**.

## Güvenlik özeti
- Tüm metinler HTML'e yazılmadan önce kaçışlanır (XSS koruması); adres çubuğundan gelen değerler doğrulanır.
- İçerik Güvenlik Politikası (CSP): yalnızca sitenin kendi scriptleri çalışır, dış bağlantı (fetch) yapılamaz,
  site başka sitelerde çerçeve içine alınamaz.
- Sosyal medya/harita linkleri yalnızca `https://` ise gösterilir; dış linkler `noopener noreferrer` ile açılır.
- Hatalı yazılmış ürünler siteyi bozmaz: atlanır ve tarayıcı konsolunda uyarı çıkar.
- Çerez, analiz veya takip aracı yoktur (bu nedenle çerez onay penceresi gerekmez).
- Panel: oturum anahtarı, Host/Origin kontrolü, sunucu tarafı doğrulama, kayıt öncesi yedek.
