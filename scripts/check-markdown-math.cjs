const assert = require('assert')
const fs = require('fs')
const vm = require('vm')
const { TextDecoder, TextEncoder } = require('util')

const mathConfig = fs.readFileSync('./src/utils/markdown.ts', 'utf8')
assert.match(mathConfig, /inlineDigit:\s*true/, 'numeric-leading inline math must stay enabled')

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
lute.SetInlineMathAllowDigitAfterOpenMarker(true)
lute.SetVditorWYSIWYG(true)

const inlineMath = lute.Md2HTML('$1$')
assert.match(inlineMath, /<span class="language-math">1<\/span>/, '$1$ must render as inline math')

const expressionMath = lute.Md2HTML('$1 + 1 = 2$')
assert.match(expressionMath, /<span class="language-math">1 \+ 1 = 2<\/span>/)

const blockMath = lute.Md2HTML('$$\n\\frac{a}{b}\n$$')
assert.match(blockMath, /<div class="language-math">\\frac{a}{b}<\/div>/)

const editorDom = lute.Md2VditorDOM('$1$')
assert.match(editorDom, /data-type="math-inline"/, 'WYSIWYG mode must recognize $1$')
assert.strictEqual(lute.VditorDOM2Md(editorDom).trim(), '$1$', 'WYSIWYG save must preserve $1$')

console.log('Markdown math checks passed')
