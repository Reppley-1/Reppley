class Citizen {
  constructor({
    name,
    age,
    originNation,
    occupation,
    skills,
    ideology,
    wealth = 0.4,
    health = 0.8,
    morale = 0.7,
  }) {
    this.name = name;
    this.age = age;
    this.originNation = originNation;
    this.occupation = occupation;
    this.skills = skills;
    this.ideology = ideology;
    this.wealth = wealth;
    this.health = health;
    this.morale = morale;
    this.heatFromAuthorities = 0;
    this.escapeProgress = 0;
  }

  applyDailyRoutine({ nation, city, random }) {
    const jobSatisfaction =
      (this.skills.includes(this.occupation.specialization) ? 0.02 : -0.01) +
      (1 - nation.authoritarianism) * 0.01 -
      city.unrest * 0.01;

    const wealthShift = this.occupation.wageModifier * 0.01 - nation.taxRate * 0.005;
    const healthShift =
      -city.diseaseLevel * 0.015 + nation.healthcareQuality * 0.01 - nation.warWeariness * 0.01;

    this.morale = Math.min(1, Math.max(0, this.morale + jobSatisfaction));
    this.wealth = Math.min(1, Math.max(0, this.wealth + wealthShift));
    this.health = Math.min(1, Math.max(0, this.health + healthShift));

    if (nation.authoritarianism > 0.7) {
      this.heatFromAuthorities = Math.min(1, this.heatFromAuthorities + 0.01);
    } else if (this.heatFromAuthorities > 0) {
      this.heatFromAuthorities = Math.max(0, this.heatFromAuthorities - 0.02);
    }

    if (nation.stateOfWar && nation.authoritarianism > 0.7) {
      this.heatFromAuthorities = Math.min(1, this.heatFromAuthorities + 0.02);
    }

    if (random.chance(0.01) && nation.stateOfWar) {
      this.morale = Math.max(0, this.morale - 0.05);
    }

    if (city.diseaseLevel > 0.6 && random.chance(0.1)) {
      this.health = Math.max(0, this.health - 0.1);
    }
  }

  attemptEscape({ nation, random }) {
    if (nation.authoritarianism < 0.6) return null;

    this.escapeProgress += 0.1 + random.range(0, 0.1);
    const success = this.escapeProgress >= 1 && random.chance(0.6 - nation.borderSecurity * 0.4);

    if (success) {
      return {
        type: 'escape-success',
        description: `${this.name} successfully fled ${nation.name}.`,
      };
    }

    if (this.heatFromAuthorities > 0.6 && random.chance(0.5)) {
      this.escapeProgress = 0;
      this.morale = Math.max(0, this.morale - 0.2);
      return {
        type: 'escape-failure',
        description: `${this.name} was stopped by border guards while trying to flee.`,
      };
    }

    return {
      type: 'escape-progress',
      description: `${this.name} is planning an escape... (${Math.floor(this.escapeProgress * 100)}%)`,
    };
  }
}

module.exports = { Citizen };
