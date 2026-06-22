---
name: project-tailwind-dark-mode
description: RoomTalk uses Tailwind v4 with class-based dark mode — requires @custom-variant dark in globals.css
metadata:
  type: project
---

RoomTalk frontend uses Tailwind CSS v4.3.x with `@import "tailwindcss"` (CSS-first config). The CSS variables use `.dark` class on `<html>` for theming. A `tailwind.config.js` with `darkMode: 'class'` exists but Tailwind v4 doesn't automatically pick it up from CSS-first mode.

**Why:** Without `@custom-variant dark`, Tailwind v4 uses `prefers-color-scheme: dark` for `dark:` utility classes by default. This causes a mismatch: CSS vars change with the `.dark` class toggle, but Tailwind dark: classes activate based on OS preference. Result: white text (`dark:text-white`) on white backgrounds (CSS var light mode) — invisible text.

**Fix applied (globals.css line 5):**
```css
@custom-variant dark (&:is(.dark, .dark *));
```

**How to apply:** Any time Tailwind `dark:` classes aren't working as expected in this project, confirm this line exists in globals.css. Do NOT remove it.
