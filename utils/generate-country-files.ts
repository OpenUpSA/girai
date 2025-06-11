import fs from 'fs-extra'
import { parse } from 'csv-parse/sync'
import path from 'path'

const file1Path = './files/source/GIRAI_2024_Edition_Data - Rankings and Scores.csv'
const file2Path = './files/source/GIRAI_2024_regional_rankings - Regional rankings.csv'
const file3Path = './files/source/GIRAI_2024_Edition_Data_Links_fix - frameworks.csv'
const file4Path = './files/source/GIRAI_2024_Edition_Data_Links_fix - gov. actions.csv'
const outputDir = './files/output/'

type Row = Record<string, string>
type LinkEntry = { Title: string; URL: string }

function mergeRows(row1?: Row, row2?: Row): Row {
  return { ...(row2 || {}), ...(row1 || {}) }
}

async function main() {
  const file1Content = await fs.readFile(file1Path, 'utf8')
  const file2Content = await fs.readFile(file2Path, 'utf8')
  const file3Content = await fs.readFile(file3Path, 'utf8')
  const file4Content = await fs.readFile(file4Path, 'utf8')

  const records1: Row[] = parse(file1Content, { columns: true, skip_empty_lines: true })
  const records2: Row[] = parse(file2Content, { columns: true, skip_empty_lines: true })
  const records3: Row[] = parse(file3Content, { columns: true, skip_empty_lines: true })
  const records4: Row[] = parse(file4Content, { columns: true, skip_empty_lines: true })

  const countryMap = new Map<
    string,
    {
      row1?: Row
      row2?: Row
      frameworks?: LinkEntry[]
      govActions?: LinkEntry[]
    }
  >()

  // Load file 1
  for (const row of records1) {
    const country = row['Country']
    if (country) {
      countryMap.set(country, { ...(countryMap.get(country) || {}), row1: row })
    }
  }

  // Load file 2
  for (const row of records2) {
    const country = row['Country']
    if (country) {
      countryMap.set(country, { ...(countryMap.get(country) || {}), row2: row })
    }
  }

  // Load file 3 (frameworks)
  for (const row of records3) {
    const country = row['Country']
    const title = row['Title']
    const url = row['URL']
    if (country && title && url) {
      const current = countryMap.get(country) || {}
      const frameworks = current.frameworks || []
      frameworks.push({ Title: title, URL: url })
      countryMap.set(country, { ...current, frameworks })
    }
  }

  // Load file 4 (government actions)
  for (const row of records4) {
    const country = row['Country']
    const title = row['Title']
    const url = row['URL']
    if (country && title && url) {
      const current = countryMap.get(country) || {}
      const govActions = current.govActions || []
      govActions.push({ Title: title, URL: url })
      console.log(govActions)
      countryMap.set(country, { ...current, govActions })
    }
  }

  await fs.ensureDir(outputDir)

  for (const [country, { row1, row2, frameworks, govActions }] of countryMap.entries()) {
    console.log(govActions)
    const merged = mergeRows(row1, row2)

    const lines = Object.entries(merged).map(([key, value]) => `${key}: ${value}`)

    if (frameworks?.length) {
      lines.push('\nFrameworks:')
      for (const fw of frameworks) {
        lines.push(`- ${fw.Title}: ${fw.URL}`)
      }
    }

    if (govActions?.length) {
      lines.push('\nGovernment Actions:')
      for (const action of govActions) {
        lines.push(`- ${action.Title}: ${action.URL}`)
      }
    }

    const content = lines.join('\n')
    const safeCountryName = country.replace(/[^a-z0-9]/gi, '_')
    const filePath = path.join(outputDir, `${safeCountryName}.txt`)
    await fs.writeFile(filePath, content)
    console.log('Generated:', filePath)
  }
}

main().catch(console.error)
