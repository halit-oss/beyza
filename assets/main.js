"use strict";

/* =========================================================
   Beyza · küçük bir gökyüzü
   Saf JavaScript — kütüphane yok, build yok.
   ========================================================= */

/* ---------------------------------------------------------
   AYARLAR — değiştirmek isteyeceğin şeyler burada.
   (Sayfadaki diğer yazılar index.html içinde.)
   --------------------------------------------------------- */
const AYARLAR = {
  // Kayar yıldızı yakalayınca sırayla çıkan küçük notlar
  gizliNotlar: [
    "Bu sayfayı yaparken tek düşündüğüm şey: yüzün nasıl gülümser?",
    "Bir yıldız kaydığında dilek tutulur. Ben zaten tuttum: seni tanıdığım gün.",
    "Uzaktaysak da aynı gökyüzüne bakıyoruz. Bu da bir çeşit yan yana olmak.",
    "Bugün sesini duymadıysam, gün eksik kalmış demektir.",
    "Küçük bir sır: bu gökyüzündeki yıldızların hiçbiri rastgele değil.",
  ],
  // Kayar yıldızın ekranda ilk belirme gecikmesi (ms)
  ilkYildizGecikmesi: 5000,
  // Sonraki kayar yıldızlar arası rastgele aralık (ms)
  yildizAraligi: [11000, 17000],
};

const AZ_HAREKET = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FARE_VAR = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ---------------------------------------------------------
   1) Yıldız alanı (canvas)
   --------------------------------------------------------- */
const tuval = document.getElementById("gokyuzu");
const ctx = tuval.getContext("2d");

const gorunum = { w: 0, h: 0, dpr: 1 };
let yildizlar = [];
let kareNo = null;

// Fare/dokunma kayması (yumuşatılmış)
const imlec = { x: 0, y: 0, hedefX: 0, hedefY: 0 };

function yildizSayisi(w, h) {
  const sayi = Math.round((w * h) / 7000);
  return Math.max(45, Math.min(sayi, 160));
}

function yildizlariKur() {
  yildizlar = [];
  const sayi = yildizSayisi(gorunum.w, gorunum.h);

  for (let i = 0; i < sayi; i++) {
    const parlak = Math.random() < 0.12;
    yildizlar.push({
      x: Math.random() * gorunum.w,
      y: Math.random() * gorunum.h,
      r: parlak ? 0.9 + Math.random() * 0.9 : 0.25 + Math.random() * 0.55,
      a: parlak ? 0.8 : 0.3 + Math.random() * 0.5,
      hiz: 0.0006 + Math.random() * 0.0018,
      faz: Math.random() * Math.PI * 2,
      derinlik: parlak ? 1 : 0.35 + Math.random() * 0.5,
    });
  }
}

function boyutlandir() {
  const w = tuval.clientWidth || window.innerWidth;
  const h = tuval.clientHeight || window.innerHeight;

  gorunum.dpr = Math.min(window.devicePixelRatio || 1, 2);
  gorunum.w = w;
  gorunum.h = h;

  tuval.width = Math.round(w * gorunum.dpr);
  tuval.height = Math.round(h * gorunum.dpr);
  ctx.setTransform(gorunum.dpr, 0, 0, gorunum.dpr, 0, 0);

  yildizlariKur();
  tekKare(0);
}

function tekKare(zaman) {
  ctx.clearRect(0, 0, gorunum.w, gorunum.h);

  // Dokunmatik cihazlarda yıldızlar kendi kendine çok yavaş süzülür
  if (!FARE_VAR) {
    imlec.hedefX = Math.sin(zaman * 0.00012) * 0.7;
    imlec.hedefY = Math.cos(zaman * 0.00009) * 0.5;
  }

  imlec.x += (imlec.hedefX - imlec.x) * 0.05;
  imlec.y += (imlec.hedefY - imlec.y) * 0.05;

  for (let i = 0; i < yildizlar.length; i++) {
    const y = yildizlar[i];
    const salinim = Math.sin(zaman * y.hiz + y.faz);
    let alfa = y.a * (0.62 + 0.38 * salinim);
    if (alfa < 0) alfa = 0;

    const px = y.x + imlec.x * 16 * y.derinlik;
    const py = y.y + imlec.y * 12 * y.derinlik;

    // Parlak yıldızlara yumuşak hale
    if (y.r > 0.9) {
      ctx.globalAlpha = alfa * 0.1;
      ctx.beginPath();
      ctx.arc(px, py, y.r * 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#f6e6c2";
      ctx.fill();
    }

    ctx.globalAlpha = alfa;
    ctx.beginPath();
    ctx.arc(px, py, y.r, 0, Math.PI * 2);
    ctx.fillStyle = "#fdf7ea";
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

function dongu(zaman) {
  tekKare(zaman);
  kareNo = window.requestAnimationFrame(dongu);
}

function donguyuBaslat() {
  if (AZ_HAREKET || kareNo !== null || document.hidden) return;
  kareNo = window.requestAnimationFrame(dongu);
}

function donguyuDurdur() {
  if (kareNo === null) return;
  window.cancelAnimationFrame(kareNo);
  kareNo = null;
}

if (FARE_VAR && !AZ_HAREKET) {
  window.addEventListener(
    "pointermove",
    (olay) => {
      imlec.hedefX = (olay.clientX / window.innerWidth - 0.5) * 2;
      imlec.hedefY = (olay.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true }
  );
}

let boyutZamanlayici = null;
function boyutDegisti() {
  window.clearTimeout(boyutZamanlayici);
  boyutZamanlayici = window.setTimeout(boyutlandir, 140);
}

window.addEventListener("resize", boyutDegisti, { passive: true });
window.addEventListener("orientationchange", boyutDegisti, { passive: true });

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    donguyuDurdur();
  } else {
    donguyuBaslat();
  }
});

/* ---------------------------------------------------------
   2) Takımyıldız — kaydırdıkça çizilen yıldız kalbi
   --------------------------------------------------------- */
const kalpSvg = document.getElementById("kalpSvg");
let kalpYolu = null;
let kalpGruplari = [];
let kalpUzunluk = 0;

function kalpNoktalari(adet) {
  // Kalp eğrisi: x = 16sin³t, y = 13cos t − 5cos2t − 2cos3t − cos4t
  const ince = 720;
  const ham = [];

  for (let i = 0; i < ince; i++) {
    const t = (i / ince) * Math.PI * 2;
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);

    ham.push({
      x: 50 + hx * 2.35,
      y: 50 - (hy + 2.6) * 2.3,
    });
  }

  // Kümülatif yay uzunluğu
  const kumulatif = [0];
  let toplam = 0;
  for (let i = 1; i <= ince; i++) {
    const a = ham[i - 1];
    const b = ham[i % ince];
    toplam += Math.hypot(b.x - a.x, b.y - a.y);
    kumulatif.push(toplam);
  }

  // Eşit aralıklı noktalar seç (kümelenme olmasın)
  const secilen = [];
  for (let k = 0; k < adet; k++) {
    const hedef = (k / adet) * toplam;

    let i = 1;
    while (i < kumulatif.length - 1 && kumulatif[i] < hedef) i++;

    const onceki = kumulatif[i - 1];
    const sonraki = kumulatif[i];
    const oran = (hedef - onceki) / Math.max(sonraki - onceki, 1e-6);

    const a = ham[i - 1];
    const b = ham[i % ince];

    secilen.push({
      x: a.x + (b.x - a.x) * oran,
      y: a.y + (b.y - a.y) * oran,
    });
  }

  return secilen;
}

function kalpOlustur() {
  if (!kalpSvg) return;

  const NS = "http://www.w3.org/2000/svg";
  const noktalar = kalpNoktalari(28);

  let d = "";
  noktalar.forEach((p, i) => {
    d += `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)} `;
  });
  d += "Z";

  kalpYolu = document.createElementNS(NS, "path");
  kalpYolu.setAttribute("d", d);
  kalpYolu.setAttribute("class", "baglanti");
  kalpSvg.appendChild(kalpYolu);

  noktalar.forEach((p) => {
    const grup = document.createElementNS(NS, "g");

    const hale = document.createElementNS(NS, "circle");
    hale.setAttribute("cx", p.x.toFixed(2));
    hale.setAttribute("cy", p.y.toFixed(2));
    hale.setAttribute("r", "2.4");
    hale.setAttribute("class", "hale");

    const nokta = document.createElementNS(NS, "circle");
    nokta.setAttribute("cx", p.x.toFixed(2));
    nokta.setAttribute("cy", p.y.toFixed(2));
    nokta.setAttribute("r", "0.8");
    nokta.setAttribute("class", "nokta");

    grup.appendChild(hale);
    grup.appendChild(nokta);
    grup.style.opacity = "0";
    grup.style.transition = "opacity 0.5s ease";

    kalpGruplari.push(grup);
    kalpSvg.appendChild(grup);
  });

  kalpUzunluk = kalpYolu.getTotalLength();
  kalpYolu.style.strokeDasharray = String(kalpUzunluk);
  kalpYolu.style.strokeDashoffset = String(kalpUzunluk);
}

function kalpGuncelle() {
  if (!kalpYolu) return;

  if (AZ_HAREKET) {
    kalpYolu.style.strokeDashoffset = "0";
    kalpGruplari.forEach((grup) => {
      grup.style.opacity = "1";
    });
    return;
  }

  const vh = window.innerHeight;
  const kutu = kalpSvg.getBoundingClientRect();
  const baslangic = vh * 0.95;
  const bitis = vh * 0.5 - kutu.height * 0.5;
  const mesafe = Math.max(baslangic - bitis, 1);

  let ilerleme = (baslangic - kutu.top) / mesafe;
  ilerleme = Math.max(0, Math.min(1, ilerleme));

  kalpYolu.style.strokeDashoffset = String(kalpUzunluk * (1 - ilerleme));

  const yumusaklik = 3;
  const toplam = kalpGruplari.length + yumusaklik;
  kalpGruplari.forEach((grup, i) => {
    const o = (ilerleme * toplam - i) / yumusaklik;
    grup.style.opacity = String(Math.max(0, Math.min(1, o)).toFixed(3));
  });
}

let kaydirmaBekliyor = false;
function kaydirmaIle() {
  if (kaydirmaBekliyor) return;
  kaydirmaBekliyor = true;
  window.requestAnimationFrame(() => {
    kaydirmaBekliyor = false;
    kalpGuncelle();
  });
}

window.addEventListener("scroll", kaydirmaIle, { passive: true });

/* ---------------------------------------------------------
   3) İsim harflerinin tek tek belirmesi
   --------------------------------------------------------- */
function ismiHazirla() {
  const isim = document.getElementById("isim");
  if (!isim) return;

  const metin = (isim.textContent || "").trim();
  if (!metin) return;

  isim.textContent = "";

  Array.from(metin).forEach((harf, i) => {
    const parca = document.createElement("span");
    parca.textContent = harf === " " ? "\u00A0" : harf;
    parca.style.animationDelay = `${0.2 + i * 0.15}s`;
    isim.appendChild(parca);
  });
}

/* ---------------------------------------------------------
   4) Ekrana girince beliren not kartları
   --------------------------------------------------------- */
function kartlariHazirla() {
  const kartlar = document.querySelectorAll(".not-karti");

  if (!("IntersectionObserver" in window)) {
    kartlar.forEach((kart) => kart.classList.add("gorunur"));
    return;
  }

  const gozcu = new IntersectionObserver(
    (girdiler) => {
      girdiler.forEach((girdi) => {
        if (!girdi.isIntersecting) return;
        const kart = girdi.target;
        const sira = Number(kart.dataset.sira || 0);
        kart.style.transitionDelay = `${sira * 0.12}s`;
        kart.classList.add("gorunur");
        gozcu.unobserve(kart);
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -6% 0px" }
  );

  kartlar.forEach((kart, i) => {
    kart.dataset.sira = String(i);
    gozcu.observe(kart);
  });
}

/* ---------------------------------------------------------
   5) Gizli not penceresi
   --------------------------------------------------------- */
const perde = document.getElementById("perde");
const pencereMetin = document.getElementById("pencereMetin");
const kapatDugmesi = document.getElementById("kapat");

let notSirasi = 0;
let sonOdak = null;

function pencereAc() {
  if (!perde || !pencereMetin) return;

  const notlar = AYARLAR.gizliNotlar;
  if (!notlar || notlar.length === 0) return;

  pencereMetin.textContent = notlar[notSirasi % notlar.length];
  notSirasi += 1;

  sonOdak = document.activeElement;
  perde.hidden = false;
  document.body.style.overflow = "hidden";

  if (kapatDugmesi) kapatDugmesi.focus({ preventScroll: true });
}

function pencereKapat() {
  if (!perde || perde.hidden) return;

  perde.hidden = true;
  document.body.style.overflow = "";

  if (sonOdak && typeof sonOdak.focus === "function") {
    sonOdak.focus({ preventScroll: true });
  }
  sonOdak = null;
}

if (perde) {
  perde.addEventListener("click", (olay) => {
    if (olay.target === perde) pencereKapat();
  });
}

if (kapatDugmesi) {
  kapatDugmesi.addEventListener("click", pencereKapat);
}

document.addEventListener("keydown", (olay) => {
  if (olay.key === "Escape") pencereKapat();
});

/* ---------------------------------------------------------
   6) Kayar yıldız — yakalanınca küçük bir not açılır
   --------------------------------------------------------- */
const kayanEl = document.getElementById("kayanYildiz");
let kayanAnim = null;
let kayanZaman = null;

function kayanPlanla(gecikme) {
  window.clearTimeout(kayanZaman);
  kayanZaman = window.setTimeout(kayanUcur, Math.max(1500, gecikme));
}

function kayanAraligi() {
  const aralik = AYARLAR.yildizAraligi;
  return aralik[0] + Math.random() * (aralik[1] - aralik[0]);
}

function kayanYildizBaslat() {
  if (AZ_HAREKET || !kayanEl) return;
  kayanPlanla(AYARLAR.ilkYildizGecikmesi + Math.random() * 3000);
}

function kayanUcur() {
  if (!kayanEl || document.hidden) {
    kayanPlanla(8000);
    return;
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const mesafe = Math.max(vw, vh) * 1.1;
  const dikey = mesafe * 0.42;
  const baslangicY = vh * (0.06 + Math.random() * 0.28);

  kayanEl.hidden = false;
  kayanEl.style.top = `${Math.round(baslangicY)}px`;
  kayanEl.style.left = "0px";

  kayanAnim = kayanEl.animate(
    [
      { transform: "translate3d(-8rem, 0, 0)", opacity: 0 },
      {
        transform: `translate3d(${Math.round(mesafe * 0.1)}px, ${Math.round(
          dikey * 0.1
        )}px, 0)`,
        opacity: 1,
        offset: 0.2,
      },
      {
        transform: `translate3d(${Math.round(mesafe)}px, ${Math.round(dikey)}px, 0)`,
        opacity: 0,
      },
    ],
    { duration: 2000, easing: "linear", fill: "forwards" }
  );

  kayanAnim.onfinish = () => {
    kayanEl.hidden = true;
    kayanAnim = null;
    kayanPlanla(kayanAraligi());
  };
}

function kayanDurdur() {
  if (!kayanAnim) return;
  kayanAnim.onfinish = null;
  kayanAnim.cancel();
  kayanAnim = null;
  if (kayanEl) kayanEl.hidden = true;
}

if (kayanEl) {
  kayanEl.addEventListener("click", () => {
    kayanDurdur();
    pencereAc();
    kayanPlanla(kayanAraligi());
  });
}

/* ---------------------------------------------------------
   7) Başlat
   --------------------------------------------------------- */
function baslat() {
  boyutlandir();
  kalpOlustur();
  ismiHazirla();
  kartlariHazirla();
  kalpGuncelle();
  donguyuBaslat();
  kayanYildizBaslat();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", baslat, { once: true });
} else {
  baslat();
}
