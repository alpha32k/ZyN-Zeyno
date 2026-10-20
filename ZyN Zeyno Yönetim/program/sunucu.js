#!/usr/bin/env node
/* =========================================================
   ZyN Zeyno — Yerel Yönetim Paneli sunucusu (bağımlılık yok, sadece Node.js)

   Başlatma: "ZyN Zeyno Yönetim\Yonetim Paneli.bat" dosyasına çift tıklayın
             (veya: node program/sunucu.js)

   Güvenlik:
   - Sadece 127.0.0.1 (bu bilgisayar) üzerinden açılır; ağdaki başka cihazlar erişemez.
   - Her açılışta rastgele bir oturum anahtarı üretilir; API istekleri bu anahtar olmadan reddedilir.
   - Host / Origin başlıkları kontrol edilir (başka sitelerin panele istek atması engellenir).
   - Kaydedilen her veri sunucu tarafında doğrulanır; her kayıttan önce yedek alınır.
   ========================================================= */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");
const { spawn, exec } = require("child_process");

const PORT = Number(process.env.ZW_PORT) || 5199;
const HOST = "127.0.0.1";
// Klasör düzeni:  ZyN Zeyno\ZyN Zeyno (web sitesi)  ·  ZyN Zeyno\ZyN Zeyno Yönetim\program (bu dosya)
const PROGRAM = __dirname;
const KOK = path.resolve(__dirname, "..", "..", "ZyN Zeyno");   // web sitesi klasörü
const PANEL = path.join(__dirname, "panel");
const URUN_GORSEL = path.join(KOK, "assets", "img", "urunler");
const YEDEK = path.join(__dirname, "yedekler");
const TOKEN = crypto.randomBytes(24).toString("hex");

const TIPLER = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".avif": "image/avif", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json",
  ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".ico": "image/x-icon"
};

/* ---------------- veri okuma / yazma ---------------- */
function jsYukle() {
  const kum = { window: {} };
  vm.createContext(kum);
  for (const f of ["assets/js/config.js", "assets/js/data.js"]) {
    vm.runInContext(fs.readFileSync(path.join(KOK, f), "utf8"), kum, { filename: f, timeout: 1000 });
  }
  const w = kum.window;
  // vm bağlamındaki nesneleri sade JSON'a çevir
  return JSON.parse(JSON.stringify({ ayarlar: w.MAGAZA || {}, kategoriler: w.KATEGORILER || [], urunler: w.URUNLER || [] }));
}

function yedekAl() {
  const ad = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
  const hedef = path.join(YEDEK, ad);
  fs.mkdirSync(hedef, { recursive: true });
  for (const f of ["config.js", "data.js"]) fs.copyFileSync(path.join(KOK, "assets/js", f), path.join(hedef, f));
  // en yeni 40 yedeği tut
  const tum = fs.readdirSync(YEDEK).filter((d) => /^\d{8}-\d{6}$/.test(d)).sort();
  tum.slice(0, Math.max(0, tum.length - 40)).forEach((d) => fs.rmSync(path.join(YEDEK, d), { recursive: true, force: true }));
}

const J = (v) => JSON.stringify(v === undefined ? "" : v, null, 2).replace(/\n/g, "\n  ");

function dataJsYaz(kategoriler, urunler) {
  const icerik = `/* =========================================================
   KATEGORİLER & ÜRÜNLER
   Bu dosya Yönetim Paneli tarafından yazılır (Yonetim Paneli.bat).
   Elle düzenleyebilirsiniz; panel bir sonraki kayıtta biçimi yeniden düzenler.
   - seri    : bir serideki bedenler ve adetleri  { "S": 1, "M": 2 }
   - fiyat   : ADET fiyatı (seri fiyatı otomatik hesaplanır)
   - minSeri : en az kaç seri sipariş verilebilir
   - gorseller: assets/img/urunler/ içindeki dosya adları (ilk görsel kapak)
   ========================================================= */
window.KATEGORILER = ${JSON.stringify(kategoriler, null, 2)};

window.URUNLER = ${JSON.stringify(urunler, null, 2)};
`;
  fs.writeFileSync(path.join(KOK, "assets/js/data.js"), icerik, "utf8");
}

function configJsYaz(a) {
  const f = a.firma || {};
  const icerik = `/* =========================================================
   MAĞAZA AYARLARI
   Bu dosya Yönetim Paneli tarafından yazılır (Yonetim Paneli.bat → İletişim & Ayarlar).
   Köşeli parantezli [ALANLAR] henüz doldurulmamış bilgilerdir.
   ========================================================= */
window.MAGAZA = {
  ad: ${J(a.ad)},
  slogan: ${J(a.slogan)},

  // Sitenin yayındaki adresi
  siteAdresi: ${J(a.siteAdresi)},
  // Cloudflare Pages proje adı (Yayınla butonu bu projeye yükler)
  cloudflareProje: ${J(a.cloudflareProje)},

  // WhatsApp numarası: ülke koduyla, boşluksuz, + olmadan (örn. 905321234567)
  whatsapp: ${J(a.whatsapp)},
  telefonGorunen: ${J(a.telefonGorunen)},

  adres: ${J(a.adres)},
  // Her satır ayrı gösterilir
  calismaSaatleri: ${J(a.calismaSaatleri)},
  haritaLinki: ${J(a.haritaLinki)},

  // Sosyal medya: tam adres yazın. Boş bırakılan ("") hesap sitede görünmez.
  instagram: ${J(a.instagram)},
  facebook: ${J(a.facebook)},
  tiktok: ${J(a.tiktok)},

  // false yaparsanız fiyatlar gizlenir, "Fiyat için WhatsApp'tan sorun" yazar
  fiyatGoster: ${J(a.fiyatGoster)},
  paraBirimi: ${J(a.paraBirimi)},

  // Ana sayfadaki kısa notlar
  notlar: ${J(a.notlar)},

  /* ---------- Yasal bilgiler (KVKK ve Gizlilik sayfalarında kullanılır) ---------- */
  firma: {
    unvan: ${J(f.unvan)},
    vergiDairesiNo: ${J(f.vergiDairesiNo)},
    mersisNo: ${J(f.mersisNo)},
    eposta: ${J(f.eposta)},
    saklamaSuresi: ${J(f.saklamaSuresi)}
  },
  // Metinler bir hukuk uzmanınca kontrol edilip bilgiler doldurulunca true yapın (taslak uyarısı kalkar)
  yasalMetinOnaylandi: ${J(a.yasalMetinOnaylandi)}
};
`;
  fs.writeFileSync(path.join(KOK, "assets/js/config.js"), icerik, "utf8");
}

/* ---------------- doğrulama ---------------- */
const ID = /^[a-z0-9][a-z0-9-]{0,60}$/;
const HEX = /^#[0-9a-f]{6}$/i;
const GORSEL = /^[\w\-. ]+\.(jpe?g|png|webp|avif)$/i;
const BEDEN = /^[\wÇĞİÖŞÜçğıöşü.\-\/ ]{1,10}$/;
const metin = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
const httpsMi = (u) => { try { return !u || new URL(u).protocol === "https:"; } catch (e) { return false; } };

function veriDogrula(girdi) {
  const hatalar = [];
  const kategoriler = [], katIdler = new Set();
  (Array.isArray(girdi.kategoriler) ? girdi.kategoriler : []).forEach((k, i) => {
    const id = metin(k && k.id, 61), ad = metin(k && k.ad, 40);
    if (!ID.test(id)) return hatalar.push(`${i + 1}. kategori: geçersiz kimlik`);
    if (!ad) return hatalar.push(`${i + 1}. kategori: ad boş`);
    if (katIdler.has(id)) return hatalar.push(`Kategori "${ad}" iki kez eklenmiş`);
    katIdler.add(id); kategoriler.push({ id, ad });
  });
  if (!kategoriler.length) hatalar.push("En az bir kategori olmalı");

  const urunler = [], idler = new Set();
  (Array.isArray(girdi.urunler) ? girdi.urunler : []).forEach((u, i) => {
    const etiket = `${i + 1}. ürün (${metin(u && u.ad, 40) || "adsız"})`;
    if (!u || !ID.test(u.id)) return hatalar.push(`${etiket}: geçersiz kimlik`);
    if (idler.has(u.id)) return hatalar.push(`${etiket}: aynı kimlik başka üründe de var`);
    const ad = metin(u.ad, 120), kod = metin(u.kod, 30).toUpperCase();
    if (!ad) hatalar.push(`${etiket}: ürün adı boş`);
    if (!kod) hatalar.push(`${etiket}: ürün kodu boş`);
    if (!katIdler.has(u.kategori)) hatalar.push(`${etiket}: kategori seçilmemiş`);
    const seri = {};
    Object.entries(u.seri || {}).forEach(([b, a]) => {
      b = metin(b, 10); const n = parseInt(a, 10);
      if (!BEDEN.test(b)) hatalar.push(`${etiket}: beden adı geçersiz "${b}"`);
      else if (!(n >= 1 && n <= 99)) hatalar.push(`${etiket}: "${b}" bedeninin adedi 1–99 olmalı`);
      else seri[b] = n;
    });
    if (!Object.keys(seri).length) hatalar.push(`${etiket}: seri içeriği boş`);
    const fiyat = Number(u.fiyat);
    if (!(isFinite(fiyat) && fiyat >= 0 && fiyat <= 10000000)) hatalar.push(`${etiket}: fiyat geçersiz`);
    const minSeri = parseInt(u.minSeri, 10);
    if (!(minSeri >= 1 && minSeri <= 999)) hatalar.push(`${etiket}: en az seri 1–999 olmalı`);
    const renkler = (Array.isArray(u.renkler) ? u.renkler : []).map((r) => ({ ad: metin(r && r.ad, 30), kod: String(r && r.kod || "") }))
      .filter((r) => r.ad);
    renkler.forEach((r) => { if (!HEX.test(r.kod)) hatalar.push(`${etiket}: "${r.ad}" renk kodu geçersiz`); });
    if (!renkler.length) hatalar.push(`${etiket}: en az bir renk ekleyin`);
    const gorseller = (Array.isArray(u.gorseller) ? u.gorseller : []).map(String);
    gorseller.forEach((g) => {
      if (!GORSEL.test(g)) hatalar.push(`${etiket}: görsel adı geçersiz`);
      else if (!fs.existsSync(path.join(URUN_GORSEL, g))) hatalar.push(`${etiket}: görsel dosyası bulunamadı (${g})`);
    });
    idler.add(u.id);
    urunler.push({
      id: u.id, kod, ad, kategori: u.kategori, kumas: metin(u.kumas, 120), seri, fiyat: Math.round(fiyat * 100) / 100, minSeri,
      renkler, aciklama: metin(u.aciklama, 1000), gorseller: gorseller.slice(0, 12), yeni: u.yeni === true
    });
  });
  return { hatalar, kategoriler, urunler };
}

function ayarDogrula(a) {
  const hatalar = [];
  a = a || {};
  const f = a.firma || {};
  const cikti = {
    ad: metin(a.ad, 60), slogan: metin(a.slogan, 80),
    siteAdresi: metin(a.siteAdresi, 120).replace(/\/+$/, ""), cloudflareProje: metin(a.cloudflareProje, 58).toLowerCase(),
    whatsapp: String(a.whatsapp || "").replace(/\D/g, ""), telefonGorunen: metin(a.telefonGorunen, 30),
    adres: metin(a.adres, 200),
    calismaSaatleri: (Array.isArray(a.calismaSaatleri) ? a.calismaSaatleri : []).map((s) => metin(s, 80)).filter(Boolean).slice(0, 6),
    haritaLinki: metin(a.haritaLinki, 500),
    instagram: metin(a.instagram, 300), facebook: metin(a.facebook, 300), tiktok: metin(a.tiktok, 300),
    fiyatGoster: a.fiyatGoster !== false, paraBirimi: metin(a.paraBirimi, 4) || "₺",
    notlar: (Array.isArray(a.notlar) ? a.notlar : []).map((s) => metin(s, 60)).filter(Boolean).slice(0, 4),
    firma: {
      unvan: metin(f.unvan, 150), vergiDairesiNo: metin(f.vergiDairesiNo, 80), mersisNo: metin(f.mersisNo, 30),
      eposta: metin(f.eposta, 120), saklamaSuresi: metin(f.saklamaSuresi, 200)
    },
    yasalMetinOnaylandi: a.yasalMetinOnaylandi === true
  };
  if (!cikti.ad) hatalar.push("Mağaza adı boş olamaz");
  if (!/^\d{11,15}$/.test(cikti.whatsapp)) hatalar.push("WhatsApp numarası ülke koduyla, sadece rakam olmalı (örn. 905321234567)");
  for (const k of ["siteAdresi", "haritaLinki", "instagram", "facebook", "tiktok"]) {
    if (!httpsMi(cikti[k])) hatalar.push(`${k}: https:// ile başlayan geçerli bir adres olmalı (veya boş)`);
  }
  if (cikti.cloudflareProje && !/^[a-z0-9][a-z0-9-]{0,57}$/.test(cikti.cloudflareProje)) hatalar.push("Cloudflare proje adı küçük harf, rakam ve tire içermeli");
  if (cikti.firma.eposta && !/^\[.*\]$/.test(cikti.firma.eposta) && !/^[^\s@<>"']+@[^\s@<>"']+\.[a-z]{2,}$/i.test(cikti.firma.eposta)) hatalar.push("KVKK e-posta adresi geçersiz");
  return { hatalar, cikti };
}

/* ---------------- arka plan işleri (yayınla, kontrol, cloudflare) ---------------- */
let is = { ad: "", calisiyor: false, log: [], basari: null, bitis: null };
function isLog(satir) {
  String(satir).replace(/\x1b\[[0-9;]*m/g, "").split(/\r?\n/).forEach((s) => { if (s.trim()) is.log.push(s); });
  if (is.log.length > 400) is.log = is.log.slice(-400);
}
function komut(cmd, args, opts = {}) {
  return new Promise((coz) => {
    isLog(`› ${[cmd, ...args].join(" ").replace(process.execPath, "node").replace(PROGRAM, ".")}`);
    const p = spawn(cmd, args, {
      cwd: PROGRAM, shell: false, windowsHide: true,
      env: { ...process.env, WRANGLER_SEND_METRICS: "false", FORCE_COLOR: "0" }, ...opts
    });
    let cikti = "";
    p.stdout.on("data", (d) => { cikti += d; isLog(d); });
    p.stderr.on("data", (d) => { cikti += d; isLog(d); });
    p.on("error", (e) => { isLog("Hata: " + e.message); coz({ kod: -1, cikti }); });
    p.on("close", (kod) => coz({ kod, cikti }));
  });
}
const NPX = process.platform === "win32" ? "npx.cmd" : "npx";
// npx Windows'ta .cmd olduğu için kabuk gerekir. Argümanlar sabit kelimeler + doğrulanmış proje adıdır;
// yine de kabuğa gitmeden önce yalnızca güvenli karakterlere izin verilir.
const wrangler = (...a) => {
  if (!a.every((x) => /^[\w@.=\/-]+$/.test(x))) { isLog("✖ Geçersiz komut parametresi"); return Promise.resolve({ kod: -1, cikti: "" }); }
  const tum = ["--yes", "wrangler@latest", ...a];
  return process.platform === "win32" ? komut(`${NPX} ${tum.join(" ")}`, [], { shell: true }) : komut(NPX, tum);
};

async function isBaslat(ad, fn) {
  if (is.calisiyor) return false;
  is = { ad, calisiyor: true, log: [], basari: null, bitis: null };
  try { is.basari = await fn(); } catch (e) { isLog("Hata: " + e.message); is.basari = false; }
  is.calisiyor = false; is.bitis = new Date().toISOString();
  return true;
}
const kontrolEt = async () => (await komut(process.execPath, [path.join(PROGRAM, "yayina-hazirla.js")])).kod === 0;

async function yayinla() {
  const a = jsYukle().ayarlar;
  const proje = a.cloudflareProje || "zynzeyno";
  if (!/^[a-z0-9][a-z0-9-]{0,57}$/.test(proje)) { isLog("✖ Cloudflare proje adı geçersiz (İletişim & Ayarlar → Yayın)."); return false; }
  isLog("1/3 Site kontrol ediliyor ve yayın klasörü hazırlanıyor…");
  if (!(await kontrolEt())) { isLog("✖ Kontrolde düzeltilmesi gereken hatalar var; yayın yapılmadı."); return false; }
  isLog("2/3 Cloudflare bağlantısı kontrol ediliyor…");
  const kim = await wrangler("whoami");
  if (/not authenticated|You are not logged in/i.test(kim.cikti) || kim.kod !== 0) {
    isLog("✖ Cloudflare'e bağlı değilsiniz. Önce 'Cloudflare'e Bağlan' butonunu kullanın."); return false;
  }
  isLog("3/3 Cloudflare Pages'e yükleniyor…");
  let d = await wrangler("pages", "deploy", "yayin", "--project-name", proje, "--branch", "main", "--commit-dirty=true");
  if (d.kod !== 0 && /not found|does not exist|Project not found/i.test(d.cikti)) {
    isLog(`Proje "${proje}" bulunamadı, oluşturuluyor…`);
    const c = await wrangler("pages", "project", "create", proje, "--production-branch", "main");
    if (c.kod !== 0) return false;
    d = await wrangler("pages", "deploy", "yayin", "--project-name", proje, "--branch", "main", "--commit-dirty=true");
  }
  if (d.kod === 0) {
    isLog(`✔ Yayınlandı. ${a.siteAdresi || ""}`);
    fs.writeFileSync(path.join(__dirname, "son-yayin.json"), JSON.stringify({ tarih: new Date().toISOString() }));
  }
  return d.kod === 0;
}

/* ---------------- HTTP yardımcıları ---------------- */
function gonder(res, kod, govde, tip = "application/json; charset=utf-8", ek = {}) {
  res.writeHead(kod, {
    "Content-Type": tip, "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer", "X-Frame-Options": "DENY", ...ek
  });
  res.end(typeof govde === "string" || Buffer.isBuffer(govde) ? govde : JSON.stringify(govde));
}
function govdeOku(req, sinir) {
  return new Promise((coz, red) => {
    let boy = 0; const parcalar = [];
    req.on("data", (p) => { boy += p.length; if (boy > sinir) { red(new Error("İstek çok büyük")); req.destroy(); } else parcalar.push(p); });
    req.on("end", () => { try { coz(JSON.parse(Buffer.concat(parcalar).toString("utf8") || "{}")); } catch (e) { red(new Error("Geçersiz veri")); } });
    req.on("error", red);
  });
}
function dosyaSun(res, kok, istenen, ekBasliklar = {}) {
  const yol = path.normalize(path.join(kok, istenen));
  if (!yol.startsWith(kok + path.sep) && yol !== kok) return gonder(res, 403, "Yasak", "text/plain");
  fs.stat(yol, (e, st) => {
    if (e || !st.isFile()) return gonder(res, 404, "Bulunamadı", "text/plain; charset=utf-8");
    gonder(res, 200, fs.readFileSync(yol), TIPLER[path.extname(yol).toLowerCase()] || "application/octet-stream", ekBasliklar);
  });
}
const PANEL_CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'self'";

/* ---------------- sunucu ---------------- */
const sunucu = http.createServer(async (req, res) => {
  // DNS rebinding koruması: sadece bu bilgisayarın adresleri
  const host = String(req.headers.host || "");
  if (host !== `${HOST}:${PORT}` && host !== `localhost:${PORT}`) return gonder(res, 403, "Yasak", "text/plain");
  const url = new URL(req.url, `http://${host}`);
  const p = decodeURIComponent(url.pathname);

  try {
    /* ---- API ---- */
    if (p.startsWith("/api/")) {
      const origin = req.headers.origin;
      if (origin && origin !== `http://${HOST}:${PORT}` && origin !== `http://localhost:${PORT}`) return gonder(res, 403, { hata: "Yasak kaynak" });
      if (req.headers["x-zw-token"] !== TOKEN) return gonder(res, 401, { hata: "Oturum geçersiz. Paneli yeniden açın." });

      if (p === "/api/veri" && req.method === "GET") {
        const v = jsYukle();
        let sonYayin = null;
        try { sonYayin = JSON.parse(fs.readFileSync(path.join(__dirname, "son-yayin.json"), "utf8")).tarih; } catch (e) { /* hiç yayın yok */ }
        return gonder(res, 200, { ...v, sonYayin });
      }
      if (p === "/api/urunler" && req.method === "PUT") {
        const g = await govdeOku(req, 2 * 1024 * 1024);
        const { hatalar, kategoriler, urunler } = veriDogrula(g);
        if (hatalar.length) return gonder(res, 422, { hatalar });
        yedekAl();
        dataJsYaz(kategoriler, urunler);
        // panelin yüklediği (p- ile başlayan) ama artık hiçbir üründe kullanılmayan fotoğrafları sil
        const kullanilan = new Set(urunler.flatMap((u) => u.gorseller));
        fs.readdirSync(URUN_GORSEL).filter((f) => /^p-/.test(f) && !kullanilan.has(f)).forEach((f) => fs.unlinkSync(path.join(URUN_GORSEL, f)));
        return gonder(res, 200, { tamam: true, kategoriler, urunler });
      }
      if (p === "/api/ayarlar" && req.method === "PUT") {
        const g = await govdeOku(req, 64 * 1024);
        const { hatalar, cikti } = ayarDogrula(g);
        if (hatalar.length) return gonder(res, 422, { hatalar });
        yedekAl();
        configJsYaz(cikti);
        return gonder(res, 200, { tamam: true, ayarlar: cikti });
      }
      if (p === "/api/foto" && req.method === "POST") {
        const g = await govdeOku(req, 12 * 1024 * 1024);
        const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(g.veri || ""));
        if (!m) return gonder(res, 422, { hata: "Desteklenmeyen görsel" });
        const buf = Buffer.from(m[2], "base64");
        const imza = { jpeg: [0xff, 0xd8, 0xff], png: [0x89, 0x50, 0x4e, 0x47], webp: [0x52, 0x49, 0x46, 0x46] }[m[1]];
        if (buf.length > 8 * 1024 * 1024 || !imza.every((b, i) => buf[i] === b)) return gonder(res, 422, { hata: "Görsel dosyası bozuk veya çok büyük" });
        const uzanti = m[1] === "jpeg" ? "jpg" : m[1];
        const ad = `p-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}.${uzanti}`;
        fs.mkdirSync(URUN_GORSEL, { recursive: true });
        fs.writeFileSync(path.join(URUN_GORSEL, ad), buf);
        return gonder(res, 200, { ad });
      }
      if (p === "/api/is" && req.method === "GET") return gonder(res, 200, is);
      if (p === "/api/is" && req.method === "POST") {
        const g = await govdeOku(req, 4096);
        const isler = {
          kontrol: () => kontrolEt(),
          yayinla: () => yayinla(),
          baglan: async () => (await wrangler("login")).kod === 0,
          durum: async () => { const r = await wrangler("whoami"); return r.kod === 0 && !/not authenticated|not logged in/i.test(r.cikti); }
        };
        if (!isler[g.ad]) return gonder(res, 400, { hata: "Bilinmeyen işlem" });
        if (is.calisiyor) return gonder(res, 409, { hata: "Başka bir işlem devam ediyor" });
        isBaslat(g.ad, isler[g.ad]);
        return gonder(res, 202, { basladi: true });
      }
      return gonder(res, 404, { hata: "Bulunamadı" });
    }

    /* ---- Site önizleme ---- */
    if (p.startsWith("/onizleme/")) return dosyaSun(res, KOK, p.slice("/onizleme/".length) || "index.html");
    if (p === "/onizleme") { res.writeHead(302, { Location: "/onizleme/index.html" }); return res.end(); }

    /* ---- Panel ---- */
    if (p === "/" || p === "/index.html") {
      const html = fs.readFileSync(path.join(PANEL, "index.html"), "utf8").replace("__ZW_TOKEN__", TOKEN);
      return gonder(res, 200, html, "text/html; charset=utf-8", { "Content-Security-Policy": PANEL_CSP });
    }
    return dosyaSun(res, PANEL, p.replace(/^\/+/, ""), { "Content-Security-Policy": PANEL_CSP });
  } catch (e) {
    return gonder(res, 400, { hata: e.message });
  }
});

sunucu.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.log(`Panel zaten açık görünüyor: http://${HOST}:${PORT}  (tarayıcıda açılıyor)`);
    tarayiciAc(); setTimeout(() => process.exit(0), 1500);
  } else { console.error(e); process.exit(1); }
});
function tarayiciAc() {
  const adres = `http://${HOST}:${PORT}/`;
  const k = process.platform === "win32" ? `start "" "${adres}"` : process.platform === "darwin" ? `open "${adres}"` : `xdg-open "${adres}"`;
  exec(k, () => {});
}
if (!fs.existsSync(path.join(KOK, "index.html"))) {
  console.error(`\n  Web sitesi klasörü bulunamadı:\n  ${KOK}\n\n  "ZyN Zeyno" ve "ZyN Zeyno Yönetim" klasörleri yan yana durmalı.\n`);
  process.exit(1);
}
sunucu.listen(PORT, HOST, () => {
  console.log("");
  console.log("  ZyN Zeyno Yönetim Paneli çalışıyor");
  console.log(`  Adres: http://${HOST}:${PORT}/`);
  console.log("  Paneli kapatmak için bu pencereyi kapatın.");
  console.log("");
  if (!process.env.ZW_TARAYICI_ACMA && !process.argv.includes("--tarayici-acma")) tarayiciAc();
});
