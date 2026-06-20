---
version: alpha
name: AdvisorOS
description: A clean, document-like fintech advisor platform with a GitHub-inspired light palette, confident green actions, and a dark AI chat accent.
colors:
  primary: "#16a34a"
  primary-active: "#15803d"
  secondary: "#2563eb"
  secondary-active: "#1d4ed8"
  ai-brand: "#24292f"
  canvas: "#f3f4f6"
  surface: "#ffffff"
  surface-raised: "#f6f8fa"
  surface-overlay: "#f0f2f4"
  ink: "#111827"
  ink-secondary: "#374151"
  ink-muted: "#6b7280"
  ink-faint: "#9ca3af"
  border: "#e5e7eb"
  border-strong: "#d1d5db"
  hairline: "#e5e7eb"
  error: "#dc2626"
  error-surface: "#fef2f2"
  warning: "#d97706"
  warning-surface: "#fffbeb"
  success: "#16a34a"
  success-surface: "#f0fdf4"
  on-primary: "#ffffff"
  on-ai-brand: "#ffffff"
typography:
  display-1:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: "1.2"
    letterSpacing: "-0.5px"
  heading-1:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "1.25"
    letterSpacing: "-0.2px"
  heading-2:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "1.3"
    letterSpacing: "-0.15px"
  heading-3:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "1.4"
    letterSpacing: "0px"
  body-md:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "1.5"
    letterSpacing: "0px"
  body-sm:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "1.46"
    letterSpacing: "0px"
  button:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "1"
    letterSpacing: "0px"
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "1.33"
    letterSpacing: "0px"
  eyebrow:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: "1.33"
    letterSpacing: "+0.08px"
  nav:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: "1"
    letterSpacing: "-0.2px"
rounded:
  none: "0px"
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  nav-bar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    height: "44px"
    padding: "0 32px"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "6px 14px"
    height: "32px"
  button-primary-pressed:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: "6px 14px"
    height: "32px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-secondary}"
    borderColor: "{colors.border-strong}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "6px 14px"
    height: "32px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "6px 10px"
    height: "32px"
  button-danger:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "6px 14px"
    height: "32px"
  button-ai:
    backgroundColor: "{colors.ai-brand}"
    textColor: "{colors.on-ai-brand}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: "10px"
    size: "44px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    shadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)"
  card-flat:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    shadow: "none"
  card-raised:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    shadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.06)"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    borderColor: "{colors.border-strong}"
    placeholderColor: "{colors.ink-faint}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
    height: "32px"
    focusBorderColor: "{colors.secondary}"
    focusRing: "0 0 0 3px rgba(37,99,235,0.15)"
  chip:
    backgroundColor: "{colors.surface-overlay}"
    textColor: "{colors.ink-secondary}"
    borderColor: "{colors.border}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  badge-green:
    backgroundColor: "{colors.success-surface}"
    textColor: "{colors.success}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
    typography: "{typography.eyebrow}"
  badge-red:
    backgroundColor: "{colors.error-surface}"
    textColor: "{colors.error}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
    typography: "{typography.eyebrow}"
  badge-yellow:
    backgroundColor: "{colors.warning-surface}"
    textColor: "{colors.warning}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
    typography: "{typography.eyebrow}"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
    shadow: "0 8px 24px rgba(0,0,0,0.18)"
    maxWidth: "360px"
  empty-state:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xxl}"
    iconColor: "{colors.ink-faint}"
  sidebar-left:
    backgroundColor: "{colors.surface}"
    width: "280px"
    borderColor: "{colors.border}"
    padding: "{spacing.md}"
  sidebar-right:
    backgroundColor: "transparent"
    width: "320px"
    padding: "0 0 0 {spacing.md}"
  ai-bubble-user:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-primary}"
    rounded: "12px 12px 4px 12px"
    padding: "8px 12px"
    maxWidth: "80%"
  ai-bubble-assistant:
    backgroundColor: "{colors.surface-overlay}"
    textColor: "{colors.ink}"
    borderColor: "{colors.border}"
    rounded: "12px 12px 12px 4px"
    padding: "8px 12px"
    maxWidth: "80%"
---

## Overview

AdvisorOS reads like a clean professional document held in good office light. The dominant surface is not pure white but a cool-neutral page canvas — `{colors.canvas}` (#f3f4f6) — that softens the clinical harshness of a full-white screen and gives the advisor workspace a calm, document-like feel. Cards and panels sit as white `{colors.surface}` (#ffffff) islands on that canvas, separated by hairline borders and the gentlest drop shadow rather than heavy elevation. Type is the system stack (Inter / -apple-system) in near-black `{colors.ink}` (#111827) at confident medium-to-heavy weights, dropping off to `{colors.ink-muted}` (#6b7280) for supporting metadata.

The palette makes exactly one loud statement: **Notion-green** `{colors.primary}` (#16a34a) for every create or commit action. Blue `{colors.secondary}` (#2563eb) is the link and focus signal, never a CTA fill. Everything else is grey, white, and the quiet canvas. Against that restraint, the AI assistant layer speaks in a single deliberate dark accent — `{colors.ai-brand}` (#24292f), a GitHub near-black — used exclusively for the floating chat button and the IntelliBot brand mark. The contrast is intentional: the advisor interface is daylight-neutral; the AI surface is a confident, darker presence within it.

**Key Characteristics:**
- Cool-neutral canvas `{colors.canvas}` over pure white, giving the workspace a document-like calm
- Near-black `{colors.ink}` system-font type at tight negative tracking for headings (`{typography.display-1}`, `{typography.heading-1}`)
- Exactly one primary action accent — advisor green `{colors.primary}` — for create/commit actions only
- Blue `{colors.secondary}` reserved strictly for links, focus rings, and inline anchor interactions
- A distinct AI-brand dark `{colors.ai-brand}` applied only to IntelliBot surfaces so the AI layer always has a recognisable visual identity
- Cards defined by 1px hairline + a soft one-stop shadow, not heavy drop-shadows
- Compact 44px top navigation with content alignment matching the page column grid

## Colors

> Source surfaces analysed: Dashboard, client repo page, TopNav, AI chat widget, dedicated chatbot workspace, left sidebar, right schedule sidebar. The system resolves to a single tightly-scoped palette across all advisor surfaces.

### Brand & Action
- **Advisor Green** (`{colors.primary}` — #16a34a): the single structural action accent. Fills every primary CTA ("New", "Create", "Submit"). Must never be used decoratively or on non-interactive elements.
- **Pressed Green** (`{colors.primary-active}` — #15803d): the darker press/hover state of the primary CTA.
- **Link Blue** (`{colors.secondary}` — #2563eb): used for hyperlinks, active tab underlines, focus rings, and the user chat bubble. Never fills a button that already has green available.
- **Pressed Blue** (`{colors.secondary-active}` — #1d4ed8): the press state of blue interactive elements.
- **IntelliBot Dark** (`{colors.ai-brand}` — #24292f): the GitHub-derived near-black reserved exclusively for the floating AI chat button and the IntelliBot sidebar brand mark. Signals the AI assistant layer with a consistent dark identity.

### Surface
- **Page Canvas** (`{colors.canvas}` — #f3f4f6): the global page background. Every page begins here; the TopNav also inherits this colour so it reads as part of the page rather than a chrome layer.
- **White Surface** (`{colors.surface}` — #ffffff): cards, panels, inputs, modals. The figure against the canvas ground.
- **Raised Surface** (`{colors.surface-raised}` — #f6f8fa): subtly elevated nested regions (sidebar headers, code blocks, table headers) when a secondary fill is needed without going as dark as the canvas.
- **Overlay Surface** (`{colors.surface-overlay}` — #f0f2f4): hover states, assistant chat bubbles, muted action pills.
- **Hairline** (`{colors.hairline}` / `{colors.border}` — #e5e7eb): 1px borders on cards, dividers, and input edges.
- **Strong Border** (`{colors.border-strong}` — #d1d5db): input focus-ready borders, search bar frames.

### Text
- **Ink** (`{colors.ink}` — #111827): primary headings and body text.
- **Ink Secondary** (`{colors.ink-secondary}` — #374151): secondary labels, nav link text, sidebar item text.
- **Ink Muted** (`{colors.ink-muted}` — #6b7280): supporting copy, timestamps, metadata.
- **Ink Faint** (`{colors.ink-faint}` — #9ca3af): placeholder text, disabled labels, empty-state icons.

### Semantic
- **Error** (`{colors.error}` — #dc2626) on `{colors.error-surface}` (#fef2f2): destructive actions, validation failures, alert states.
- **Warning** (`{colors.warning}` — #d97706) on `{colors.warning-surface}` (#fffbeb): caution flags on client risk profiles.
- **Success** (`{colors.success}` — #16a34a) on `{colors.success-surface}` (#f0fdf4): confirmation states, resolved alerts. Shares hue with `{colors.primary}` intentionally.

## Typography

### Font Family
The entire system uses the **native system font stack**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. This choice prioritises rendering speed, OS-native legibility, and zero FOUT — critical for a tool advisors have open all day. No web font downloads, no flash of unstyled text.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-1}` | 32px | 700 | 1.2 | −0.5px | Page welcome heading ("✦ Hello, advisor") |
| `{typography.heading-1}` | 24px | 600 | 1.25 | −0.2px | Dashboard section titles ("Home") |
| `{typography.heading-2}` | 20px | 600 | 1.3 | −0.15px | Card section headers, modal titles |
| `{typography.heading-3}` | 16px | 600 | 1.4 | 0 | Sidebar headers ("Top repositories", "Today's Schedule") |
| `{typography.nav}` | 15px | 600 | 1 | −0.2px | TopNav brand mark "AdvisorOS" |
| `{typography.body-md}` | 15px | 400 | 1.5 | 0 | Default body copy, feed items, nav links |
| `{typography.body-sm}` | 13px | 400 | 1.46 | 0 | Sidebar list items, metadata, table rows |
| `{typography.button}` | 14px | 600 | 1 | 0 | All button labels |
| `{typography.caption}` | 12px | 400 | 1.33 | 0 | Timestamps, footnotes, sidebar helper text |
| `{typography.eyebrow}` | 11px | 600 | 1.33 | +0.08px | Status badges, section eyebrows |

### Principles
AdvisorOS type is **efficient and hierarchy-clear, never decorative**. Headlines use weight 600–700 and mild negative tracking so section titles feel anchored without being heavy. Body copy sits at a comfortable 1.5 line-height — advisors read dense client information, so readability beats compactness. The expressive range runs from a 32px display heading down to 11px eyebrow labels; no size in between needs to be invented. Button labels stay at weight 600 because buttons must always look clickable at a glance against the quiet canvas.

## Layout

### Spacing System
- **Base unit**: 4px.
- **Tokens**: `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px.
- Card interior padding: `{spacing.md}` (16px). Button horizontal padding: 14px (between `{spacing.sm}` and `{spacing.md}`). Section vertical gaps: `{spacing.lg}` to `{spacing.xl}`.

### Grid & Container
The page uses a **three-column centred layout** capped at `max-width: 1440px` with `padding: 0 32px` (matching `{spacing.xl}`). Columns:
- **Left sidebar** — 280px fixed, sticky below the 44px TopNav (`top: 45px`), holds "Top repositories"
- **Feed / main** — `flex: 1`, `max-width: 800px`, the primary advisor workspace
- **Right sidebar** — 320px fixed, sticky, holds "Today's Schedule"

The TopNav inner container mirrors this same `max-width: 1440px; padding: 0 32px` constraint so the "AdvisorOS" wordmark left-aligns with the left sidebar edge and the profile avatar right-aligns with the right sidebar edge.

The dedicated chatbot workspace (`/chatbot`) uses a two-column layout: a 256px collapsible AI sidebar + full-width main content. The workspace height is `calc(100vh - 44px)` to account for the sticky TopNav.

### Whitespace Philosophy
Cards and sections breathe. The 1px hairline border defines the figure/ground relationship; shadows confirm lift. Between sections, `{spacing.lg}` (24px) is the minimum vertical gap — never collapse sections against each other. Feed cards are separated by `{spacing.sm}` (12px) gaps to keep the list scannable without feeling dense.

### Responsive Strategy

#### Breakpoints
| Name | Width | Key Changes |
|---|---|---|
| Wide | 1440px+ | Three columns, full container constraint kicks in |
| Desktop | 1024–1440px | Standard three-column, right sidebar visible |
| Tablet | 768–1024px | Right sidebar hidden (`hidden lg:flex`), two columns |
| Mobile | ≤768px | Left sidebar hidden (`hidden md:block`), single feed column |

#### Collapsing Strategy
Left sidebar hides below `md` breakpoint. Right sidebar hides below `lg`. The feed column expands to fill available width. The AI chat widget remains accessible as a fixed floating button at all breakpoints. The chatbot sidebar (`/chatbot`) is independently collapsible via a toggle button, reducing to `width: 0` with a CSS transition.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 — Flat | 1px `{colors.hairline}` border, no shadow | Sidebar panels on the canvas, table rows |
| 1 — Card | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Standard content cards, feed items, the AI chat widget |
| 2 — Raised | `0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.06)` | Hovered cards, dropdowns, context menus |
| 3 — Overlay | `0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -2px rgba(0,0,0,0.05)` | Modals, popovers, the chat widget container |
| 4 — Toast | `0 8px 24px rgba(0,0,0,0.18)` | Toast notifications, floating action confirmations |

The elevation system is **tonal, not dramatic**. The canvas-to-surface step (gray to white) does most of the figure/ground work; shadows only confirm lift. The AI chat widget uses Level 3 to establish that it floats above the page layer — the dark `{colors.ai-brand}` button also creates natural visual separation.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Table cells, rule dividers |
| `{rounded.xs}` | 4px | Small inline badges, code snippets |
| `{rounded.sm}` | 6px | Small buttons in dense contexts, search highlights |
| `{rounded.md}` | 8px | All standard buttons, form inputs, dropdown items |
| `{rounded.lg}` | 12px | Cards, feed items, sidebar panels, the AI widget container |
| `{rounded.xl}` | 16px | Modal dialogs, large illustration frames |
| `{rounded.full}` | 9999px | Status badges, chip filters, avatar circles |

### Geometry Principles
The system is **decisively rectangular with friendly corners**. `{rounded.md}` (8px) governs every interactive control — buttons, inputs, chips. `{rounded.lg}` (12px) governs every content surface — cards, panels, the chat widget. The contrast between small (8px) and large (12px) radii reinforces the hierarchy: controls feel precise, containers feel welcoming. Full-pill radius belongs only to status badges and the avatar circle.

## Components

> **States documented per component**: Default, Hover, Active/Pressed, Focus (keyboard), Disabled, and relevant semantic variants. Empty state and toast patterns are included as first-class components given their frequency in the advisor workflow.

### Navigation

**`nav-bar`** — Top navigation
- `{colors.canvas}` surface, `{colors.ink}` brand text at `{typography.nav}`, `{spacing.xl}` horizontal padding. 44px tall sticky bar. Inner content constrained to `max-width: 1440px` to align the wordmark with the left sidebar and avatar with the right sidebar. Breadcrumb trail appears on client repo pages in `{colors.ink-muted}` / `{colors.ink}` alternation.

**`sidebar-left`** — Repo navigation panel
- `{colors.surface}` (white), 280px, sticky at `top: 45px`, `height: calc(100vh - 45px)`. Contains repo search input, repo list, and "New" button. Border: 1px `{colors.hairline}`, `{rounded.lg}`, Level-1 shadow.

**`sidebar-right`** — Schedule panel
- No background (inherits canvas), 320px, sticky at `top: 45px`. Contains "Today's Schedule" timeline. No border — lives as a transparent column rather than a card.

**`ai-sidebar`** — IntelliBot session history (in `/chatbot`)
- `{colors.surface-raised}` (#F2F5F3) background, 256px, collapsible to `width: 0` via CSS transition. Contains session recents list and nav links in Claude-style layout.

### Buttons

**`button-primary`** — Create / commit action
- Fill `{colors.primary}`, text `{colors.on-primary}`, `{typography.button}`, `{rounded.md}`, `6px 14px` padding, 32px height. The only green element on any page.
- Hover: `{colors.primary-active}`.

**`button-primary-pressed`** — Pressed state
- Fill `{colors.primary-active}`, same chrome. Apply `scale(0.97)` press transform.

**`button-secondary`** — Secondary / outline action
- `{colors.surface}` fill, `{colors.ink-secondary}` text, 1px `{colors.border-strong}` border, `{rounded.md}`, same padding as primary. Used for cancel, back, and alternate actions.
- Hover: `{colors.surface-raised}` fill.

**`button-ghost`** — Ghost / icon button
- Transparent fill, `{colors.ink-muted}` text/icon, `{rounded.md}`, `5–6px` padding. Used for toolbar controls (TopNav bell, plus, sidebar icon buttons).
- Hover: `{colors.surface-overlay}` fill.

**`button-danger`** — Destructive action
- `{colors.error}` fill, `{colors.on-primary}` text, `{rounded.md}`. Reserved for delete, remove, revoke.
- Hover: darken to `#b91c1c`.

**`button-ai`** — IntelliBot floating chat toggle
- `{colors.ai-brand}` (#24292f) fill, `{colors.on-ai-brand}` icon, 44×44px, `{rounded.lg}`. Fixed position bottom-right. This is the only dark-fill button in the system and must remain visually distinct.
- Hover: lighten fill to `#374151`.

### Cards & Surfaces

**`card`** — Standard content card
- `{colors.surface}` fill, `{colors.ink}` text, `{typography.body-md}`, `{rounded.lg}`, `{spacing.md}` padding, 1px `{colors.hairline}` border, Level-1 shadow. The workhorse surface — feed items, client profiles, chatbot container.

**`card-flat`** — Flat card (panel-like)
- Same as `card` but no shadow. Used where the element is structurally part of a sidebar or fixed zone that does not need to feel lifted — e.g., the left repo sidebar, inline form areas.

**`card-raised`** — Elevated card
- Level-2 shadow, same radius and fill. Used for hovered feed items, dropdowns, and context menus to provide hover-lift feedback.

**`empty-state`** — No-content state
- `{colors.surface}` fill, `{rounded.lg}`, `{spacing.xxl}` padding, centred column layout. Structure: an `{colors.ink-faint}` icon (48×48px), a `{typography.heading-3}` label in `{colors.ink-secondary}`, a `{typography.body-sm}` description in `{colors.ink-muted}`, and an optional `button-primary` or `button-secondary` CTA below. Used in: empty sessions list, no-results search, empty feed.

### Inputs & Forms

**`input`** — Text / number field
- `{colors.surface}` fill, `{colors.ink}` text, `{typography.body-sm}`, 1px `{colors.border-strong}` border, `{rounded.md}`, `6px 12px` padding, 32px height. Placeholder: `{colors.ink-faint}`. Focus ring: `0 0 0 3px rgba(37,99,235,0.15)` with `{colors.secondary}` border.

**`textarea-chat`** — AI chat message input
- Same fill and border as `input`, auto-resizing via JS (min 44px, max 200px), no resize handle. Used in both the widget and the `/chatbot` workspace.

### Status & Metadata

**`badge-green`** — Success / active status
- `{colors.success-surface}` fill, `{colors.success}` text, `{typography.eyebrow}`, `{rounded.full}`, `2px 8px` padding. Client "Active" status, resolved flags.

**`badge-red`** — Error / high-risk status
- `{colors.error-surface}` fill, `{colors.error}` text, same chrome. High-risk client flags, overdue alerts.

**`badge-yellow`** — Warning / pending status
- `{colors.warning-surface}` fill, `{colors.warning}` text, same chrome. Pending reviews, near-expiry policies.

**`chip`** — Filter / tag pill
- `{colors.surface-overlay}` fill, `{colors.ink-secondary}` text, 1px `{colors.hairline}` border, `{rounded.full}`, `2px 10px` padding. Used for AI action pills ("Retirement concerns", "High risk clients") in the chatbot welcome view.

### AI Chat

**`ai-bubble-user`** — Advisor's message
- `{colors.secondary}` fill, `{colors.on-primary}` text, asymmetric radius `12px 12px 4px 12px` (tail at bottom-left), `8px 12px` padding, max-width 80%. Right-aligned.

**`ai-bubble-assistant`** — IntelliBot's response
- `{colors.surface-overlay}` fill, `{colors.ink}` text, 1px `{colors.hairline}` border, asymmetric radius `12px 12px 12px 4px` (tail at bottom-right), same padding and max-width. Left-aligned. Supports markdown rendering.

### Feedback

**`toast`** — Notification toast
- `{colors.ink}` (#111827) fill (dark inversion), `{colors.surface}` text, `{typography.body-sm}`, `{rounded.lg}`, `12px 16px` padding, max-width 360px, Level-4 shadow (`0 8px 24px rgba(0,0,0,0.18)`). Stacks from the bottom-right corner with `{spacing.xs}` gap between toasts. Structure: optional leading icon (coloured by intent — green, red, amber) + message text + optional "Dismiss" ghost button.

**Toast variants:**
- **Info** (default): no icon, neutral fill.
- **Success**: green `✓` icon prefixed to message.
- **Error**: red `✕` icon; fill may shift to `{colors.error}` for critical failures.
- **Warning**: amber `⚠` icon.

### Signature Components

**`ai-chat-widget`** — Floating IntelliBot panel
- Fixed bottom-right, 380px wide × 520px tall, `{rounded.lg}`, Level-3 shadow. Header: `{colors.ai-brand}` fill, white text/icons, 44px tall. Body: `{colors.surface}` chat area. Footer: input row with attachment and send controls. Collapses to the 44×44px `button-ai` when closed.

**`client-repo-card`** — Client profile card in feed
- Standard `card` chrome. Contains: avatar dot + client name + client ID breadcrumb, activity summary, risk tags as `badge-red`/`badge-yellow`, and a timestamp in `{typography.caption}` / `{colors.ink-faint}`.

**`schedule-timeline`** — Today's Schedule (right sidebar)
- Vertical timeline of events with a coloured left-border rule (green for completed, blue for current, gray for upcoming), `{typography.body-sm}` event labels, and `{typography.caption}` times. No card frame — floats on the canvas as a pure typographic component.

### Examples (illustrative)

> Kit-mirror demonstration surfaces. Each `ex-*` entry references AdvisorOS-native primitives for downstream `/preview-design` and `/generate-kit` consumers.

**`ex-client-profile-card`** — Client record card in the feed.
- Properties: `backgroundColor`, `textColor`, `borderColor`, `rounded`, `padding`, `shadow`

**`ex-risk-badge`** — Inline risk severity indicator.
- Properties: `backgroundColor`, `textColor`, `rounded`, `padding`, `typography`

**`ex-empty-session-list`** — Empty AI session history in the sidebar.
- Properties: `backgroundColor`, `iconColor`, `captionTypography`, `rounded`, `padding`

**`ex-auth-form`** — Sign-in card. Re-uses `card` chrome with `input` fields inside.
- Properties: `backgroundColor`, `rounded`, `padding`

**`ex-modal`** — Confirmation / detail modal. Level-3 shadow, scrim overlay at `rgba(0,0,0,0.35)`.
- Properties: `backgroundColor`, `rounded`, `padding`, `shadow`

**`ex-data-table`** — Client data table. Header uses `{colors.surface-raised}` fill + `{typography.eyebrow}` in `{colors.ink-muted}`; rows alternate or stay plain with 1px `{colors.hairline}` row borders.
- Properties: `headerBackground`, `headerTypography`, `bodyTypography`, `cellPadding`, `rowBorder`

**`ex-toast-stack`** — Stacked toast demo. Bottom-right origin, `{spacing.xs}` gap, max 3 visible, LIFO dismiss order.
- Properties: `backgroundColor`, `textColor`, `rounded`, `padding`, `shadow`, `maxWidth`

**`ex-sidebar-nav-row`** — Session item in AI sidebar recents list.
- Properties: `backgroundColor`, `activeIndicatorColor`, `hoverBackground`, `rounded`, `padding`, `typography`

**`ex-action-pill-row`** — Row of 4 `chip` action pills in the chatbot welcome view ("Retirement concerns", "Passive income", etc.).
- Properties: `backgroundColor`, `textColor`, `borderColor`, `rounded`, `padding`, `iconSize`

**`ex-schedule-event`** — Single event row in the right sidebar timeline.
- Properties: `accentBorderColor`, `labelTypography`, `timeTypography`, `backgroundColor`

## Do's and Don'ts

### Do
- Reserve `{colors.primary}` (green) for the single create/commit CTA on any given view — never use it decoratively.
- Keep every page on the `{colors.canvas}` (#f3f4f6) background; use pure `{colors.surface}` (#ffffff) for cards and inputs to establish clear figure/ground.
- Use `{colors.secondary}` (blue) only for links, focus rings, and the user's chat bubble fill — never as a button CTA when green is available.
- Apply `{colors.ai-brand}` (#24292f) exclusively to IntelliBot surfaces so the AI layer retains a distinct visual identity across all contexts.
- Define card edges with 1px `{colors.hairline}` + Level-1 shadow; never use heavy drop-shadows.
- Set headings in `{typography.heading-1}` / `{typography.heading-2}` with their negative tracking applied explicitly.
- Use `{rounded.md}` (8px) for all controls and `{rounded.lg}` (12px) for all containers — maintain the control/container size contrast.
- Stack toasts from bottom-right, max 3 visible, with `{spacing.xs}` gap and a dark `{colors.ink}` fill so they read above the page canvas.
- In empty states, pair an `{colors.ink-faint}` icon with a short `{typography.heading-3}` label and a single CTA — never leave an empty state without a next action.

### Don't
- Don't use `{colors.primary}` (green) for any non-interactive decoration — it is the action signal and must carry that meaning consistently.
- Don't introduce a second structural action colour alongside green — blue is for links and focus only.
- Don't apply `{colors.ai-brand}` to non-AI surfaces; the dark accent must stay anchored to the IntelliBot layer.
- Don't use heavy shadows (more than Level-2) on standard cards — elevation is subtle here, not dramatic.
- Don't set body copy at weight 600+ — reserve heavy weight for headings and button labels.
- Don't use `{rounded.full}` on buttons or inputs — pills belong only to badges and the avatar circle.
- Don't build empty states without a recovery action — advisors should never be stranded in a blank screen.
- Don't place toast notifications in the bottom-left where they would obscure the AI chat widget.
- Don't mix semantic badge colours arbitrarily — `badge-red` means risk/error, `badge-yellow` means caution/pending, `badge-green` means active/resolved; never swap them for aesthetic reasons.
