#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Simulation } = require('./core/simulation');
const { generateScenario, occupations } = require('./scenarios/defaultScenario');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const [key, value] = argv[i].split('=');
    if (key.startsWith('--')) {
      args[key.replace(/^--/, '')] = value ?? true;
    }
  }
  return args;
}

function buildPlayerConfig(args, scenario) {
  const chosenOccupation = occupations.find((job) => job.name.toLowerCase() === (args.occupation?.toLowerCase() ?? '')) || occupations[0];
  return {
    name: args.name || 'Player One',
    age: Number.parseInt(args.age || '28', 10),
    originNation: args.nation || scenario.nations[0].name,
    occupation: chosenOccupation,
    skills: args.skills ? args.skills.split(',').map((skill) => skill.trim()) : [chosenOccupation.specialization],
    ideology: args.ideology || 'Pragmatist',
    wealth: args.wealth ? Number.parseFloat(args.wealth) : 0.4,
    health: args.health ? Number.parseFloat(args.health) : 0.8,
    morale: args.morale ? Number.parseFloat(args.morale) : 0.7,
  };
}

function runSimulation() {
  const args = parseArgs(process.argv);
  const scenario = generateScenario({
    year: args.year ? Number.parseInt(args.year, 10) : 2020,
    altHistoryPrompt: args.prompt || '',
    seed: args.seed || 'reppley-alpha',
    nationCount: args.nations ? Number.parseInt(args.nations, 10) : 6,
  });

  const playerConfig = buildPlayerConfig(args, scenario);
  const simulation = new Simulation({ scenario, playerConfig });
  const days = args.days ? Number.parseInt(args.days, 10) : 120;
  const history = simulation.run(days);

  const output = {
    metadata: {
      scenario: {
        year: scenario.year,
        altHistoryPrompt: scenario.altHistoryPrompt,
        nations: scenario.nations.map((nation) => nation.name),
      },
      player: {
        name: playerConfig.name,
        originNation: playerConfig.originNation,
        occupation: playerConfig.occupation.name,
      },
      daysSimulated: history.length,
    },
    history,
  };

  if (args.output) {
    const outputPath = path.resolve(process.cwd(), args.output);
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`Simulation exported to ${outputPath}`);
  } else {
    console.log(JSON.stringify(output, null, 2));
  }
}

if (require.main === module) {
  runSimulation();
}

module.exports = { runSimulation };
