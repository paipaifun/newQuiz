import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TransparentModalProps {
  /** 遮罩层的z-index层级 */
  zIndex?: number;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 透明弹窗单例，全局覆盖，点击无效，需要主动关闭
 * 用于在启用时阻止用户点击操作
 */
class TransparentModalManager {
  private static instance: TransparentModalManager;
  private listeners: Set<(visible: boolean) => void> = new Set();
  private visible: boolean = false;

  private constructor() {}

  static getInstance(): TransparentModalManager {
    if (!TransparentModalManager.instance) {
      TransparentModalManager.instance = new TransparentModalManager();
    }
    return TransparentModalManager.instance;
  }

  show(zIndex?: number, className?: string) {
    this.visible = true;
    this.notifyListeners();
    // 存储配置
    this.currentConfig = { zIndex, className };
  }

  hide() {
    this.visible = false;
    this.notifyListeners();
  }

  subscribe(listener: (visible: boolean) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.visible));
  }

  getVisible(): boolean {
    return this.visible;
  }

  private currentConfig: { zIndex?: number; className?: string } = {};
  getConfig() {
    return this.currentConfig;
  }
}

// 创建单例实例
const modalManager = TransparentModalManager.getInstance();

// 导出 show 和 hide 方法
export const showTransparentModal = (zIndex?: number, className?: string) => {
  console.log('currData, showTransparentModal', zIndex, className)
  modalManager.show(zIndex, className);
};

export const hideTransparentModal = () => {
  console.log('hideTransparentModal')
  modalManager.hide();
};

// 获取单例实例的方法（如果需要的话）
export const getTransparentModalManager = () => modalManager;

// React 组件
const TransparentModalComponent: React.FC<TransparentModalProps> = () => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<{ zIndex?: number; className?: string }>({});

  useEffect(() => {
    const unsubscribe = modalManager.subscribe((isVisible) => {
      setVisible(isVisible);
      if (isVisible) {
        setConfig(modalManager.getConfig());
      }
    });

    return unsubscribe;
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 w-full h-full bg-[rgba(0,0,0,0.0)]  ${config.className || ''}`}
      style={{
        zIndex: config.zIndex || 9999,
        // backgroundColor: 'rgba(0, 0, 0, 0.5)',
        pointerEvents: 'auto', // 确保可以接收点击事件
      }}
      onClick={(e) => {
        // 阻止事件冒泡和默认行为
        e.preventDefault();
        e.stopPropagation();
        // 点击无效，不关闭遮罩层
      }}
      onTouchStart={(e) => {
        // 阻止触摸事件
        e.preventDefault();
        e.stopPropagation();
      }}
      onTouchMove={(e) => {
        // 阻止触摸移动事件
        e.preventDefault();
        e.stopPropagation();
      }}
    />
  );
};

// 使用 Portal 渲染到 body
const TransparentModal: React.FC = () => {
  return createPortal(
    <TransparentModalComponent />,
    document.body
  );
};

export default TransparentModal;