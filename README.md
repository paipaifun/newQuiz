# Webpack5 + Tailwind + React + TypeScript H5项目

这是一个使用Webpack5、Tailwind CSS、React和TypeScript构建的H5页面项目，已实现vw方案的页面适配。

## 技术栈

- React 18
- TypeScript
- Webpack 5
- Tailwind CSS
- PostCSS (包含postcss-px-to-viewport用于vw适配)

## 页面适配方案

本项目使用vw方案进行页面适配，通过postcss-px-to-viewport插件自动将px单位转换为vw单位。设计稿宽度为375px。

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start
```

## 构建

```bash
# 构建生产环境代码
npm run build
```

构建后的文件将位于`dist`目录中。

## 项目结构

```
webpack5-tailwind-react-ts/
├── public/              # 静态资源目录
│   └── index.html       # HTML模板
├── src/                 # 源代码目录
│   ├── App.tsx          # 主应用组件
│   ├── index.css        # 全局样式
│   └── index.tsx        # 应用入口
├── package.json         # 项目配置
├── postcss.config.js    # PostCSS配置
├── tailwind.config.js   # Tailwind CSS配置
├── tsconfig.json        # TypeScript配置
└── webpack.config.js    # Webpack配置
``` 