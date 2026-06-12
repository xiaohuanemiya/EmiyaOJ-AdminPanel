const assert = require('assert')
const fs = require('fs')
const vm = require('vm')
const ts = require('typescript')
const { TextDecoder, TextEncoder } = require('util')

const markdownSource = fs.readFileSync('./src/utils/markdown.ts', 'utf8')
const markdownCode = ts.transpileModule(markdownSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020
  }
}).outputText
const markdownModule = { exports: {} }
vm.runInNewContext(markdownCode, {
  exports: markdownModule.exports,
  module: markdownModule,
  require
})

const {
  applyProblemImageWidth,
  clampProblemImageHeight,
  clampProblemImageWidth,
  getProblemImageHeight,
  getProblemImageWidth,
  removeProblemImageMarkdown,
  setProblemImageSize,
  setProblemImageWidth
} = markdownModule.exports

const originalUrl = 'https://example.com/problem.png'
assert.strictEqual(clampProblemImageHeight(1), 10)
assert.strictEqual(clampProblemImageHeight(240.4), 240)
assert.strictEqual(clampProblemImageHeight(10001), 10000)
assert.strictEqual(clampProblemImageWidth(1), 10)
assert.strictEqual(clampProblemImageWidth(63.4), 63)
assert.strictEqual(clampProblemImageWidth(101), 100)
const resizedUrl = setProblemImageWidth(originalUrl, 50)
assert.strictEqual(resizedUrl, `${originalUrl}#emiyaoj-width=50`)
assert.strictEqual(getProblemImageWidth(resizedUrl), 50)
assert.strictEqual(setProblemImageWidth(resizedUrl, null), originalUrl)
const freelyResizedUrl = setProblemImageSize(originalUrl, { width: 63, height: 240 })
assert.strictEqual(freelyResizedUrl, `${originalUrl}#emiyaoj-width=63&emiyaoj-height=240`)
assert.strictEqual(getProblemImageWidth(freelyResizedUrl), 63)
assert.strictEqual(getProblemImageHeight(freelyResizedUrl), 240)
assert.strictEqual(setProblemImageWidth(freelyResizedUrl, 75), `${originalUrl}#emiyaoj-width=75&emiyaoj-height=240`)
assert.strictEqual(
  setProblemImageWidth(`${originalUrl}#anchor`, 75),
  `${originalUrl}#anchor&emiyaoj-width=75`
)
assert.strictEqual(
  removeProblemImageMarkdown(`before\n\n![demo](${resizedUrl})\n\nafter`, originalUrl),
  'before\n\nafter'
)

const fakeImage = {
  dataset: {},
  getAttribute: () => resizedUrl,
  style: {
    height: '',
    width: '',
    removeProperty(property) {
      this[property] = ''
    }
  }
}
applyProblemImageWidth(fakeImage)
assert.strictEqual(fakeImage.style.width, '50%')
assert.strictEqual(fakeImage.style.height, 'auto')

const freelyResizedImage = {
  ...fakeImage,
  dataset: {},
  getAttribute: () => freelyResizedUrl,
  style: { ...fakeImage.style }
}
applyProblemImageWidth(freelyResizedImage)
assert.strictEqual(freelyResizedImage.style.width, '63%')
assert.strictEqual(freelyResizedImage.style.height, '240px')

const luteCode = fs.readFileSync('./node_modules/vditor/dist/js/lute/lute.min.js', 'utf8')
const sandbox = {
  clearTimeout,
  console,
  require,
  setTimeout,
  TextDecoder,
  TextEncoder,
  WebAssembly
}
vm.createContext(sandbox)
vm.runInContext(luteCode, sandbox)

const lute = sandbox.Lute.New()
lute.SetVditorWYSIWYG(true)
const imageMarkdown = `![demo](${resizedUrl})`
const editorDom = lute.Md2VditorDOM(imageMarkdown)
assert.match(editorDom, /#emiyaoj-width=50/)
assert.strictEqual(lute.VditorDOM2Md(editorDom).trim(), imageMarkdown)
const freelyResizedMarkdown = `![demo](${freelyResizedUrl})`
assert.strictEqual(lute.VditorDOM2Md(lute.Md2VditorDOM(freelyResizedMarkdown)).trim(), freelyResizedMarkdown)

console.log('Markdown image resize checks passed')
