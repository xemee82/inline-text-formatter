/**
 * Content Script 主入口
 * 协调 SelectionDetector、FloatingToolbar 与 TextReplacer
 * 支持 LinkedIn 与 X (Twitter) 双平台
 */
(function () {
  'use strict';

  if (window.__lifInitialized) return;
  window.__lifInitialized = true;

  let currentSelectionInfo = null;

  // 1. 初始化浮动工具栏
  window.FloatingToolbar.init((styleName) => {
    if (!currentSelectionInfo) return;

    const selection = currentSelectionInfo.selection || window.getSelection();
    if (!selection || selection.isCollapsed) {
      try {
        selection.removeAllRanges();
        selection.addRange(currentSelectionInfo.range);
      } catch (e) {
        console.warn('[InlineFormatter] 恢复选区失败:', e);
      }
    }

    const success = window.TextReplacer.applyFormat(styleName, currentSelectionInfo);

    if (success) {
      setTimeout(() => {
        window.FloatingToolbar.hide();
        currentSelectionInfo = null;
      }, 150);
    }
  });

  // 2. 初始化选区检测
  window.SelectionDetector.init((info) => {
    if (info) {
      currentSelectionInfo = info;
      window.FloatingToolbar.show(info.rect);
    } else {
      if (window.FloatingToolbar.isVisible()) {
        setTimeout(() => {
          const sel = (currentSelectionInfo && currentSelectionInfo.selection) || window.getSelection();
          if (!sel || sel.isCollapsed) {
            window.FloatingToolbar.hide();
            currentSelectionInfo = null;
          }
        }, 200);
      }
    }
  });

  console.log('[InlineFormatter] Content Script loaded on', window.location.hostname);
})();
