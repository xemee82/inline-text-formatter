/**
 * 浮动格式化工具栏
 * 使用 open Shadow DOM 隔离样式
 * 采用纯 DOM API 构建（避免使用 innerHTML，彻底兼容 LinkedIn Trusted Types 安全策略）
 * 采用 HTML5 Popover API 获得原生置顶（Top Layer）权限，无视外部 modal / dialog / stacking context
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
    // 使用原生 Popover API (无视外部 z-index 和 stacking context，直接处于 Top Layer 顶层)
    hostElement.setAttribute('popover', 'manual');
    
    // 原生 Popover 样式重置：
    // 核心设计：使用 max-content 使得宿主容器边界严格贴合内部工具栏，
    // 彻底解决 width:0 导致 Chromium 点击穿透到底层模态框的问题！
    hostElement.style.setProperty('position', 'fixed', 'important');
    hostElement.style.setProperty('width', 'max-content', 'important');
    hostElement.style.setProperty('height', 'max-content', 'important');
    hostElement.style.setProperty('margin', '0', 'important');
    hostElement.style.setProperty('padding', '0', 'important');
    hostElement.style.setProperty('border', 'none', 'important');
    hostElement.style.setProperty('background', 'transparent', 'important');
    hostElement.style.setProperty('inset', 'unset', 'important');
    hostElement.style.setProperty('z-index', '2147483647', 'important');

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
        position: relative;
        white-space: nowrap;
        user-select: none;
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
        transition: background-color 0.1s ease;
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

    // 阻止 mousedown 默认行为，防止编辑器失焦；同时阻断冒泡，防止外界页面全局监听导致选区被破坏
    toolbarElement.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    // 监听按钮点击事件
    toolbarElement.addEventListener('click', (e) => {
      e.stopPropagation();
      const btn = e.target.closest('button[data-style]');
      if (btn && typeof formatCallback === 'function') {
        formatCallback(btn.getAttribute('data-style'));
      }
    });

    if (!document.body.contains(hostElement)) {
      document.body.appendChild(hostElement);
    }
  }

  function show(rect) {
    if (!hostElement || !toolbarElement) return;

    // 智能挂载：如果当前选区或焦点处于原生 <dialog> 模态弹窗内（如 LinkedIn Start a Post），
    // 必须将 hostElement 挂载在该 <dialog> 内部，规避 showModal() 的底层交互隔离屏蔽；
    // 否则正常挂载在 document.body。
    const sel = typeof window.getSelection === 'function' ? window.getSelection() : null;
    const activeDialog = document.activeElement?.closest?.('dialog[open]') || 
                         sel?.anchorNode?.parentElement?.closest?.('dialog[open]') ||
                         document.querySelector?.('dialog[open]');
    const targetParent = activeDialog || document.body;

    if (hostElement.parentNode !== targetParent) {
      targetParent.appendChild(hostElement);
    }

    // 关键 1：先确保 popover 处于打开状态，脱离 display:none，使其获得真实盒模型尺寸！
    // 彻底解决之前因初始 0 尺寸导致的“先在右侧闪现、再跳到上方”的双跳动闪烁问题！
    try {
      if (!hostElement.matches(':popover-open')) {
        hostElement.showPopover();
      }
    } catch (e) {
      // Fallback
    }

    isToolbarVisible = true;

    // 关键 2：此时测量 hostElement 获得 100% 精确的渲染宽高
    const toolbarRect = hostElement.getBoundingClientRect();
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

    // 关键 3：使用 setProperty + important，一步到位绝对就位
    hostElement.style.setProperty('left', `${left}px`, 'important');
    hostElement.style.setProperty('top', `${top}px`, 'important');
  }

  function hide() {
    if (!hostElement || !toolbarElement) return;
    
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
