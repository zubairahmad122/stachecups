// optimize-images.mjs
// ... existing code ...
import fg from 'fast-glob'
import path from 'node:path'
import fs from 'node:fs/promises'
import sharp from 'sharp'

const root = path.resolve(process.cwd(), 'public')

const patterns = [
  '**/*.png',
  '**/*.jpg',
  '**/*.jpeg'
]

const generateWebp = true // set false if you don't want webp copies

function formatBytes(bytes) {
  if (bytes === 0) return '0B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)}${sizes[i]}`
}

async function optimizeFile(file) {
  const abs = path.join(root, file)
  const ext = path.extname(file).toLowerCase()
  const tmp = abs + '.tmp'

  const input = await fs.readFile(abs)
  const before = input.length

  let pipeline = sharp(input, { failOn: 'none' })

  if (ext === '.png') {
    // Lossless PNG: palette + highest compression
    pipeline = pipeline.png({ compressionLevel: 9, palette: true })
  } else {
    // JPEG: visually lossless/near-lossless using mozjpeg
    pipeline = pipeline.jpeg({ quality: 85, mozjpeg: true, trellisQuantisation: true, overshootDeringing: true, optimiseScans: true, progressive: true })
  }

  await pipeline.toFile(tmp)
  const output = await fs.readFile(tmp)
  const after = output.length

  // Replace only if smaller
  if (after < before) {
    await fs.rename(tmp, abs)
  } else {
    await fs.unlink(tmp).catch(() => {})
  }

  // Optional WebP sibling
  if (generateWebp) {
    const webpPath = abs.replace(/\.(png|jpe?g)$/i, '.webp')
    // Skip if already exists
    try {
      await fs.access(webpPath)
    } catch {
      await sharp(input).webp({ quality: ext === '.png' ? 95 : 85, nearLossless: ext === '.png' }).toFile(webpPath)
    }
  }

  return { before, after: Math.min(after, before) }
}

async function run() {
  const files = await fg(patterns, { cwd: root, dot: false })
  let totalBefore = 0
  let totalAfter = 0

  for (const file of files) {
    try {
      const { before, after } = await optimizeFile(file)
      totalBefore += before
      totalAfter += after
      const saved = before - after
      console.log(`${file}  ${formatBytes(before)} -> ${formatBytes(after)}  saved ${formatBytes(saved)}`)
    } catch (e) {
      console.warn(`Failed: ${file}`, e.message)
    }
  }

  console.log(`\nTotal: ${formatBytes(totalBefore)} -> ${formatBytes(totalAfter)}  saved ${formatBytes(totalBefore - totalAfter)}`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
