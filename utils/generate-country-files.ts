import fs from 'fs-extra'
import { parse } from 'csv-parse/sync'
import path from 'path'

const outputDir = './files/output/'

type Row = Record<string, string>
type LinkEntry = { Title: string; URL: string }

function mergeRows(rankingsScores?: Row, regionalRankings?: Row): Row {
  return { ...(regionalRankings || {}), ...(rankingsScores || {}) }
}

async function main() {
  const countryRankingsScoresContent = await fs.readFile('./files/source/Country_Rankings_Scores.csv', 'utf8')
  const countryRegionalRankingsContent = await fs.readFile('./files/source/Country_Regional_Rankings.csv', 'utf8')
  const countryFrameworksContent = await fs.readFile('./files/source/Country_Frameworks.csv', 'utf8')
  const countryGovActionsContent = await fs.readFile('./files/source/Country_Gov_Actions.csv', 'utf8')
  const countryThematicRankingContent = await fs.readFile('./files/source/Country_Thematic_Scores_Ranking.csv', 'utf8')

  const records1: Row[] = parse(countryRankingsScoresContent, { columns: true, skip_empty_lines: true })
  const records2: Row[] = parse(countryRegionalRankingsContent, { columns: true, skip_empty_lines: true })
  const records3: Row[] = parse(countryFrameworksContent, { columns: true, skip_empty_lines: true })
  const records4: Row[] = parse(countryGovActionsContent, { columns: true, skip_empty_lines: true })
  const records5: Row[] = parse(countryThematicRankingContent, { columns: true, skip_empty_lines: true })

  console.log(records5)

  const countryMap = new Map<
    string,
    {
      rankingsScores?: Row
      regionalRankings?: Row
      frameworks?: LinkEntry[]
      govActions?: LinkEntry[]
      thematicData?: Row
    }
  >()

  for (const row of records1) {
    const country = row['Country']
    if (country) {
      countryMap.set(country, { ...(countryMap.get(country) || {}), rankingsScores: row })
    }
  }

  for (const row of records2) {
    const country = row['Country']
    if (country) {
      countryMap.set(country, { ...(countryMap.get(country) || {}), regionalRankings: row })
    }
  }

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

  for (const row of records4) {
    const country = row['Country']
    const title = row['Title']
    const url = row['URL']
    if (country && title && url) {
      const current = countryMap.get(country) || {}
      const govActions = current.govActions || []
      govActions.push({ Title: title, URL: url })
      countryMap.set(country, { ...current, govActions })
    }
  }

  for (const row of records5) {
    console.log(row)
    const country = row['Country']
    if (country) {
      countryMap.set(country, { ...(countryMap.get(country) || {}), thematicData: row })
    }
  }

  await fs.ensureDir(outputDir)

  for (const [country, { rankingsScores, regionalRankings, frameworks, govActions, thematicData }] of countryMap.entries()) {
    const merged = mergeRows(rankingsScores, regionalRankings)
    const lines = Object.entries(merged).map(([key, value]) => `${key}: ${value}`)

    if (thematicData) {
      lines.push('\nThematic Scores And Rankings:')
      for (const [key, value] of Object.entries(thematicData)) {
        if (key !== 'Country') {
          lines.push(`- ${key}: ${value}`)
        }
      }
    }

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
    //console.log('Generated:', filePath)
  }
}

main().catch(console.error)
