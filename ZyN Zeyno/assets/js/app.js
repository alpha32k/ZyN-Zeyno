/* ZyN Zeyno — ortak site kodu (veri doğrulama, header, footer, WhatsApp, ürün kartları) */
(function () {
  "use strict";
  const M = window.MAGAZA || {};

  /* ---------- yardımcılar ---------- */
  const $ = (s, k = document) => k.querySelector(s);
  // HTML'e yazılan her metin buradan geçer (XSS koruması)
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Sadece https/http linklerine izin ver (javascript:, data: vb. engellenir)
  function guvenliUrl(u) {
    if (!u) return "";
    try { const x = new URL(String(u), location.href); return /^https?:$/.test(x.protocol) ? x.href : ""; }
    catch (e) { return ""; }
  }
  const uyar = (...a) => console.warn("[ZyN Zeyno veri]", ...a);

  /* ---------- veri doğrulama ----------
     data.js / config.js elle düzenlendiği için yazım hatalarında site çökmesin,
     hatalı alanlar düzeltilsin ya da ürün atlanıp konsolda uyarı verilsin. */
  const ID_DESEN = /^[a-z0-9][a-z0-9-]{0,60}$/;
  const HEX_DESEN = /^#[0-9a-f]{6}$/i;
  const GORSEL_DESEN = /^[\w\-. ]+\.(jpe?g|png|webp|avif)$/i; // klasör/protokol içeremez

  M.ad = String(M.ad || "ZyN Zeyno");
  M.slogan = String(M.slogan || "");
  M.whatsapp = String(M.whatsapp || "").replace(/\D/g, "");
  M.paraBirimi = String(M.paraBirimi || "₺");
  M.fiyatGoster = M.fiyatGoster !== false;
  if (!M.whatsapp) uyar("config.js: whatsapp numarası boş.");

  const KATEGORILER = (Array.isArray(window.KATEGORILER) ? window.KATEGORILER : [])
    .filter((k) => k && ID_DESEN.test(k.id) && k.ad)
    .map((k) => ({ id: k.id, ad: String(k.ad) }));
  const katIdler = new Set(KATEGORILER.map((k) => k.id));

  const gorulenId = new Set();
  const URUNLER = (Array.isArray(window.URUNLER) ? window.URUNLER : []).map((u, i) => {
    if (!u || !ID_DESEN.test(u.id)) { uyar(`${i + 1}. ürün atlandı: geçersiz id`, u && u.id); return null; }
    if (gorulenId.has(u.id)) { uyar(`"${u.id}" atlandı: aynı id iki kez kullanılmış`); return null; }
    if (!katIdler.has(u.kategori)) { uyar(`"${u.id}" atlandı: kategori bulunamadı`, u.kategori); return null; }
    const seri = {};
    Object.entries(u.seri || {}).forEach(([b, a]) => { const n = parseInt(a, 10); if (n > 0) seri[String(b)] = Math.min(n, 99); });
    if (!Object.keys(seri).length) { uyar(`"${u.id}" atlandı: seri içeriği boş`); return null; }
    const fiyat = Number(u.fiyat);
    const renkler = (Array.isArray(u.renkler) ? u.renkler : [])
      .filter((r) => r && r.ad)
      .map((r) => ({ ad: String(r.ad), kod: HEX_DESEN.test(r.kod) ? r.kod : "#F9CACD" }));
    gorulenId.add(u.id);
    return {
      id: u.id,
      kod: String(u.kod || u.id).toUpperCase(),
      ad: String(u.ad || u.id),
      kategori: u.kategori,
      kumas: u.kumas ? String(u.kumas) : "",
      aciklama: u.aciklama ? String(u.aciklama) : "",
      seri,
      fiyat: isFinite(fiyat) && fiyat >= 0 ? fiyat : 0,
      minSeri: Math.max(1, Math.min(999, parseInt(u.minSeri, 10) || 1)),
      renkler: renkler.length ? renkler : [{ ad: "Standart", kod: "#F9CACD" }],
      gorseller: (Array.isArray(u.gorseller) ? u.gorseller : []).filter((g) => {
        const ok = GORSEL_DESEN.test(g); if (!ok) uyar(`"${u.id}": geçersiz görsel adı atlandı`, g); return ok;
      }),
      yeni: u.yeni === true
    };
  }).filter(Boolean);
  window.URUNLER = URUNLER; window.KATEGORILER = KATEGORILER;

  const para = (n) => n.toLocaleString("tr-TR", { maximumFractionDigits: 2 }) + " " + M.paraBirimi;
  const seriParca = (u) => Object.values(u.seri).reduce((a, b) => a + b, 0);
  const seriFiyat = (u) => u.fiyat * seriParca(u);
  const seriYazi = (u) => Object.entries(u.seri).map(([b, a]) => (a > 1 ? `${b}×${a}` : b)).join(" · ");
  const urunBul = (id) => URUNLER.find((u) => u.id === id);
  const kategoriAd = (id) => (KATEGORILER.find((k) => k.id === id) || {}).ad || "";
  const gorselYol = (dosya) => "assets/img/urunler/" + encodeURIComponent(dosya);

  function koyuMu(hex) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 110;
  }
  // Ürün görseli yoksa: ürün rengine göre logo çizimli zarif bir zemin
  function gorselHtml(u, renkKod, i = 0) {
    const renk = HEX_DESEN.test(renkKod) ? renkKod : u.renkler[0].kod;
    const yedek = `<div class="gorselsiz${koyuMu(renk) ? " koyu" : ""}" style="--renk:${renk}"><div class="gorselsiz-cizim"></div></div>`;
    if (!u.gorseller.length) return yedek;
    const dosya = u.gorseller[Math.min(i, u.gorseller.length - 1)];
    return `${yedek}<img class="urun-foto" src="${esc(gorselYol(dosya))}" alt="${esc(u.ad)}" loading="lazy">`;
  }
  // Yüklenemeyen ürün fotoğrafını kaldır, alttaki renkli zemin görünsün (inline onerror yerine; CSP uyumlu)
  document.addEventListener("error", (e) => {
    const t = e.target;
    if (t && t.tagName === "IMG" && t.closest(".urun-gorsel, .galeri-ana, .galeri-kucuk")) {
      if (t.closest(".galeri-kucuk")) t.closest("button").remove(); else t.remove();
    }
  }, true);

  /* ---------- WhatsApp ---------- */
  const waLink = (mesaj) => `https://wa.me/${M.whatsapp}?text=${encodeURIComponent(mesaj)}`;
  const WA_IKON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.7 15.6 2.2 13.8 2.2 12 2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zm8.4-18.2C18.1 1.3 15.2.1 12 .1 5.5.1.1 5.5.1 12c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.7c1.7.9 3.7 1.4 5.7 1.4 6.5 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.4z"/></svg>';

  const urunLinki = (u) => (/^https?:$/.test(location.protocol)
    ? location.origin + location.pathname.replace(/[^/]*$/, "") + "urun.html?id=" + encodeURIComponent(u.id) : "");

  // Ürün sayfasından doğrudan sipariş mesajı
  function siparisMesaji(u, renk, seri) {
    const parca = seriParca(u) * seri;
    let m = `Merhaba ${M.ad}, bu üründen sipariş vermek istiyorum:\n\n`;
    m += `• ${u.kod} – ${u.ad}\n`;
    m += `  Renk: ${renk}\n`;
    m += `  Seri: ${seriYazi(u)} (${seriParca(u)} parça)\n`;
    m += `  Adet: ${seri} seri = ${parca} parça\n`;
    if (M.fiyatGoster) m += `  Tutar: ${para(parca * u.fiyat)}\n`;
    const link = urunLinki(u);
    if (link) m += `\nÜrün: ${link}\n`;
    m += `\nFirma / Ad Soyad:\nŞehir:`;
    return m;
  }

  /* ---------- header / footer ---------- */
  const IKON = {
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    konum: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    saat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor"/></svg>',
    web: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v2.6c-1.4.1-2.6-.3-3.9-1.1v5.4c0 6.8-7.4 9-10.4 4.1-1.9-3.1-.7-8.6 5.5-8.8v2.8c-.5.1-1 .2-1.4.4-1.4.5-2.2 1.4-2 3 .4 3 6 3.9 5.5-2V3h2.8z"/></svg>'
  };

  // Markaların kendi renkli logoları (sosyal medya butonları için)
  const TIKTOK_YOL = "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z";
  const LOGO = {
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><defs><radialGradient id="zw-ig" cx="30%" cy="107%" r="150%"><stop offset="0" stop-color="#FDF497"/><stop offset=".05" stop-color="#FDF497"/><stop offset=".45" stop-color="#FD5949"/><stop offset=".6" stop-color="#D6249F"/><stop offset=".9" stop-color="#285AEB"/></radialGradient></defs><rect x="1" y="1" width="22" height="22" rx="6.5" fill="url(#zw-ig)"/><rect x="5.5" y="5.5" width="13" height="13" rx="4" fill="none" stroke="#fff" stroke-width="1.7"/><circle cx="12" cy="12" r="3.1" fill="none" stroke="#fff" stroke-width="1.7"/><circle cx="16.1" cy="7.9" r="1" fill="#fff"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#0866FF" d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>',
    tiktok: `<svg viewBox="-1 -1 26 26" aria-hidden="true"><path fill="#25F4EE" transform="translate(-.9 -.7)" d="${TIKTOK_YOL}"/><path fill="#FE2C55" transform="translate(.9 .7)" d="${TIKTOK_YOL}"/><path fill="#000" d="${TIKTOK_YOL}"/></svg>`
  };

  // Sosyal medya hesapları (config.js'te boş bırakılanlar listelenmez)
  const SOSYAL = [
    { anahtar: "instagram", ad: "Instagram" },
    { anahtar: "facebook", ad: "Facebook" },
    { anahtar: "tiktok", ad: "TikTok" }
  ].map((s) => ({ ...s, url: guvenliUrl(M[s.anahtar]), ikon: LOGO[s.anahtar] })).filter((s) => s.url);

  // Henüz doldurulmamış "[ALAN]" değerleri
  const doluMu = (v) => !!v && !/^\[.*\]$/.test(String(v).trim());

  // Yasal sayfalardaki <span data-cfg="firma.unvan"> alanlarını config.js'ten doldur
  function cfgDoldur() {
    document.querySelectorAll("[data-cfg]").forEach((el) => {
      const v = el.dataset.cfg.split(".").reduce((o, k) => (o ? o[k] : undefined), M);
      el.textContent = v == null || v === "" ? "—" : String(v);
      if (!doluMu(v)) el.classList.add("eksik-bilgi");
    });
    document.querySelectorAll("[data-cfg-eposta]").forEach((el) => {
      const e = M.firma && M.firma.eposta;
      if (doluMu(e) && /^[^\s@<>"']+@[^\s@<>"']+\.[a-z]{2,}$/i.test(e)) { el.innerHTML = `<a href="mailto:${esc(e)}">${esc(e)}</a>`; }
      else { el.textContent = e || "[E-POSTA ADRESİ]"; el.classList.add("eksik-bilgi"); }
    });
    const taslak = document.querySelector("[data-taslak-uyari]");
    if (taslak) taslak.hidden = M.yasalMetinOnaylandi === true;
    document.querySelectorAll("[data-wa-link]").forEach((a) => {
      a.href = waLink(`Merhaba ${M.ad}, bilgi almak istiyorum.`); a.target = "_blank"; a.rel = "noopener noreferrer";
    });
  }

  function sablonCiz() {
    const sayfa = document.body.dataset.sayfa;
    const aktif = (s) => (sayfa === s ? ' class="aktif" aria-current="page"' : "");
    const genelMesaj = `Merhaba ${M.ad}, toptan ürünleriniz hakkında bilgi almak istiyorum.`;
    const header = document.createElement("div");
    header.innerHTML = `
      <a class="icerige-gec" href="#icerik-basi">İçeriğe geç</a>
      <header class="header">
        <div class="kap">
          <a href="index.html" class="marka" aria-label="${esc(M.ad)} ana sayfa">
            <span class="marka-logo" aria-hidden="true"></span>
            <span class="marka-ad">${esc(M.ad)}<small>${esc(M.slogan)}</small></span>
          </a>
          <nav class="nav" id="nav" aria-label="Ana menü">
            <a href="index.html#urunler"${aktif("ana")}>Ürünler</a>
            <a href="index.html#iletisim">İletişim</a>
          </nav>
          <div class="header-aksiyon">
            <button type="button" class="ikon-btn menu-btn" id="menuBtn" aria-label="Menüyü aç" aria-expanded="false" aria-controls="nav">${IKON.menu}</button>
          </div>
        </div>
      </header>`;
    document.body.prepend(...header.children);

    const footer = document.createElement("footer");
    footer.className = "footer";
    footer.innerHTML = `
      <div class="kap">
        <a href="index.html" class="marka"><span class="marka-logo" aria-hidden="true"></span><span class="marka-ad">${esc(M.ad)}<small>${esc(M.slogan)}</small></span></a>
        <p>Butik ve mağazalar için seri halinde toptan kadın giyim. Tüm siparişler WhatsApp üzerinden alınır.</p>
        <div class="footer-alt">
          <span>© ${new Date().getFullYear()} ${esc(M.ad)} · Toptan Kadın Giyim</span>
          <nav class="footer-yasal" aria-label="Yasal bilgiler">
            <a href="kvkk.html">KVKK Aydınlatma Metni</a>
            <a href="gizlilik-ve-cerez-politikasi.html">Gizlilik ve Çerez Politikası</a>
          </nav>
        </div>
      </div>`;
    document.body.append(footer);

    const wa = document.createElement("a");
    wa.className = "wa-sabit"; wa.href = waLink(genelMesaj); wa.target = "_blank"; wa.rel = "noopener noreferrer";
    wa.setAttribute("aria-label", "WhatsApp ile yazın"); wa.innerHTML = WA_IKON;
    document.body.append(wa);

    const nav = $("#nav"), menuBtn = $("#menuBtn");
    const menuKapat = () => { nav.classList.remove("acik"); menuBtn.setAttribute("aria-expanded", "false"); };
    menuBtn.addEventListener("click", () => {
      const acik = nav.classList.toggle("acik");
      menuBtn.setAttribute("aria-expanded", acik);
    });
    nav.addEventListener("click", (e) => { if (e.target.tagName === "A") menuKapat(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") menuKapat(); });

    // Header alt çizgisi yalnızca sayfa kaydırılınca görünür
    const headerEl = document.querySelector(".header");
    const kaydirmaKontrol = () => headerEl.classList.toggle("kaydirildi", window.scrollY > 8);
    window.addEventListener("scroll", kaydirmaKontrol, { passive: true });
    kaydirmaKontrol();

    // "İçeriğe geç" hedefi: sayfanın <main> öğesi
    const main = document.querySelector("main");
    if (main && !main.id) main.id = "icerik-basi";
    if (main) main.setAttribute("tabindex", "-1");
    cfgDoldur();
  }

  /* ---------- ürün kartı ---------- */
  function urunKart(u) {
    const link = `urun.html?id=${encodeURIComponent(u.id)}`;
    return `<article class="urun-kart">
      <a href="${link}" class="urun-gorsel" aria-label="${esc(u.ad)}">
        ${u.yeni ? '<span class="etiket">Yeni</span>' : ""}
        ${gorselHtml(u)}
        <span class="seri-rozet"><span>Seri: <b>${esc(seriYazi(u))}</b></span><span>${seriParca(u)} parça</span></span>
      </a>
      <div class="urun-bilgi">
        <div class="urun-kod">${esc(u.kod)} · ${esc(kategoriAd(u.kategori))}</div>
        <h3 class="urun-ad"><a href="${link}">${esc(u.ad)}</a></h3>
        <div class="renk-noktalar">${u.renkler.map((r) => `<span class="renk-nokta" style="background:${r.kod}" title="${esc(r.ad)}"></span>`).join("")}</div>
        <div class="fiyat-satir">${M.fiyatGoster
          ? `<span class="fiyat">${para(u.fiyat)} <small style="font-weight:400">/ adet</small></span><span class="fiyat-alt">Seri: ${para(seriFiyat(u))}</span>`
          : `<span class="fiyat-alt">Fiyat için WhatsApp'tan sorun</span>`}</div>
      </div>
    </article>`;
  }

  /* ---------- Google için yapılandırılmış veri (JSON-LD) ----------
     type="application/ld+json" çalıştırılabilir kod değildir; CSP'yi etkilemez. */
  function jsonLd(veri) {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(veri).replace(/</g, "\\u003c");
    document.head.appendChild(s);
  }
  const siteKok = () => {
    const u = guvenliUrl(M.siteAdresi);
    return u ? u.replace(/\/+$/, "") : (/^https?:$/.test(location.protocol) ? location.origin + location.pathname.replace(/[^/]*$/, "").replace(/\/$/, "") : "");
  };

  /* ---------- dışa aç ---------- */
  window.ZW = { $, esc, guvenliUrl, doluMu, SOSYAL, para, seriParca, seriFiyat, seriYazi, urunBul, kategoriAd, gorselHtml, gorselYol,
    waLink, WA_IKON, IKON, siparisMesaji, urunKart, jsonLd, siteKok };

  sablonCiz();
})();
