const assert = require('assert')
const fs = require('fs')
const path = require('path')
const Module = require('module')
const typescript = require('typescript')

// Compile the TypeScript utility without adding a test-framework dependency.
const filename = path.join(__dirname, '../src/util.ts')
const source = fs.readFileSync(filename, 'utf8')
const javascript = typescript.transpileModule(source, {
    compilerOptions: { module: typescript.ModuleKind.CommonJS },
}).outputText
const compiled = new Module(filename, module)
compiled.filename = filename
compiled.paths = module.paths
compiled._compile(javascript, filename)
const { createOutputSanitizer, cleanupOutput } = compiled.exports

function test (name, raw, expected) {
    assert.strictEqual(cleanupOutput(raw), expected, name + ': one-shot')
    for (let split = 0; split <= raw.length; split++) {
        const sanitize = createOutputSanitizer()
        assert.strictEqual(sanitize(raw.slice(0, split)) + sanitize(raw.slice(split)),
            expected, name + ': split at ' + split)
    }
    const sanitize = createOutputSanitizer()
    assert.strictEqual([...raw].map(character => sanitize(character)).join(''),
        expected, name + ': one character per chunk')
}

test('plain text (including literal bracketed text)', 'hello [38;2;204m [A-Z] 123\n',
    'hello [38;2;204m [A-Z] 123\n')
test('common SGR and truecolor highlight',
    '\x1b[1;31mError\x1b[0m and \x1b[38;2;204;147;147;1mhighlighted\x1b[22;39m\n',
    'Error and highlighted\n')
test('cursor movement and device private modes',
    '\x1b[?25l\x1b[2JReady\x1b[1;10H!\x1b[?25h', 'Ready!')
test('title via OSC BEL', '\x1b]0;my terminal\x07command\n', 'command\n')
test('hyperlink via OSC ST', '\x1b]8;;https://example.org\x1b\\link\x1b]8;;\x1b\\', 'link')
test('DCS/APC/PM/SOS strings',
    '\x1bPignored\x1b\\A\x1b_ignored\x1b\\B\x1b^ignored\x1b\\C\x1bXignored\x1b\\D', 'ABCD')
test('character set escapes and save/restore cursor',
    '\x1b(B\x1b%G\x1b7text\x1b8', 'text')
test('backspace removed, line boundaries preserved', 'a\x08b\r\n', 'ab\r\n')
test('8-bit CSI and OSC', '\x9b31mOK\x9b0m\x9d0;title\x9c', 'OK')
test('Unicode remains intact', '\x1b[32mOlá 👋 café 日本語\x1b[0m', 'Olá 👋 café 日本語')
test('reset sanitizer between recordings', '\x1b[31mone', 'one')

const separate = createOutputSanitizer()
assert.strictEqual(separate('\x1b[31'), '')
assert.strictEqual(separate('mred'), 'red')
assert.strictEqual(cleanupOutput('second'), 'second')
console.log('All Save Output ANSI/VT sanitizer tests passed.')
