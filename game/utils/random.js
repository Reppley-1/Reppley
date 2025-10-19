const DEFAULT_SEED = 2020;

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToSeed(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function createSeededRandom(seedInput = DEFAULT_SEED) {
  const seed =
    typeof seedInput === 'string' ? hashStringToSeed(seedInput) : seedInput;
  const rng = mulberry32(seed || DEFAULT_SEED);
  return {
    next: () => rng(),
    range: (min, max) => min + rng() * (max - min),
    int: (min, max) => Math.floor(min + rng() * (max - min + 1)),
    pick: (array) => array[Math.floor(rng() * array.length)],
    chance: (probability) => rng() < probability,
    weightedPick: (items) => {
      const totalWeight = items.reduce((acc, item) => acc + item.weight, 0);
      let threshold = rng() * totalWeight;
      for (const item of items) {
        threshold -= item.weight;
        if (threshold <= 0) return item.value;
      }
      return items[items.length - 1].value;
    }
  };
}

module.exports = {
  createSeededRandom,
};
