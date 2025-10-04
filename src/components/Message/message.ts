import { createApp } from 'vue';
import MessageComponent, { type MessageProps } from './index.vue';

export interface MessageOptions {
  content: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

const instances: any[] = [];

function createMessage(options: MessageOptions) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = createApp(MessageComponent, {
    ...options,
    onClose: () => {
      options.onClose?.();
      // 移除实例
      const index = instances.indexOf(instance);
      if (index > -1) {
        instances.splice(index, 1);
      }
      // 延迟移除 DOM，等待动画完成
      setTimeout(() => {
        instance.unmount();
        // 在某些窗口被隐藏/关闭的情况下，容器可能已被移除
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }, 300);
    },
  } as MessageProps);

  instance.mount(container);
  instances.push(instance);

  return instance;
}

export const message = {
  success: (content: string, duration?: number) => {
    return createMessage({ content, type: 'success', duration });
  },
  error: (content: string, duration?: number) => {
    return createMessage({ content, type: 'error', duration });
  },
  warning: (content: string, duration?: number) => {
    return createMessage({ content, type: 'warning', duration });
  },
  info: (content: string, duration?: number) => {
    return createMessage({ content, type: 'info', duration });
  },
};

export default message;
