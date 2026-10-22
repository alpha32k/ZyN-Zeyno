/* =========================================================
   KATEGORİLER & ÜRÜNLER
   Bu dosya Yönetim Paneli tarafından yazılır (Yonetim Paneli.bat).
   Elle düzenleyebilirsiniz; panel bir sonraki kayıtta biçimi yeniden düzenler.
   - seri    : bir serideki bedenler ve adetleri  { "S": 1, "M": 2 }
   - fiyat   : ADET fiyatı (seri fiyatı otomatik hesaplanır)
   - minSeri : en az kaç seri sipariş verilebilir
   - gorseller: assets/img/urunler/ içindeki dosya adları (ilk görsel kapak)
   ========================================================= */
window.KATEGORILER = [
  {
    "id": "elbise",
    "ad": "Elbise"
  },
  {
    "id": "bluz",
    "ad": "Bluz & Gömlek"
  },
  {
    "id": "pantolon",
    "ad": "Pantolon"
  },
  {
    "id": "etek",
    "ad": "Etek"
  },
  {
    "id": "takim",
    "ad": "Takım"
  },
  {
    "id": "tunik",
    "ad": "Tunik"
  },
  {
    "id": "triko",
    "ad": "Triko"
  },
  {
    "id": "dis",
    "ad": "Ceket & Dış Giyim"
  }
];

window.URUNLER = [
  {
    "id": "keten-midi-elbise",
    "kod": "ZW-1001",
    "ad": "Keten Karışımlı Midi Elbise",
    "kategori": "elbise",
    "kumas": "%55 Keten, %45 Viskon",
    "seri": {
      "S": 1,
      "M": 1,
      "L": 1,
      "XL": 1
    },
    "fiyat": 420,
    "minSeri": 2,
    "renkler": [
      {
        "ad": "Pudra",
        "kod": "#F2C4C6"
      },
      {
        "ad": "Bej",
        "kod": "#D9C7B0"
      },
      {
        "ad": "Siyah",
        "kod": "#1F1A1B"
      }
    ],
    "aciklama": "Belden kuşaklı, V yaka, yırtmaçlı midi boy elbise. Yaz sezonunun en çok tercih edilen modeli.",
    "gorseller": [],
    "yeni": true
  },
  {
    "id": "saten-gomlek",
    "kod": "ZW-1002",
    "ad": "Saten Oversize Gömlek",
    "kategori": "bluz",
    "kumas": "%100 Polyester Saten",
    "seri": {
      "S": 1,
      "M": 2,
      "L": 2,
      "XL": 1
    },
    "fiyat": 285,
    "minSeri": 2,
    "renkler": [
      {
        "ad": "Ekru",
        "kod": "#F3EDE2"
      },
      {
        "ad": "Gül Kurusu",
        "kod": "#C08A8E"
      },
      {
        "ad": "Zümrüt",
        "kod": "#2F5D50"
      }
    ],
    "aciklama": "Düşük omuzlu, gizli patlı, parlak saten dokulu oversize gömlek.",
    "gorseller": [],
    "yeni": true
  },
  {
    "id": "palazzo-pantolon",
    "kod": "ZW-1003",
    "ad": "Yüksek Bel Palazzo Pantolon",
    "kategori": "pantolon",
    "kumas": "Krep",
    "seri": {
      "36": 1,
      "38": 1,
      "40": 1,
      "42": 1
    },
    "fiyat": 310,
    "minSeri": 2,
    "renkler": [
      {
        "ad": "Siyah",
        "kod": "#1F1A1B"
      },
      {
        "ad": "Taş",
        "kod": "#CFC3B4"
      },
      {
        "ad": "Lacivert",
        "kod": "#28324A"
      }
    ],
    "aciklama": "Yüksek bel, beli lastikli, bol paça akışkan palazzo pantolon.",
    "gorseller": [],
    "yeni": true
  },
  {
    "id": "pileli-etek",
    "kod": "ZW-1004",
    "ad": "Pileli Midi Etek",
    "kategori": "etek",
    "kumas": "Şifon, astarlı",
    "seri": {
      "S": 1,
      "M": 1,
      "L": 1
    },
    "fiyat": 240,
    "minSeri": 3,
    "renkler": [
      {
        "ad": "Pudra",
        "kod": "#F2C4C6"
      },
      {
        "ad": "Mint",
        "kod": "#BFD8C9"
      },
      {
        "ad": "Siyah",
        "kod": "#1F1A1B"
      }
    ],
    "aciklama": "Beli lastikli, ince pileli, astarlı şifon midi etek.",
    "gorseller": [],
    "yeni": false
  },
  {
    "id": "blazer-takim",
    "kod": "ZW-1005",
    "ad": "Blazer Ceket & Pantolon Takım",
    "kategori": "takim",
    "kumas": "Kaşe Krep",
    "seri": {
      "S": 1,
      "M": 2,
      "L": 2,
      "XL": 1
    },
    "fiyat": 690,
    "minSeri": 1,
    "renkler": [
      {
        "ad": "Bej",
        "kod": "#D9C7B0"
      },
      {
        "ad": "Siyah",
        "kod": "#1F1A1B"
      },
      {
        "ad": "Gül",
        "kod": "#D99AA0"
      }
    ],
    "aciklama": "Tek düğmeli astarlı blazer ceket ve yüksek bel kumaş pantolondan oluşan takım.",
    "gorseller": [],
    "yeni": true
  },
  {
    "id": "desenli-tunik",
    "kod": "ZW-1006",
    "ad": "Çiçek Desenli Uzun Tunik",
    "kategori": "tunik",
    "kumas": "%100 Viskon",
    "seri": {
      "38": 1,
      "40": 1,
      "42": 1,
      "44": 1
    },
    "fiyat": 265,
    "minSeri": 2,
    "renkler": [
      {
        "ad": "Pembe Çiçek",
        "kod": "#E9A9AE"
      },
      {
        "ad": "Mavi Çiçek",
        "kod": "#8FA7C4"
      }
    ],
    "aciklama": "Yandan yırtmaçlı, düğmeli yaka, rahat kalıp viskon tunik.",
    "gorseller": [],
    "yeni": false
  },
  {
    "id": "fitilli-kazak",
    "kod": "ZW-1007",
    "ad": "Fitilli Balıkçı Yaka Kazak",
    "kategori": "triko",
    "kumas": "%50 Akrilik, %30 Yün, %20 Polyamid",
    "seri": {
      "STD": 4
    },
    "fiyat": 230,
    "minSeri": 2,
    "renkler": [
      {
        "ad": "Krem",
        "kod": "#F1E8DA"
      },
      {
        "ad": "Pudra",
        "kod": "#F2C4C6"
      },
      {
        "ad": "Kahve",
        "kod": "#6B4E3D"
      },
      {
        "ad": "Gri",
        "kod": "#9A9696"
      }
    ],
    "aciklama": "Standart beden, yumuşak dokulu, fitilli örgü balıkçı yaka kazak. Seri tek renk 4 adettir.",
    "gorseller": [],
    "yeni": true
  },
  {
    "id": "kaban",
    "kod": "ZW-1008",
    "ad": "Kuşaklı Uzun Kaban",
    "kategori": "dis",
    "kumas": "Kaşe, astarlı",
    "seri": {
      "S": 1,
      "M": 1,
      "L": 1,
      "XL": 1
    },
    "fiyat": 980,
    "minSeri": 1,
    "renkler": [
      {
        "ad": "Camel",
        "kod": "#B98B5E"
      },
      {
        "ad": "Siyah",
        "kod": "#1F1A1B"
      },
      {
        "ad": "Ekru",
        "kod": "#F3EDE2"
      }
    ],
    "aciklama": "Geniş yakalı, kuşaklı, cepli astarlı uzun kaşe kaban.",
    "gorseller": [],
    "yeni": false
  },
  {
    "id": "brode-bluz",
    "kod": "ZW-1009",
    "ad": "Brode Detaylı Poplin Bluz",
    "kategori": "bluz",
    "kumas": "%100 Pamuk Poplin",
    "seri": {
      "S": 1,
      "M": 1,
      "L": 1,
      "XL": 1
    },
    "fiyat": 255,
    "minSeri": 2,
    "renkler": [
      {
        "ad": "Beyaz",
        "kod": "#FFFFFF"
      },
      {
        "ad": "Pudra",
        "kod": "#F2C4C6"
      }
    ],
    "aciklama": "Yakası ve kolları brode işlemeli, balon kollu poplin bluz.",
    "gorseller": [],
    "yeni": false
  },
  {
    "id": "kruvaze-elbise",
    "kod": "ZW-1010",
    "ad": "Kruvaze Yaka Maxi Elbise",
    "kategori": "elbise",
    "kumas": "Krep Saten",
    "seri": {
      "S": 1,
      "M": 2,
      "L": 2,
      "XL": 1
    },
    "fiyat": 465,
    "minSeri": 1,
    "renkler": [
      {
        "ad": "Gül Kurusu",
        "kod": "#C08A8E"
      },
      {
        "ad": "Zümrüt",
        "kod": "#2F5D50"
      },
      {
        "ad": "Siyah",
        "kod": "#1F1A1B"
      }
    ],
    "aciklama": "Kruvaze yaka, belden bağlamalı, uzun kollu maxi boy saten elbise. Davet ve özel günler için.",
    "gorseller": [],
    "yeni": false
  },
  {
    "id": "esofman-takim",
    "kod": "ZW-1011",
    "ad": "Modal Rahat Takım",
    "kategori": "takim",
    "kumas": "Modal Penye",
    "seri": {
      "S": 1,
      "M": 1,
      "L": 1,
      "XL": 1
    },
    "fiyat": 380,
    "minSeri": 2,
    "renkler": [
      {
        "ad": "Gri Melanj",
        "kod": "#B5B3B3"
      },
      {
        "ad": "Pudra",
        "kod": "#F2C4C6"
      },
      {
        "ad": "Haki",
        "kod": "#7C7A5C"
      }
    ],
    "aciklama": "Yumuşak modal kumaştan sweatshirt ve geniş paça pantolon takım.",
    "gorseller": [],
    "yeni": false
  },
  {
    "id": "deri-etek",
    "kod": "ZW-1012",
    "ad": "Deri Görünümlü Mini Etek",
    "kategori": "etek",
    "kumas": "Suni Deri",
    "seri": {
      "S": 1,
      "M": 1,
      "L": 1
    },
    "fiyat": 215,
    "minSeri": 3,
    "renkler": [
      {
        "ad": "Siyah",
        "kod": "#1F1A1B"
      },
      {
        "ad": "Kahve",
        "kod": "#6B4E3D"
      }
    ],
    "aciklama": "Arkadan fermuarlı, A kesim deri görünümlü mini etek.",
    "gorseller": [],
    "yeni": false
  }
];
