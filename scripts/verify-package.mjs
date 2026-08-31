import { spawnSync } from 'node:child_process'

const result = spawnSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
  encoding: 'utf8',
  shell: process.platform === 'win32',
})

if (result.status !== 0) {
  process.stderr.write(result.stderr)
  process.exit(result.status ?? 1)
}

const parsed = JSON.parse(result.stdout)
const manifest = Array.isArray(parsed) ? parsed[0] : parsed
if (manifest === null || typeof manifest !== 'object' || !Array.isArray(manifest.files)) {
  throw new TypeError('npm pack returned an invalid manifest')
}
const paths = new Set(manifest.files.map(file => file.path))
const required = ['LICENSE', 'dist/entries/headless.js', 'dist/entries/headless.d.ts']
const forbidden = [...paths].filter(path => path.startsWith('tv-mirror-reference/'))

if (required.some(path => !paths.has(path)) || forbidden.length > 0) {
  throw new Error(`package content is invalid: ${JSON.stringify({ required, forbidden })}`)
}

console.log(JSON.stringify({
  name: manifest.name,
  version: manifest.version,
  integrity: manifest.integrity,
  files: manifest.entryCount,
}))
