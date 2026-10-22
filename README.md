# ZyN Zeyno

[Türkçe](#türkçe) · [English](#english)

| Ana sayfa · Home page | Ürün sayfası · Product page |
|---|---|
| <img src="screenshots/home.png" alt="The whole home page: hero, products with search and categories, contact section and footer"> | <img src="screenshots/product.png" alt="A product page: colours, series content, series count, total and the WhatsApp order button"> |

---

## Türkçe

Toptan kadın giyim satan bir mağaza için katalog sitesi. Yönetim paneli ayrı (özel) depodadır: ZyN-Zeyno-Admin.

### Site

HTML, CSS ve JavaScript ile yazılmış statik bir site. Sunucu, veritabanı, üyelik veya ödeme yok; siparişler WhatsApp üzerinden alınır.

- **Seri satış:** Ürünler seri hâlinde satılır (ör. S-M-L-XL birer adet = 4 parça). Seri fiyatı adet fiyatından otomatik hesaplanır; her ürünün en az sipariş seri adedi vardır.
- **Ürün sayfası:** Görsel galerisi, renk ve seri adedi seçimi, toplam parça ve tutar. "WhatsApp ile Sipariş Ver" düzenli bir sipariş mesajı hazırlar.
- **Arama ve kategoriler:** Soldan açılan panelde arama, sayılı kategoriler ve sıralama.
- **Yasal ve teknik:** KVKK ve gizlilik sayfaları, 404 sayfası, `sitemap.xml`, `robots.txt`, uygulama ikonları, Open Graph ve JSON-LD.
- **Güvenlik:**
  - İçerik Güvenlik Politikası (CSP): yalnızca sitenin kendi kodları çalışır, dış bağlantı yapılamaz.
  - Tüm metinler sayfaya yazılmadan önce kaçışlanır (XSS koruması).
  - Çerez veya takip aracı yok.

### Yönetim paneli

Ayrı ve özel bir depoda: **ZyN-Zeyno-Admin**. Node.js ile yalnızca yönetici bilgisayarında çalışır (`127.0.0.1`); bu sitenin `assets/js/config.js` ve `data.js` dosyalarını yazar. İki depo yan yana klonlanır (`ZyN-Zeyno` ve `ZyN-Zeyno-Admin`).

### Çalıştırma

Site statiktir: `index.html` dosyasını açmak veya herhangi bir statik sunucuyla yayınlamak yeterlidir (GitHub Pages dahil).

> Bu depoda iletişim bilgileri (telefon, adres, e-posta, sosyal medya) yer almaz. Panelin “İletişim & Ayarlar” sekmesinden doldurulur.

---

## English

A catalogue site for a shop that sells women's clothing wholesale. The admin panel lives in a separate private repository, ZyN-Zeyno-Admin.

### Site

A static site in HTML, CSS and JavaScript. No server, database, accounts or payments; orders are taken over WhatsApp.

- **Series sales:** Products are sold in series (e.g. one each of S-M-L-XL = 4 pieces). The series price is calculated from the unit price; every product has a minimum number of series.
- **Product page:** Image gallery, colour and series count, total pieces and amount. "Order on WhatsApp" prepares a tidy order message.
- **Search and categories:** A side panel with search, categories with counts, and sorting.
- **Legal and technical:** Privacy pages (Turkish KVKK), a 404 page, `sitemap.xml`, `robots.txt`, app icons, Open Graph and JSON-LD.
- **Security:**
  - Content Security Policy: only the site's own scripts run, and no outside connections are made.
  - Every text is escaped before it reaches the page (XSS protection).
  - No cookies or tracking.

### Admin panel

In a separate private repository: **ZyN-Zeyno-Admin**. A Node.js panel that runs only on the admin's computer (`127.0.0.1`); it writes this site's `assets/js/config.js` and `data.js`. Clone both repositories side by side.

### Running it

The site is static: open `index.html` or serve it with any static host (GitHub Pages included).

> This repository contains no contact details (phone, address, email, social media); they are filled in from the panel's “İletişim & Ayarlar” tab.

---

Made by [Ahmet Şahin](https://github.com/alpha32k).
