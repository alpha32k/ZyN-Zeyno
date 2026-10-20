#!/usr/bin/env node
/* =========================================================
   ZyN Zeyno — yayına hazırlık aracı (bağımlılık yok, sadece Node.js)

   Kullanım: Yönetim Paneli → Yayınla (veya ZyN Zeyno Yönetim\program klasöründe: node yayina-hazirla.js)

   Yaptıkları:
   1. config.js ve data.js'i kontrol eder, eksik / hatalı bilgileri listeler
   2. Ürün görseli dosyaları gerçekten var mı bakar
   3. sitemap.xml ve robots.txt üretir (config.js → siteAdresi doluysa)
   4. HTML sayfalarına canonical, og:url ve tam adresli og:image yazar
   5. CSS/JS bağlantılarındaki ?v= sürümünü yeniler (ziyaretçiler eski dosyayı görmesin)
   Her ürün değişikliğinden veya tasarım güncellemesinden sonra çalıştırın.
   ========================================================= */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

// Klasör düzeni: ZyN Zeyno\ZyN Zeyno (web sitesi) · ZyN Zeyno\ZyN Zeyno Yönetim\program (bu dosya)
const KOK = path.resolve(__dirname, "..", "..", "ZyN Zeyno");   // web sitesi klasörü
const oku = (f) => fs.readFileSync(path.join(KOK, f), "utf8");
const yaz = (f, icerik) => fs.writeFileSync(path.join(KOK, f), icerik, "utf8");

const hatalar = [], uyarilar = [];

/* ---------- 1. ayarları ve verileri yükle ---------- */
const kum = { window: {} };
vm.createContext(kum);
for (const f of ["assets/js/config.js", "assets/js/data.js"]) {
  try { vm.runInContext(oku(f), kum, { filename: f }); }
  catch (e) { console.error(`✖ ${f} okunamadı — yazım hatası olabilir:\n  ${e.message}`); process.exit(1); }
}
const M = kum.window.MAGAZA || {}, URUNLER = kum.window.URUNLER || [], KATEGORILER = kum.window.KATEGORILER || [];
const bos = (v) => !v || /^\[.*\]$/.test(String(v).trim());

if (!/^\d{11,15}$/.test(String(M.whatsapp || ""))) hatalar.push("config.js → whatsapp: ülke koduyla, sadece rakam olmalı (örn. 905321234567)");
if (M.whatsapp === "905000000000") hatalar.push("config.js → whatsapp: hâlâ örnek numara (905000000000)");
if (/Örnek Mah/.test(M.adres || "")) uyarilar.push("config.js → adres: hâlâ örnek adres");
const firma = M.firma || {};
for (const [k, ad] of [["unvan", "firma unvanı"], ["vergiDairesiNo", "vergi dairesi / no"], ["eposta", "e-posta"], ["saklamaSuresi", "saklama süresi"]]) {
  if (bos(firma[k])) uyarilar.push(`config.js → firma.${k}: ${ad} doldurulmamış (KVKK sayfasında sarı görünür)`);
}
if (!M.yasalMetinOnaylandi) uyarilar.push("config.js → yasalMetinOnaylandi: false — KVKK/Gizlilik sayfalarında 'Taslak' uyarısı görünüyor");
for (const s of ["instagram", "facebook", "tiktok"]) {
  if (M[s] && /^https?:\/\/(www\.)?[a-z]+\.com\/?$/i.test(M[s])) uyarilar.push(`config.js → ${s}: sadece ana sayfa adresi yazılı; hesabınızın tam adresini yazın veya "" yapın`);
}

const siteAdresi = String(M.siteAdresi || "").trim().replace(/\/+$/, "");
if (!siteAdresi) uyarilar.push("config.js → siteAdresi boş: sitemap.xml, canonical ve paylaşım görseli tam adresi üretilemedi");
else if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(siteAdresi)) hatalar.push(`config.js → siteAdresi "${siteAdresi}" geçersiz (örn. https://www.zynzeyno.com)`);

/* ---------- 2. ürünleri kontrol et ---------- */
const katIdler = new Set(KATEGORILER.map((k) => k.id));
const idler = new Set();
URUNLER.forEach((u, i) => {
  const ad = `data.js → ${i + 1}. ürün (${(u && u.id) || "id yok"})`;
  if (!u || !/^[a-z0-9][a-z0-9-]{0,60}$/.test(u.id)) return hatalar.push(`${ad}: id küçük harf, rakam ve tire içermeli`);
  if (idler.has(u.id)) hatalar.push(`${ad}: bu id başka bir üründe de var`);
  idler.add(u.id);
  if (!katIdler.has(u.kategori)) hatalar.push(`${ad}: kategori "${u.kategori}" KATEGORILER listesinde yok`);
  if (!u.seri || !Object.values(u.seri).some((a) => a > 0)) hatalar.push(`${ad}: seri içeriği boş`);
  if (!(Number(u.fiyat) >= 0)) hatalar.push(`${ad}: fiyat sayı olmalı`);
  (u.renkler || []).forEach((r) => { if (!/^#[0-9a-f]{6}$/i.test(r.kod)) uyarilar.push(`${ad}: "${r.ad}" renk kodu #RRGGBB biçiminde değil`); });
  (u.gorseller || []).forEach((g) => {
    if (!/^[\w\-. ]+\.(jpe?g|png|webp|avif)$/i.test(g)) hatalar.push(`${ad}: görsel adı geçersiz "${g}"`);
    else if (!fs.existsSync(path.join(KOK, "assets/img/urunler", g))) hatalar.push(`${ad}: görsel bulunamadı → assets/img/urunler/${g}`);
    else if (fs.statSync(path.join(KOK, "assets/img/urunler", g)).size > 600 * 1024) uyarilar.push(`${ad}: "${g}" 600 KB'tan büyük; sıkıştırırsanız site hızlanır`);
  });
});

/* ---------- 3. sitemap.xml ve robots.txt ---------- */
const bugun = new Date().toISOString().slice(0, 10);
const xmlEsc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
if (siteAdresi) {
  // Cloudflare Pages adresleri .html uzantısız sunar (/kvkk.html → /kvkk); sitemap uzantısız adresleri listeler
  const adresler = ["/", "/kvkk", "/gizlilik-ve-cerez-politikasi", ...URUNLER.filter((u) => u && u.id).map((u) => `/urun?id=${encodeURIComponent(u.id)}`)];
  yaz("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${adresler.map((a) => `  <url><loc>${xmlEsc(siteAdresi + a)}</loc><lastmod>${bugun}</lastmod></url>`).join("\n")}
</urlset>
`);
}
yaz("robots.txt", `# ${M.ad || "Site"} — robots.txt (Yönetim Paneli tarafından üretilir)
User-agent: *
Allow: /
Disallow: /404
${siteAdresi ? `\nSitemap: ${siteAdresi}/sitemap.xml` : "\n# Sitemap satırı, config.js → siteAdresi doldurulup bu araç çalıştırılınca eklenir."}
`);

/* ---------- 4-5. HTML sayfalarını güncelle ---------- */
const surum = new Date().toISOString().replace(/\D/g, "").slice(0, 12);
const sayfalar = { "index.html": "/", "urun.html": null, "kvkk.html": "/kvkk", "gizlilik-ve-cerez-politikasi.html": "/gizlilik-ve-cerez-politikasi", "404.html": null };
for (const [dosya, yol] of Object.entries(sayfalar)) {
  if (!fs.existsSync(path.join(KOK, dosya))) { hatalar.push(`${dosya} bulunamadı`); continue; }
  let html = oku(dosya);
  html = html.replace(/(assets\/(?:css|js)\/[\w.-]+\.(?:css|js))\?v=\w+/g, `$1?v=${surum}`);
  let blok = "";
  if (siteAdresi) {
    if (yol) blok += `\n  <link rel="canonical" href="${siteAdresi}${yol}">\n  <meta property="og:url" content="${siteAdresi}${yol}">`;
    blok += `\n  <meta name="twitter:image" content="${siteAdresi}/assets/img/paylasim.png">\n  `;
    html = html.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${siteAdresi}/assets/img/paylasim.png">`);
  }
  html = html.replace(/<!-- yayin:basla -->[\s\S]*?<!-- yayin:bitis -->/, `<!-- yayin:basla -->${blok}<!-- yayin:bitis -->`);
  yaz(dosya, html);
}

/* ---------- 6. yayin/ klasörü: Cloudflare Pages'e yüklenecek temiz kopya ----------
   Sadece sitenin çalışması için gereken dosyalar kopyalanır (araçlar, notlar, orijinal logolar hariç). */
const YAYIN = path.join(__dirname, "yayin");   // Cloudflare'e yüklenen kopya (program\yayin)
const YAYIN_DOSYALARI = ["index.html", "urun.html", "kvkk.html", "gizlilik-ve-cerez-politikasi.html", "404.html",
  "site.webmanifest", "robots.txt", "sitemap.xml", "_headers", "favicon.ico", "assets"];
fs.rmSync(YAYIN, { recursive: true, force: true });
fs.mkdirSync(YAYIN);
for (const f of YAYIN_DOSYALARI) {
  const kaynak = path.join(KOK, f);
  if (fs.existsSync(kaynak)) fs.cpSync(kaynak, path.join(YAYIN, f), { recursive: true });
}
const yayinSay = (k) => fs.readdirSync(k, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? yayinSay(path.join(k, e.name)) : 1), 0);

/* ---------- rapor ---------- */
console.log(`\n${M.ad || "Site"} — yayın kontrolü`);
console.log(`  Ürün: ${URUNLER.length} · Kategori: ${KATEGORILER.length} · Dosya sürümü: ${surum}`);
console.log(siteAdresi ? `  ✔ sitemap.xml ve robots.txt üretildi (${siteAdresi})` : "  • robots.txt üretildi, sitemap.xml için siteAdresi gerekli");
console.log(`  ✔ yayin/ klasörü hazır (${yayinSay(YAYIN)} dosya) → Cloudflare Pages'e bu klasörü yükleyin`);
if (uyarilar.length) { console.log(`\n  Uyarılar (${uyarilar.length}):`); uyarilar.forEach((u) => console.log("   ! " + u)); }
if (hatalar.length) { console.log(`\n  Düzeltilmesi gerekenler (${hatalar.length}):`); hatalar.forEach((h) => console.log("   ✖ " + h)); }
if (!hatalar.length && !uyarilar.length) console.log("\n  ✔ Her şey hazır, siteyi yükleyebilirsiniz.");
console.log("");
process.exitCode = hatalar.length ? 1 : 0;
