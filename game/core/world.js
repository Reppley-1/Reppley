const { EventEngine } = require('./eventEngine');

class World {
  constructor({ nations, random }) {
    this.nations = nations;
    this.random = random;
    this.eventEngine = new EventEngine(random);
    this.day = 0;
    this.log = [];
  }

  tick() {
    this.day += 1;
    for (const nation of this.nations) {
      nation.updateDaily(this.random);
    }
    const events = this.eventEngine.generateDailyEvents(this);
    this.log.push(...events.map((event) => ({ ...event, day: this.day })));
    return events;
  }

  summary() {
    return this.nations.map((nation) => ({
      name: nation.name,
      gdp: nation.resources.gdp,
      stability: nation.stability,
      stateOfWar: nation.stateOfWar,
      wars: nation.currentWars,
      population: nation.cities.reduce((acc, city) => acc + city.population, 0),
    }));
  }
}

module.exports = { World };
