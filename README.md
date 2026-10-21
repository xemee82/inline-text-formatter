# Inline Text Formatter for LinkedIn & X: Bold, Italic & Font Styles

> **Format LinkedIn and X (Twitter) posts, comments, threads & replies with bold, italic, and stylish fonts instantly.**  
> Free, privacy-first Chrome & Edge browser extension. No X Premium subscription required.

[![Microsoft Edge Add-ons](https://img.shields.io/badge/Edge%20Add--ons-Live-blue?logo=microsoftedge)](https://microsoftedge.microsoft.com/addons/detail/formatly-for-linkedin-bo/ondapfbkhgndgfmffikdkmkklofdomlo)
[![Version](https://img.shields.io/badge/version-1.2.9-green.svg)](manifest.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Features

- **Instant Inline Floating Toolbar**: Highlight any text inside LinkedIn or X to format it instantly. No tab switching, no copy-pasting from generator websites, no intrusive modal popups.
- **Full X (Twitter) Support**: Format tweets, threads, quote tweets, and reply boxes without paying for X Premium.
- **LinkedIn Modal & Feed Support**: Works seamlessly across posts, comments, nested reply threads, and the "Start a post" modal dialog.
- **Universal Unicode Output**: Built using standard Unicode Mathematical Alphanumeric Symbols. Renders natively for all followers across web, iOS, iPadOS, Android, and external embeds.
- **Editor State Synchronization**: Employs native `insertText` input commands, ensuring both LinkedIn's Quill and X's React/Draft.js editors keep submit buttons active and character counters accurate.
- **Full Cmd+Z / Ctrl+Z Undo**: Preserves standard browser undo/redo history on both platforms.
- **Strict Site Isolation & Zero Permissions**: Runs exclusively on `*.linkedin.com`, `*.x.com`, and `*.twitter.com`. Declares **zero** host permissions, zero storage permissions, and zero background scripts. 100% local client-side execution.

---

## Supported Typography Styles

| Style Name | Example Output | Description |
| :--- | :--- | :--- |
| **Serif Bold** | `𝐁𝐨𝐥𝐝 𝐓𝐞𝐱𝐭` | Classical high-impact bold typography |
| **Serif Italic** | `𝐼𝑡𝑎𝑙𝑖𝑐 𝐓𝐞𝐱𝐭` | Elegant italic styling for quotes & emphasis |
| **Serif Bold Italic** | `𝑩𝒐𝒍𝒅 𝑰𝒕𝒂𝒍𝒊𝒄` | Dynamic emphasis for titles & hooks |
| **Sans-Serif Bold** | `𝗕𝗼𝗹𝗱 𝗦𝗮𝗻𝘀` | Modern, clean tech aesthetic |
| **Revert (Plain)** | `Aa Plain Text` | One-click restoration back to standard ASCII |

---

## Quick Start

### Install from Store
- **Edge**: [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/formatly-for-linkedin-bo/ondapfbkhgndgfmffikdkmkklofdomlo)
- **Chrome**: Chrome Web Store (coming soon)

### Load Unpacked (Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/xemee82/inline-text-formatter.git
   ```
2. Open `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge).
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the project directory.
5. Open [linkedin.com](https://www.linkedin.com) or [x.com](https://x.com), select any text in an editor, and the toolbar will appear.

---

## Architecture

- **Pure Vanilla ES6+**: Zero build tools, zero bundlers, zero npm dependencies (~35KB total payload).
- **Shadow DOM Isolation**: The floating toolbar is rendered inside an open Shadow DOM root, preventing CSS conflicts with host site design systems.
- **HTML5 Popover API (Top Layer)**: The toolbar host uses `popover="manual"`, elevating it into the browser's native **Top Layer** to guarantee visual stacking above complex SPA overlays without participating in fragile `z-index` wars.
- **Dynamic Contextual Mounting**: Intelligently anchors within active HTML5 `<dialog>` elements or falls back to `document.body`, ensuring 100% compliance with browser modal isolation rules.
- **Trusted Types & CSP Compliant**: Constructed 100% via native DOM APIs (`createElement`, `textContent`, `setAttribute`). Completely avoids `innerHTML`.

---

## Engineering Challenges & Hard-Won Solutions (技术攻坚与深度实践)

Building an inline text formatter that operates inside modern enterprise SPAs (LinkedIn & X) looks deceptively simple, but involves overcoming deep browser rendering, framework event model, and specification-level hurdles. Below are the key engineering breakthroughs discovered during development:

### 1. The Native HTML5 `<dialog>` Interaction Barrier (`Blocked by modal dialog`)

- **The Symptom**: In LinkedIn's "Start a post" modal, the floating toolbar was visually visible above the text, but clicking any button (e.g., Bold) was either completely ignored or penetrated through to the modal backdrop, triggering LinkedIn's "Discard draft?" prompt.
- **The Investigation**: Live DevTools inspection using `document.elementFromPoint(cx, cy)` on the button coordinates revealed that Chromium's hit-test was returning an ancestor `<dialog modal=true>` rather than our toolbar. LinkedIn's composer is an HTML5 native `<dialog>` opened via `dialog.showModal()`.
- **The Browser Spec**: Under the WHATWG HTML specification:
  > *"While a dialog element is showing a modal dialog... elements outside the dialog are marked as blocked by the modal dialog."*
  
  When a dialog is shown modally, the browser applies **hardware-level interaction isolation** to all nodes outside that `<dialog>`. Even elements in the Top Layer (like popovers) appended to `document.body` are considered "outside the dialog" and their pointer events are blocked.
- **The Solution**: **Dynamic Contextual Mounting**. In `FloatingToolbar.show()`, the extension detects whether the active selection or focus is inside an open modal dialog (`dialog[open]`). If so, it dynamically mounts `#lif-toolbar-host` as a direct descendant of that `<dialog>`. If in standard feed posts, comments, or on X.com, it mounts to `document.body`. Once inside `<dialog>`, the browser recognizes the toolbar as a legitimate modal participant and restores 100% pointer interaction.

### 2. Top Layer Hit-Testing & The "0x0 Bounding Box" Trap

- **The Symptom**: When first adopting the HTML5 Popover API (`popover="manual"`), the toolbar suffered a "double-jump" visual jitter (flashing briefly on the far right before snapping above text), and in certain positions clicks failed to register.
- **The Root Cause**: Legacy content script CSS applied `width: 0 !important; height: 0 !important; pointer-events: none !important` to the Shadow Host (`#lif-toolbar-host`) under the outdated assumption that it would prevent blocking underlying content. In Chromium:
  1. A Shadow Host with `pointer-events: none` causes the entire Shadow Root subtree to be skipped during hit-testing, passing clicks straight through to the backdrop.
  2. A 0x0 host measured before `showPopover()` has no geometry, leading to inaccurate position calculations on the first render frame.
- **The Solution**: 
  - Host geometry is set to `width: max-content !important; height: max-content !important; pointer-events: auto !important`, precisely hugging the toolbar boundaries.
  - Because `popover` elements are natively `display: none` when closed, they never block underlying content when hidden.
  - In `show()`, `hostElement.showPopover()` is invoked **before** measuring `getBoundingClientRect()`, guaranteeing pixel-perfect position calculations on frame zero with zero flicker.

### 3. Multi-Site Event Compatibility: React (X.com) vs Quill (LinkedIn)

- **The Challenge**:
  - **X (Twitter)** uses React 18 with a top-level synthetic event delegation root. Moving focus away from the editor deselects text and resets compose state.
  - **LinkedIn** uses a customized Quill-based contenteditable container wrapped in strict discard-on-outside-click handlers.
- **The Solution**:
  - Toolbar buttons attach `mousedown` listeners with `e.preventDefault()`. Preventing default on `mousedown` keeps the browser focus firmly inside the text editor while allowing the button `click` event to fire normally.
  - Text replacement uses `document.execCommand('insertText')` backed by native `InputEvent` dispatching (`input`, `change`), preserving native browser Undo/Redo (`Cmd+Z` / `Ctrl+Z`) and maintaining React character counts.

### 4. Zero-Permission MV3 Compliance

- Declares **zero** `host_permissions`, zero background service workers, and zero storage permissions.
- Scope is strictly locked to content script URL patterns (`linkedin.com`, `x.com`, `twitter.com`).
- Eliminates browser permission warning banners during installation, ensuring maximum user trust and near-instant store approval.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full release history.

---

## Creator & Maintainer

**Tianlu (Tyler) HUANG**  
*Co-founder & COO @ Transfong | Tech Ventures Cross-Border*  
- LinkedIn: [linkedin.com/in/tylerhuangsg](https://www.linkedin.com/in/tylerhuangsg/)  
- GitHub: [@xemee82](https://github.com/xemee82)  

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Disclaimer
*InlineFormatter is an independent open-source project and is not affiliated with, sponsored by, or endorsed by LinkedIn Corporation or X Corp. LinkedIn is a registered trademark of LinkedIn Corporation. X and Twitter are registered trademarks of X Corp.*
