import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API_DIR = path.join(ROOT_DIR, 'public', 'api');
const OUTPUT_PATH = path.join(ROOT_DIR, 'data', 'resort-interest-scores.ts');
const REVIEW_INSIGHTS_PATH = path.join(API_DIR, 'resort-review-insights.json');

const EXPECTED_RESORT_COUNT = 171;
const MAX_SCORE = 800;
const PRICE_TREND_WEIGHT = 0.45;
const REVIEW_SOURCE_THRESHOLD = 10;
const REVIEW_MULTIPLIER = 1.3;
const HASH_SALT = 'maldives-bible-interest-v1';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const hashToUnitInterval = value => {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
};

const correlation = (left, right) => {
  const leftMean = left.reduce((sum, value) => sum + value, 0) / left.length;
  const rightMean = right.reduce((sum, value) => sum + value, 0) / right.length;
  let numerator = 0;
  let leftVariance = 0;
  let rightVariance = 0;

  for (let index = 0; index < left.length; index += 1) {
    const leftDelta = left[index] - leftMean;
    const rightDelta = right[index] - rightMean;
    numerator += leftDelta * rightDelta;
    leftVariance += leftDelta ** 2;
    rightVariance += rightDelta ** 2;
  }

  return numerator / Math.sqrt(leftVariance * rightVariance);
};

const loadResorts = async () => {
  const fileNames = (await readdir(API_DIR))
    .filter(fileName => /^resorts\d*\.json$/.test(fileName))
    .sort((left, right) => {
      const numberFor = fileName => Number(fileName.match(/^resorts(\d*)\.json$/)?.[1] || 1);
      return numberFor(left) - numberFor(right);
    });

  const chunks = await Promise.all(
    fileNames.map(async fileName => JSON.parse(await readFile(path.join(API_DIR, fileName), 'utf8')))
  );
  const resorts = chunks.flat();

  if (resorts.length !== EXPECTED_RESORT_COUNT) {
    throw new Error(`Expected ${EXPECTED_RESORT_COUNT} resorts, received ${resorts.length}.`);
  }

  const ids = new Set();
  for (const resort of resorts) {
    if (!Number.isInteger(resort.id) || ids.has(resort.id)) {
      throw new Error(`Invalid or duplicate resort id: ${String(resort.id)}`);
    }
    if (!Number.isFinite(resort.price) || resort.price < 0) {
      throw new Error(`Invalid price for resort ${resort.id}: ${String(resort.price)}`);
    }
    ids.add(resort.id);
  }

  return resorts;
};

const buildScores = async () => {
  const resorts = await loadResorts();
  const reviewPayload = JSON.parse(await readFile(REVIEW_INSIGHTS_PATH, 'utf8'));
  const reviewSourceCountById = new Map(
    (Array.isArray(reviewPayload.items) ? reviewPayload.items : []).map(item => [
      item.resortId,
      Number(item.reviewSummary?.sourceCount) || 0,
    ])
  );

  const priceOrdered = [...resorts].sort((left, right) => right.price - left.price || left.id - right.id);
  const indexesByPrice = new Map();
  priceOrdered.forEach((resort, index) => {
    indexesByPrice.set(resort.price, [...(indexesByPrice.get(resort.price) ?? []), index]);
  });
  const averageIndexByPrice = new Map(
    [...indexesByPrice.entries()].map(([price, indexes]) => [
      price,
      indexes.reduce((sum, index) => sum + index, 0) / indexes.length,
    ])
  );

  const scored = priceOrdered.map(resort => {
    const averagePriceIndex = averageIndexByPrice.get(resort.price);
    const priceRankSignal = 1 - averagePriceIndex / (priceOrdered.length - 1);
    const stableNoise = hashToUnitInterval(`${HASH_SALT}:${resort.id}`);
    const rawScore = PRICE_TREND_WEIGHT * priceRankSignal
      + (1 - PRICE_TREND_WEIGHT) * stableNoise;

    return {
      resort,
      priceRankSignal,
      rawScore,
      hasReviewBonus: reviewSourceCountById.get(resort.id) === REVIEW_SOURCE_THRESHOLD,
    };
  });

  const minRawScore = Math.min(...scored.map(item => item.rawScore));
  const maxRawScore = Math.max(...scored.map(item => item.rawScore));

  if (!Number.isFinite(maxRawScore) || maxRawScore <= minRawScore) {
    throw new Error('Unable to establish the interest-score range.');
  }

  const results = scored.map(item => {
    const baseScore = Math.max(
      0,
      Math.round(
        ((item.rawScore - minRawScore) / (maxRawScore - minRawScore))
          * MAX_SCORE
      )
    );
    const multiplier = item.hasReviewBonus ? REVIEW_MULTIPLIER : 1;
    const score = clamp(Math.round(baseScore * multiplier), 0, MAX_SCORE);

    return { ...item, baseScore, score };
  });

  const scores = results.map(item => item.score);
  const trendSignals = results.map(item => item.priceRankSignal);
  const priceTrendCorrelation = correlation(trendSignals, scores);
  const adjacentReversals = scores.slice(1).filter((score, index) => score > scores[index]).length;

  if (Math.min(...scores) !== 0 || Math.max(...scores) !== MAX_SCORE) {
    throw new Error(`Interest scores must span 0-${MAX_SCORE}.`);
  }
  if (priceTrendCorrelation < 0.5 || priceTrendCorrelation > 0.85) {
    throw new Error(`Unexpected price trend correlation: ${priceTrendCorrelation.toFixed(3)}.`);
  }
  if (adjacentReversals < 60) {
    throw new Error(`Distribution is too close to strict price order (${adjacentReversals} reversals).`);
  }
  for (const item of results.filter(result => result.hasReviewBonus)) {
    const expected = clamp(Math.round(item.baseScore * REVIEW_MULTIPLIER), 0, MAX_SCORE);
    if (item.score !== expected) {
      throw new Error(`Review multiplier mismatch for resort ${item.resort.id}.`);
    }
  }

  return {
    results,
    summary: {
      resortCount: results.length,
      minScore: Math.min(...scores),
      maxScore: Math.max(...scores),
      reviewBonusCount: results.filter(item => item.hasReviewBonus).length,
      priceTrendCorrelation,
      adjacentReversals,
    },
  };
};

const renderSource = results => {
  const entries = results
    .map(({ resort, score }) => `  ${resort.id}: ${score}, // $${resort.price.toLocaleString('en-US')} · ${resort.name}`)
    .join('\n');

  return `// Generated by scripts/generate-resort-interest.mjs. Do not edit by hand.\n`
    + `// Editorial starting interest scores, not historical user-like totals.\n`
    + `// Live user likes are added separately at runtime.\n`
    + `export const RESORT_INTEREST_BASELINE: Readonly<Record<number, number>> = Object.freeze({\n`
    + `${entries}\n`
    + `});\n`;
};

const { results, summary } = await buildScores();
const nextSource = renderSource(results);
const checkOnly = process.argv.includes('--check');

if (checkOnly) {
  let currentSource = '';
  try {
    currentSource = await readFile(OUTPUT_PATH, 'utf8');
  } catch {
    // A clear mismatch error is emitted below.
  }
  if (currentSource !== nextSource) {
    throw new Error('data/resort-interest-scores.ts is stale. Run npm run interest:generate.');
  }
} else {
  await writeFile(OUTPUT_PATH, nextSource, 'utf8');
}

console.log(
  `[interest scores] ${checkOnly ? 'validated' : 'generated'} ${summary.resortCount} resorts; `
    + `range ${summary.minScore}-${summary.maxScore}; review bonus ${summary.reviewBonusCount}; `
    + `price trend ${summary.priceTrendCorrelation.toFixed(3)}; reversals ${summary.adjacentReversals}`
);
