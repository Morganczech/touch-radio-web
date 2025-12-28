---
description: Prepare project for release and detect uncommitted or local-only changes.
---

Připrav projekt na release.

Kontroly:
- Zkontroluj verze aplikace, changelog a metadata.
- Zkontroluj, zda nejsou neuložené nebo necommitnuté změny v repozitáři.
- Zahrň i lokální úpravy provedené uživatelem (nejen změny vytvořené agentem).
- Ověř, že stav repozitáře odpovídá poslednímu commitu.

Git hygiene kontrola:
- Zkontroluj, zda nejsou v repozitáři soubory, které by měly být ignorovány (.env, build/, dist/, .idea/, .vscode/, *.log apod.).
- Ověř, že .gitignore pokrývá:
  - build artefakty
  - dočasné soubory
  - lokální konfigurace
  - cache a generované soubory
- Zkontroluj, zda žádný ignorovaný soubor nebyl omylem přidán do commitu.

Pokud:
- je nalezen soubor, který by měl být v .gitignore,
- nebo je .gitignore neúplný,

MUSÍŠ:
- upozornit na konkrétní soubory nebo cesty,
- navrhnout úpravu .gitignore,
- NEPROVÁDĚT žádnou změnu bez schválení.

Omezení:
- Neprováděj release ani tag bez výslovného pokynu.
- Neměň kód ani konfiguraci bez schválení.

Výstup:
- Checklist připravenosti k vydání.
- Seznam neuložených, necommitnutých nebo podezřelých změn.
- Seznam rizik nebo nejasností, které mohou ovlivnit release.

Pokud je repozitář ve stavu „dirty“, MUSÍŠ na to výslovně upozornit a zastavit další kroky.