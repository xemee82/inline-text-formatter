/**
 * 浮动格式化工具栏
 * 使用 open Shadow DOM 隔离样式
 * 采用纯 DOM API 构建（避免使用 innerHTML，彻底兼容 LinkedIn Trusted Types 安全策略）
 * 
 * 精简按钮：Bold / Italic / Bold Italic / Sans-Serif Bold / Revert
 */
window.FloatingToolbar = (function() {
  let hostElement = null;
  let shadowRoot = null;
  let toolbarElement = null;
  let isToolbarVisible = false;
  let formatCallback = null;

  function init(onFormatClick) {
    if (hostElement) return;

    formatCallback = onFormatClick;

    // 创建宿主元素并附加 Shadow DOM
    hostElement = document.createElement('div');
    hostElement.id = 'lif-toolbar-host';
    hostElement.setAttribute('data-lif-toolbar', 'true');
    // 使用原生 Popover API (无视外部 z-index 和 stacking context，直接处于顶层)
    hostElement.setAttribute('popover', 'manual');
    
    // 重置 Popover 默认的居中样式，使其成为一个 0x0 的定位锚点
    hostElement.style.setProperty('position', 'fixed', 'important');
    hostElement.style.setProperty('width', '0', 'important');
    hostElement.style.setProperty('height', '0', 'important');
    hostElement.style.setProperty('overflow', 'visible', 'important');
    hostElement.style.setProperty('margin', '0', 'important');
    hostElement.style.setProperty('padding', '0', 'important');
    hostElement.style.setProperty('border', 'none', 'important');
    hostElement.style.setProperty('inset', 'unset', 'important');

    shadowRoot = hostElement.attachShadow({ mode: 'open' });

    // 1. 注入隔离样式 (使用 textContent 彻底规避 Trusted Types 拦截)
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .lif-toolbar {
        display: flex;
        align-items: center;
        background-color: #1B1F23;
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        padding: 4px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        position: absolute;
        left: 0;
        top: 0;
        opacity: 0;
        transform: translateY(4px);
        transition: opacity 0.15s ease, transform 0.1s ease;
        white-space: nowrap;
      }

      .lif-toolbar.visible {
        opacity: 1;
        transform: translateY(0);
      }

      .lif-toolbar::after {
        content: '';
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 6px 6px 0;
        border-style: solid;
        border-color: #1B1F23 transparent transparent transparent;
      }
      
      .lif-toolbar.arrow-top::after {
        bottom: auto;
        top: -6px;
        border-width: 0 6px 6px;
        border-color: transparent transparent #1B1F23 transparent;
      }

      button {
        background: transparent;
        border: none;
        color: white;
        padding: 6px 10px;
        cursor: pointer;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: inherit;
        font-size: inherit;
        line-height: 1;
      }

      button:hover {
        background-color: #30363D;
      }

      .lif-separator {
        display: inline-block;
        width: 1px;
        height: 20px;
        background-color: #30363D;
        margin: 0 2px;
      }
    `;
    shadowRoot.appendChild(styleEl);

    // 2. 纯 DOM API 方式创建工具栏
    toolbarElement = document.createElement('div');
    toolbarElement.className = 'lif-toolbar';
    toolbarElement.setAttribute('role', 'toolbar');
    toolbarElement.setAttribute('aria-label', 'Text formatting');

    function createBtn(style, title, text, isBold, isItalic) {
      const btn = document.createElement('button');
      btn.setAttribute('data-style', style);
      btn.setAttribute('title', title);
      btn.textContent = text;
      if (isBold) btn.style.fontWeight = 'bold';
      if (isItalic) btn.style.fontStyle = 'italic';
      return btn;
    }

    toolbarElement.appendChild(createBtn('bold', 'Bold (Serif)', 'B', true, false));
    toolbarElement.appendChild(createBtn('italic', 'Italic', 'I', false, true));
    toolbarElement.appendChild(createBtn('boldItalic', 'Bold Italic', 'B', true, true));
    toolbarElement.appendChild(createBtn('sansSerifBold', 'Bold (Sans-Serif)', '𝗕', false, false));

    const sep = document.createElement('span');
    sep.className = 'lif-separator';
    toolbarElement.appendChild(sep);

    const revBtn = createBtn('revert', 'Revert to plain text', 'Aa', false, false);
    revBtn.style.fontSize = '12px';
    toolbarElement.appendChild(revBtn);

    shadowRoot.appendChild(toolbarElement);

    const isX = window.location.hostname.includes('x.com') || window.location.hostname.includes('twitter.com');

    // 针对不同网站采取不同的事件拦截策略
    toolbarElement.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (isX) {
        // X.com 强依赖 stopPropagation，否则 React 全局拦截会强制失焦
        e.stopPropagation();
      }
    });

    toolbarElement.addEventListener('click', (e) => {
      if (isX) e.stopPropagation();
      const btn = e.target.closest('button[data-style]');
      if (btn && typeof formatCallback === 'function') {
        formatCallback(btn.getAttribute('data-style'));
      }
    });

    if (!document.body.contains(hostElement)) {
      document.body.appendChild(hostElement);
    }
    console.log('[InlineFormatter] 浮动工具栏初始化完成');
  }

  function show(rect) {
    if (!hostElement || !toolbarElement) return;

    if (!document.body.contains(hostElement)) {
      document.body.appendChild(hostElement);
    }

    toolbarElement.classList.add('visible');
    isToolbarVisible = true;

    const toolbarRect = toolbarElement.getBoundingClientRect();
    const gap = 8;
    
    // 水平居中
    let left = rect.left + (rect.width / 2) - (toolbarRect.width / 2);
    const minLeft = 8;
    const maxLeft = window.innerWidth - toolbarRect.width - 8;
    left = Math.max(minLeft, Math.min(left, maxLeft));

    // 默认在选区上方
    let top = rect.top - toolbarRect.height - gap;
    
    if (top < 0) {
      top = rect.bottom + gap;
      toolbarElement.classList.add('arrow-top');
    } else {
      toolbarElement.classList.remove('arrow-top');
    }

    hostElement.style.left = `${left}px`;
    hostElement.style.top = `${top}px`;

    try {
      if (!hostElement.matches(':popover-open')) {
        hostElement.showPopover();
      }
    } catch (e) {
      // Fallback
    }
  }

  function hide() {
    if (!hostElement || !toolbarElement) return;
    
    toolbarElement.classList.remove('visible');
    isToolbarVisible = false;
    
    try {
      if (hostElement.matches(':popover-open')) {
        hostElement.hidePopover();
      }
    } catch (e) {}
  }

  function isVisible() {
    return isToolbarVisible;
  }

  function isToolbarElement(el) {
    if (!el) return false;
    return el.closest?.('[data-lif-toolbar]') !== null;
  }

  return {
    init,
    show,
    hide,
    isVisible,
    isToolbarElement
  };
})();
