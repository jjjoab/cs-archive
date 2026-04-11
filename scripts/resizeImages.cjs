const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const projectRoot = path.resolve(__dirname, '..');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const WEBP_OPTIONS = {
  quality: 80,
  effort: 6,
};

const profiles = [
  {
    label: 'Landing backgrounds',
    directory: path.join(projectRoot, 'src', 'assets', 'big pics'),
    maxLongEdge: 2560,
    webpOptions: {
      ...WEBP_OPTIONS,
      quality: 74,
    },
  },
  {
    label: 'Archive posters',
    directory: path.join(projectRoot, 'src', 'assets', 'corsica test posters'),
    maxLongEdge: 1400,
    webpOptions: {
      ...WEBP_OPTIONS,
      quality: 78,
    },
  },
];

const args = new Set(process.argv.slice(2));
const isDryRun = args.has('--dry-run');
const keepOriginals = args.has('--keep-originals');

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getOutputPath(filePath) {
  const parsed = path.parse(filePath);
  return path.join(parsed.dir, `${parsed.name}.webp`);
}

async function optimizeImage(filePath, profile) {
  const inputStats = await fs.stat(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const outputPath = getOutputPath(filePath);
  const tempOutputPath = `${outputPath}.tmp.webp`;

  const image = sharp(filePath, { failOn: 'none' }).rotate();
  const metadata = await image.metadata();
  const width = metadata.width ?? null;
  const height = metadata.height ?? null;
  const longEdge = width && height ? Math.max(width, height) : null;

  const pipeline = image.resize({
    width: width && width >= height ? profile.maxLongEdge : undefined,
    height: height && height > width ? profile.maxLongEdge : undefined,
    fit: 'inside',
    withoutEnlargement: true,
  }).webp(profile.webpOptions);

  if (isDryRun) {
    return {
      source: path.basename(filePath),
      output: path.basename(outputPath),
      replacedOriginal: ext === '.webp',
      removedOriginal: !keepOriginals && ext !== '.webp',
      inputBytes: inputStats.size,
      outputBytes: null,
      longEdge,
    };
  }

  await pipeline.toFile(tempOutputPath);
  const outputStats = await fs.stat(tempOutputPath);
  await fs.rename(tempOutputPath, outputPath);

  if (!keepOriginals && ext !== '.webp') {
    await fs.unlink(filePath);
  }

  return {
    source: path.basename(filePath),
    output: path.basename(outputPath),
    replacedOriginal: ext === '.webp',
    removedOriginal: !keepOriginals && ext !== '.webp',
    inputBytes: inputStats.size,
    outputBytes: outputStats.size,
    longEdge,
  };
}

async function runProfile(profile) {
  const entries = await fs.readdir(profile.directory, { withFileTypes: true });
  const imageFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  let totalInputBytes = 0;
  let totalOutputBytes = 0;
  let convertedCount = 0;
  let deletedOriginalCount = 0;

  console.log(`\n${profile.label}`);
  console.log(`- directory: ${path.relative(projectRoot, profile.directory)}`);
  console.log(`- max long edge: ${profile.maxLongEdge}px`);
  console.log(`- files found: ${imageFiles.length}`);

  for (const fileName of imageFiles) {
    const filePath = path.join(profile.directory, fileName);
    const result = await optimizeImage(filePath, profile);

    totalInputBytes += result.inputBytes;
    totalOutputBytes += result.outputBytes ?? 0;
    convertedCount += 1;
    if (result.removedOriginal) deletedOriginalCount += 1;

    const outputSummary = isDryRun
      ? 'dry run'
      : `${formatBytes(result.inputBytes)} -> ${formatBytes(result.outputBytes)}`;
    const removalSummary = result.removedOriginal ? ' | removed original' : '';

    console.log(`  • ${result.source} -> ${result.output} (${outputSummary}${removalSummary})`);
  }

  if (isDryRun) {
    console.log(`- planned conversions: ${convertedCount}`);
    console.log(`- originals to remove: ${deletedOriginalCount}`);
    return;
  }

  const savings = totalInputBytes > 0
    ? (((totalInputBytes - totalOutputBytes) / totalInputBytes) * 100).toFixed(1)
    : '0.0';

  console.log(`- total input: ${formatBytes(totalInputBytes)}`);
  console.log(`- total output: ${formatBytes(totalOutputBytes)}`);
  console.log(`- savings: ${savings}%`);
}

async function main() {
  console.log(`Image optimization ${isDryRun ? '(dry run)' : ''}`.trim());
  if (keepOriginals) {
    console.log('Keeping original JPG/PNG files after conversion.');
  }

  for (const profile of profiles) {
    await runProfile(profile);
  }
}

main().catch(async (error) => {
  console.error('\nImage optimization failed.');
  console.error(error);

  const tempFiles = profiles.map((profile) => profile.directory);
  for (const directory of tempFiles) {
    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      await Promise.all(entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.tmp.webp'))
        .map((entry) => fs.unlink(path.join(directory, entry.name))));
    } catch {
      // ignore cleanup failures
    }
  }

  process.exitCode = 1;
});