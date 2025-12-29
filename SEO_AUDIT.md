# SEO Audit Report — Touch Radio Web

**Datum auditu:** 2025-12-29  
**Projekt:** touch-radio-web  
**Platforma:** Astro

---

## 🔴 Kritické problémy

### 1. Chybějící OpenGraph metadata
**Problém:** Projekt neobsahuje žádná OpenGraph (og:*) metadata pro sociální sdílení.

**Dopad:**
- Při sdílení na Facebook, LinkedIn, Discord apod. se zobrazí generický náhled bez kontroly
- Chybí og:image → žádný vizuální náhled
- Chybí og:title, og:description → použije se fallback z title/description, ale není garantováno

**Řešení:**
```astro
<meta property="og:type" content="website" />
<meta property="og:url" content={Astro.url} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={new URL('/og-image.jpg', Astro.url)} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

---

### 2. Chybějící Twitter Card metadata
**Problém:** Žádná Twitter Card metadata.

**Dopad:**
- Při sdílení na X/Twitter se zobrazí základní náhled bez kontroly
- Chybí možnost použít `summary_large_image` pro atraktivnější sdílení

**Řešení:**
```astro
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={new URL('/og-image.jpg', Astro.url)} />
```

---

### 3. Chybějící OG obrázek
**Problém:** Neexistuje žádný sociální náhledový obrázek.

**Dopad:**
- Sdílení na sociálních sítích vypadá neprofesionálně
- Nižší CTR při sdílení

**Řešení:**
Vytvořit obrázek s těmito parametry:
- **Název souboru:** `og-image.jpg`
- **Umístění:** `/public/og-image.jpg`
- **Rozměry:** 1200×630 px (poměr 1.91:1)
- **Formát:** JPG (optimalizovaný, ~100-200 KB)
- **Obsah návrhu:**
  - Výrazný nadpis: "Touch Radio"
  - Podnadpis: "Minimalist Web Radio Player"
  - Jednoduchý gradient pozadí (např. modrá → fialová)
  - Ikona rádia nebo vlny
  - Bezpečné okraje 60px ze všech stran

---

### 4. Chybějící PWA ikony a manifest
**Problém:** Projekt nemá web app manifest ani PWA ikony.

**Dopad:**
- Nelze přidat aplikaci na domovskou obrazovku mobilních zařízení
- Chybí branding při instalaci jako PWA
- Horší uživatelský zážitek na mobilech

**Řešení:**
Vytvořit následující soubory:

**`/public/manifest.json`:**
```json
{
  "name": "Touch Radio",
  "short_name": "Touch Radio",
  "description": "Minimalist web radio player focusing on simplicity and speed",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Ikony potřebné:**
- `/public/icons/icon-192.png` (192×192 px)
- `/public/icons/icon-512.png` (512×512 px)
- `/public/apple-touch-icon.png` (180×180 px)
- `/public/favicon-32x32.png` (32×32 px)
- `/public/favicon-16x16.png` (16×16 px)

**Přidat do `<head>` v BaseLayout.astro:**
```astro
<link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<meta name="theme-color" content="#3b82f6" />
```

---

## 🟡 Doporučené vylepšení

### 5. Slabý title tag
**Problém:** Title je pouze "Touch Radio" bez kontextu.

**Aktuální stav:**
```astro
title = "Touch Radio"
```

**Doporučení:**
```astro
title = "Touch Radio | Free Web Radio Player"
```

Nebo dynamicky pro různé stránky:
```astro
const pageTitle = title ? `${title} | Touch Radio` : "Touch Radio | Free Web Radio Player";
```

**Výhody:**
- Lepší SEO (klíčová slova)
- Jasnější kontext v záložkách prohlížeče
- Lepší rozpoznatelnost ve výsledcích vyhledávání

---

### 6. Generický meta description
**Problém:** Description je příliš obecný a krátký.

**Aktuální stav:**
```
"Minimalist web radio player focusing on simplicity and speed."
```

**Doporučení:**
```
"Discover and play thousands of radio stations worldwide. Touch Radio is a free, minimalist web radio player with smart search, playlist export, and no ads. Listen now!"
```

**Výhody:**
- Delší (150-160 znaků je ideál)
- Obsahuje klíčová slova (radio stations, free, playlist, no ads)
- Call-to-action ("Listen now!")
- Lepší CTR ve vyhledávání

---

### 7. Chybí canonical URL
**Problém:** Není definován canonical tag.

**Dopad:**
- Potenciální problémy s duplicitním obsahem
- Google si může vybrat špatnou verzi URL

**Řešení:**
```astro
<link rel="canonical" href={Astro.url.href} />
```

---

### 8. Chybí strukturovaná data (JSON-LD)
**Problém:** Žádná strukturovaná data pro vyhledávače.

**Doporučení:**
Přidat JSON-LD schema pro WebApplication:

```astro
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Touch Radio",
  "description": "Discover and play thousands of radio stations worldwide",
  "url": "https://touchradio.app",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "browserRequirements": "Requires JavaScript. Requires HTML5."
}
</script>
```

**Výhody:**
- Lepší zobrazení ve vyhledávání Google
- Rich snippets
- Zvýšená důvěryhodnost

---

## 🟢 Kosmetické úpravy

### 9. Lang atribut
**Aktuální stav:** `<html lang="en">`

**Doporučení:**
Pokud je aplikace primárně česká, změnit na:
```astro
<html lang="cs">
```

Nebo přidat podporu pro více jazyků dynamicky.

---

### 10. README.md je generický
**Problém:** README obsahuje výchozí Astro template text.

**Doporučení:**
Aktualizovat README s:
- Popisem projektu Touch Radio
- Instrukcemi pro build a deploy
- Informacemi o funkcích aplikace
- Licencí

---

## 📋 Implementační checklist

### Priorita 1 (Kritické)
- [ ] Vytvořit OG obrázek (1200×630 px)
- [ ] Přidat OpenGraph metadata do BaseLayout.astro
- [ ] Přidat Twitter Card metadata do BaseLayout.astro
- [ ] Vytvořit PWA ikony (192, 512, 180, 32, 16 px)
- [ ] Vytvořit manifest.json
- [ ] Přidat odkazy na ikony a manifest do <head>

### Priorita 2 (Doporučené)
- [ ] Vylepšit title tag (přidat kontext)
- [ ] Přepsat meta description (delší, s klíčovými slovy)
- [ ] Přidat canonical URL
- [ ] Přidat JSON-LD strukturovaná data
- [ ] Nastavit správný lang atribut

### Priorita 3 (Kosmetické)
- [ ] Aktualizovat README.md
- [ ] Přidat robots.txt (pokud není)
- [ ] Zvážit sitemap.xml (pro budoucí multi-page)

---

## 🎨 Návrh designu OG obrázku

### Koncept:
```
┌─────────────────────────────────────────────────┐
│                                                 │
│         [60px bezpečný okraj]                   │
│                                                 │
│   🎵                                            │
│                                                 │
│   TOUCH RADIO                                   │
│   [Velký, tučný font, bílá barva]               │
│                                                 │
│   Minimalist Web Radio Player                   │
│   [Menší font, 70% opacity]                     │
│                                                 │
│   • 7000+ Stations                              │
│   • Smart Search                                │
│   • Playlist Export                             │
│                                                 │
│         [Gradient: #3b82f6 → #8b5cf6]           │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Technické parametry:
- **Rozměry:** 1200×630 px
- **Pozadí:** Gradient (modrá #3b82f6 → fialová #8b5cf6)
- **Font:** Inter (již používaný v projektu)
- **Barva textu:** Bílá (#ffffff)
- **Ikona:** Emoji 🎵 nebo vlastní SVG ikona
- **Formát:** JPG, optimalizovaný na ~150 KB

---

## 🔧 Návrh centralizované SEO komponenty

Pro lepší správu metadat doporučuji vytvořit komponentu:

**`src/components/SEO.astro`:**
```astro
---
interface Props {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

const {
  title = "Touch Radio | Free Web Radio Player",
  description = "Discover and play thousands of radio stations worldwide. Touch Radio is a free, minimalist web radio player with smart search, playlist export, and no ads. Listen now!",
  image = "/og-image.jpg",
  type = "website"
} = Astro.props;

const canonicalURL = new URL(Astro.url.pathname, Astro.site);
const ogImage = new URL(image, Astro.site);
---

<!-- Primary Meta Tags -->
<title>{title}</title>
<meta name="title" content={title} />
<meta name="description" content={description} />
<link rel="canonical" href={canonicalURL} />

<!-- Open Graph / Facebook -->
<meta property="og:type" content={type} />
<meta property="og:url" content={canonicalURL} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={ogImage} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content={canonicalURL} />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImage} />
```

**Použití v BaseLayout.astro:**
```astro
import SEO from "../components/SEO.astro";

<head>
  <SEO title={title} description={description} />
  <!-- zbytek head -->
</head>
```

---

## 📊 Shrnutí

**Celkem nalezeno:** 10 problémů  
**Kritické:** 4  
**Doporučené:** 4  
**Kosmetické:** 2

**Odhadovaný čas implementace:**
- Kritické problémy: ~3-4 hodiny (včetně tvorby grafiky)
- Doporučené vylepšení: ~1-2 hodiny
- Kosmetické úpravy: ~30 minut

**Doporučené pořadí:**
1. Vytvořit OG obrázek a ikony (lze použít Figma, Canva, nebo generate_image)
2. Implementovat SEO komponentu s metadaty
3. Vytvořit manifest.json
4. Aktualizovat README.md
