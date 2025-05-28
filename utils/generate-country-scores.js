const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Paths
const inputPath = path.join(__dirname, '../files/openai-store/GIRAI_2024_Edition_Rankings_And_Scores.html');
const outputDir = path.join(__dirname, '../files/output');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Load and parse HTML
const html = fs.readFileSync(inputPath, 'utf8');
const $ = cheerio.load(html);

// --- Extract full headers (2-row headers) ---
const headerRows = $('table.waffle tr').slice(0, 2);
const headers = [];

// First pass: collect merged headers from row 0
let colIdx = 0;
headerRows.eq(0).find('td, th').each((_, cell) => {
  const colspan = parseInt($(cell).attr('colspan')) || 1;
  const baseHeader = $(cell).text().trim().replace(/\s+/g, ' ');
  for (let i = 0; i < colspan; i++) {
    headers[colIdx++] = baseHeader; // Base for now
  }
});

// Second pass: append second row (subheaders)
colIdx = 0;
headerRows.eq(1).find('td, th').each((_, cell) => {
  const text = $(cell).text().trim().replace(/\s+/g, ' ');
  if (headers[colIdx]) {
    headers[colIdx] = `${headers[colIdx]} - ${text}`;
  } else {
    headers[colIdx] = text; // fill in if missing
  }
  colIdx++;
});

// Clean headers (e.g., fix first few that aren't merged)
headers[0] = 'Ranking';
headers[1] = 'ISO3';
headers[2] = 'Country';
headers[3] = 'GIRAI_region';
headers[4] = 'UN_region';
headers[5] = 'UN_subregion';
headers[6] = 'Index score';

// --- Process each country row ---
$('table.waffle tr').slice(3).each((_, row) => {
  const cells = $(row).find('td');
  if (cells.length < 3) return;

  const values = [];
  cells.each((i, cell) => {
    const text = $(cell).text().trim().replace(/\s+/g, ' ');
    values.push(text);
  });

  const countryName = values[2]; // Column C = index 2
  if (!countryName) return;

  const safeFileName = countryName.replace(/[^a-z0-9]/gi, '_');
  const filePath = path.join(outputDir, `${safeFileName}.txt`);

  const content = headers.map((header, i) => `${header}: ${values[i] || ''}`).join('\n');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✔ Created: ${safeFileName}.txt`);
});
