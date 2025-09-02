# i18n 国际化使用指南

## 概述

本项目使用 `react-i18next` 实现国际化功能，支持中文和英文两种语言。

## 文件结构

```
src/i18n/
├── index.ts          # i18n 配置文件
├── locales/          # 语言包目录
│   ├── en.json       # 英文语言包
│   └── zh.json       # 中文语言包
└── README.md         # 使用说明
```

## 使用方法

### 1. 在组件中使用翻译

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const MyComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <button>{t('common.start')}</button>
    </div>
  );
};
```

### 2. 使用自定义 Hook

```tsx
import React from 'react';
import { useI18n } from '../hooks/useI18n';

const MyComponent: React.FC = () => {
  const { t, changeLanguage, language } = useI18n();

  return (
    <div>
      <p>当前语言: {language}</p>
      <button onClick={() => changeLanguage('en')}>切换到英文</button>
      <button onClick={() => changeLanguage('zh')}>切换到中文</button>
    </div>
  );
};
```

### 3. 添加新的翻译文本

1. 在 `src/i18n/locales/zh.json` 中添加中文翻译
2. 在 `src/i18n/locales/en.json` 中添加英文翻译

```json
{
  "newSection": {
    "title": "新标题",
    "description": "新描述"
  }
}
```

### 4. 使用插值

```tsx
// 在语言包中
{
  "greeting": "你好，{{name}}！"
}

// 在组件中
const { t } = useTranslation();
t('greeting', { name: '张三' }); // 输出: "你好，张三！"
```

### 5. 复数形式

```tsx
// 在语言包中
{
  "items": "{{count}} 个项目",
  "items_plural": "{{count}} 个项目"
}

// 在组件中
t('items', { count: 1 }); // 输出: "1 个项目"
t('items', { count: 5 }); // 输出: "5 个项目"
```

## 语言切换

项目已集成语言切换器组件 `LanguageSwitcher`，位于页面右上角。用户可以通过点击按钮在中英文之间切换。

## 语言检测

i18n 会自动检测用户的语言偏好：
1. 首先检查 localStorage 中保存的语言设置
2. 然后检查浏览器语言设置
3. 最后使用默认语言（中文）

## 注意事项

1. 所有翻译文本都应该使用嵌套的键名结构，便于管理
2. 翻译键名应该具有描述性，便于理解
3. 在开发环境中，i18n 会输出调试信息
4. 语言设置会保存在 localStorage 中，下次访问时会自动恢复 