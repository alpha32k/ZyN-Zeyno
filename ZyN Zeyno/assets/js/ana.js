/* ZyN Zeyno — ana sayfa: hero, ürün listesi (filtre/arama/sıralama), iletişim */
(function () {
  "use strict";
  const { $, esc, waLink, guvenliUrl, urunKart, kategoriAd, WA_IKON, IKON, SOSYAL } = ZW, M = MAGAZA;

  /* ---------- iletişim kartları ---------- */
  const harita = guvenliUrl(M.haritaLinki);  $("#iletisimKartlar").innerHTML = `
    <a class="iletisim-kart" href="${esc(waLink(`Merhaba ${M.ad}, bilgi almak istiyorum.`))}" target="_blank" rel="noopener noreferrer">
      <div class="ikon">${WA_IKON}</div><h3>WhatsApp</h3><p>${esc(M.telefonGorunen)}</p><span class="kart-link">Mesaj gönder</span></a>    ${harita
      ? `<a class="iletisim-kart" href="${esc(harita)}" target="_blank" rel="noopener noreferrer">
          <div class="ikon">${IKON.konum}</div><h3>Adres</h3><p>${esc(M.adres)}</p><span class="kart-link">Haritada aç</span></a>`
      : `<div class="iletisim-kart"><div class="ikon">${IKON.konum}</div><h3>Adres</h3><p>${esc(M.adres)}</p></div>`}
    <div class="iletisim-kart">
      <div class="ikon">${IKON.saat}</div><h3>Çalışma Saatleri</h3><p>${[].concat(M.calismaSaatleri || []).map(esc).join("<br>")}</p></div>
    ${SOSYAL.length ? `<div class="iletisim-kart">
      <div class="ikon">${IKON.web}</div><h3>Sosyal Medya</h3><p>Yeni ürünleri takip edin</p>
      <div class="sosyal">${SOSYAL.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="${s.ad}" title="${s.ad}">${s.ikon}</a>`).join("")}</div>
    </div>` : ""}`;

  /* ---------- Google için işletme bilgisi ---------- */
  const kok = ZW.siteKok();
  if (kok) {
    ZW.jsonLd({
      "@context": "https://schema.org",
      "@type": "ClothingStore",
      "@id": kok + "/#isletme",
      name: M.ad,
      description: "Butik ve mağazalar için seri halinde toptan kadın giyim.",
      url: kok + "/",
      logo: kok + "/assets/img/ikonlar/ikon-512.png",
      image: kok + "/assets/img/paylasim.png",
      telephone: "+" + M.whatsapp,      address: { "@type": "PostalAddress", streetAddress: M.adres, addressCountry: "TR" },
      sameAs: SOSYAL.map((s) => s.url)
    });
  }

  /* ---------- hero ---------- */
  const heroWa = $("#heroWa");
  heroWa.href = waLink(`Merhaba ${M.ad}, toptan ürünleriniz hakkında bilgi almak istiyorum.`);
  heroWa.target = "_blank"; heroWa.rel = "noopener noreferrer";
  $("#heroNotlar").innerHTML = (M.notlar || []).map((n) => `<span>${esc(n)}</span>`).join("");

  /* ---------- durum ---------- */
  const p = new URLSearchParams(location.search);
  let kategori = KATEGORILER.some((k) => k.id === p.get("kategori")) ? p.get("kategori") : "";
  let sirala = "yeni";
  if (!M.fiyatGoster) document.querySelectorAll("#siralaMenu [data-fiyat]").forEach((o) => o.remove());

  /* ---------- özel sıralama menüsü ---------- */
  const sBtn = $("#siralaBtn"), sMenu = $("#siralaMenu"), sKutu = $("#sirala");
  const secenekler = () => [...sMenu.querySelectorAll('[role="option"]')];
  function menuIsaretle() {
    secenekler().forEach((o) => o.setAttribute("aria-selected", o.dataset.v === sirala));
    const secili = secenekler().find((o) => o.dataset.v === sirala);
    if (secili) $("#siralaYazi").textContent = secili.textContent;
  }
  function menuAc() {
    sKutu.classList.add("acik"); sBtn.setAttribute("aria-expanded", "true");
    const secili = sMenu.querySelector('[aria-selected="true"]');
    secenekler().forEach((o) => o.classList.toggle("odak", o === secili));
    sMenu.focus({ preventScroll: true });
  }
  function menuKapat(odakla) {
    sKutu.classList.remove("acik"); sBtn.setAttribute("aria-expanded", "false");
    if (odakla) sBtn.focus();
  }
  function sec(v) { sirala = v; menuIsaretle(); menuKapat(true); ciz(); }
  sBtn.addEventListener("click", () => (sKutu.classList.contains("acik") ? menuKapat() : menuAc()));
  sMenu.addEventListener("click", (e) => { const o = e.target.closest('[role="option"]'); if (o) sec(o.dataset.v); });
  sMenu.addEventListener("keydown", (e) => {
    const l = secenekler(), i = l.findIndex((o) => o.classList.contains("odak"));
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const j = (i + (e.key === "ArrowDown" ? 1 : -1) + l.length) % l.length;
      l.forEach((o, k) => o.classList.toggle("odak", k === j));
    } else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (l[i]) sec(l[i].dataset.v); }
    else if (e.key === "Escape" || e.key === "Tab") menuKapat(e.key === "Escape");
  });
  sMenu.addEventListener("mousemove", (e) => {
    const o = e.target.closest('[role="option"]'); if (o) secenekler().forEach((x) => x.classList.toggle("odak", x === o));
  });
  document.addEventListener("click", (e) => { if (!sKutu.contains(e.target)) menuKapat(); });
  menuIsaretle();

  /* ---------- filtre paneli (tüm ekranlarda soldan açılır) ---------- */
  const fAc = $("#filtreAc"), fPanel = $("#filtrePanel");
  function panelAc() {
    document.body.classList.add("filtre-acik"); fAc.setAttribute("aria-expanded", "true");
    fPanel.setAttribute("role", "dialog"); fPanel.setAttribute("aria-modal", "true");
    setTimeout(() => $("#filtreKapat").focus(), 50);
  }
  function panelKapat(urunlereGit) {
    if (!document.body.classList.contains("filtre-acik")) return;
    document.body.classList.remove("filtre-acik"); fAc.setAttribute("aria-expanded", "false");
    fPanel.removeAttribute("role"); fPanel.removeAttribute("aria-modal");
    if (urunlereGit) $("#urunler").scrollIntoView({ behavior: "smooth", block: "start" }); else fAc.focus();
  }
  fAc.addEventListener("click", panelAc);
  $("#filtreKapat").addEventListener("click", () => panelKapat(false));
  $("#filtrePerde").addEventListener("click", () => panelKapat(false));
  $("#filtreGoster").addEventListener("click", () => panelKapat(true));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") panelKapat(false); });

  /* ---------- kategori sekmeleri ---------- */
  function cipleriCiz() {
    const sayi = (id) => (id ? URUNLER.filter((u) => u.kategori === id).length : URUNLER.length);
    $("#cipler").innerHTML = [{ id: "", ad: "Tümü" }, ...KATEGORILER].filter((k) => sayi(k.id))
      .map((k) => `<button class="sekme${k.id === kategori ? " aktif" : ""}" data-k="${esc(k.id)}" role="tab" aria-selected="${k.id === kategori}">${esc(k.ad)}<span class="sayi">${sayi(k.id)}</span></button>`).join("");
    // seçili sekmeyi şeridin ortasına getir (sayfayı dikey kaydırmadan)
    const serit = $("#cipler"), aktifSekme = $("#cipler .aktif");
    if (aktifSekme) serit.scrollTo({ left: aktifSekme.offsetLeft - (serit.clientWidth - aktifSekme.offsetWidth) / 2, behavior: "smooth" });
  }

  /* ---------- ürün listesi ---------- */
  function ciz() {
    const q = $("#arama").value.trim().toLocaleLowerCase("tr");
    const liste = URUNLER.filter((u) => (!kategori || u.kategori === kategori) &&
      (!q || (u.ad + " " + u.kod).toLocaleLowerCase("tr").includes(q)));
    if (sirala === "artan") liste.sort((a, b) => a.fiyat - b.fiyat);
    if (sirala === "azalan") liste.sort((a, b) => b.fiyat - a.fiyat);
    if (sirala === "ad") liste.sort((a, b) => a.ad.localeCompare(b.ad, "tr"));
    if (sirala === "yeni") liste.sort((a, b) => b.yeni - a.yeni);

    $("#sonuc").innerHTML = `<b>${liste.length}</b> ürün${q ? ` · “${esc(q)}” için` : ""}`;
    $("#temizle").hidden = !q;
    $("#filtreEtiket").textContent = kategori ? kategoriAd(kategori) : "Tüm ürünler";
    $("#aramaIsareti").hidden = !q;
    $("#filtreGoster").textContent = `${liste.length} Ürünü Göster`;
    $("#liste").innerHTML = liste.length ? liste.map(urunKart).join("")
      : `<div class="bos" style="grid-column:1/-1"><p>Aradığınız kriterde ürün bulunamadı.</p>
         <a class="btn btn-wa" target="_blank" rel="noopener noreferrer" href="${esc(waLink(`Merhaba ${M.ad}, "${q || kategoriAd(kategori)}" ile ilgili ürününüz var mı?`))}">WhatsApp'tan Sorun</a></div>`;
  }

  $("#cipler").addEventListener("click", (e) => {
    const b = e.target.closest(".sekme"); if (!b) return;
    kategori = b.dataset.k;
    const url = new URL(location.href);
    kategori ? url.searchParams.set("kategori", kategori) : url.searchParams.delete("kategori");
    history.replaceState(null, "", url);
    cipleriCiz(); ciz();
    panelKapat(true);   // kategori seçince panel kapanır, ürünlere gidilir
  });
  // aramada Enter'a basınca sonuçlara git
  $("#arama").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); $("#arama").blur(); panelKapat(true); } });
  $("#arama").addEventListener("input", ciz);
  $("#temizle").addEventListener("click", () => { $("#arama").value = ""; $("#arama").focus(); ciz(); });
  cipleriCiz(); ciz();
})();
