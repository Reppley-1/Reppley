const { City } = require('./city');

class Nation {
  constructor({
    name,
    ideology,
    government,
    economy,
    techLevel,
    militaryStrength,
    authoritarianism,
    healthcareQuality,
    taxRate,
    borderSecurity,
    diplomacyStyle,
    colors,
    cities = [],
  }) {
    this.name = name;
    this.ideology = ideology;
    this.government = government;
    this.economy = economy;
    this.techLevel = techLevel;
    this.militaryStrength = militaryStrength;
    this.authoritarianism = authoritarianism;
    this.healthcareQuality = healthcareQuality;
    this.taxRate = taxRate;
    this.borderSecurity = borderSecurity;
    this.diplomacyStyle = diplomacyStyle;
    this.colors = colors;
    this.cities = cities.map((city) => new City(city));
    this.resources = {
      gdp: 1_000_000_000 * techLevel,
      food: 0.6,
      energy: 0.6,
      research: techLevel * 0.2,
    };
    this.stability = 0.6;
    this.warWeariness = 0;
    this.stateOfWar = false;
    this.currentWars = [];
    this.relations = new Map();
  }

  addRelation(otherNation, score) {
    this.relations.set(otherNation.name, score);
  }

  relationScore(otherNation) {
    return this.relations.get(otherNation.name) ?? 0;
  }

  isHostile(otherNation) {
    const score = this.relationScore(otherNation);
    return score < -0.4;
  }

  updateDaily(random) {
    const economicMultiplier =
      (1 + this.resources.food * 0.2 + this.resources.energy * 0.2 + this.techLevel * 0.1);
    this.resources.gdp *= 1 + 0.0001 * economicMultiplier;

    // Healthcare influences city public health responses
    const publicHealthModifier = this.healthcareQuality * 0.01;

    for (const city of this.cities) {
      city.updateDaily({ random, publicHealthModifier });
    }

    const averageUnrest = this.cities.reduce((acc, city) => acc + city.unrest, 0) / this.cities.length;
    const averageProsperity =
      this.cities.reduce((acc, city) => acc + city.prosperity, 0) / this.cities.length;

    const stabilityShift =
      averageProsperity * 0.01 - averageUnrest * 0.02 - this.authoritarianism * 0.005;
    this.stability = Math.min(1, Math.max(0, this.stability + stabilityShift));

    if (this.stateOfWar) {
      this.warWeariness = Math.min(1, this.warWeariness + 0.01);
      this.stability = Math.max(0, this.stability - 0.01);
      this.resources.gdp *= 0.999;
    } else {
      this.warWeariness = Math.max(0, this.warWeariness - 0.005);
    }

    // Resource adjustments
    this.resources.food = Math.min(1, Math.max(0, this.resources.food + 0.01 - averageUnrest * 0.005));
    this.resources.energy = Math.min(1, Math.max(0, this.resources.energy + 0.01 - this.stateOfWar * 0.02));
    this.resources.research = Math.min(1, Math.max(0, this.resources.research + this.techLevel * 0.003));

    // Taxation effect
    this.resources.gdp *= 1 - this.taxRate * 0.0005;
  }

  applyDiseaseOutbreak(severity) {
    this.cities.forEach((city) => city.applyDiseaseOutbreak(severity));
  }

  applyWarImpact(intensity) {
    this.cities.forEach((city) => city.applyWarImpact(intensity));
    this.militaryStrength = Math.max(0, this.militaryStrength - intensity * 0.1);
    this.resources.gdp *= 1 - intensity * 0.02;
  }
}

module.exports = { Nation };
