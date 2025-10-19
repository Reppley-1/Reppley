const { Citizen } = require('./citizen');
const { Nation } = require('./nation');
const { World } = require('./world');
const { createSeededRandom } = require('../utils/random');

class Simulation {
  constructor({ scenario, playerConfig }) {
    this.random = createSeededRandom(scenario.seed ?? 2020);
    this.nations = scenario.nations.map((nation) => new Nation(nation));
    this.world = new World({ nations: this.nations, random: this.random });
    this.applyRelations(scenario.relations ?? {});
    const originNation = this.nations.find((nation) => nation.name === playerConfig.originNation);
    if (!originNation) {
      throw new Error(`Origin nation ${playerConfig.originNation} not found in scenario`);
    }
    this.player = new Citizen({ ...playerConfig, originNation: originNation.name });
    this.playerCity = originNation.cities[0];
  }

  applyRelations(relations) {
    for (const nation of this.nations) {
      const relationEntries = relations[nation.name] || {};
      for (const other of this.nations) {
        if (other === nation) continue;
        const score = relationEntries[other.name] ?? 0;
        nation.addRelation(other, score);
      }
    }
  }

  run(days) {
    const history = [];
    for (let i = 0; i < days; i += 1) {
      const events = this.world.tick();
      this.player.applyDailyRoutine({
        nation: this.getPlayerNation(),
        city: this.playerCity,
        random: this.random,
      });

      const escapeEvent = this.player.attemptEscape({ nation: this.getPlayerNation(), random: this.random });
      const dayRecord = {
        day: this.world.day,
        events,
        player: {
          health: this.player.health,
          morale: this.player.morale,
          wealth: this.player.wealth,
          heatFromAuthorities: this.player.heatFromAuthorities,
          escapeProgress: this.player.escapeProgress,
          escapeEvent,
        },
        nations: this.world.summary(),
      };
      history.push(dayRecord);
      if (escapeEvent?.type === 'escape-success') break;
    }
    return history;
  }

  getPlayerNation() {
    return this.nations.find((nation) => nation.name === this.player.originNation);
  }
}

module.exports = { Simulation };
