# Checklisk pro Netlify Deploy

## 1. Příprava repozitáře ✅
- **Všechny změny commitnuty**: Ano, včetně `netlify.toml`.
- **Git Push**: Proveden na `main`.
- **Verzování**: Aktuální verze projektu je `v.1.1.0`.

## 2. Netlify Konfigurace (`netlify.toml`) ✅
- **Build Command**: `npm run build` (spustí `fetch:stations` -> `normalize:stations` -> `astro build`).
- **Publish Directory**: `dist`.
- **Node Version**: Nastaven na `20.15.1`.
- **Security Headers**: Nastaveny základní CSP a bezpečnostní hlavičky.
- **Pozor na CSP**: `media-src` povoluje `http:` pro streamy, které často neběží na HTTPS.

## 3. Environment Variables
- V tomto projektu nejsou vyžadovány žádné tajné API klíče pro build (Radio Browser API je veřejné).
- Pokud by byly potřeba, nastavte je v Netlify dashboardu v sekci **Site configuration > Environment variables**.

## 4. Build Performance
- **Large Chunk Warning**: Vite hlásí větší chunk (~2.4MB) pro `index.astro_astro_type_script_index_0_lang`. To je očekávané, protože bundlujeme databázi 5000 stanic přímo do aplikace pro offline-first přístup.
- **Doporučení**: Pokud by velikost rostla, zvážit dynamický import json dat nebo rozdělení do více souborů. Pro teď je to akceptovatelné pro rychlý start.

## 5. Další kroky
1. Přihlaste se do Netlify.
2. Klikněte na **"Add new site"** -> **"Import an existing project"**.
3. Vyberte GitHub repozitář `touch-radio-web`.
4. Netlify by mělo automaticky detekovat nastavení z `netlify.toml`.
5. Klikněte na **"Deploy"**.

Tento checklist slouží jako záznam o připravenosti projektu.
