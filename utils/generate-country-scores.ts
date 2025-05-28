import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

// Load the HTML file
const html = fs.readFileSync('GIRAI_2024_Edition_Rankings_And_Scores.html', 'utf8');
const $ = cheerio.load(html);

// Select the first table in the document
const table = $('table').first();

// Extract headers from the table
const headers: string[] = [];
table.find('thead tr').last().find('th').each((_, th) => {
  headers.push($(th).text().trim());
});

// Extract rows from the table
const rows: { [key: string]: string }[] = [];
table.find('tbody tr').each((_, tr) => {
  const rowData: { [key: string]: string } = {};
  $(tr).find('td').each((i, td) => {
    rowData[headers[i]] = $(td).text().trim();
  });
  if (Object.keys(rowData).length > 0) {
    rows.push(rowData);
  }
});

// Create the output directory if it doesn't exist
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Write each country's data to a separate text file
rows.forEach((row) => {
  const countryName = row['Country'] || 'Unknown';
  const safeCountryName = countryName.replace(/[\\/:*?"<>|]/g, '');
  const filePath = path.join(outputDir, `${safeCountryName}.txt`);

  const content = headers.map((header) => `${header}: ${row[header] || ''}`).join('\n');
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log(`✅ Successfully generated ${rows.length} country files in the 'output' directory.`);
