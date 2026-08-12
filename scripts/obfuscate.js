// Build bitəndən sonra avtomatik işə düşür (npm "postbuild" hook).
// dist/assets/*.js fayllarını qarışdırır ki, kodun oxunması/kopyalanması çətinləşsin.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs'
import { join } from 'path'
import JavaScriptObfuscator from 'javascript-obfuscator'

const ASSETS_DIR = join(process.cwd(), 'dist', 'assets')

function obfuscateFile(path) {
  const code = readFileSync(path, 'utf8')
  const result = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: false, // Firebase SDK-nın daxili dinamik metod çağırışlarını sındırır
    deadCodeInjection: false, // eyni səbəbdən deaktiv
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.75,
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,
    selfDefending: false, // ESM modulları qıra bilər, deaktiv saxlanılır
    disableConsoleOutput: false,
    numbersToExpressions: false,
    splitStrings: false, // Çoxlu Azərbaycan hərfli (qeyri-ASCII) mətnlə birləşərək sətirləri korlayırdı — deaktiv edildi
  })
  writeFileSync(path, result.getObfuscatedCode())
}

function run(dir) {
  let count = 0
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      count += run(full)
    } else if (entry.endsWith('.js')) {
      obfuscateFile(full)
      count++
    }
  }
  return count
}

try {
  const n = run(ASSETS_DIR)
  console.log(`✓ ${n} JS faylı qarışdırıldı (obfuscated)`)
} catch (err) {
  console.error('Obfuscation xətası (build davam edir):', err.message)
}
