import * as fs from 'fs'
import * as path from 'path'

function csvToJson(csv: string): Record<string, string>[] {
  const [headerLine, ...lines] = csv.trim().split('\n')
  const headers = headerLine.split(',').map(h => h.trim())

  return lines.map(line => {
    const values = line.split(',').map(v => v.trim())
    const obj: Record<string, string> = {}
    headers.forEach((key, i) => {
      obj[key] = values[i]
    })
    return obj
  })
}

const csvFilePath = path.resolve(__dirname, '../files/source/GIRAI_2024_regional_rankings - Regional rankings.csv')

fs.readFile(csvFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading CSV file:', err)
    return
  }

  const jsonData = csvToJson(data)
  console.log(JSON.stringify(jsonData, null, 2))

  const outputPath = path.resolve(__dirname, '../files/output/regional-rankings.json')
  fs.writeFile(outputPath, JSON.stringify(jsonData, null, 2), err => {
    if (err) console.error('Error writing JSON file:', err)
    else console.log('✅ JSON file saved to', outputPath)
  })
})
