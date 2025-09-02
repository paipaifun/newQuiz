// 帮我实现个 toast 组件，底部黑色 透明，文字居中，出现和消失需要渐变效果

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

interface ToastProps {
  message: string;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, duration = 2000 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

  return (
    <div
      className={`fixed left-1/2 bottom-[10%] z-[9999] px-[24px] py-[8px] rounded-lg text-[#fff] text-center text-[15px] pointer-events-none transition-opacity duration-300 transform -translate-x-1/2 ${visible ? 'opacity-90' : 'opacity-0'}`}
      style={{
        background: 'rgba(0,0,0,0.7)',
        minWidth: '120px',
        maxWidth: '80vw',
        fontWeight: 400,
        borderRadius: '10px',
      }}
    >
      {message}
    </div>
  );
};

let root: ReactDOM.Root | null = null;
let timer: NodeJS.Timeout | null = null;

export function showToast(message: string, duration = 2000) {
  if (root) {
    // 先卸载旧的
    root.unmount();
    const oldDiv = document.getElementById('global-toast-root');
    if (oldDiv) oldDiv.remove();
    root = null;
  }
  const div = document.createElement('div');
  div.id = 'global-toast-root';
  document.body.appendChild(div);
  root = ReactDOM.createRoot(div);
  root.render(<Toast message={message} duration={duration} />);
  // 自动卸载
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    if (root) {
      root.unmount();
      div.remove();
      root = null;
    }
  }, duration + 400); // 多留一点时间做渐变
}

export default Toast;

