/**
 * 浮动格式化工具栏
 * 使用 open Shadow DOM 隔离样式
 * 采用纯 DOM API 构建（避免使用 innerHTML，彻底兼容 Trusted Types 安全策略）
 *
 * 安全架构：
 *   宿主 (#lif-toolbar-host) 是 width:0 height:0 pointer-events:none 的零尺寸锚点。
 *   仅 Shadow DOM 内部的 .lif-toolbar.visible 拥有 pointer-events:auto。
 *   这确保不会出现大面积透明遮罩拦截页面点击（Messaging、导航等）的问题。
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
    // 宿主本身是零尺寸锚点，内部工具栏通过 overflow:visible 溢出呈现
    hostElement = document.createElement('div');
    hostElement.id = 'lif-toolbar-host';
    hostElement.setAttribute('data-lif-toolbar', 'true');
    hostElement.style.setProperty('position', 'fixed', 'important');
    hostElement.style.setProperty('z-index', '2147483647', 'important');
    hostElement.style.setProperty('pointer-events', 'none', 'important');
    hostElement.style.setProperty('width', '0', 'important');
    hostElement.style.setProperty('height', '0', 'important');
    hostElement.style.setProperty('overflow', 'visible', 'important');
    hostElement.style.left = '0px';
    hostElement.style.top = '0px';
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
        z-index: 2147483647;
        isolation: isolate;
        opacity: 0;
        pointer-events: none;
        transform: translateY(4px);
        transition: opacity 0.15s ease, transform 0.1s ease;
        white-space: nowrap;
      }

      .lif-toolbar.visible {
        opacity: 1;
        pointer-events: auto;
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

    // 2. 纯 DOM API 方式创建工具栏，彻底规避 innerHTML
    toolbarElement = document.createElement('div');
    toolbarElement.className = 'lif-toolbar';
    toolbarElement.setAttribute('role', 'toolbar');
    toolbarElement.setAttribute('aria-label', 'Text formatting');

    function createBtn(style, title, text, isBold, isItalic) {
      const btn = document.createElement('button');
      btn.setAttribute('data-style', style);
      btn.setAttribute('title', title);
      btn.setAttribute('type', 'button');
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

    // 阻止 mousedown 默认行为，防止编辑器失焦
    toolbarElement.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    // 监听按钮点击事件
    toolbarElement.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-style]');
      if (btn && typeof formatCallback === 'function') {
        formatCallback(btn.getAttribute('data-style'));
      }
    });

    document.body.appendChild(hostElement);
    console.log('[InlineFormatter] 浮动工具栏初始化完成 (Trusted Types 安全模式)');
  }

  function show(rect) {
    if (!hostElement || !toolbarElement) return;

    // 核心修复：无条件将宿主重新 append 到 document.body 末尾
    // 现代 SPA (如 LinkedIn / X) 会动态挂载弹窗、抽屉或遮罩容器 (如 #interop-outlet、artdeco-modal-outlet)
    // 根据 CSS 层叠上下文规范，同级正 z-index 定位元素在层叠冲突时，以 DOM 树先后顺序 (Document Order) 决定层叠
    // 无论外部何时插入了何种高层级弹窗，只要每次激活时重新 append 到 body 末尾，宿主元素就始终位居 DOM 树最底端，
    // 从而 100% 绝对置顶于任何动态弹窗遮罩之上，彻底解决浮窗被弹窗遮挡的问题。
    document.body.appendChild(hostElement);

    // 再次强制确保层叠上下文与定位属性不被外部宿主样式污染
    hostElement.style.setProperty('position', 'fixed', 'important');
    hostElement.style.setProperty('z-index', '2147483647', 'important');
    hostElement.style.setProperty('pointer-events', 'none', 'important');

    // 注意：不在宿主上设置 pointer-events:auto（这正是 Messaging Bug 的根因）
    // 仅在 Shadow DOM 内部的 .lif-toolbar 上通过 .visible 类启用 pointer-events
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
  }

  function hide() {
    if (!hostElement || !toolbarElement) return;
    
    toolbarElement.classList.remove('visible');
    isToolbarVisible = false;
    // 宿主始终保持 pointer-events:none，无需额外清理
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
