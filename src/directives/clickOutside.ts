import type { Directive, DirectiveBinding } from "vue";

interface ClickOutsideElement extends HTMLElement {
  __clickOutsideHandler__?: (event: MouseEvent) => void;
}

export const clickOutside: Directive = {
  mounted(el: ClickOutsideElement, binding: DirectiveBinding) {
    const handler = (event: MouseEvent) => {
      // 检查点击是否在元素外部
      if (!(el === event.target || el.contains(event.target as Node))) {
        // 调用绑定的函数
        binding.value(event);
      }
    };

    // 保存 handler 引用用于 unmounted 时清理
    el.__clickOutsideHandler__ = handler;

    // 使用 setTimeout 确保在当前事件循环后添加监听器
    // 避免立即触发
    window.setTimeout(() => {
      document.addEventListener("click", handler);
    }, 0);
  },

  unmounted(el: ClickOutsideElement) {
    // 移除事件监听器
    if (el.__clickOutsideHandler__) {
      document.removeEventListener("click", el.__clickOutsideHandler__);
      delete el.__clickOutsideHandler__;
    }
  },
};

export default clickOutside;
