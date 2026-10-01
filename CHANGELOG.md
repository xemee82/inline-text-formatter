# Changelog

All notable changes to Inline Text Formatter are documented in this file.

## [1.2.1] - 2026-10-01

### Fixed: Floating Toolbar Occlusion by Modal Dialogs (LinkedIn & X)
- **Root cause**: The toolbar host container (`#lif-toolbar-host`) was statically appended to `document.body` during initial page load (`document_idle`). When users subsequently opened a modal dialog (such as LinkedIn's "Start a post" modal or X's Tweet compose dialog), the application dynamically mounted its modal overlay container (`#interop-outlet` / `.artdeco-modal-overlay`) to `document.body`. Under CSS Stacking Context rules, when sibling elements share the same stacking level, Document Order (DOM sequence) determines visual precedence. Because the modal was mounted later, the floating toolbar was rendered underneath the modal card and overlay backdrop, preventing user interaction.
- **Fix**: Implemented **Dynamic DOM Promotion on Activation**:
  - `FloatingToolbar.show()` now unconditionally re-appends `hostElement` to the very end of `document.body` (`document.body.appendChild(hostElement)`), guaranteeing that the toolbar is always the latest child in Document Order, rendering on top of any dynamically mounted dialogs.
  - Dynamically enforces `position: fixed !important`, `z-index: 2147483647 !important`, and `pointer-events: none !important` on the host element.
  - Added internal `z-index: 2147483647` and `isolation: isolate` to `.lif-toolbar` within the Shadow DOM.
  - Maintained the zero-size anchor architecture (`width: 0; height: 0; pointer-events: none; overflow: visible`) so underlying clicks and LinkedIn Messaging remain completely unblocked.
- **Automated Regression Suite**: Added `content/toolbar.test.js` validating DOM promotion, modal outlet occlusion resistance, and stacking context invariants.

## [1.2.0] - 2026-09-25

### Rebrand & Differentiation
- **Official New Name**: Rebranded from "Formatly" to **Inline Text Formatter for LinkedIn & X: Bold, Italic & Font Styles** (Short brand: **InlineFormatter**).
- **Brand Differentiation**: Eliminates brand confusion with third-party modal form generators. Highlights our distinct Notion/Medium-style inline floating toolbar interaction.
- **SEO & Search Dominance**: Aligns store listing title with top intent keywords: `Inline`, `Text Formatter`, `LinkedIn & X`, `Bold, Italic & Font Styles`.
- **UI & Code Polish**: Updated popup branding to `InlineFormatter`, unified internal logging to `[InlineFormatter]`, updated repo links to `inline-text-formatter`.

## [1.1.0] - 2026-09-22

### New: X (Twitter) Platform Support
- **Full X (Twitter) inline formatting**: Format tweets, threads, quote tweets, and reply boxes with bold, italic, bold italic, sans-serif bold, and plain revert — without requiring an X Premium subscription.
- **React/Draft.js state synchronization**: Dispatches native input commands to keep X's character counter circle and Post/Reply button in sync after formatting.
- **X DOM detection**: Supports `role="textbox"` and `data-testid="tweetTextarea_*"` attribute matching for reliable X editor detection.
- **Dual site scope**: Content scripts now run on `*.linkedin.com`, `*.x.com`, and `*.twitter.com`.

### Fixed: Messaging Entry Blocked (LinkedIn)
- **Root cause**: The toolbar host element (`#lif-toolbar-host`) was a `position: fixed; z-index: 2147483647` div with no explicit width/height constraints. As a block-level element, the browser auto-sized it to near-viewport width. Combined with `pointer-events: auto` toggling via CSS `!important` and JavaScript, a large invisible overlay intermittently intercepted clicks on LinkedIn's Messaging panel, navigation buttons, and other UI layers.
- **Fix**: The host element is now constrained to `width: 0; height: 0; overflow: visible` and permanently set to `pointer-events: none`. Only the Shadow DOM inner toolbar (`.lif-toolbar.visible`) receives `pointer-events: auto`. This ensures zero interference with any underlying page element regardless of z-index stacking.

### Changed
- Extension name updated to reflect dual-platform support.
- Popup UI shows separate status badges for LinkedIn and X (Twitter).
- Store listing descriptions, screenshots, and promotional tiles updated for dual-platform branding.

## [1.0.0] - 2026-09-20

### Initial Release
- Inline floating toolbar for LinkedIn posts, comments, and deeply nested reply threads.
- Five typography styles: Serif Bold, Serif Italic, Serif Bold Italic, Sans-Serif Bold, Plain Revert (Aa).
- Universal Unicode output: renders natively for all readers across iOS, Android, web, and email.
- Editor synchronization via `document.execCommand('insertText')` preserving Cmd+Z / Ctrl+Z undo history.
- Shadow DOM style isolation; pure DOM API construction (zero innerHTML, Trusted Types CSP compliant).
- Strict site isolation: `*.linkedin.com` only.
- Zero permissions: no host permissions, no storage, no background worker.
