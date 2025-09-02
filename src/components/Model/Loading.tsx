import React from 'react';
import { useI18n } from '../../hooks/useI18n';
import Modal from './base';
import LOADING from '../../assets/img/loading.gif';
import ReactDOM from 'react-dom/client';

const Loading: React.FC = () => {
  const { t } = useI18n();
  return (
    <Modal
      isOpen={true}
      onClose={() => {}}
      showCloseButton={false}
      closeOnOverlayClick={false}
      className="flex flex-col items-center justify-center bg-transparent shadow-none"
    >
      <img src={LOADING} alt="loading" className="w-[180px] h-[101px] mb-4" />
      <div className="text-[#fff] text-[11px] font-bold text-center mt-[-30px]">{t('Loading......')}</div>
    </Modal>
  );
};

let root: ReactDOM.Root | null = null;

export function showLoading() {
  if (root) return;
  const div = document.createElement('div');
  div.id = 'global-loading-root';
  document.body.appendChild(div);
  root = ReactDOM.createRoot(div);
  root.render(<Loading />);
}

export function hideLoading() {
  const div = document.getElementById('global-loading-root');
  if (root && div) {
    root.unmount();
    div.remove();
    root = null;
  }
}

export default Loading;