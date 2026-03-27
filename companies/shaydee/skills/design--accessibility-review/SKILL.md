---
name: accessibility-review
description: >
  Audit designs and code for WCAG 2.1 AA compliance. Covers perceivable, operable,
  understandable, and robust criteria with automated and manual testing approaches.
  Use when reviewing UI for accessibility or preparing to ship any user-facing interface.
---

# Accessibility Review

Evaluate designs and implementations against WCAG 2.1 AA standards.

## WCAG 2.1 AA Quick Reference

### Perceivable
- **1.1.1** Non-text content has alt text
- **1.3.1** Info and structure conveyed semantically
- **1.4.3** Contrast ratio >= 4.5:1 (normal text), >= 3:1 (large text)
- **1.4.11** Non-text contrast >= 3:1 (UI components, graphics)

### Operable
- **2.1.1** All functionality available via keyboard
- **2.4.3** Logical focus order
- **2.4.7** Visible focus indicator
- **2.5.5** Touch target >= 44x44 CSS pixels

### Understandable
- **3.2.1** Predictable on focus (no unexpected changes)
- **3.3.1** Error identification (describe the error)
- **3.3.2** Labels or instructions for inputs

### Robust
- **4.1.2** Name, role, value for all UI components

## Common Issues

1. Insufficient color contrast
2. Missing form labels
3. No keyboard access to interactive elements
4. Missing alt text on meaningful images
5. Focus traps in modals
6. Missing ARIA landmarks
7. Auto-playing media without controls
8. Time limits without extension options

## Testing Approach

1. Automated scan (catches ~30% of issues)
2. Keyboard-only navigation
3. Screen reader testing (VoiceOver, NVDA)
4. Color contrast verification
5. Zoom to 200% — does layout break?

## Quick Code Audit

When reviewing HTML, check these patterns:

```bash
# Images missing alt text
grep -rn "<img" --include="*.html" | grep -v "alt="

# Form inputs missing labels
grep -rn "<input\|<select\|<textarea" --include="*.html" | grep -v "aria-label\|id="

# Buttons with no text content
grep -rn "<button" --include="*.html" | grep -v "aria-label"

# Links with no descriptive text
grep -rn ">click here<\|>here<\|>read more<" --include="*.html"
```

**Quick fixes to always apply:**
- Add `lang="en"` to `<html>` tag
- Add `<meta name="viewport" content="width=device-width, initial-scale=1">` for mobile
- Use semantic elements: `<nav>`, `<main>`, `<article>`, `<footer>` instead of `<div>`
- Every `<input>` should have a visible `<label>` with matching `for`/`id`
- Interactive elements need `:focus` styles (never `outline: none` without a replacement)
- Color should never be the only way to convey information (add icons or text too)

## Output Format

```markdown
## Accessibility Audit

### Critical (must fix before shipping)
- [issue with file:line and WCAG reference]

### Warnings (fix if time allows)
- [issue with file:line and WCAG reference]

### Passed
- [what's already accessible]
```
