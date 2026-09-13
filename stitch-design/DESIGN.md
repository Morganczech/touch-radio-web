---
name: Precision Hi-Fi Radio
colors:
  surface: '#111319'
  surface-dim: '#111319'
  surface-bright: '#373940'
  surface-container-lowest: '#0c0e14'
  surface-container-low: '#191b22'
  surface-container: '#1e1f26'
  surface-container-high: '#282a30'
  surface-container-highest: '#33343b'
  on-surface: '#e2e2eb'
  on-surface-variant: '#bac9cc'
  inverse-surface: '#e2e2eb'
  inverse-on-surface: '#2e3037'
  outline: '#849396'
  outline-variant: '#3b494c'
  surface-tint: '#00daf3'
  primary: '#c3f5ff'
  on-primary: '#00363d'
  primary-container: '#00e5ff'
  on-primary-container: '#00626e'
  inverse-primary: '#006875'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#edeaff'
  on-tertiary: '#1000a9'
  tertiary-container: '#ccccff'
  on-tertiary-container: '#4344d1'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#9cf0ff'
  primary-fixed-dim: '#00daf3'
  on-primary-fixed: '#001f24'
  on-primary-fixed-variant: '#004f58'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#111319'
  on-background: '#e2e2eb'
  surface-variant: '#33343b'
typography:
  display-hero:
    fontFamily: Geist
    fontSize: 44px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  title-card:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-telemetry:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-badge:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.25rem
  margin: 1rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style
The design system embodies a modern, high-precision audiophile environment inspired by tactile rack-mount master equipment, cutting-edge software synthesizers, and premium digital audio workstations. Tailored for dedicated music explorers, curators, and global radio enthusiasts, it balances clinical acoustic utility with an immersive, atmospheric late-night listening mood.

The aesthetic fuses **Precision Minimalism** with subtle **Glassmorphism** and **Tactile Dark UI**:
- **Atmospheric Depth:** Deep zinc and obsidian surfaces recede into the backdrop, placing focus entirely on album art, broadcast frequencies, signal telemetry, and station branding.
- **Acoustic Luminance:** Electric cyan and sonic emerald indicators cut sharply through low-key backgrounds, visually signaling live streaming state, audio bitrates, dynamic waveforms, and stereo activity.
- **Instrument-grade Density:** Tight, legible information architecture with standardized telemetry badges (format codecs, sample rates, geographic origins) that resemble precision physical tuners.

## Colors
The color architecture prioritizes low eye strain during prolonged sessions and instantaneous cognitive feedback for audio state changes:

- **Primary (`#00E5FF` - Electric Cyan):** Used for interactive audio controls, active playback bars, scrub heads, focused search states, and visualizer peaks. It provides an immediate optical pop against dark carbon backdrops.
- **Secondary (`#10B981` - Sonic Emerald):** Signifies live broadcast feeds, optimal health metrics, verified high-bitrate codecs (e.g., FLAC, 320k AAC), and active stream toggles.
- **Tertiary (`#6366F1` - Electric Indigo):** Reserved for selection badges, export/utility operations, and secondary metadata highlights.
- **Neutrals & Surfaces:**
  - `Canvas / Root`: `#08090D` (Pitch black with a subtle blue undertone).
  - `Surface Base`: `#0E1117` (Deep zinc chassis).
  - `Surface Elevated / Card`: `#151922` (Translucent neutral with 60% opacity when frosted).
  - `Surface Border / Ghost Rim`: `rgba(255, 255, 255, 0.08)` for idle states, transitioning to `rgba(0, 229, 255, 0.35)` when actively streaming.
  - `Text Primary`: `#F1F5F9` (High contrast crisp white).
  - `Text Muted / Telemetry`: `#64748B` (Technical slate).

## Typography
The typographic hierarchy merges modern neo-grotesque efficiency with monospaced technical telemetry:

- **Geist (Headlines & Titles):** Provides crisp geometric authority for station headers, hero search calls-to-action, and drawer headers. Its tight kerning delivers high-density readability.
- **Inter (Body & Navigation):** Delivers transparent, fatigue-free reading across station descriptions, country lists, and playlist collections.
- **JetBrains Mono (Metadata & Badges):** Employed across bitrate meters, codec flags (MP3, AAC, OPUS, FLAC), audio frequency outputs, and timer readouts. Monospaced numerals prevent visual shifting during real-time updates.

## Layout & Spacing
The layout follows a modular cockpit architecture engineered for high-density navigation and uninterrupted audio playback:

- **Grid Structure:** A responsive 12-column grid system with dynamic margins:
  - **Desktop (>= 1280px):** 4 to 5 station columns in the central discovery area (`gutter-desktop: 1.25rem`), accompanied by a persistent 320px right-hand side rail for selection, playlist builder, and batch export tools.
  - **Tablet (768px - 1279px):** 2 to 3 station columns; the playlist selection rail collapses into a slide-over panel accessible via bottom bar toggles.
  - **Mobile (< 768px):** Single or dual-column stream layout with sticky header search and elevated bottom sheet player.
- **Persistent Player Anchor:** The layout reserves `88px` of fixed bottom clearance across all screens to ensure zero layout jump when the persistent floating master player dock is active.
- **Spacing Rhythm:** Standardized on a 4px baseline. Station card interiors use `space-md` (12px) padding to maximize information density without clutter.

## Elevation & Depth
Depth is created through luminosity and edge reflection rather than heavy drop shadows:

- **Surface Level 0 (Canvas):** Flat `#08090D` deep canvas.
- **Surface Level 1 (Card & Module Shells):** `#11141C` backplate overlaid with `border: 1px solid rgba(255, 255, 255, 0.06)`.
- **Surface Level 2 (Glass Floating Shells / Bottom Player / Drawers):** `rgba(18, 22, 32, 0.82)` with `backdrop-filter: blur(16px)` and top-edge light bevel `box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`.
- **Active Streaming Elevation (Acoustic Halo):** Playing cards and master player controls gain an ambient electric glow: `box-shadow: 0 0 24px -4px rgba(0, 229, 255, 0.18), inset 0 0 0 1px rgba(0, 229, 255, 0.4)`.

## Shapes
The shape language uses balanced rounded geometry (`roundedness: 2` / base 8px) that mirrors modern precision audio hardware:

- **Cards & Enclosures:** `0.5rem` (8px) for standard station cards and filter clusters, providing a structured, instrument-panel feel.
- **Badges & Micro-tags:** `0.25rem` (4px) corner radius for technical tags (e.g., `320 kbps`, `AAC`), keeping metadata compact.
- **Play Buttons & Player Controls:** Circular or pill configurations (`rounded-full`) for tactile differentiation from rectangular data surfaces.
- **Station Logos:** `0.375rem` (6px) rounded squares with `1px solid rgba(255, 255, 255, 0.08)` borders to unify eclectic third-party radio iconography.

## Components

### Station Cards
- **Base State:** Dark slate panel (`#131720`) with 1px border (`rgba(255,255,255,0.06)`), 8px border radius, and 12px interior padding.
- **Top Row:** 40x40px station emblem with subtle bevel, station title (Inter Semibold 15px), country flag emoji or icon, followed by an outline heart favorite trigger on the right.
- **Bottom Telemetry Row:** Monospaced codec pill (`MP3` / `AAC`), centered subtle play icon button, and right-aligned bitrate readout (`128 kbps` / `320 kbps`).
- **Active / Streaming State:** Glowing cyan accent border (`rgba(0, 229, 255, 0.45)`), live animated mini-equalizer bars in place of static play icon, and station title highlighted in white.

### Persistent Hi-Fi Bottom Player
- **Structure:** Full-width floating dock pinned to the viewport bottom with 16px blur glassmorphism, 1px top border separator (`rgba(255, 255, 255, 0.1)`).
- **Left Zone (Now Playing):** 52x52px station artwork with subtle neon badge, station moniker, genre tags, and live stream status ping (emerald blinking dot + "LIVE").
- **Center Zone (Transport & Telemetry):** Circular play/pause hero button (40px, solid electric cyan fill with obsidian icon), back/forward station skip, integrated live frequency visualizer (32 audio bins rendered in cyan-to-emerald gradient), and stream uptime clock.
- **Right Zone (Master Controls):** Audio quality switch button (`HD 320k` vs `DATA SAVER`), linear volume slider with glowing filled track, playlist queue counter, and export tray drawer toggle.

### Chips & Filter Pills
- Sleek low-profile pills (`height: 30px`) for genres (Ambient, Jazz, News, Electronic).
- Unselected: Dark semi-transparent surface (`rgba(255,255,255,0.04)`) with muted gray text.
- Selected: Bordered with electric cyan (`rgba(0,229,255,0.3)`), cyan text tint, and a 4px soft glow indicator.

### Input Fields (Global Frequency Search)
- Monolithic search bar with dark interior (`#0B0E14`), recessed inner shadow, search glass icon in muted slate, and active keyboard shortcut indicator (`/` or `CMD+K`).
- Focus state activates an electric cyan hairline border and a delicate `0 0 12px rgba(0, 229, 255, 0.15)` aura.

### Playlist Selection Rail & Export Tools
- Dedicated panel displaying selected stations with total audio bitrate tally.
- Export action buttons stacked in visual hierarchy: Primary "Share Playlist" with solid surface, followed by ghost action buttons for instant audio playlist downloads: `.M3U`, `.M3U8`, `.PLS`, and `.JSON`.