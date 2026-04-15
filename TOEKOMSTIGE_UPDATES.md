# HPB — Toekomstige Updates (uitgesteld)

Dit document bundelt alle wijzigingen uit eerdere prompts die niet in de huidige sessie zijn doorgevoerd. Gebruik dit als basis voor een volgende update-ronde.

---

## UPDATE 2 — Volledige meertaligheid (NL, EN, ES, FR, DE)

**Status:** Gedeeltelijk. Alleen NL+EN volledig vertaald, andere talen vallen terug op EN.

**Wat moet gebeuren:**
- Alle hardgecodeerde Dutch strings in pagina's identificeren en vervangen door `getT()` keys
- Vertalingen toevoegen voor DE, ES, FR (geen fallback meer)
- Taalinstelling rechtsboven, naast categoriekeuze
- AI-gegenereerde teksten (coach, dwarsverbanden, persoonlijkheidsinterpretaties) automatisch in actieve taal
- AI system prompts moeten taal expliciet meekrijgen

**Files:**
- `src/lib/i18n.ts` — uitbreiden met DE/ES/FR vertalingen
- Alle pagina's met inline NL strings — refactoren
- `src/lib/system-prompts.ts` — taal parameter toevoegen
- `src/app/api/chat/route.ts` — gebruiker taal meesturen

---

## UPDATE 3 — Datum en tijdstempel door de hele app

**Wat moet gebeuren:**
- Huidige dag/datum altijd zichtbaar (in Banner of header)
- Elke gebruikersinvoer krijgt automatische datumstempel bij opslaan
- Na opslaan: klikbare banner "Mijn reflectie — 14 april 2026" onderaan scherm
- Klikken op banner → terug naar exacte invoer
- Wisselen tussen nieuw invulscherm en eerder opgeslagen versies

**Files:**
- `src/components/layout/Banner.tsx` — datum tonen
- Elke invoerpagina — banner component toevoegen
- Nieuw component: `src/components/SavedItemBanner.tsx`

---

## UPDATE 4 — MyBlueprint herstructurering

**Wat moet gebeuren:**
- "Relaxation" en "Positive distraction" worden domeinen IN de cirkel (niet erboven)
- "Confidence" verdwijnt uit cirkel → wordt subonderdeel van "Beste versie van mijzelf"
- 3 vragen onder Confidence: "Waar haal jij je zelfvertrouwen uit?", "Wat maakt jou zelfverzekerd?", "Wat maakt jou krachtig?"
- Elk domein klikbaar → eigen verdiepingspagina met:
  - Wie is mijn begeleider/coach op dit vlak
  - Op welke manier besteed ik hier aandacht aan
  - Wat brengt me dat
  - Wat gaat goed / minder / wil ik anders
  - Hoe reflecteer ik hierop
- Gebruikers kunnen elementen toevoegen aan elk domein
- Terugknop naar overzicht

**Files:**
- `src/app/dashboard/blauwdruk/page.tsx` — domeinen herstructureren
- Nieuw: `src/app/dashboard/blauwdruk/[domain]/page.tsx` — verdiepingspagina
- `src/app/dashboard/toolkit/beste-versie/page.tsx` — confidence-vragen toevoegen
- Verwijderen: `/dashboard/blauwdruk/ontspanning` en `/positieve-afleiding` losse pagina's

---

## UPDATE 6 — In-app herinneringssysteem op basis van feitelijk gebruik

**Wat moet gebeuren:**
- Per gebruiker bijhouden wanneer elk subdomein voor het laatst is bezocht
- Pop-up rechtsonder als subdomein >7 dagen niet bezocht: "Vergeet ook niet naar [X] te kijken"
- Geldt voor: beste versie, mentor, toolkit, blauwdruk, routines, persoonlijkheid, locus of control, ANTs squasher, contact
- Reflectie: dagelijkse herinnering aan einde van dag als nog niet ingevuld
- Wekelijks: herinnering om Jesse update te sturen
- Niet-blokkerend, verdwijnt automatisch na enkele seconden

**Files:**
- Nieuw model: `ModuleVisit` (userId, module, lastVisited)
- `src/app/api/module-visits/route.ts` — track en query
- `src/components/ReminderToast.tsx` — pop-up component
- `src/app/dashboard/layout.tsx` — global reminder check
- Hook: `src/hooks/useReminders.ts`

---

## UPDATE 7 — Intelligente dwarsverbanden tussen modules

**Status:** Basis aanwezig (`/api/cross-insights` op reflectiepagina). Moet uitgebreid worden naar alle modules.

**Wat moet gebeuren:**
- Bij elke nieuwe invoer: AI analyseert volledige geschiedenis voor verbanden
- Verbanden contextgebonden tonen (juiste moment, juiste module)
- Voorbeelden:
  - Onzekere intentie → wijst op beste versie
  - Lage motivatie → wijst op inspirerende mentor
  - Coachgesprek thema's → wijst op eerdere doelen
- Werkt voor alle modules: reflectie, intentie, coach, toolkit, blueprint, routines, doelen, locus of control
- Altijd specifiek, nooit generiek

**Files:**
- `src/app/api/cross-insights/route.ts` — generaliseren voor alle modules
- Nieuw component: `src/components/InsightCard.tsx`
- Integratie in alle invoerpagina's

---

## UPDATE 8 — Reflectiepagina: doelen als centraal anker

**Wat moet gebeuren:**
- Doelen bovenaan reflectiepagina als klikbare titels
- Toevoegen met begeleiding: procesdoel of resultaatdoel
- Vanaf 5 doelen: melding "Het is effectiever om niet aan te veel dingen tegelijkertijd te werken..."
- Bij dagelijkse intentie: aangeven op welk doel deze van toepassing is
- Bij dagelijkse reflectie: aangespoord tot reflectie op doelen
- Visueel zichtbare koppeling intentie ↔ reflectie ↔ doelen

**Files:**
- `src/app/dashboard/page.tsx` (reflectie) — doelen sectie bovenaan
- `src/app/api/goals/route.ts` — type field (proces/resultaat) toevoegen
- Nieuw model: `Goal` (userId, title, type, priority, createdAt)

---

## UPDATE 10 — Toolkit: uniforme weergave en geschiedenis

**Wat moet gebeuren:**
- "ANTs Squasher" en "Mentorschap" in dezelfde visuele blokjes als andere toolkit-elementen (uniforme kaartopmaak)
- Alle toolkit-subdomeinen krijgen automatische datum- en titellabeling bij elk gebruik
- Per subdomein: overzichtelijke geschiedenislijst, gesorteerd op datum
- Eerdere sessies volledig terug te lezen

**Files:**
- `src/app/dashboard/toolkit/page.tsx` — uniforme styling
- Per toolkit subdomein: geschiedenis component toevoegen
- Nieuw component: `src/components/ToolkitHistoryList.tsx`

---

## UPDATE 11 — Routines: uitgebreide habit tracker

**Wat moet gebeuren:**
- Plusknop bij alle categorieën/tijdstippen voor vrij invullen of inspreken
- Tijdstippen niet beperkt tot dagdelen, ook concrete tijden mogelijk
- Visueel overzicht: "Beste versie" centraal, routines eromheen
- Per routine: tekstuele beschrijving van bijdrage aan beste versie
- Klikken op routine → verdiepingslaag met eerdere invoer
- Maandkalender met gekleurde bolletjes per dag per routine (uitgevoerd ja/nee)

**Files:**
- `src/app/dashboard/routines/page.tsx` — herstructureren naar visueel overzicht
- Nieuw: `src/app/dashboard/routines/[id]/page.tsx` — verdiepingspagina + kalender
- Schema: `Routine` model uitbreiden met `description`, `exactTime`

---

## UPDATE 12 — Locus of Control in mentale toolkit

**Wat moet gebeuren:**
- Nieuw blokje "Locus of Control" in toolkit
- Invulstructuur:
  1. Beschrijf de situatie/uitdaging
  2. Waar heb je wel controle over?
  3. Waar heb je geen controle over?
  4. Welke richting wil je uit?
  5. Wat wil je veranderen?
  6. Over welke elementen heb je controle, waar niet?
- Opslaan met datum en titel
- Terug te lezen via standaard geschiedenis-systeem

**Files:**
- Nieuw model: `LocusOfControl` (userId, situation, controllable, uncontrollable, direction, change, controlOverChange, createdAt)
- `src/app/dashboard/toolkit/locus/page.tsx` — nieuw
- `src/app/api/locus/route.ts` — nieuw
- Toolkit hub: nieuwe kaart toevoegen

---

## UPDATE 14 — Gebruikerscategorieën: atleet, artiest, ondernemer

**Status:** Persona systeem bestaat al (`src/lib/persona.ts`), maar wordt amper gebruikt in pagina's.

**Wat moet gebeuren:**
- Bij onboarding: verplicht categorie kiezen (Atleet, Artiest, Ondernemer)
- Categorie wijzigbaar rechtsboven, naast taalinstelling
- Domeinspecifieke taal door HELE app:
  - Wedstrijd/Optreden/Pitch
  - Training/Repetitie/Werkdag
  - Coach/Regisseur/Mentor
  - Teamgenoten/Medeartiesten/Collega's
- AI-gegenereerde content past zich automatisch aan
- System prompts krijgen persona context

**Files:**
- `src/app/onboarding/page.tsx` — categorie selectie toevoegen
- `src/components/layout/Banner.tsx` — categorie picker
- `src/lib/persona.ts` — uitbreiden met meer terms
- Alle pagina's met persoonsspecifieke teksten — `usePersona` hook integreren
- `src/app/api/chat/route.ts` — persona context meesturen

---

## Andere openstaande wensen

### Voice input op alle tekstvelden
- VoiceInput component bestaat al
- Moet toegepast worden op ELK textveld in de app (audit nodig)

### Text-to-speech voor AI-gegenereerde tekst
- Web Speech API voor uitlezen
- Knop bij elke AI-response

### Lerend element in alle modules
- UserMemory model bestaat
- Moet actiever gevoed en gebruikt worden door alle modules
- Patroonherkenning over tijd

### Push notifications (echt, niet alleen in-app)
- Service Worker + VAPID keys
- PushSubscription model bestaat al in schema
- NotificationPreference model bestaat al
- Implementatie nog te doen

### Nederlands → andere talen voor labels die nu vast staan
- "Voornaam", "Achternaam" in onboarding
- "Welkom" in onboarding
- Diverse placeholders en error messages

---

## Prioriteitsvolgorde voor volgende sessie

1. **UPDATE 14 — Categorieën** (groot effect, meeste werk al gedaan in persona.ts)
2. **UPDATE 8 — Doelen op reflectiepagina** (cruciaal voor dagelijkse waarde)
3. **UPDATE 12 — Locus of Control** (nieuwe content, overzichtelijk)
4. **UPDATE 4 — Blauwdruk herstructurering** (verbetering van bestaande feature)
5. **UPDATE 2 — Volledige meertaligheid** (groot, fundamenteel)
6. **UPDATE 6 — In-app herinneringen** (nice-to-have)
7. **UPDATE 7 — Dwarsverbanden uitbreiden** (afhankelijk van data)
8. **UPDATE 11 — Routines kalender** (visuele upgrade)
9. **UPDATE 10 — Toolkit uniformiteit** (cosmetisch)
10. **UPDATE 3 — Datumstempels** (cosmetisch + UX)

---

*Dit document is gegenereerd op 14 april 2026.*
*De huidige sessie heeft de prioriteits-updates 1, 5, 9, 13 + deduplicatie afgerond.*
