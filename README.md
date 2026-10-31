# Beyza · küçük bir gökyüzü

Beyza için yapılmış, tek sayfalık interaktif romantik site.
Gece göğü, yıldızlar ve kaydırdıkça çizilen bir yıldız kalbi.

## Ne var içinde?

1. **Giriş** — isim harf harf beliriyor, arka planda canlı yıldız alanı.
2. **Takımyıldız** — sayfayı kaydırdıkça yıldızlar birleşip kalp çiziyor.
3. **Üç küçük yıldız** — ekrana girince beliren üç not kartı.
4. **Kapanış** — kısa veda cümlesi + imza.
5. **Sürpriz** — arada bir ekrandan yıldız kayıyor. Yakalanırsa (dokunulursa)
   küçük bir not açılıyor.

## Nasıl çalıştırılır?

Kurulum yok, build yok. `index.html` dosyasını tarayıcıda açman yeterli.

Yerel sunucu istersen (telefondan test etmek için faydalı):

```bash
cd /bu/klasör
python3 -m http.server 8000
# aynı Wi-Fi'deki telefondan: http://BILGISAYARIN-IP:8000
```

## Yazıları nasıl değiştiririm?

- **Sayfadaki tüm yazılar:** `index.html` içinde, `<!-- 1) GİRİŞ -->`,
  `<!-- 2) TAKIMYILDIZ -->`, `<!-- 3) NOTLAR -->`, `<!-- 4) KAPANIŞ -->`
  yorumlarının altında. İmza satırı: `<p class="imza" id="imza">— Halit</p>`.
- **Kayan yıldızı yakalayınca çıkan notlar:** `assets/main.js` dosyasının en
  üstündeki `AYARLAR.gizliNotlar` listesi.
- **Kayan yıldızın sıklığı:** aynı yerdeki `ilkYildizGecikmesi` ve
  `yildizAraligi` (milisaniye).
- **Renkler / yazı tipi:** `assets/style.css` en üstteki `:root` değişkenleri.

## Telefon uyumu (Samsung / Android Chrome)

- `viewport-fit=cover` + `env(safe-area-inset-*)` → çentik/gesture bar güvenli.
- `100dvh` + `svh` fallback → adres çubuğu kayınca sayfa zıplamıyor.
- `theme-color` → Chrome'un üst barı gece lacivert.
- Dokunma hedefleri ≥ 44px, `-webkit-tap-highlight-color: transparent`.
- Yıldız canvas'ı `devicePixelRatio` en fazla 2 ile çiziliyor; yıldız sayısı
  ekran alanına göre 45–160 arasında. Pil/ısınma derdi yok.
- Telefonda fare parallax'ı kapalı; yıldızlar kendi kendine çok yavaş süzülüyor.
- Sekme arka plana atılınca animasyon durur (`visibilitychange`).
- `prefers-reduced-motion: reduce` açıksa: animasyonlar durur, kalp tamamen
  çizili gelir, kayan yıldız hiç çıkmaz.

## Yayına alma (GitHub Pages)

1. Dosyaları GitHub'daki repoya gönder (`index.html`, `assets/`).
2. Repo → **Settings → Pages** → *Source*: `Deploy from a branch`,
   *Branch*: `main` / `/ (root)` → **Save**.
3. Bir-iki dakika sonra `https://KULLANICIADI.github.io/beyza/` adresinde açılır.

Linki WhatsApp'tan gönderirken önizleme çıkması için `index.html` içindeki
`description` etiketini değiştirebilirsin.

## Dosyalar

```
index.html          → sayfa içeriği (yazılar burada)
assets/style.css    → görünüm
assets/main.js      → yıldızlar, kalp, kayan yıldız, notlar
assets/favicon.svg  → sekme ikonu
```
