const { createSeededRandom } = require('../utils/random');

const ideologies = ['Democratic', 'Authoritarian', 'Technocratic', 'Theocratic', 'Communist', 'Monarchist'];
const economies = ['Capitalist', 'Mixed', 'Command', 'Feudal-Corporate'];
const governments = ['Parliamentary Republic', 'Presidential Republic', 'Single-Party State', 'Military Junta', 'Confederation'];
const diplomacyStyles = ['Isolationist', 'Expansionist', 'Cooperative', 'Mercantile'];
const occupations = [
  { name: 'Engineer', wageModifier: 0.8, specialization: 'engineering' },
  { name: 'Doctor', wageModifier: 0.9, specialization: 'medical' },
  { name: 'Teacher', wageModifier: 0.6, specialization: 'education' },
  { name: 'Artist', wageModifier: 0.4, specialization: 'arts' },
  { name: 'Technician', wageModifier: 0.5, specialization: 'engineering' },
  { name: 'Trader', wageModifier: 0.7, specialization: 'economics' },
  { name: 'Intelligence Officer', wageModifier: 0.8, specialization: 'espionage' },
];

function generateCity(random, name) {
  return {
    name,
    population: random.int(500_000, 15_000_000),
    infrastructure: random.range(0.3, 0.9),
    sanitation: random.range(0.3, 0.95),
    unrest: random.range(0, 0.2),
    prosperity: random.range(0.3, 0.9),
  };
}

function generateNation(random, year, index, altHistoryPrompt) {
  let name = `Nation ${index + 1}`;
  let ideology = random.pick(ideologies);
  let government = random.pick(governments);
  let militaryStrength = random.range(0.2, 1);
  let techLevel = Math.min(1.2, Math.max(0.4, 0.5 + (year - 1900) / 200));
  let authoritarianism = random.range(0, 1);
  let healthcareQuality = random.range(0.2, 0.9);
  let borderSecurity = random.range(0.1, 0.9);

  if (altHistoryPrompt?.toLowerCase().includes('rome')) {
    name = index === 0 ? 'Nova Roma' : `Roman Client State ${index}`;
    ideology = index === 0 ? 'Imperial Technocracy' : 'Client State';
    government = index === 0 ? 'Neo-Imperial Senate' : 'Imperial Protectorate';
    techLevel = index === 0 ? 1.1 : techLevel;
    militaryStrength = index === 0 ? 1 : militaryStrength;
  }

  if (altHistoryPrompt?.toLowerCase().includes('북한') || altHistoryPrompt?.toLowerCase().includes('dprk')) {
    if (index === 0) {
      name = "People's Dawn Republic";
      ideology = 'Juche Revivalism';
      government = 'Supreme Leadership Council';
      authoritarianism = random.range(0.85, 1);
      borderSecurity = random.range(0.8, 1);
      healthcareQuality = random.range(0.3, 0.5);
    }
  }

  const cities = [
    generateCity(random, `${name} City`),
    generateCity(random, `${name} Industrial Hub`),
  ];

  return {
    name,
    ideology,
    government,
    economy: random.pick(economies),
    techLevel,
    militaryStrength,
    authoritarianism,
    healthcareQuality,
    taxRate: random.range(0.1, 0.5),
    borderSecurity,
    diplomacyStyle: random.pick(diplomacyStyles),
    colors: {
      primary: `hsl(${random.int(0, 360)}, 70%, 50%)`,
      secondary: `hsl(${random.int(0, 360)}, 60%, 40%)`,
    },
    cities,
  };
}

function computeRelations(random, nations) {
  const relationMap = {};
  for (const source of nations) {
    relationMap[source.name] = {};
    for (const target of nations) {
      if (source === target) continue;
      const alignmentBonus = source.ideology === target.ideology ? 0.2 : 0;
      const diplomacyModifier = source.diplomacyStyle === 'Expansionist' ? -0.2 : 0.1;
      relationMap[source.name][target.name] = random.range(-0.3, 0.3) + alignmentBonus + diplomacyModifier;
    }
  }
  return relationMap;
}

function generateScenario({ year = 2020, altHistoryPrompt = '', seed = 'reppley-alpha', nationCount = 5 }) {
  const random = createSeededRandom(`${seed}-${year}-${altHistoryPrompt}`);
  const nations = [];
  for (let i = 0; i < nationCount; i += 1) {
    nations.push(generateNation(random, year, i, altHistoryPrompt));
  }
  const relations = computeRelations(random, nations);
  return {
    seed: `${seed}-${year}-${altHistoryPrompt}`,
    nations,
    relations,
    occupations,
    year,
    altHistoryPrompt,
  };
}

module.exports = {
  generateScenario,
  occupations,
};
