/* ZyN Zeyno — ürün detay sayfası: renk, seri adedi, WhatsApp siparişi */
(function () {
  "use strict";
  const Z = ZW, M = MAGAZA, $ = Z.$, esc = Z.esc;
  const MAX_SERI = 999;
  const u = Z.urunBul(new URLSearchParams(location.search).get("id"));

  if (!u) {
    document.title = `Ürün bulunamadı · ${M.ad}`;
    $("#icerik").innerHTML = `<div class="bos" style="padding:100px 20px"><h1 style="font-size:1.6rem">Ürün bulunamadı</h1>
      <p>Aradığınız ürün kaldırılmış olabilir.</p><a class="btn btn-gul" href="index.html#urunler">Ürünlere Dön</a></div>`;
    return;
  }

  document.title = `${u.ad} (${u.kod}) · ${M.ad}`;
  const aciklamaMeta = document.querySelector('meta[name="description"]');
  if (aciklamaMeta) aciklamaMeta.content = `${u.ad} (${u.kod}) — seri halinde toptan: ${Z.seriYazi(u)}. ${u.aciklama}`.slice(0, 160);

  // Google için ürün bilgisi
  const kok = Z.siteKok();
  if (kok) {
    const urunUrl = `${kok}/urun.html?id=${encodeURIComponent(u.id)}`;
    const veri = {
      "@context": "https://schema.org", "@type": "Product",
      name: u.ad, sku: u.kod, description: u.aciklama || undefined, category: Z.kategoriAd(u.kategori),
      brand: { "@type": "Brand", name: M.ad }, url: urunUrl,
      image: u.gorseller.length ? u.gorseller.map((g) => `${kok}/${Z.gorselYol(g)}`) : [`${kok}/assets/img/paylasim.png`],
      color: u.renkler.map((r) => r.ad).join(", "), material: u.kumas || undefined
    };
    if (M.fiyatGoster) veri.offers = { "@type": "Offer", url: urunUrl, priceCurrency: "TRY", price: u.fiyat, businessFunction: "http://purl.org/goodrelations/v1#Sell", eligibleQuantity: { "@type": "QuantitativeValue", minValue: u.minSeri * Z.seriParca(u), unitText: "adet" } };
    Z.jsonLd(veri);
  }
  $("#yol").innerHTML = `<a href="index.html#urunler">Ürünler</a> / <a href="index.html?kategori=${encodeURIComponent(u.kategori)}#urunler">${esc(Z.kategoriAd(u.kategori))}</a> / ${esc(u.ad)}`;

  let renk = u.renkler[0], seri = u.minSeri, gorselNo = 0;
  const parca = Z.seriParca(u);

  $("#icerik").innerHTML = `
    <div class="detay">
      <div>
        <div class="galeri-ana" id="galeriAna"></div>
        <div class="galeri-kucuk" id="galeriKucuk"></div>
      </div>
      <div class="detay-bilgi">
        <div class="urun-kod">${esc(u.kod)} · ${esc(Z.kategoriAd(u.kategori))}</div>
        <h1>${esc(u.ad)}</h1>
        <div class="detay-fiyat">${M.fiyatGoster
          ? `<span class="fiyat">${Z.para(u.fiyat)} <small style="font-size:.9rem;font-weight:400">/ adet</small></span>
             <span class="fiyat-alt">1 seri (${parca} parça) = <b>${Z.para(Z.seriFiyat(u))}</b></span>`
          : `<span class="fiyat-alt">Toptan fiyat için WhatsApp'tan bilgi alın</span>`}</div>

        <div class="detay-blok">
          <span class="etiket-yazi">Renk <b id="renkAd"></b></span>
          <div class="renk-secim" id="renkler" role="radiogroup" aria-label="Renk seçimi"></div>
        </div>

        <div class="detay-blok">
          <span class="etiket-yazi">Seri İçeriği <b>(1 seri)</b></span>
          <table class="seri-tablo">
            <tr><th scope="row">Beden</th>${Object.keys(u.seri).map((b) => `<th>${esc(b)}</th>`).join("")}<th class="toplam">Toplam</th></tr>
            <tr><th scope="row">Adet</th>${Object.values(u.seri).map((a) => `<td>${a}</td>`).join("")}<td class="toplam">${parca}</td></tr>
          </table>
        </div>

        <div class="detay-blok">
          <span class="etiket-yazi">Seri Adedi <b>(en az ${u.minSeri} seri)</b></span>
          <div class="adet-satir">
            <div class="adet">
              <button type="button" id="eksi" aria-label="Seri azalt">−</button>
              <input id="seriInput" type="number" inputmode="numeric" min="${u.minSeri}" max="${MAX_SERI}" value="${seri}" aria-label="Seri adedi">
              <button type="button" id="arti" aria-label="Seri arttır">+</button>
            </div>
          </div>
          <div class="ozet-kutu" id="ozet"></div>
        </div>

        <div class="detay-butonlar">
          <a class="btn btn-wa btn-blok" id="sor" target="_blank" rel="noopener noreferrer">${Z.WA_IKON} WhatsApp ile Sipariş Ver</a>
          <p class="siparis-notu">Butona bastığınızda seçimlerinizle hazır bir WhatsApp mesajı açılır; bilgileriniz bu sitede saklanmaz. Kesin fiyat ve stok onayı mağaza tarafından verilir. Ayrıntılar: <a href="kvkk.html">KVKK Aydınlatma Metni</a>.</p>
        </div>

        <div class="detay-blok">
          <span class="etiket-yazi">Ürün Bilgisi</span>
          <ul class="ozellik-liste">
            ${u.kumas ? `<li><b>Kumaş</b><span>${esc(u.kumas)}</span></li>` : ""}
            <li><b>Renkler</b><span>${u.renkler.map((r) => esc(r.ad)).join(", ")}</span></li>
            <li><b>Satış</b><span>Seri halinde · ${esc(Z.seriYazi(u))}</span></li>
            ${u.aciklama ? `<li><b>Açıklama</b><span>${esc(u.aciklama)}</span></li>` : ""}
          </ul>
        </div>
      </div>
    </div>`;

  function galeriCiz() {
    $("#galeriAna").innerHTML = Z.gorselHtml(u, renk.kod, gorselNo);
    $("#galeriKucuk").innerHTML = u.gorseller.length > 1 ? u.gorseller.map((g, i) =>
      `<button type="button" class="${i === gorselNo ? "aktif" : ""}" data-i="${i}" aria-label="Görsel ${i + 1}"><img src="${esc(Z.gorselYol(g))}" alt=""></button>`).join("") : "";
  }
  function renkCiz() {
    $("#renkAd").textContent = renk.ad;
    $("#renkler").innerHTML = u.renkler.map((r, i) =>
      `<button type="button" class="renk-btn${r === renk ? " aktif" : ""}" data-i="${i}" role="radio" aria-checked="${r === renk}">
         <span class="renk-nokta" style="background:${r.kod}"></span>${esc(r.ad)}</button>`).join("");
  }
  const sinirla = (v) => Math.max(u.minSeri, Math.min(MAX_SERI, v));
  function ozetCiz() {
    $("#seriInput").value = seri;
    $("#eksi").disabled = seri <= u.minSeri;
    $("#arti").disabled = seri >= MAX_SERI;
    const toplam = seri * parca;
    $("#ozet").innerHTML = `
      <div><span>${seri} seri × ${parca} parça</span><span>${toplam} parça</span></div>
      ${Object.keys(u.seri).length > 1 ? `<div><span>Beden dağılımı</span><span>${Object.entries(u.seri).map(([b, a]) => `${esc(b)}: ${a * seri}`).join(" · ")}</span></div>` : ""}
      ${M.fiyatGoster ? `<div class="buyuk"><span>Toplam</span><span>${Z.para(toplam * u.fiyat)}</span></div>` : ""}`;
    $("#sor").href = Z.waLink(Z.siparisMesaji(u, renk.ad, seri));
  }

  $("#galeriKucuk").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return; gorselNo = +b.dataset.i; galeriCiz();
  });
  $("#renkler").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    renk = u.renkler[+b.dataset.i] || renk; renkCiz(); galeriCiz(); ozetCiz();
  });
  $("#eksi").addEventListener("click", () => { seri = sinirla(seri - 1); ozetCiz(); });
  $("#arti").addEventListener("click", () => { seri = sinirla(seri + 1); ozetCiz(); });
  $("#seriInput").addEventListener("change", (e) => {
    const v = parseInt(e.target.value, 10); seri = isNaN(v) ? u.minSeri : sinirla(v); ozetCiz();
  });

  galeriCiz(); renkCiz(); ozetCiz();

  const benzer = URUNLER.filter((x) => x.kategori === u.kategori && x.id !== u.id);
  const doldur = URUNLER.filter((x) => x.id !== u.id && !benzer.includes(x));
  const goster = benzer.concat(doldur).slice(0, 4);
  if (goster.length) { $("#benzerBolum").hidden = false; $("#benzer").innerHTML = goster.map(Z.urunKart).join(""); }
})();
