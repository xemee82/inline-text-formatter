# Changelog

All notable changes to Inline Text Formatter are documented in this file.

## [1.2.9] - 2026-10-02

### Fixed: Native HTML5 `<dialog>` Modal Click Isolation (LinkedIn "Start a post")
- **Root Cause**: LinkedIn's post composer uses a native HTML5 `<dialog>` element opened via `dialog.showModal()`. Under the WHATWG HTML standard, all DOM nodes outside the modal dialog are marked as "blocked by modal dialog" (hardware-level interaction isolation). Because the toolbar host was statically appended to `document.body`, clicks on the toolbar were intercepted by the browser's modal isolation barrier, passing through to the dialog backdrop and triggering LinkedIn's "Discard draft?" prompt.
- **Fix**: Implemented **Dynamic Contextual Mounting**:
  - `FloatingToolbar.show()` dynamically detects whether the active selection or focused editor is inside an open `<dialog>` (`dialog[open]`).
  - If inside a modal dialog, `#lif-toolbar-host` is mounted directly inside that `<dialog>`, granting it legitimate modal participant status and completely eliminating click isolation.
  - If in standard feed posts, comments, or on X.com, it gracefully defaults to `document.body`.
  - Safely guards `window.getSelection` for headless / synthetic environments.

## [1.2.8] - 2026-10-02

### Fixed: Content Script Static CSS Override Cleanup
- **Root Cause**: `content/content.css` had a lingering `#lif-toolbar-host` rule with `pointer-events: none !important` and `width: 0 !important` that overrode inline JavaScript styling, causing click-through to underlying overlays in Chromium.
- **Fix**: Cleaned up `content/content.css` to align with the `max-content` box model and removed all `pointer-events: none` declarations.

## [1.2.7] - 2026-10-02

### Changed: Host Element Box Sizing Refactor
- Replaced `width: 0; height: 0; overflow: visible` with `width: max-content; height: max-content`.
- Refactored `show()` to call `showPopover()` prior to geometry calculation to eliminate first-frame dimension latency and position flicker.

## [1.2.6] - 2026-10-02

### Fixed: Multi-Platform Event Interception Balancing
- Fine-tuned pointerdown and mousedown event propagation strategies between X.com's React 18 event delegation tree and LinkedIn's Quill editor.

## [1.2.2] - 2026-10-01

### Added: HTML5 Popover API (Top Layer Elevation)
- Promoted `#lif-toolbar-host` to the browser's native **Top Layer** using `popover="manual"`.
- Bypassed complex SPA `z-index` stacking context competition on LinkedIn `#interop-outlet` and Twitter modals.

## [1.2.1] - 2026-10-01

### Fixed: Floating Toolbar Occlusion by Modal Dialogs (LinkedIn & X)
- Initial attempt at dynamic DOM promotion on `document.body` to resolve mounting order precedence.

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
- **Fix**: Constrained host element sizing and ensured zero click blocking on underlying page elements.

## [1.0.0] - 2026-09-20

### Initial Release
- Inline floating toolbar for LinkedIn posts, comments, and deeply nested reply threads.
- Five typography styles: Serif Bold, Serif Italic, Serif Bold Italic, Sans-Serif Bold, Plain Revert (Aa).
- Universal Unicode output: renders natively for all readers across iOS, Android, web, and email.
- Editor synchronization via `document.execCommand('insertText')` preserving Cmd+Z / Ctrl+Z undo history.
- Shadow DOM style isolation; pure DOM API construction (zero innerHTML, Trusted Types CSP compliant).
- Strict site isolation: `*.linkedin.com` only.
- Zero permissions: no host permissions, no storage, no background worker.
