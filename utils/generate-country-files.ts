import fs from 'fs-extra'
import { parse } from 'csv-parse/sync'
import path from 'path'
import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID

const file1Path = './files/source/GIRAI_2024_Edition_Data - Rankings and Scores.csv'
const file2Path = './files/source/GIRAI_2024_regional_rankings - Regional rankings.csv'
const outputDir = './files/output/'

type Row = Record<string, string>

function mergeRows(row1: Row | undefined, row2: Row | undefined): Row {
  return { ...(row2 || {}), ...(row1 || {}) }
}

async function uploadFile(filePath: string) {
  const file = await openai.files.create({
    file: fs.createReadStream(filePath),
    purpose: 'assistants',
  })

  console.log(`✅ Uploaded ${file.filename} → ${file.id}`)
  return file.id
}

async function main() {
  if (!vectorStoreId) return
  const file1Content = await fs.readFile(file1Path, 'utf8')
  const file2Content = await fs.readFile(file2Path, 'utf8')

  const records1: Row[] = parse(file1Content, { columns: true, skip_empty_lines: true })
  const records2: Row[] = parse(file2Content, { columns: true, skip_empty_lines: true })

  const countryMap = new Map<string, { row1?: Row, row2?: Row }>()

  for (const row of records1) {
    const country = row['Country']
    if (country) {
      countryMap.set(country, { ...(countryMap.get(country) || {}), row1: row })
    }
  }

  for (const row of records2) {
    const country = row['Country']
    if (country) {
      countryMap.set(country, { ...(countryMap.get(country) || {}), row2: row })
    }
  }

  await fs.ensureDir(outputDir)

  const uploadedFileIds: string[] = []

  for (const [country, { row1, row2 }] of countryMap.entries()) {
    const merged = mergeRows(row1, row2)
    const lines = Object.entries(merged).map(([key, value]) => `${key}: ${value}`)
    const content = lines.join('\n')
    const safeCountryName = country.replace(/[^a-z0-9]/gi, '_')
    const filePath = path.join(outputDir, `${safeCountryName}.txt`)
    await fs.writeFile(filePath, content)

    const fileId = await uploadFile(filePath)
    uploadedFileIds.push(fileId)
  }
  const chunkSize = 10
  const countryFiles = (await fs.readdir(outputDir))
    .filter(file => file.endsWith('.txt'))
    .map(file => path.join(outputDir, file))

  for (let i = 0; i < countryFiles.length; i += chunkSize) {
    const batchFiles = countryFiles.slice(i, i + chunkSize)

    console.log(`Uploading batch ${i / chunkSize + 1} with ${batchFiles.length} files`)

    const batch = await openai.vectorStores.fileBatches.uploadAndPoll(vectorStoreId, {
      files: batchFiles.map((filePath) => fs.createReadStream(filePath)),
    })

    console.log('Batch upload response:', JSON.stringify(batch, null, 2))
  }
}

main().catch(console.error)
