---
name: "Pixel Art UI Direction"
description: "Use when redesigning or editing game visuals, UI, HUD, overlays, sprites, board presentation, or CSS styling in this project. Applies a modern 8-bit pixel art direction for total visual overhaul and retro consistency work."
applyTo: "src/ui/**/*.tsx, src/ui/styles.css, src/main.tsx"
---

# Pixel Art Visual Direction

- Apply a modern 8-bit pixel art style across UI, HUD, overlays, board framing, and any visual presentation layer.
- Favor strong silhouettes, crisp edges, limited palettes, clear contrast, and repeatable visual motifs.
- Keep the interface readable at gameplay speed before adding decorative detail.

# UI Rules

- Treat the HUD, seed bar, overlays, cards, and board chrome as one coherent retro interface system.
- Prefer chunky borders, framed panels, sharp shadows, stepped shapes, and obvious active or selected states.
- Avoid generic modern web UI patterns, soft blurs, glassmorphism, floating cards, or smooth luxury gradients.
- Use spacing, borders, shadows, texture patterns, and palette variables to create the style before adding extra markup.

# Pixel Art Constraints

- Use a restrained palette and keep color roles clear: background, surface, accent, warning, success, and interactive states.
- Prefer clean color blocks over noisy detail.
- If gradients are used, keep them minimal and banded so they still feel retro.
- Typography should feel game-like and deliberate, not default browser styling.

# Project-Specific Guardrails

- Keep React components view-focused; do not move gameplay logic into UI files for the sake of presentation.
- Express visual changes primarily in `src/ui/styles.css` and only add component structure when the visual system genuinely needs it.
- Preserve quick gameplay scanning: plants, zombies, lanes, health feedback, costs, cooldowns, and selection states must remain obvious.

# When Doing A Broad Rework

- Start with shared visual primitives first: palette, panel treatment, buttons, typography, spacing rhythm, and board framing.
- Then align high-visibility screens and components so the art direction feels consistent everywhere.
- Prefer a bold, immediate stylistic shift over many small unrelated visual tweaks.