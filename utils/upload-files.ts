import fs from 'fs-extra'
import path from 'path'
import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const outputDir = './files/output/'
const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID!

const chunkArray = <T>(array: T[], chunkSize: number): T[][] =>
  Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, i) =>
    array.slice(i * chunkSize, i * chunkSize + chunkSize)
  )

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function deleteExistingFilesByName(filenames: string[]) {
  console.log('🔍 Fetching existing uploaded files...')
  for await (const file of openai.files.list()) {
    if (filenames.includes(file.filename)) {
      console.log(`🗑️ Deleting existing file: ${file.filename} (id: ${file.id})`)
      await openai.files.delete(file.id)
    }
  }
}

async function uploadFilesInChunks(
  filePaths: string[],
  chunkSize = 20,
  delayMs = 3000
) {
  const chunks = chunkArray(filePaths, chunkSize)
  const failedChunks: string[][] = []

  let totalUploaded = 0
  let totalFailed = 0

  for (const [index, chunk] of chunks.entries()) {
    console.log(`🚀 Uploading chunk ${index + 1}/${chunks.length}...`)
    try {
      const batch = await openai.vectorStores.fileBatches.uploadAndPoll(vectorStoreId, {
        files: chunk.map(filePath => fs.createReadStream(filePath)),
      })

      console.log(`📊 Batch upload response:\n${JSON.stringify(batch, null, 2)}`)

      const counts = batch.file_counts || {}
      totalUploaded += counts.completed || chunk.length
      totalFailed += counts.failed || 0
    } catch (err) {
      console.error(`❌ Error uploading chunk ${index + 1}:`, err)
      failedChunks.push(chunk)
      totalFailed += chunk.length
    }

    if (index < chunks.length - 1) {
      console.log(`⏳ Waiting ${delayMs}ms before next chunk...`)
      await delay(delayMs)
    }
  }

  // Retry failed files one by one
  if (failedChunks.length > 0) {
    const failedFiles = failedChunks.flat()
    console.log(`🔁 Retrying ${failedFiles.length} failed files...`)
    for (const filePath of failedFiles) {
      try {
        const batch = await openai.vectorStores.fileBatches.uploadAndPoll(vectorStoreId, {
          files: [fs.createReadStream(filePath)],
        })

        console.log(`📄 Retry successful for: ${path.basename(filePath)}`)
        console.log(`📊 Retry upload response:\n${JSON.stringify(batch, null, 2)}`)

        const counts = batch.file_counts || {}
        totalUploaded += counts.completed || 1
        totalFailed -= counts.completed || 1
      } catch (err) {
        console.error(`❌ Final failure for: ${path.basename(filePath)}`, err)
      }
    }
  }

  console.log(`✅ Final summary: Uploaded: ${totalUploaded}, Failed: ${totalFailed}, Total: ${filePaths.length}`)
}

async function uploadFiles() {
  if (!vectorStoreId) {
    console.error('❗ No vector store ID found in environment.')
    return
  }

  const allFiles = (await fs.readdir(outputDir))
    .filter(file => file.endsWith('.txt') || file.endsWith('.json'))
    .slice(0, 200)

  const files = allFiles.map(file => path.join(outputDir, file))
  const filenames = allFiles.map(file => path.basename(file))

  await deleteExistingFilesByName(filenames)

  console.log(`📦 Uploading ${files.length} files to vector store ${vectorStoreId}...`)
  await uploadFilesInChunks(files)

  console.log('🎉 Done uploading all files.')
}

uploadFiles().catch(console.error)
