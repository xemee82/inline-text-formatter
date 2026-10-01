# Chrome Web Store & Edge Add-ons 商店上架资料包

本文档整理了提交至 **Google Chrome Web Store** 和 **Microsoft Edge Add-ons** 开发者后台所需的全套元数据、合规文案、隐私申明与审核说明。

---

## 1. 基础信息 (Basic Metadata)

### 扩展名称 (Extension Name)
> ⚠️ **合规警示 (Trademark Policy)**：根据 Google 与微软的商标政策，**切勿直接使用 "LinkedIn Text Formatter" 或 "X Text Formatter" 作为应用主标题**，否则会被审核机器人直接判定为 "Impersonation (冒充官方应用)" 并秒拒或下架。合规格式必须采用 `<产品名> for <平台>: <功能描述>`。

- **推荐名称 (Recommended)**: `Inline Text Formatter for LinkedIn & X: Bold, Italic & Font Styles` (68 字符)

### 简短描述 (Short Description)
> 最大限制 132 个字符。展示在搜索列表和推荐卡片中，务必简练且直击痛点。

`Inline text formatter for LinkedIn & X. Format posts, comments, threads & replies with bold, italic & stylish fonts instantly.` (126 字符)

### 类别 (Category)
- **Chrome Web Store**: `Productivity` (生产力) 或 `Social & Communication` (社交与通讯)
- **Edge Add-ons**: `Productivity` (生产力)

### 单一用途声明 (Single Purpose Statement)
> 审核团队必读，需用一句话说明扩展的唯一核心目的。

`Provides an inline floating formatting toolbar to convert selected text into bold, italic, and stylish Unicode fonts directly within LinkedIn and X (Twitter) editors.`

### 主语言 (Primary Language)
`English (United States)` （可在商店配置多语言本地化）

---

## 2. 商店详细介绍 (Detailed Description)

> 💡 **复制以下内容直接粘贴至开发者后台的 Description 输入框**（商店后台不支持 Markdown 语法，已排版为标准换行符与 ASCII 符号）：

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

## 3. 权限申明与合规问卷 (Permissions Justification)

在 Chrome Web Store 开发者后台的 **"Privacy (隐私与合规)"** 标签页中，请按以下要求填写：

### 权限清单
- **Permissions**: `None` (无任何额外权限)
- **Host Permissions**: `None` (无额外外置主机权限)
- **Content Scripts 声明理由**:
  - `https://*.linkedin.com/*`, `https://*.x.com/*`, `https://*.twitter.com/*`
  > "The content script runs strictly on LinkedIn and X (Twitter) web pages to detect user text selection inside post and tweet editors and display the floating formatting toolbar. It operates entirely locally and does not read, store, or transmit any user data."

### 个人数据收集申明 (Data Collection Form)
问卷中的所有选项均勾选 **"No (否)"**：
- [x] Does the extension collect user data? -> **No**
- [x] Personally identifiable information -> **Not collected**
- [x] Authentication information -> **Not collected**
- [x] Personal communications / Web history -> **Not collected**
- [x] Certify that data is NOT sold to third parties -> **Checked (已勾选)**
- [x] Certify that data is NOT used for purposes unrelated to the core function -> **Checked (已勾选)**

---

## 4. 上架视觉素材清单 (Visual Assets)

本扩展所有商店视觉素材均已生成，且存放于本地 `store-assets/` 及 iCloud 云盘中：

| 文件名 | 尺寸 | 格式 | 用途说明 |
| :--- | :--- | :--- | :--- |
| `screenshot-1-toolbar.png` | 1280 × 800 | PNG (24-bit, 无 Alpha) | 主功能截图（划选唤起浮动工具栏） |
| `screenshot-2-styles.png` | 1280 × 800 | PNG (24-bit, 无 Alpha) | 场景截图（排版风格全览与回复框实装） |
| `promo-tile-440x280.png` | 440 × 280 | PNG (24-bit, 无 Alpha) | Chrome 商店小横幅促销瓦片 (Small Promo Tile) |
| `marquee-promo-1400x560.png` | 1400 × 560 | PNG (24-bit, 无 Alpha) | 商店推荐大横幅 (Marquee Promo Tile) |
| `marquee-promo-1400x560.jpg` | 1400 × 560 | JPEG (RGB, 无 Alpha) | 备用 24-bit JPEG 格式横幅 |
| `icons/icon-128.png` | 128 × 128 | PNG | 商店展示主应用图标 |

---

## 5. 打包发布文件 (Release Package)

- **ZIP 包路径**: `inline-text-formatter-v1.2.1.zip`
- **校验状态**: 
  - 100% 满足 Manifest V3 规范
  - 根目录直置 `manifest.json`（无多余层级包装）
  - 零外部 npm 依赖，零动态远程脚本，完全纯净
