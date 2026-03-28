# Design System Specification: The Fluid Professional

## 1. Overview & Creative North Star
**Creative North Star: "The Intelligent Atmosphere"**

This design system moves beyond the rigid, boxy constraints of traditional SaaS platforms. To represent an AI-powered matching engine, the UI must feel liquid, breathing, and anticipatory. We achieve this through **Editorial Whitespace** and **Tonal Depth**. 

Instead of a "dashboard" look, we are creating a "curated workspace." We break the template by using intentional asymmetry—where data visualizations might bleed off a container edge or typography scales jump dramatically from `display-lg` to `label-md` to create an authoritative, high-end editorial feel. The goal is to make the freelancer feel like they are entering a premium gallery of opportunities, not a database.

---

## 2. Colors: Tonal Logic over Structural Lines
Our palette is rooted in the "Intelligence Teal" (`primary`) and "Deep Trust Indigo" (`secondary`). 

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders for sectioning. 
Structure is defined through background shifts. A `surface-container-low` section sitting on a `surface` background creates a sophisticated boundary that feels integrated rather than partitioned.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-transparent layers:
- **Base Layer:** `surface` (#f4fbf7) – The canvas.
- **Section Layer:** `surface-container-low` (#eef5f1) – To group large content areas.
- **Card Layer:** `surface-container-lowest` (#ffffff) – To elevate the most critical interactive data.
- **Interaction Layer:** `surface-bright` (#f4fbf7) – For hovering and active states.

### The "Glass & Gradient" Rule
To inject "soul" into the tech-forward personality, use Glassmorphism for floating elements (like the Fixed Top Navbar). 
- **Effect:** Background Blur (20px) + `surface` at 70% opacity.
- **Signature Gradients:** For primary CTAs and progress bars, use a subtle linear gradient: `primary` (#006b5c) to `primary-container` (#00bfa5) at a 135-degree angle. This prevents the "flat-button" look and adds a premium sheen.

---

## 3. Typography: The Editorial Scale
We use **Inter** as our sole typeface, relying on extreme weight and size contrast to establish hierarchy.

- **Display (The Statement):** Use `display-lg` (3.5rem) for welcome states or high-level AI match scores. It should feel bold and unmissable.
- **Headline (The Anchor):** `headline-md` (1.75rem) with a tight letter-spacing (-0.02em) for card titles.
- **Body (The Narrative):** `body-lg` (1rem) for job descriptions. We prioritize line-height (1.6) to ensure the "generous whitespace" extends into the text blocks.
- **Label (The Metadata):** `label-sm` (0.6875rem) in All Caps with +0.05em tracking for category tags or "AI Confidence" indicators.

---

## 4. Elevation & Depth: Tonal Layering
We replace drop shadows with **Tonal Lift**.

- **The Layering Principle:** Depth is achieved by "stacking." A white card (`surface-container-lowest`) on a light grey-teal section (`surface-container-low`) provides all the visual separation needed.
- **Ambient Shadows:** Only for "Floating" elements (Modals, Popovers). Use a 32px blur, 0px offset, and 6% opacity of `on-surface` (#161d1b). This mimics natural, soft-box studio lighting.
- **The "Ghost Border" Fallback:** If high-contrast accessibility is required, use `outline-variant` (#bbcac4) at 15% opacity. Never use 100% opaque lines.

---

## 5. Components

### Cards & Lists (The Core)
- **Rule:** Forbid divider lines. 
- **Execution:** Separate job listings using `spacing-6` (2rem) of vertical whitespace. Use a subtle background shift on hover to `surface-container-high` to indicate interactivity.
- **Corners:** Apply `md` (1.5rem) to inner content and `lg` (2rem) to main container cards.

### Buttons
- **Primary:** Gradient fill (`primary` to `primary-container`), white text, `full` roundedness. 
- **Secondary:** `secondary-container` (#8596ff) background with `on-secondary-container` (#11278e) text. No border.
- **Tertiary:** Text-only in `primary` weight, with a `surface-container-low` background appearing only on hover.

### Data Visualization (The AI Edge)
- **Radar Charts:** Fill area with `primary` at 20% opacity; stroke with `primary` at 2px width. 
- **Progress Bars:** Use a "Track and Glow" style. The track is `surface-container-highest`, and the fill is the signature Teal Gradient.

### Navigation
- **Fixed Navbar:** Glassmorphic blur. No bottom border. Use a soft `surface-tint` glow at the very top edge.
- **Slim Sidebar:** `surface-container-low` background. Use `primary-fixed-dim` (#44ddc1) as the indicator for the "Active" state—a vertical pill shape rather than a full-width background highlight.

---

## 6. Do’s and Don'ts

### Do
- **Do** use `spacing-16` (5.5rem) for padding between major sections to let the AI-generated insights "breathe."
- **Do** overlap elements. Let a radar chart slightly bleed over the edge of its parent card to break the "boxed-in" feel.
- **Do** use `on-surface-variant` for secondary text to maintain a soft, high-end contrast ratio.

### Don't
- **Don't** use 1px borders to separate list items. It creates visual noise and looks "off-the-shelf."
- **Don't** use pure black (#000000) for text. Always use `on-background` (#161d1b) to maintain the teal-tinted professional warmth.
- **Don't** use standard "Drop Shadows" from component libraries. If it looks like a shadow, it’s too dark. It should look like a glow.

---

## 7. Spacing & Radius Reference

| Token | Value | Use Case |
| :--- | :--- | :--- |
| **Radius-LG** | 2rem | Main job cards, profile containers |
| **Radius-Full** | 9999px | Buttons, status chips, search bars |
| **Spacing-4** | 1.4rem | Standard internal card padding |
| **Spacing-10** | 3.5rem | Gutter between sidebar and main content |
| **Spacing-20** | 7rem | Hero section vertical padding |