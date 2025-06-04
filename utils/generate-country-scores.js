"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var cheerio = require("cheerio");
// Load the HTML file
var html = fs.readFileSync('./files/source/GIRAI_2024_Edition_Rankings_And_Scores.html', 'utf8');
var $ = cheerio.load(html);
// Select the first table in the document
var table = $('table').first();
// Extract headers from the table
var headers = [];
table.find('thead tr').last().find('th').each(function (_, th) {
    headers.push($(th).text().trim());
});
// Extract rows from the table
var rows = [];
table.find('tbody tr').each(function (_, tr) {
    var rowData = {};
    $(tr).find('td').each(function (i, td) {
        rowData[headers[i]] = $(td).text().trim();
    });
    if (Object.keys(rowData).length > 0) {
        rows.push(rowData);
    }
});
// Create the output directory if it doesn't exist
var outputDir = path.join(__dirname, '../files/output');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}
// Write each country's data to a separate text file
rows.forEach(function (row) {
    console.log(row, row['']);
    var countryName = row['Country'] || 'Unknown';
    var safeCountryName = countryName.replace(/[\\/:*?"<>|]/g, '');
    var filePath = path.join(outputDir, "".concat(safeCountryName, ".txt"));
    var content = headers.map(function (header) { return "".concat(header, ": ").concat(row[header] || ''); }).join('\n');
    fs.writeFileSync(filePath, content, 'utf8');
});
console.log("\u2705 Successfully generated ".concat(rows.length, " country files in the 'output' directory."));
