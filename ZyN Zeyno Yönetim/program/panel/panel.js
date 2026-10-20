/* ZyN Zeyno — Yönetim Paneli arayüzü */
(function () {
  "use strict";
  const TOKEN = document.querySelector('meta[name="zw-token"]').content;
  const $ = (s, k = document) => k.querySelector(s);
  const $$ = (s, k = document) => [...k.querySelectorAll(s)];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const para = (n) => Number(n || 0).toLocaleString("tr-TR", { maximumFractionDigits: 2 }) + " ₺";
  const gorselUrl = (g) => "/onizleme/assets/img/urunler/" + encodeURIComponent(g);
  const IKON = {
    yukari: '<svg viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    asagi: '<svg viewBox="0 0 24 24"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
    duzenle: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
    sil: '<svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/></svg>'
  };

  let durum = { ayarlar: {}, kategoriler: [], urunler: [] };
  let kirli = { kategoriler: false, ayarlar: false };

  /* ---------------- API ---------------- */
  async function api(yontem, adres, govde) {
    const r = await fetch(adres, {
      method: yontem, headers: { "Content-Type": "application/json", "X-ZW-Token": TOKEN },
      body: govde === undefined ? undefined : JSON.stringify(govde)
    });
    let veri = {};
    try { veri = await r.json(); } catch (e) { /* boş yanıt */ }
    if (!r.ok) { const h = new Error(veri.hata || (veri.hatalar || []).join("\n") || "İşlem başarısız"); h.hatalar = veri.hatalar; h.kod = r.status; throw h; }
    return veri;
  }

  let bildirimZ;
  function bildir(metin, hata) {
    const b = $("#bildirim"); b.textContent = metin; b.classList.toggle("hata", !!hata); b.classList.add("goster");
    clearTimeout(bildirimZ); bildirimZ = setTimeout(() => b.classList.remove("goster"), hata ? 5000 : 2600);
  }

  /* ---------------- yardımcılar ---------------- */
  const TR = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", Ö: "o", Ş: "s", Ü: "u" };
  const slug = (s) => String(s).replace(/[çğıİöşüÇĞÖŞÜ]/g, (c) => TR[c]).toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "urun";
  function benzersiz(taban, mevcut) {
    let id = taban, n = 2;
    while (mevcut.has(id)) id = `${taban}-${n++}`;
    return id;
  }
  const seriParca = (seri) => Object.values(seri || {}).reduce((a, b) => a + Number(b || 0), 0);
  const seriYazi = (seri) => Object.entries(seri || {}).map(([b, a]) => (a > 1 ? `${b}×${a}` : b)).join(" · ");
  const katAd = (id) => (durum.kategoriler.find((k) => k.id === id) || {}).ad || "—";

  async function urunleriKaydet(urunler, kategoriler = durum.kategoriler) {
    const sonuc = await api("PUT", "/api/urunler", { kategoriler, urunler });
    durum.urunler = sonuc.urunler; durum.kategoriler = sonuc.kategoriler;
    return sonuc;
  }

  /* ---------------- sekmeler ---------------- */
  function sekmeAc(ad) {
    $$("#menu button").forEach((b) => b.classList.toggle("aktif", b.dataset.sekme === ad));
    $$(".sekme").forEach((s) => (s.hidden = s.id !== "s-" + ad));
    if (ad === "kategoriler") katCiz();
    if (ad === "ayarlar") ayarDoldur();
    window.scrollTo(0, 0);
  }
  $("#menu").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-sekme]"); if (!b) return;
    const aktif = $("#menu .aktif").dataset.sekme;
    if (kirli[aktif] && !confirm("Kaydedilmemiş değişiklikler var. Yine de çıkılsın mı?")) return;
    kirli[aktif] = false;
    sekmeAc(b.dataset.sekme);
    menuKapat();
  });

  /* sol menü (tüm ekranlarda): ☰ ile açılır, sekme seçince / dışına tıklayınca / Esc ile kapanır */
  function menuAc() { document.body.classList.add("menu-acik"); $("#menuAc").setAttribute("aria-expanded", "true"); }
  function menuKapat() { document.body.classList.remove("menu-acik"); $("#menuAc").setAttribute("aria-expanded", "false"); }
  $("#menuAc").addEventListener("click", () => (document.body.classList.contains("menu-acik") ? menuKapat() : menuAc()));
  $("#yanPerde").addEventListener("click", menuKapat);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && document.body.classList.contains("menu-acik")) menuKapat(); });  window.addEventListener("beforeunload", (e) => { if (kirli.kategoriler || kirli.ayarlar) { e.preventDefault(); e.returnValue = ""; } });

  /* ================= ÜRÜNLER ================= */
  function filtreDoldur() {
    const sec = $("#katFiltre"), deger = sec.value;
    sec.innerHTML = `<option value="">Tüm kategoriler</option>` + durum.kategoriler.map((k) => `<option value="${esc(k.id)}">${esc(k.ad)}</option>`).join("");
    sec.value = durum.kategoriler.some((k) => k.id === deger) ? deger : "";
  }
  function urunCiz() {
    $("#urunSayi").textContent = durum.urunler.length;
    const q = $("#urunAra").value.trim().toLocaleLowerCase("tr"), kat = $("#katFiltre").value;
    const filtreli = !!(q || kat);
    const liste = durum.urunler.map((u, i) => ({ u, i })).filter(({ u }) =>
      (!kat || u.kategori === kat) && (!q || `${u.ad} ${u.kod}`.toLocaleLowerCase("tr").includes(q)));
    if (!liste.length) {
      $("#urunListe").innerHTML = `<div class="bos">${durum.urunler.length ? "Aramaya uyan ürün yok." : "Henüz ürün yok. <b>Yeni Ürün</b> ile ekleyin."}</div>`;
      return;
    }
    $("#urunListe").innerHTML = liste.map(({ u, i }) => {
      const kapak = u.gorseller && u.gorseller[0];
      return `<div class="urun-satir" data-i="${i}">
        <div class="kucuk-foto" ${kapak ? `style="background-image:url('${esc(gorselUrl(kapak))}')"` : ""}>${kapak ? "" : "Foto yok"}</div>
        <div class="urun-bilgi">
          <h3>${esc(u.ad)}</h3>
          <p>${esc(u.kod)} · ${esc(katAd(u.kategori))} · Seri: ${esc(seriYazi(u.seri))} (${seriParca(u.seri)} parça) · ${u.renkler.length} renk</p>
          <div class="etiketler">${u.yeni ? '<span class="et koyu">Yeni</span>' : ""}${!kapak ? '<span class="et uyari">Fotoğraf eklenmemiş</span>' : ""}<span class="et">En az ${u.minSeri} seri</span></div>
        </div>
        <div class="urun-fiyat">${para(u.fiyat)} <small>/ adet · seri ${para(u.fiyat * seriParca(u.seri))}</small></div>
        <div class="satir-btn">
          <button class="ikon-btn" data-islem="yukari" title="Yukarı taşı" ${filtreli || i === 0 ? "disabled" : ""}>${IKON.yukari}</button>
          <button class="ikon-btn" data-islem="asagi" title="Aşağı taşı" ${filtreli || i === durum.urunler.length - 1 ? "disabled" : ""}>${IKON.asagi}</button>
          <button class="ikon-btn" data-islem="duzenle" title="Düzenle">${IKON.duzenle}</button>
        </div>
      </div>`;
    }).join("");
  }
  $("#urunAra").addEventListener("input", urunCiz);
  $("#katFiltre").addEventListener("change", urunCiz);
  $("#urunListe").addEventListener("click", async (e) => {
    const satir = e.target.closest(".urun-satir"); if (!satir) return;
    const i = +satir.dataset.i, b = e.target.closest("button[data-islem]");
    if (b && (b.dataset.islem === "yukari" || b.dataset.islem === "asagi")) {
      const j = b.dataset.islem === "yukari" ? i - 1 : i + 1;
      const yeni = durum.urunler.slice(); [yeni[i], yeni[j]] = [yeni[j], yeni[i]];
      try { await urunleriKaydet(yeni); urunCiz(); } catch (h) { bildir(h.message, true); }
      return;
    }
    pencereAc(durum.urunler[i]);
  });
  $("#yeniUrun").addEventListener("click", () => {
    if (!durum.kategoriler.length) return bildir("Önce en az bir kategori ekleyin.", true);
    pencereAc(null);
  });

  /* ---------- ürün penceresi ---------- */
  const pencere = $("#urunPencere"), form = $("#urunForm");
  let duzen = null; // { id, gorseller }

  const SERI_HAZIR = {
    "S · M · L · XL": { S: 1, M: 1, L: 1, XL: 1 },
    "S · M×2 · L×2 · XL": { S: 1, M: 2, L: 2, XL: 1 },
    "S · M · L": { S: 1, M: 1, L: 1 },
    "M · L · XL · XXL": { M: 1, L: 1, XL: 1, XXL: 1 },
    "36 · 38 · 40 · 42": { 36: 1, 38: 1, 40: 1, 42: 1 },
    "38 · 40 · 42 · 44": { 38: 1, 40: 1, 42: 1, 44: 1 },
    "Standart × 4": { STD: 4 }
  };
  const RENK_HAZIR = [["Siyah", "#1F1A1B"], ["Beyaz", "#FFFFFF"], ["Ekru", "#F3EDE2"], ["Krem", "#F1E8DA"], ["Bej", "#D9C7B0"],
    ["Taş", "#CFC3B4"], ["Camel", "#B98B5E"], ["Kahve", "#6B4E3D"], ["Pudra", "#F2C4C6"], ["Gül Kurusu", "#C08A8E"],
    ["Kırmızı", "#B3261E"], ["Bordo", "#6D1F2B"], ["Lacivert", "#28324A"], ["Mavi", "#5B7DB1"], ["Mint", "#BFD8C9"],
    ["Haki", "#7C7A5C"], ["Zümrüt", "#2F5D50"], ["Gri", "#9A9696"]];

  $("#seriHazir").innerHTML = Object.keys(SERI_HAZIR).map((k) => `<button type="button" data-seri="${esc(k)}">${esc(k)}</button>`).join("");
  $("#renkHazir").innerHTML = RENK_HAZIR.map(([ad, kod]) => `<button type="button" data-ad="${esc(ad)}" data-kod="${kod}"><i style="background:${kod}"></i>${esc(ad)}</button>`).join("");

  function seriSatir(beden = "", adet = 1) {
    const d = document.createElement("div"); d.className = "satir";
    d.innerHTML = `<input name="beden" maxlength="10" placeholder="Beden (örn. M)" value="${esc(beden)}">
      <input name="adet" type="number" min="1" max="99" value="${esc(adet)}" aria-label="Adet">
      <button type="button" class="ikon-btn" data-kaldir title="Kaldır">${IKON.sil}</button>`;
    $("#seriSatirlar").appendChild(d);
  }
  function renkSatir(ad = "", kod = "#F2C4C6") {
    const d = document.createElement("div"); d.className = "satir";
    d.innerHTML = `<input type="color" name="renkKod" value="${esc(kod)}" aria-label="Renk">
      <input name="renkAd" maxlength="30" placeholder="Renk adı (örn. Pudra)" value="${esc(ad)}">
      <button type="button" class="ikon-btn" data-kaldir title="Kaldır">${IKON.sil}</button>`;
    $("#renkSatirlar").appendChild(d);
  }
  function seriTopla() {
    const seri = {};
    $$("#seriSatirlar .satir").forEach((s) => {
      const b = $('[name="beden"]', s).value.trim(), a = parseInt($('[name="adet"]', s).value, 10);
      if (b) seri[b] = (seri[b] || 0) + (a > 0 ? a : 0);
    });
    return seri;
  }
  function seriOzet() {
    const seri = seriTopla(), p = seriParca(seri), f = Number(form.fiyat.value || 0);
    $("#seriOzet").textContent = p ? `1 seri = ${p} parça${f ? ` · seri fiyatı ${para(f * p)}` : ""}` : "";
  }
  form.addEventListener("input", (e) => { if (e.target.closest("#seriSatirlar") || e.target.name === "fiyat") seriOzet(); });
  $("#seriHazir").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-seri]"); if (!b) return;
    $("#seriSatirlar").innerHTML = "";
    Object.entries(SERI_HAZIR[b.dataset.seri]).forEach(([be, a]) => seriSatir(be, a));
    seriOzet();
  });
  $("#renkHazir").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-ad]"); if (!b) return;
    const var_ = $$('#renkSatirlar [name="renkAd"]').some((i) => i.value.trim().toLocaleLowerCase("tr") === b.dataset.ad.toLocaleLowerCase("tr"));
    if (!var_) renkSatir(b.dataset.ad, b.dataset.kod);
  });
  $("#bedenEkle").addEventListener("click", () => { seriSatir("", 1); seriOzet(); });
  $("#renkEkle").addEventListener("click", () => renkSatir());
  form.addEventListener("click", (e) => {
    const k = e.target.closest("[data-kaldir]"); if (!k) return;
    k.closest(".satir").remove(); seriOzet();
  });

  /* fotoğraflar */
  function fotoCiz() {
    $("#fotolar").innerHTML = duzen.gorseller.map((g, i) => `<div class="foto" style="background-image:url('${esc(gorselUrl(g))}')">
      ${i === 0 ? '<span class="kapak">KAPAK</span>' : ""}
      <div class="foto-btn">
        <button type="button" data-foto="sol" data-i="${i}" title="Sola al" ${i === 0 ? "disabled" : ""}>‹</button>
        <button type="button" data-foto="sil" data-i="${i}" title="Kaldır">✕</button>
        <button type="button" data-foto="sag" data-i="${i}" title="Sağa al" ${i === duzen.gorseller.length - 1 ? "disabled" : ""}>›</button>
      </div></div>`).join("");
  }
  $("#fotolar").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-foto]"); if (!b) return;
    const i = +b.dataset.i, g = duzen.gorseller;
    if (b.dataset.foto === "sil") g.splice(i, 1);
    if (b.dataset.foto === "sol" && i > 0) [g[i - 1], g[i]] = [g[i], g[i - 1]];
    if (b.dataset.foto === "sag" && i < g.length - 1) [g[i + 1], g[i]] = [g[i], g[i + 1]];
    fotoCiz();
  });
  async function kucult(dosya) {
    const bmp = await createImageBitmap(dosya);
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height);
    x.drawImage(bmp, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.86);
  }
  async function fotoYukle(dosyalar) {
    const uygun = [...dosyalar].filter((d) => /^image\/(jpeg|png|webp)$/.test(d.type));
    if (!uygun.length) return bildir("Sadece JPG, PNG veya WEBP fotoğraf ekleyebilirsiniz.", true);
    for (const d of uygun) {
      if (duzen.gorseller.length >= 12) { bildir("Bir ürüne en fazla 12 fotoğraf eklenebilir.", true); break; }
      const yer = document.createElement("div"); yer.className = "foto yukleniyor"; $("#fotolar").appendChild(yer);
      try {
        const veri = await kucult(d);
        const { ad } = await api("POST", "/api/foto", { veri });
        duzen.gorseller.push(ad);
      } catch (h) { bildir(`"${d.name}" yüklenemedi: ${h.message}`, true); }
      fotoCiz();
    }
  }
  $("#fotoSec").addEventListener("change", (e) => { fotoYukle(e.target.files); e.target.value = ""; });
  const alan = $("#fotoAlan");
  ["dragenter", "dragover"].forEach((t) => alan.addEventListener(t, (e) => { e.preventDefault(); alan.classList.add("uzerinde"); }));
  ["dragleave", "drop"].forEach((t) => alan.addEventListener(t, (e) => { e.preventDefault(); alan.classList.remove("uzerinde"); }));
  alan.addEventListener("drop", (e) => fotoYukle(e.dataTransfer.files));

  function pencereAc(u) {
    duzen = { id: u ? u.id : null, gorseller: u ? u.gorseller.slice() : [] };
    $("#pencereBaslik").textContent = u ? "Ürünü Düzenle" : "Yeni Ürün";
    $("#urunSil").hidden = !u;
    $("#urunHata").hidden = true;
    form.kategori.innerHTML = durum.kategoriler.map((k) => `<option value="${esc(k.id)}">${esc(k.ad)}</option>`).join("");
    form.ad.value = u ? u.ad : "";
    form.kod.value = u ? u.kod : "";
    form.kategori.value = u ? u.kategori : ($("#katFiltre").value || durum.kategoriler[0].id);
    form.fiyat.value = u ? u.fiyat : "";
    form.minSeri.value = u ? u.minSeri : 1;
    form.kumas.value = u ? u.kumas : "";
    form.aciklama.value = u ? u.aciklama : "";
    form.yeni.checked = u ? u.yeni : true;
    $("#seriSatirlar").innerHTML = ""; $("#renkSatirlar").innerHTML = "";
    if (u) {
      Object.entries(u.seri).forEach(([b, a]) => seriSatir(b, a));
      u.renkler.forEach((r) => renkSatir(r.ad, r.kod));
    } else {
      Object.entries(SERI_HAZIR["S · M · L · XL"]).forEach(([b, a]) => seriSatir(b, a));
    }
    fotoCiz(); seriOzet();
    pencere.showModal();
    form.ad.focus();
  }
  function pencereKapat() { pencere.close(); duzen = null; }
  $("#pencereKapat").addEventListener("click", pencereKapat);
  $("#urunVazgec").addEventListener("click", pencereKapat);

  function hataGoster(liste) {
    const k = $("#urunHata");
    k.innerHTML = `<b>Kaydedilemedi:</b><ul>${liste.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>`;
    k.hidden = false; k.scrollIntoView({ block: "nearest" });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const seri = seriTopla();
    const renkler = $$("#renkSatirlar .satir").map((s) => ({ ad: $('[name="renkAd"]', s).value.trim(), kod: $('[name="renkKod"]', s).value.toUpperCase() })).filter((r) => r.ad);
    const eksik = [];
    if (!Object.keys(seri).length) eksik.push("En az bir beden ekleyin.");
    if (!renkler.length) eksik.push("En az bir renk ekleyin (adını yazmayı unutmayın).");
    if (eksik.length) return hataGoster(eksik);

    const mevcutIdler = new Set(durum.urunler.filter((x) => x.id !== duzen.id).map((x) => x.id));
    const urun = {
      id: duzen.id || benzersiz(slug(form.ad.value), mevcutIdler),
      kod: form.kod.value.trim().toUpperCase(), ad: form.ad.value.trim(), kategori: form.kategori.value,
      kumas: form.kumas.value.trim(), seri, fiyat: Number(form.fiyat.value), minSeri: parseInt(form.minSeri.value, 10),
      renkler, aciklama: form.aciklama.value.trim(), gorseller: duzen.gorseller.slice(), yeni: form.yeni.checked
    };
    const kodCakisma = durum.urunler.find((x) => x.id !== duzen.id && x.kod === urun.kod);
    if (kodCakisma && !confirm(`"${urun.kod}" kodu "${kodCakisma.ad}" ürününde de kullanılıyor. Yine de kaydedilsin mi?`)) return;

    const yeniListe = duzen.id ? durum.urunler.map((x) => (x.id === duzen.id ? urun : x)) : [urun, ...durum.urunler];
    const btn = $("#urunKaydet"); btn.disabled = true;
    try {
      await urunleriKaydet(yeniListe);
      pencereKapat(); urunCiz(); bildir(`"${urun.ad}" kaydedildi. Sitede görünmesi için Yayınla'ya basın.`);
    } catch (h) { hataGoster(h.hatalar || [h.message]); }
    btn.disabled = false;
  });

  $("#urunSil").addEventListener("click", async () => {
    const u = durum.urunler.find((x) => x.id === duzen.id); if (!u) return;
    if (!confirm(`"${u.ad}" ürünü silinsin mi? Fotoğrafları da silinir.`)) return;
    try {
      await urunleriKaydet(durum.urunler.filter((x) => x.id !== u.id));
      pencereKapat(); urunCiz(); bildir(`"${u.ad}" silindi.`);
    } catch (h) { hataGoster(h.hatalar || [h.message]); }
  });

  /* ================= KATEGORİLER ================= */
  let katDuzen = [];
  function katCiz(yenidenKopyala = true) {
    if (yenidenKopyala) katDuzen = durum.kategoriler.map((k) => ({ ...k }));
    const sayi = (id) => durum.urunler.filter((u) => u.kategori === id).length;
    $("#katListe").innerHTML = katDuzen.map((k, i) => `<div class="kat-satir" data-i="${i}">
      <input value="${esc(k.ad)}" maxlength="40" aria-label="Kategori adı">
      <span class="say">${sayi(k.id)} ürün</span>
      <div class="satir-btn">
        <button type="button" class="ikon-btn" data-islem="yukari" ${i === 0 ? "disabled" : ""} title="Yukarı">${IKON.yukari}</button>
        <button type="button" class="ikon-btn" data-islem="asagi" ${i === katDuzen.length - 1 ? "disabled" : ""} title="Aşağı">${IKON.asagi}</button>
        <button type="button" class="ikon-btn" data-islem="sil" title="Sil">${IKON.sil}</button>
      </div></div>`).join("") || '<p class="ipucu">Henüz kategori yok.</p>';
  }
  $("#katListe").addEventListener("input", (e) => {
    const s = e.target.closest(".kat-satir"); if (!s) return;
    katDuzen[+s.dataset.i].ad = e.target.value; kirli.kategoriler = true;
  });
  $("#katListe").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-islem]"); if (!b) return;
    const i = +b.closest(".kat-satir").dataset.i;
    if (b.dataset.islem === "sil") {
      const n = durum.urunler.filter((u) => u.kategori === katDuzen[i].id).length;
      if (n) return bildir(`Bu kategoride ${n} ürün var. Önce ürünleri başka kategoriye taşıyın veya silin.`, true);
      katDuzen.splice(i, 1);
    } else {
      const j = b.dataset.islem === "yukari" ? i - 1 : i + 1;
      [katDuzen[i], katDuzen[j]] = [katDuzen[j], katDuzen[i]];
    }
    kirli.kategoriler = true; katCiz(false);
  });
  $("#katEkleForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const ad = $("#katYeniAd").value.trim(); if (!ad) return;
    if (katDuzen.some((k) => k.ad.toLocaleLowerCase("tr") === ad.toLocaleLowerCase("tr"))) return bildir("Bu kategori zaten var.", true);
    katDuzen.push({ id: benzersiz(slug(ad), new Set(katDuzen.map((k) => k.id))), ad });
    $("#katYeniAd").value = ""; kirli.kategoriler = true; katCiz(false);
  });
  $("#katKaydet").addEventListener("click", async () => {
    if (katDuzen.some((k) => !k.ad.trim())) return bildir("Kategori adı boş olamaz.", true);
    try {
      await urunleriKaydet(durum.urunler, katDuzen.map((k) => ({ id: k.id, ad: k.ad.trim() })));
      kirli.kategoriler = false; katCiz(); filtreDoldur(); urunCiz(); bildir("Kategoriler kaydedildi.");
    } catch (h) { bildir((h.hatalar || [h.message]).join(" · "), true); }
  });

  /* ================= AYARLAR ================= */
  const af = $("#ayarForm");
  const SATIRLI = ["notlar", "calismaSaatleri"];
  function ayarDoldur() {
    const a = durum.ayarlar;
    $$("[name]", af).forEach((el) => {
      const v = el.name.split(".").reduce((o, k) => (o ? o[k] : undefined), a);
      if (el.type === "checkbox") el.checked = el.name === "fiyatGoster" ? v !== false : v === true;
      else if (SATIRLI.includes(el.name)) el.value = [].concat(v || []).join("\n");
      else el.value = v == null ? "" : v;
    });
    kirli.ayarlar = false;
  }
  af.addEventListener("input", () => (kirli.ayarlar = true));
  $("#ayarKaydet").addEventListener("click", async () => {
    const a = JSON.parse(JSON.stringify(durum.ayarlar)); a.firma = a.firma || {};
    $$("[name]", af).forEach((el) => {
      let v = el.type === "checkbox" ? el.checked : SATIRLI.includes(el.name) ? el.value.split("\n").map((s) => s.trim()).filter(Boolean) : el.value.trim();
      const [k1, k2] = el.name.split(".");
      if (k2) a[k1][k2] = v; else a[k1] = v;
    });
    try {
      const s = await api("PUT", "/api/ayarlar", a);
      durum.ayarlar = s.ayarlar; kirli.ayarlar = false; ayarDoldur(); yayinBilgi();
      bildir("Ayarlar kaydedildi. Sitede görünmesi için Yayınla'ya basın.");
    } catch (h) { bildir((h.hatalar || [h.message]).join(" · "), true); }
  });

  /* ================= YAYINLA ================= */
  const IS_AD = { kontrol: "Kontrol", yayinla: "Yayınlama", baglan: "Cloudflare bağlantısı", durum: "Bağlantı kontrolü" };
  let izleZ = null;
  function yayinBilgi(sonYayin) {
    $("#yayinAdres").textContent = (durum.ayarlar.siteAdresi || "site").replace(/^https?:\/\//, "");
    if (sonYayin !== undefined) {
      $("#sonYayin").textContent = sonYayin ? "Son yayın: " + new Date(sonYayin).toLocaleString("tr-TR") : "Henüz yayın yapılmadı";
    }
  }
  function isCiz(is) {
    $$("[data-is]").forEach((b) => (b.disabled = is.calisiyor));
    if (!is.ad) return;
    $("#isBaslik").textContent = IS_AD[is.ad] || "İşlem";
    $("#isLog").textContent = is.log.length ? is.log.join("\n") : "Başlatılıyor…";
    $("#isLog").scrollTop = $("#isLog").scrollHeight;
    const r = $("#isRozet"); r.hidden = false;
    r.className = "rozet" + (is.calisiyor ? "" : is.basari ? " iyi" : " kotu");
    r.textContent = is.calisiyor ? "Çalışıyor…" : is.basari ? "Tamamlandı" : "Başarısız";
    if (!is.calisiyor && (is.ad === "durum" || is.ad === "baglan")) {
      const d = $("#cfDurum");
      d.className = "durum " + (is.basari ? "iyi" : "kotu");
      d.textContent = is.basari ? "✔ Bu bilgisayar Cloudflare'e bağlı" : "✖ Bağlı değil — 'Cloudflare'e Bağlan'a basın";
    }
  }
  async function isIzle() {
    clearTimeout(izleZ);
    try {
      const is = await api("GET", "/api/is"); isCiz(is);
      if (is.calisiyor) { izleZ = setTimeout(isIzle, 1000); return; }
      if (is.ad === "yayinla" && is.basari) { bildir("Site yayınlandı!"); const v = await api("GET", "/api/veri"); yayinBilgi(v.sonYayin); }
      if (is.ad === "baglan" && is.basari) isBaslat("durum");
    } catch (h) { bildir(h.message, true); }
  }
  async function isBaslat(ad) {
    if (ad === "yayinla" && (kirli.ayarlar || kirli.kategoriler)) return bildir("Önce kaydedilmemiş değişiklikleri kaydedin.", true);
    try { await api("POST", "/api/is", { ad }); isIzle(); } catch (h) { bildir(h.message, true); }
  }
  $("#s-yayinla").addEventListener("click", (e) => { const b = e.target.closest("[data-is]"); if (b) isBaslat(b.dataset.is); });

  /* ================= başlangıç ================= */
  async function yukle() {
    try {
      const v = await api("GET", "/api/veri");
      durum = { ayarlar: v.ayarlar, kategoriler: v.kategoriler, urunler: v.urunler };
      filtreDoldur(); urunCiz(); yayinBilgi(v.sonYayin);
      isIzle();
    } catch (h) {
      $("#urunListe").innerHTML = `<div class="bos">Veriler yüklenemedi: ${esc(h.message)}</div>`;
    }
  }
  yukle();
})();
