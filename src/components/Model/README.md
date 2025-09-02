# Modal 组件说明

## TransparentModal 透明遮罩层

一个全屏透明遮罩层单例组件，用于在启用时阻止用户点击操作。

### 特性
- 单例模式，全局唯一
- 全屏覆盖
- 完全透明背景
- 阻止点击事件穿透
- 阻止触摸事件
- 需要主动关闭
- 可自定义z-index层级
- 使用 Portal 渲染到 body

### 使用方法

#### 方法1：使用导出的方法（推荐）

```tsx
import { showTransparentModal, hideTransparentModal } from './transparentModal';

function App() {
  const handleShowModal = () => {
    // 显示遮罩层，可传入 zIndex 和 className
    showTransparentModal(9999, 'custom-modal');
  };

  const handleHideModal = () => {
    // 隐藏遮罩层
    hideTransparentModal();
  };

  return (
    <div>
      <button onClick={handleShowModal}>
        显示遮罩层
      </button>
      
      <button onClick={handleHideModal}>
        关闭遮罩层
      </button>
    </div>
  );
}
```

#### 方法2：使用单例管理器

```tsx
import { getTransparentModalManager } from './transparentModal';

function App() {
  const modalManager = getTransparentModalManager();

  const handleShowModal = () => {
    modalManager.show(9999, 'custom-modal');
  };

  const handleHideModal = () => {
    modalManager.hide();
  };

  return (
    <div>
      <button onClick={handleShowModal}>
        显示遮罩层
      </button>
      
      <button onClick={handleHideModal}>
        关闭遮罩层
      </button>
    </div>
  );
}
```

### 在应用根组件中引入

```tsx
// App.tsx 或根组件
import TransparentModal from './components/Model/transparentModal';

function App() {
  return (
    <div>
      {/* 你的应用内容 */}
      <h1>我的应用</h1>
      
      {/* 透明遮罩层组件 - 只需要引入一次 */}
      <TransparentModal />
    </div>
  );
}
```

### 导出的方法

| 方法 | 说明 |
|------|------|
| `showTransparentModal(zIndex?, className?)` | 显示遮罩层，可选传入 zIndex 和 className |
| `hideTransparentModal()` | 隐藏遮罩层 |
| `getTransparentModalManager()` | 获取单例管理器实例 |

### 单例管理器方法

| 方法 | 说明 |
|------|------|
| `show(zIndex?, className?)` | 显示遮罩层 |
| `hide()` | 隐藏遮罩层 |
| `getVisible()` | 获取当前显示状态 |
| `subscribe(listener)` | 订阅状态变化 |

### 注意事项

1. 遮罩层会阻止所有点击和触摸事件
2. 需要调用 `hideTransparentModal()` 或 `modalManager.hide()` 来关闭遮罩层
3. 建议设置较高的 `zIndex` 值确保遮罩层在最上层
4. 组件使用 `fixed` 定位，会覆盖整个视口
5. 使用 Portal 渲染到 `document.body`，确保正确的层级关系
6. 在应用根组件中只需要引入一次 `<TransparentModal />`
7. 可以在任何地方调用 `showTransparentModal()` 和 `hideTransparentModal()` 