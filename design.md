---
version: alpha
name: GitHub Dark
description: A polished dark developer platform system with crisp contrast, subtle borders, and a confident green accent.
colors:
  primary: "#08872b"
  primary-70: "#0b9a34"
  primary-90: "#067423"
  secondary: "#1f2328"
  tertiary: "#8dd6ff"
  neutral: "#0d1117"
  surface: "#161b22"
  on-surface: "#ffffff"
  border: "#374151"
  muted: "#8b949e"
  overlay: "#0d1117"
  error: "#f85149"
typography:
  headline-display:
    fontFamily: "Mona Sans"
    fontSize: "56px"
    fontWeight: 440
    lineHeight: "60.48px"
    letterSpacing: "0px"
  headline-lg:
    fontFamily: "Mona Sans"
    fontSize: "40px"
    fontWeight: 440
    lineHeight: "48px"
    letterSpacing: "0px"
  headline-md:
    fontFamily: "Mona Sans"
    fontSize: "20px"
    fontWeight: 440
    lineHeight: "28px"
    letterSpacing: "0px"
  headline-sm:
    fontFamily: "Mona Sans VF"
    fontSize: "18px"
    fontWeight: 440
    lineHeight: "22px"
    letterSpacing: "0px"
  body-lg:
    fontFamily: "Mona Sans"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "28px"
    letterSpacing: "0.18px"
  body-md:
    fontFamily: "Mona Sans"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "27px"
    letterSpacing: "0.18px"
  body-sm:
    fontFamily: "Mona Sans"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "22px"
    letterSpacing: "0.12px"
  label-lg:
    fontFamily: "Mona Sans"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "24px"
    letterSpacing: "0px"
  label-md:
    fontFamily: "Mona Sans"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
    letterSpacing: "0px"
  label-sm:
    fontFamily: "Mona Sans VF"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "0px"
  caption:
    fontFamily: "Mona Sans VF"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
    letterSpacing: "0px"
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 8px
  sm: 16px
  md: 24px
  lg: 48px
  xl: 94px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: "6px 28px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: "6px 28px"
    height: "48px"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.tertiary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: "0px"
    height: "auto"
  card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "16px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    height: "48px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
---

# GitHub Dark

## Overview
GitHub’s visual language feels mature, technical, and calm under pressure: a dark developer workspace with bright focal points that guide attention without feeling noisy. The tone is professional and collaborative, built for engineers, contributors, and teams who expect efficiency, clarity, and trust. Density is moderate to spacious, with generous hero breathing room and tightly controlled component surfaces.

## Colors
- **Primary (#08872b):** A vivid GitHub green used for the main conversion action and success-forward emphasis. It should feel energetic, optimistic, and unmistakably clickable.
- **Secondary (#1f2328):** A deep charcoal surface used for secondary buttons and darker content containers when a layer needs to read as interactive but subdued.
- **Tertiary (#8dd6ff):** A cool blue accent for links and discovery-oriented interactions. It adds a lighter informational note against the dark base.
- **Neutral (#0d1117):** The core background black-blue that defines the overall dark-mode environment. It anchors the interface and makes the accent colors glow.
- **Surface (#161b22):** A slightly lifted panel tone for inputs, cards, and embedded UI regions. Use it when a control needs separation without breaking the dark system.
- **On-surface (#ffffff):** The primary text and icon color, chosen for maximum contrast on dark backgrounds and colored buttons.
- **Border (#374151):** A restrained gray used for outlines, dividers, and component edges. Borders do much of the hierarchy work in place of shadows.
- **Muted (#8b949e):** A softer neutral for helper text, secondary labels, and less prominent UI metadata.
- **Error (#f85149):** A saturated warning red reserved for destructive states, validation, and failure messaging.

## Typography
The system uses Mona Sans as the primary family, with Mona Sans VF where a more flexible or compact rendering is helpful. Headings are light in feel despite medium weight values, giving the interface a modern, airy personality rather than a heavy enterprise tone.

`headline-display` and `headline-lg` carry the landing-page hierarchy: large, centered, and confident, with tight or neutral letter spacing. `headline-md` and `headline-sm` are used for section titles, cards, and interface labels, maintaining the same clean geometry at smaller sizes.

`body-lg`, `body-md`, and `body-sm` prioritize readability over decoration. Body copy uses comfortable line heights and a subtle positive letter spacing, which helps the text feel crisp in the dark theme.

`label-lg`, `label-md`, and `label-sm` support buttons, navigation, and form controls. Labels are generally medium weight, with no noticeable uppercase treatment; the source feels sentence-case and direct rather than shouty.

## Layout
The page uses a centered hero composition with a broad full-bleed background and a strong vertical axis. Navigation is arranged in a compact top bar, while the primary content is placed in a narrow column to keep the headline and call-to-action focused.

Spacing is rhythmic and intentionally generous: the system’s key intervals are 8px, 16px, 24px, 48px, and 94px. Use `xs` and `sm` for compact control spacing, `md` for section separation, and `lg` to `xl` for major page breathing room.

Cards and embedded surfaces use internal padding around 16px, with larger section padding only when content is meant to feel like a major panel. Inputs and buttons align to a consistent 48px control height to keep rows tidy and predictable.

## Elevation & Depth
The design is mostly flat, relying on contrast, borders, and tonal layering instead of heavy shadow stacks. Depth is created by changing surface values slightly from the background and by using a crisp 1px border to define edges.

The strongest depth cue is the glowing lower content panel, which reads as a luminous embedded showcase rather than a floating material layer. Use shadows sparingly and only when they reinforce a special feature area; otherwise let the dark palette and border system do the work.

## Shapes
The shape language is restrained and slightly rounded, with `rounded.md` at 8px as the dominant radius. This creates a modern, tool-like feel that is approachable without becoming soft or playful.

Interactive elements should remain geometrically simple: buttons, cards, and inputs all prefer consistent corners and avoid exaggerated curves. Full pill treatment is appropriate only for chips and very small status elements.

## Components
Buttons are the most expressive component in the system. `button-primary` uses the green fill, white text, and 48px height to signal the main action; it should be the most visually dominant control on the page. `button-secondary` uses a dark fill with a light border to provide a clear alternate action without competing with the primary CTA. `button-tertiary` should remain text-like and transparent, used for subtle actions such as links or lightweight navigation.

Buttons should keep medium-weight labels, balanced horizontal padding, and a calm, rectangular silhouette. Hover states should brighten the fill slightly or strengthen the border, but should never introduce heavy shadow or motion.

Cards use the dark surface, 8px radius, and thin border to define content blocks. They should feel like contained panels inside the larger background rather than separate floating objects. Keep card padding modest and consistent, and preserve strong text contrast inside them.

Inputs follow the same surface logic as cards, with a slightly lighter fill than the page background and comfortable internal padding. Field borders should remain subtle but visible, and placeholder text should be muted rather than low-contrast gray. A 48px control height keeps forms aligned with the button system.

Chips, tags, and compact metadata pills should use `rounded.full` to create a controlled capsule shape. They belong in supportive roles only and should never outweigh the main calls to action.

Links should use the blue tertiary color and stay visually lighter than buttons. They are best treated as navigation or secondary discovery cues, not as decorated CTAs.
