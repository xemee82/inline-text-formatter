# Chrome Web Store & Edge Add-ons 开发者后台提交完整指南

> **版本**：v1.2.1  
> **最后更新**：2026-10-01  
> **适用平台**：Google Chrome Web Store Developer Dashboard / Microsoft Edge Partner Center  
> **项目名称**：Inline Text Formatter for LinkedIn & X: Bold, Italic & Font Styles  

---

## 1. 基础信息清单 (Store Listing Basics)

| 字段 (Field) | 提交内容 (Value) | 说明 / 约束 |
| :--- | :--- | :--- |
| **Extension Name**<br>(扩展名称) | `Inline Text Formatter for LinkedIn & X: Bold, Italic & Font Styles` | 严格遵守平台商标命名政策，精准植入 Inline / Text Formatter / LinkedIn & X（68 字符，符合 ≤75 字符上限） |
| **Summary / Short Description**<br>(简短描述) | `Inline text formatter for LinkedIn & X. Format posts, comments, threads & replies with bold, italic & stylish fonts instantly.` | 126 字符（严格满足 ≤132 字符上限） |
| **Category**<br>(类别) | `Productivity` (生产力) 或 `Social & Communication` (社交与通讯) | 优先选择 Productivity |
| **Primary Language**<br>(主语言) | `English (United States)` | 商店后台支持后续添加其他语言本地化 |
| **Single Purpose Statement**<br>(单一用途声明) | `Provides an inline floating formatting toolbar to convert selected text into bold, italic, and stylish Unicode fonts directly within LinkedIn and X (Twitter) editors.` | 审核团队必读，一句话精确阐明核心功能 |

---

## 2. 详细描述 (Detailed Description)

> 💡 **操作指南**：直接复制以下虚线框内的纯文本内容，粘贴至 Chrome/Edge 开发者后台的 **Description** 文本框中（纯文本排版，已兼容商店纯文本换行格式，已包含必要的商标免责声明）：

```text
Inline Text Formatter provides an instant floating formatting toolbar directly inside LinkedIn and X (Twitter) post composers, comment fields, threads, and reply boxes. It eliminates the need to switch browser tabs to copy-paste formatted text from external generator websites or clumsy modal popups.

Select any text within an editable field on LinkedIn or X (Twitter) to format it instantly with bold, italic, and Unicode typography.

WHAT'S NEW IN v1.2.1
- Fixed Floating Toolbar Occlusion: Resolved an issue where the inline floating toolbar could be rendered behind modal dialogs (such as LinkedIn's "Start a post" modal or compose dialogs) due to dynamic DOM insertion order.
- Dynamic DOM Promotion: The toolbar now dynamically promotes its host element to the top of the stacking context upon activation, ensuring 100% visibility and clickability above all dialogs, drawers, and overlay backdrops.
- Retained Zero-Size Anchor Architecture: Preserved non-intrusive hit-testing so background clicks and LinkedIn Messaging remain completely unblocked.

WHAT'S NEW IN v1.2.0
- Rebranded to Inline Text Formatter: Highlights our pure inline, floating toolbar experience without annoying modal popups.
- Full X (Twitter) Support: Format tweets, threads, quote tweets, and replies with bold, italic, and stylish fonts. No X Premium required.
- Fixed Messaging Issue: Resolved an issue where the toolbar host element could intermittently block clicks on LinkedIn's Messaging panel.
- Zero-Size Anchor Architecture: Redesigned the toolbar host element to eliminate pointer-event conflicts across all underlying page elements.

HIGHLIGHTS
- No X Premium Required: Unlock bold, italic, and font styles across all X posts and replies without a paid subscription.
- Universal Feed Visibility: Uses standard Unicode characters that display natively for all followers across web, iOS, Android, and embeds.
- Works Across Both Platforms: Seamlessly format LinkedIn posts and comments, X tweets and threads, quote tweets, and reply dialogs.

FEATURES
- Instant Floating Toolbar: Appears directly over selected text within LinkedIn's or X's editor.
- Universal Comment & Reply Support: Works seamlessly across posts, inline feed comments, threads, and deeply nested reply boxes without disabling submit buttons.
- Five Core Styles:
  * Serif Bold (Bold)
  * Serif Italic (Italic)
  * Serif Bold Italic (Bold Italic)
  * Sans-Serif Bold (Bold)
  * Plain Revert (Aa): Restores styled text to standard plain characters.
- Universal Compatibility: Uses standard Unicode characters. Styled text renders consistently across iOS, Android, web browsers, and email notifications without requiring plugins for readers.
- Editor Synchronization: Integrates with LinkedIn's Quill and X's React/Draft.js editor models via native input commands, keeping the submit button active and preserving Cmd+Z / Ctrl+Z undo history.
- Strict Site Isolation: Configured strictly for *.linkedin.com, *.x.com, and *.twitter.com. The extension never runs on or inspects any other website.
- Clean and Unobtrusive: No configuration panels or background processes. The toolbar only displays when text is selected.

HOW TO USE
1. Start writing a post, comment, thread, or reply on LinkedIn or X.
2. Highlight the text you want to format.
3. Click "B", "I", or any style on the floating toolbar.
4. To revert, highlight the styled text and click "Aa", or press Cmd+Z / Ctrl+Z.

PRIVACY & SECURITY
- Zero sensitive permissions: Declares no host permissions, no storage access, and no background worker.
- Site-isolated: Scoped exclusively to *.linkedin.com, *.x.com, and *.twitter.com.
- Local execution: All transformations occur locally in your browser. No data is collected, logged, or transmitted.
- Fully compliant with LinkedIn and X Content Security Policies.

DISCLAIMER
Inline Text Formatter is an independent open-source project and is not affiliated with, sponsored by, or endorsed by LinkedIn Corporation or X Corp. LinkedIn is a registered trademark of LinkedIn Corporation. X and Twitter are registered trademarks of X Corp.

Open source under the MIT License:
https://github.com/xemee82/inline-text-formatter
```

---

## 3. 隐私权与合规问卷 (Privacy Practices Tab)

### 3.1 Single Purpose Description
> `Provides an inline floating formatting toolbar to convert selected text into bold, italic, and stylish Unicode fonts directly within LinkedIn and X (Twitter) editors.`

### 3.2 Permission Justification (权限使用理由)
- 本扩展在 `manifest.json` 中 **声明了 0 项 permissions**。
- **Content Scripts 声明理由**：
  - `https://*.linkedin.com/*`, `https://*.x.com/*`, `https://*.twitter.com/*`
  > `The content script runs strictly on LinkedIn and X (Twitter) web pages to detect user text selection inside post and tweet editors and display the floating formatting toolbar. It operates entirely locally and does not read, store, or transmit any user data.`

### 3.3 Data Usage (数据收集问卷)
问卷所有项勾选 **"No (不收集任何数据)"**：
- [x] Does your extension collect or use any user data? -> **No**
- [x] 勾选两项开发者诚信承诺。

---

## 4. 上架资源文件速查

所有素材均已保存在 iCloud 目录：  
`/Users/tylerh/Library/Mobile Documents/com~apple~CloudDocs/Formatly_Store_Assets/`

- **ZIP 上传包**: `inline-text-formatter-v1.2.1.zip`
- **应用图标**: `icons/icon-128.png` (128×128)
- **截图 1**: `screenshot-1-toolbar.png` (1280×800)
- **截图 2**: `screenshot-2-styles.png` (1280×800)
- **小促销图**: `promo-tile-440x280.png` (440×280)
- **大横幅图**: `marquee-promo-1400x560.png` / `.jpg` (1400×560, 24-bit 无 Alpha)

---

## 5. v1.2.1 更新提交说明 (Notes for Certification / Changelog)

在更新现有 Edge 商店上架或重新提交 Chrome 审核时，在 **"What's new in this version"** 或 **Changelog** 字段填入：

```text
v1.2.1 Changelog:
- FIXED: Resolved an issue where the inline floating toolbar could be rendered behind modal dialogs (such as LinkedIn's "Start a post" modal or compose dialogs) due to dynamic DOM insertion order.
- IMPROVED: Implemented dynamic DOM promotion on activation, guaranteeing 100% visibility and clickability above all dialogs, drawers, and overlay backdrops.
- PRESERVED: Retained zero-size anchor host architecture to eliminate all pointer-event conflicts with underlying page elements.
```
