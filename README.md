# PROJECT SPEC // SECOND BRAIN
## Distraction-Free, Offline-First Markdown Knowledge Base & Scratchpad
**System Aesthetic:** Zerotsu - Studio UI (Neobrutalist Architectural Dossier System)  
**Cost Model:** $0.00 / Zero-Budget  
**Target Path:** `d:\Wengdev\second-brain\`  

---

## 1. Executive Summary & Philosophy
**Second Brain** is an ultra-fast, local-first markdown note-taking environment and knowledge repository. It functions seamlessly with zero network connectivity using client-side persistent storage (IndexedDB) and offers conflict-resilient multi-device synchronization using free cloud infrastructure (Cloudflare Pages + Supabase/Turso).

### Core Pillars
1. **Local-First & Zero Latency**: Data is read from and written to local storage first. UI interactions never wait on network requests.
2. **Distraction-Free Zen Writing**: Minimalist markdown editing surface with vim/command-palette shortcuts, instant live preview, and telemetry counters.
3. **Mechanical Neobrutalist UI**: Styled strictly using the Zerotsudios UI design tokens (Canvas Paper `#FFFFFF`, Midnight Ink `#0A090D`, Electric Violet `#7C3AED`, and 2px ink borders with 0-blur drop shadows).
4. **Zero Financial Overhead**: 100% free hosting and backend tiers.

---

## 2. Technical Stack & Infrastructure ($0 Budget)

| Layer | Technology | Free Tier Provider | Responsibility |
| :--- | :--- | :--- | :--- |
| **Frontend Runtime** | Vanilla ES6+ / Vite | Local / Static | Fast, zero-dependency, long-term stability |
| **Design System** | Zerotsudios UI | Local (`css/zerotsudios.css`, `js/zerotsudios.js`) | Neobrutalist ink cards, title bars, and typography |
| **Local Storage Engine** | IndexedDB (via Dexie.js / Native) | Browser Client | Offline persistence, full-text note search, instant retrieval |
| **Markdown & Syntax** | Marked.js / Prism.js | CDN / Bundled | Fast client-side markdown parsing and code highlighting |
| **Hosting & Edge Delivery** | Cloudflare Pages | Cloudflare (Free Tier) | Unlimited bandwidth, global CDN, instant deployments |
| **Sync & Auth (Phase 2)** | Supabase or Turso (libSQL) | Supabase / Turso Free | End-to-end encrypted backup, real-time sync across devices |

---

## 3. Architecture & Data Flow

```
+-------------------------------------------------------------------+
|                        BROWSER CLIENT                             |
|                                                                   |
|   [ Markdown Editor ] <---> [ Zerotsudios UI ]                    |
|           |                       |                               |
|           v                       v                               |
|   [ In-Memory State ] <---> [ IndexedDB Storage (Dexie.js) ]      |
+-------------------------------------------------------------------+
                                    |
                         (When Online & Sync Enabled)
                                    v
+-------------------------------------------------------------------+
|                     FREE CLOUD BACKEND                            |
|                                                                   |
|   [ Cloudflare Pages ] (Static Host & Edge Routing)               |
|   [ Supabase / Turso ] (Encrypted Remote Blob / libSQL Sync)      |
+-------------------------------------------------------------------+
```

### Data Schema (IndexedDB / Local Entities)
```typescript
interface Note {
  id: string;              // UUID v4
  title: string;           // Derived from first line / H1 or custom
  content: string;         // Raw markdown text
  tags: string[];          // Categorization tags (#dev, #idea, etc.)
  isPinned: boolean;       // Quick access flag
  isArchived: boolean;     // Soft-delete / archive
  wordCount: number;       // Telemetry metric
  readingTimeMin: number;  // Telemetry metric
  createdAt: number;       // Unix epoch ms
  updatedAt: number;       // Unix epoch ms
  syncedAt: number | null; // Last sync timestamp
  dirty: boolean;          // Pending remote sync flag
}
```

---

## 4. Feature Roadmap & Milestone Breakdown

### Phase 1: Local-First Core & Zerotsudios Interface (Current)
- [x] Project scaffolded with Zerotsudios UI CSS, JS, and asset pipeline.
- [x] Clean three-column mechanical layout:
  - **Left Sidebar**: Vault selector, folder/tag tree, pinned notes, quick search.
  - **Center Canvas**: Markdown editor (monospace / clean typography) with live line/word telemetry.
  - **Right Panel (Collapsible)**: Live compiled preview or document metadata dossier.
- [x] IndexedDB persistence layer (auto-save with debounce).
- [x] Fast fuzzy search (`title`, `content`, `tags`).
- [x] Export features: Markdown (`.md`), Plain Text (`.txt`), and JSON backup archive.

### Phase 2: Power-User Controls & Telemetry
- [ ] **Quick Command Palette (`Ctrl + K` / `Cmd + K`)**: Switch notes, create new note, toggle theme, export.
- [ ] **Zen / Focus Mode (`F11` or toggle)**: Hides sidebars, leaves just the paper canvas with mechanical ink styling.
- [ ] **Keyboard Shortcuts**:
  - `Ctrl + N`: New scratchpad note
  - `Ctrl + Shift + F`: Global search
  - `Ctrl + P`: Toggle preview split
  - `Ctrl + S`: Force immediate save snapshot

### Phase 3: Cloudflare Deployment & Multi-Device Sync ($0 Free Tier)
- [ ] Connect repo to Cloudflare Pages for automatic preview & production deployments.
- [ ] Optional client-side WebCrypto password protection (AES-256-GCM) so notes are encrypted before touching the cloud.
- [ ] Supabase or Turso sync connector for multi-device sync without hosting bills.

---

## 5. UI & Styling Specifications (Zerotsudios Compliance)
* **Base Paper**: High-contrast `#FFFFFF` with `#0A090D` text.
* **Panels & Dossiers**: `.title-bar` header strips, `.panel-dark` for terminal telemetry / status bar.
* **Borders & Shadows**: `2px solid #0A090D` borders, `4px 4px 0 #0A090D` hard drop shadows.
* **Accents**: `.btn-purple` (`#7C3AED`) for primary actions, `.badge-lilac` (`#C06BF0`) with bold Midnight Ink (`#0A090D`) text for tag indicators.
* **Typography**:
  - Display: `Anton` (All caps, 900 weight, skewed accents)
  - Telemetry & Code: `Space Mono`
  - Body / Content: `Archivo`

---

## 6. Quick Start & Local Development
```bash
# Navigate to the project
cd d:\Wengdev\second-brain

# Launch local preview using any local static server (e.g., Python or Node)
npx serve .
# or
python -m http.server 8080
```
