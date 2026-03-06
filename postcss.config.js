import pxToViewport from 'postcss-px-to-viewport-8-plugin'

export default {
  plugins: [
    pxToViewport({
      viewportWidth: 375,
      unitPrecision: 5,
      viewportUnit: 'vw',
      selectorBlackList: ['.ignore-px'],
      minPixelValue: 1,
      mediaQuery: false,
      exclude: [/node_modules\/vant/]
    })
  ]
}
