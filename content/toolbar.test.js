const assert = require('assert');
const fs = require('fs');

const toolbarCode = fs.readFileSync('content/toolbar.js', 'utf8');

class MockElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.id = '';
    this.className = '';
    this.attributes = {};
    this.children = [];
    this.childNodes = [];
    this.parentNode = null;
    this._popoverOpen = false;
    this._classes = new Set();
    this.style = {
      _props: {},
      _priorities: {},
      setProperty: function(prop, val, priority) {
        this._props[prop] = val;
        this._priorities[prop] = priority || '';
        this[prop] = val;
      },
      getPropertyValue: function(prop) {
        return this._props[prop] || '';
      },
      getPropertyPriority: function(prop) {
        return this._priorities[prop] || '';
      }
    };
    this.shadowRoot = null;
  }
  
  addEventListener() {}
  
  getBoundingClientRect() {
    return { width: 160, height: 34, top: 0, left: 0, bottom: 34, right: 160 };
  }
  
  matches(selector) {
    if (selector === ':popover-open') {
      return !!this._popoverOpen;
    }
    return false;
  }
  
  showPopover() {
    this._popoverOpen = true;
  }
  
  hidePopover() {
    this._popoverOpen = false;
  }

  setAttribute(k, v) { this.attributes[k] = v; }
  getAttribute(k) { return this.attributes[k] || null; }
  hasAttribute(k) { return k in this.attributes; }

  appendChild(child) {
    if (child.parentNode) {
      const idx = child.parentNode.childNodes.indexOf(child);
      if (idx > -1) child.parentNode.childNodes.splice(idx, 1);
    }
    child.parentNode = this;
    this.childNodes.push(child);
    if (child.tagName !== '#text') {
      this.children.push(child);
    }
  }

  attachShadow() {
    this.shadowRoot = new MockElement('#shadow-root');
    return this.shadowRoot;
  }

  get classList() {
    const self = this;
    return {
      _classes: self._classes,
      add: function(c) { self._classes.add(c); },
      remove: function(c) { self._classes.delete(c); },
      contains: function(c) { return self._classes.has(c); }
    };
  }
}

global.document = {
  createElement: (tag) => new MockElement(tag),
  body: new MockElement('body'),
  documentElement: new MockElement('html')
};
global.window = {};
global.console = {
  log: (...args) => {},
  warn: (...args) => {}
};

eval(toolbarCode);

// 1. 初始化
window.FloatingToolbar.init(() => {});
const host = document.body.childNodes[0];
assert.ok(host, '宿主元素存在');
assert.strictEqual(host.getAttribute('popover'), 'manual', '必须具有 popover=manual');
assert.strictEqual(host.style.getPropertyValue('z-index'), '2147483647');
assert.strictEqual(host.style.getPropertyValue('padding'), '0');
assert.strictEqual(host.style.getPropertyValue('margin'), '0');

// 2. 调用 show() 触发 popover
const dummyRect = { left: 200, top: 300, width: 30, height: 20 };
window.FloatingToolbar.show(dummyRect);
assert.strictEqual(host.matches(':popover-open'), true, 'show() 应将元素提升至 Popover 顶层');

// 3. 调用 hide() 关闭 popover
window.FloatingToolbar.hide();
assert.strictEqual(host.matches(':popover-open'), false, 'hide() 应关闭 Popover');

console.log('✓ 成功执行 3/3 Popover API 测试');
