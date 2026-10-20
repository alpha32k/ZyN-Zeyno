# ZyN Zeyno — Toptan Kadın Giyim Statik Web Sitesi (Proje Prompt'u)

## Amaç
ZyN Zeyno markası için **toptan kadın giyim** satan bir dükkânın vitrin/katalog sitesi.
Site **tamamen statiktir** (HTML + CSS + vanilla JS, sunucu/veritabanı yok). Ödeme ve
sepet altyapısı yoktur; tüm sipariş ve sorular **WhatsApp** üzerinden yürür.

## Satış modeli — SERİ satış
- Mallar **toptan**, **seri halinde** satılır. Bir seri = belirli bedenlerden belirli
  adetler (örn. S-M-L-XL birer adet = 4 parça).
- Her ürün kendi seri içeriğini taşır (`seri: { S:1, M:1, L:1, XL:1 }`).
- Fiyat **adet fiyatı** olarak girilir; **seri fiyatı = adet fiyatı × serideki parça** otomatik hesaplanır.
- Her ürünün **minimum sipariş (seri)** adedi vardır.
- Fiyat gösterimi ayardan kapatılabilir ("Fiyat için WhatsApp'tan sorun").

## Marka & Tasarım
- Logo: tek çizgi (line-art) kadın profili + "ZEYNO WOMAN" yazısı, yumuşak pembe/beyaz bölünmüş zemin.
- Renk paleti logodan türetilir:
  - Pudra pembe (logo zemini) `#F9CACD`
  - Açık pudra `#FDEBEC`, krem zemin `#FFF9F8`
  - Gül (vurgu/buton) `#B8606C`, koyu gül `#8E4450`
  - Mürekkep (çizgi/metin) `#1F1A1B`
- Tipografi: başlıklar **Josefin Sans** (logodaki ince geometrik harflere yakın, büyük harf, geniş harf aralığı),
  gövde **Jost**.
- Sade, zarif, bol beyaz alan; logodaki dalgalı pembe/beyaz ayrım hero bölümünde SVG dalga ile tekrarlanır.
- Mobil öncelikli, tam duyarlı.

## Sayfalar
1. **Ana sayfa (`index.html`)** — hero (logo çizimi; masaüstünde sağ yarıyı üstten alta kaplayan pembe dalga,
   mobilde pembe yuvarlak), **ürünler** ve **iletişim** (WhatsApp, adres, çalışma saatleri, Instagram/Facebook/TikTok).
   Ürünlerde beyaz araç kartı: "Ara & Kategoriler" butonu + özel sıralama menüsü. Tüm ekranlarda arama ve sayılı
   kategoriler soldan açılan panelde, kategoriler alt alta. Sepet ve kategori vitrini yok.
2. **Ürün detay (`urun.html?id=...`)** — görsel galerisi, ürün kodu, kumaş, açıklama, renk seçimi,
   seri içerik tablosu, seri adedi seçici (min. seri), toplam parça & tutar ve tek buton:
   "WhatsApp ile Sipariş Ver" (altında KVKK notu).
3. **Yasal:** `kvkk.html` (KVKK Aydınlatma Metni), `gizlilik-ve-cerez-politikasi.html`; bilgiler config.js'ten dolar,
   eksikler sarı işaretlenir, onaylanana kadar "Taslak" uyarısı görünür.
4. **404.html** — her adreste çalışan sayfa bulunamadı sayfası.
5. **Footer** — marka, kısa açıklama, telif ve yasal linkler (iletişim bilgisi ve kategori yok).

## Altyapı & Güvenlik
- CSP (yalnızca kendi scriptleri, `connect-src 'none'`, çerçeveye alınamaz), referrer politikası; inline script yok.
- Tüm metinler kaçışlanır; URL parametreleri ve linkler doğrulanır; hatalı ürün verisi atlanıp konsola yazılır.
- `.htaccess` (Apache/Hostinger) ve `_headers` (Netlify/Cloudflare): güvenlik başlıkları, HTTPS, 404, önbellek, sıkıştırma.
- SEO: açıklamalar, Open Graph paylaşım görseli, JSON-LD (ClothingStore, Product), `sitemap.xml`, `robots.txt`.
- `site.webmanifest` + uygulama ikonları; "İçeriğe geç" linki, noscript uyarısı, yazdırma stili.
- `araclar/yayina-hazirla.js`: kontrol, sitemap/robots üretimi, canonical/og:url, dosya sürümü yenileme.
- Çerez/analiz yok → çerez onay penceresi gerekmez.

## WhatsApp
- Numara ve mağaza bilgileri tek dosyada: `assets/js/config.js`.
- `https://wa.me/<numara>?text=<mesaj>` biçimi; mesajlar Türkçe ve düzenli
  (ürün kodu, ad, renk, seri adedi, toplam parça, tahmini tutar).
- Sağ altta sabit WhatsApp butonu.

## Veri
- Ürünler ve kategoriler `assets/js/data.js` içinde düz bir dizi olarak tutulur; kod bilmeyen biri de
  kopyala-yapıştır ile ürün ekleyebilir.
- Ürün görselleri `assets/img/urunler/` klasörüne konur; görsel yoksa ürün rengine göre logo çizimli zemin gösterilir.
- Ürünler, kategoriler ve ayarlar yerel **Yönetim Paneli**'nden düzenlenir (ZyN Zeyno Yönetim\Yonetim Paneli.bat).

## Klasör yapısı
```
ZyN Zeyno\ZyN Zeyno\            Web sitesi (index, urun, kvkk, gizlilik, 404, assets\ …)
ZyN Zeyno\ZyN Zeyno Yönetim\    Yonetim Paneli.bat, README.md, PROMPT.md, Orijinal Logolar\,
                                program\ (sunucu.js, panel\, yayina-hazirla.js, yayin\, yedekler\)
```
Ayrıntılı dosya listesi README.md içinde.
