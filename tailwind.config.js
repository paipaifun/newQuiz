import { height } from "./tailwind";
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      // 可以在这里扩展Tailwind的默认配置
      height
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          /* Chrome, Safari and Opera */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          /* IE, Edge and Firefox */
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
      }
      addUtilities(newUtilities);
    },
  ],
  variants: {
    extend: {
      margin: ['even', 'odd', 'first', 'last', 'nth-child'],
    },
  },
  corePlugins: {
    height: true // 确保高度核心插件启用
  }
}; 