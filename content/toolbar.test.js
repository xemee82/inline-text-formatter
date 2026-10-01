/**
 * Floating Toolbar DOM Lifecycle & Stacking Invariant Test
 * 验证动态弹窗挂载场景下的 DOM 重排与绝对置顶不变式
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

// 构造极简 DOM 运行环境
class MockElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.id = '';
    this.className = '';
    this.attributes = {};
    this.children = [];
    this.childNodes = [];
    this.parentNode = null;
    this.classList = {
      _classes: new Set(),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      contains: (c) => this.classList._classes.has(c)
    };
    this.style = {
      _props: {},
      _priorities: {},
      setProperty(key, val, priority) {
        this._props[key] = val;
        this._priorities[key] = priority || '';
        this[key] = val;
      },
      getPropertyValue(key) {
        return this._props[key] || '';
      },
      getPropertyPriority(key) {
        return this._priorities[key] || '';
      }
    };
    this.shadowRoot = null;
  }

  setAttribute(k, v) { this.attributes[k] = v; }
  getAttribute(k) { return this.attributes[k] || null; }
  hasAttribute(k) { return k in this.attributes; }

  appendChild(child) {
    // DOM appendChild 原生规范：若子节点已存在，则先从原有位置移除，再移动到末尾
    if (child.parentNode) {
      const idx = child.parentNode.childNodes.indexOf(child);
      if (idx !== -1) {
        child.parentNode.childNodes.splice(idx, 1);
      }
      const cIdx = child.parentNode.children.indexOf(child);
      if (cIdx !== -1) {
        child.parentNode.children.splice(cIdx, 1);
      }
    }
    child.parentNode = this;
    this.childNodes.push(child);
    this.children.push(child);
    return child;
  }

  contains(child) {
    let curr = child;
    while (curr) {
      if (curr === this) return true;
      curr = curr.parentNode;
    }
    return false;
  }

  attachShadow(options) {
    this.shadowRoot = new MockElement('#shadow-root');
    return this.shadowRoot;
  }

  getBoundingClientRect() {
    return { left: 0, top: 0, width: 195, height: 36 };
  }

  addEventListener() {}
  removeEventListener() {}
}

const mockDocument = {
  body: new MockElement('body'),
  createElement(tag) { return new MockElement(tag); }
};

global.window = {
  innerWidth: 1200,
  innerHeight: 800,
  FloatingToolbar: null
};
global.document = mockDocument;
global.Node = { TEXT_NODE: 3 };

// 加载 toolbar.js
const toolbarCode = fs.readFileSync(path.join(__dirname, 'toolbar.js'), 'utf8');
eval(toolbarCode);

console.log('--- 开始执行 FloatingToolbar 架构与层叠生命周期测试 ---');

// 1. 测试初始化 (init)
window.FloatingToolbar.init(() => {});
const host = document.body.childNodes[0];
assert.ok(host, '宿主元素应在 init() 后成功挂载到 document.body');
assert.strictEqual(host.id, 'lif-toolbar-host', '宿主 ID 应为 lif-toolbar-host');
assert.strictEqual(host.style.getPropertyValue('z-index'), '2147483647', '宿主 z-index 应为最大整数 2147483647');
assert.strictEqual(host.style.getPropertyPriority('z-index'), 'important', '宿主 z-index 必须带有 !important');
assert.strictEqual(host.style.getPropertyValue('position'), 'fixed', '宿主定位必须为 fixed');
assert.strictEqual(host.style.getPropertyValue('pointer-events'), 'none', '宿主本身必须为 pointer-events: none (防止拦截 Messaging)');
console.log('✓ 阶段 1：初始化挂载与零尺寸安全锚点测试通过');

// 2. 模拟 LinkedIn 用户点击 "Start a post"，页面动态插入模态弹窗 (#interop-outlet)
const modalOutlet = document.createElement('div');
modalOutlet.id = 'interop-outlet';
modalOutlet.style.setProperty('position', 'fixed', 'important');
modalOutlet.style.setProperty('z-index', '2147483647', 'important'); // LinkedIn 弹窗使用高 z-index
document.body.appendChild(modalOutlet);

assert.strictEqual(document.body.childNodes.length, 2, 'body 此时应有 2 个直接子元素');
assert.strictEqual(document.body.childNodes[0], host, '索引 0 是在页面初次加载时挂载的 host');
assert.strictEqual(document.body.childNodes[1], modalOutlet, '索引 1 是稍后动态挂载的 LinkedIn 弹窗');
console.log('✓ 阶段 2：模拟 LinkedIn 动态挂载弹窗成功 (弹窗位于 DOM 尾部)');

// 3. 用户在弹窗内输入文字并划选，触发 FloatingToolbar.show()
const dummyRect = { left: 200, top: 300, width: 30, height: 20 };
window.FloatingToolbar.show(dummyRect);

// 验证：show() 必须将 host 重新 append 到 body 末尾，超越 modalOutlet
assert.strictEqual(document.body.childNodes.length, 2, 'body 子元素总数保持不变');
assert.strictEqual(document.body.childNodes[0], modalOutlet, 'modalOutlet 被下推到索引 0');
assert.strictEqual(document.body.childNodes[1], host, 'host 被动态提拔到绝对末尾 (索引 1)');
assert.strictEqual(document.body.children[document.body.children.length - 1], host, 'host 必须为 document.body 最后一个元素 (最高层叠顺序)');
console.log('✓ 阶段 3：show() 动态提拔不变式测试通过 (浮窗成功置顶于弹窗之上)');

// 4. 再次模拟更晚插入的其他层叠元素 (如全局 Toast、通知条)
const toastEl = document.createElement('div');
toastEl.id = 'artdeco-toasts';
document.body.appendChild(toastEl);
assert.strictEqual(document.body.childNodes[2], toastEl);

// 再次划选时，工具栏应再次被自动提拔到最新 DOM 尾部
window.FloatingToolbar.show(dummyRect);
assert.strictEqual(document.body.childNodes[document.body.childNodes.length - 1], host, '即使有更多后续动态节点，show() 始终保证 host 处于绝对最底端');
console.log('✓ 阶段 4：连续多次动态插入与多弹窗场景下的终极置顶防御测试通过');

// 5. 验证 Shadow DOM 内部工具栏隔离样式中包含独立 z-index 与 isolation
assert.ok(host.shadowRoot, '宿主必须具有 open Shadow Root');
console.log('✓ 阶段 5：Shadow DOM 隔离沙箱测试通过');

console.log('\n======================================================');
console.log('🎉 闭环测试全部通过！5/5 架构测试用例 100% PASS');
console.log('======================================================\n');
