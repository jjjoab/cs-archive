const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'src', 'assets', 'CORSICA_STUDIOS_INDEX.txt');
const outputPath = path.join(__dirname, '..', 'src', 'assets', 'CORSICA_STUDIOS_INDEX.json');

const raw = fs.readFileSync(inputPath, 'utf8');
const lines = raw.split(/\r?\n/);

const items = [];
let id = 0;

for (const line of lines) {
  const match = line.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})\s*[–—-]\s*(.+)$/);
  if (!match) continue;

  const [, dayRaw, monthRaw, yearRaw, restRaw] = match;
  const day = dayRaw.padStart(2, '0');
  const month = monthRaw.padStart(2, '0');
  let yearNum = parseInt(yearRaw, 10);
  if (yearRaw.length === 2) yearNum += 2000;
  const date = `${yearNum}-${month}-${day}`;

  const isGig = restRaw.includes('⬥');
  const rest = restRaw.replace(/⬥/g, '').trim();

  const colonIndex = rest.indexOf(':');
  const name = colonIndex > -1 ? rest.substring(0, colonIndex).trim() : rest.trim();
  const artists = colonIndex > -1 ? rest.substring(colonIndex + 1).trim() : '';

  items.push({
    id: id++,
    date,
    name,
    artists,
    room1Url: null,
    room2Url: null,
    type: isGig ? 'gig' : 'clubnight',
  });
}

fs.writeFileSync(outputPath, JSON.stringify(items, null, 2));
console.log(`Wrote ${items.length} items to ${outputPath}`);
