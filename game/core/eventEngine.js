class EventEngine {
  constructor(random) {
    this.random = random;
  }

  generateDailyEvents(world) {
    const events = [];
    events.push(...this.maybeSpawnDisease(world));
    events.push(...this.maybeTriggerWar(world));
    events.push(...this.maybeTriggerPeace(world));
    events.push(...this.maybeTriggerDiplomacy(world));
    return events;
  }

  maybeSpawnDisease(world) {
    const events = [];
    for (const nation of world.nations) {
      if (this.random.chance(0.002 + (1 - nation.healthcareQuality) * 0.001)) {
        const severity = this.random.range(0.05, 0.25);
        const affectedCity = this.random.pick(nation.cities);
        affectedCity.applyDiseaseOutbreak(severity);
        events.push({
          type: 'disease',
          nation: nation.name,
          city: affectedCity.name,
          severity,
          description: `${affectedCity.name} reports an outbreak with severity ${(severity * 100).toFixed(1)}%.`,
        });
      }
    }
    return events;
  }

  maybeTriggerWar(world) {
    const events = [];
    for (const aggressor of world.nations) {
      if (aggressor.stateOfWar) continue;
      if (aggressor.militaryStrength < 0.3) continue;

      const potentialTargets = world.nations.filter(
        (nation) => nation !== aggressor && aggressor.isHostile(nation)
      );
      if (!potentialTargets.length) continue;

      if (this.random.chance(0.001 + (1 - aggressor.stability) * 0.002)) {
        const target = this.random.pick(potentialTargets);
        aggressor.stateOfWar = true;
        target.stateOfWar = true;
        aggressor.currentWars.push(target.name);
        target.currentWars.push(aggressor.name);
        aggressor.addRelation(target, -1);
        target.addRelation(aggressor, -1);
        events.push({
          type: 'war-declared',
          aggressor: aggressor.name,
          target: target.name,
          description: `${aggressor.name} declares war on ${target.name} citing border disputes and ideological clashes.`,
        });
      }
    }
    return events;
  }

  maybeTriggerPeace(world) {
    const events = [];
    for (const nation of world.nations) {
      if (!nation.stateOfWar) continue;
      if (this.random.chance(0.002 + nation.warWeariness * 0.02)) {
        const opponentName = nation.currentWars[0];
        const opponent = world.nations.find((n) => n.name === opponentName);
        if (!opponent) continue;

        nation.stateOfWar = false;
        nation.currentWars = [];
        nation.warWeariness = Math.max(0, nation.warWeariness - 0.3);

        opponent.stateOfWar = false;
        opponent.currentWars = [];
        opponent.warWeariness = Math.max(0, opponent.warWeariness - 0.3);

        nation.addRelation(opponent, Math.min(0, nation.relationScore(opponent) + 0.1));
        opponent.addRelation(nation, Math.min(0, opponent.relationScore(nation) + 0.1));

        events.push({
          type: 'peace-treaty',
          parties: [nation.name, opponent.name],
          description: `${nation.name} and ${opponent.name} sign a ceasefire to rebuild their nations.`,
        });
      }
    }
    return events;
  }

  maybeTriggerDiplomacy(world) {
    const events = [];
    for (const nation of world.nations) {
      if (this.random.chance(0.003)) {
        const partner = this.random.pick(world.nations.filter((n) => n !== nation));
        const adjustment = this.random.range(-0.1, 0.15);
        nation.addRelation(partner, nation.relationScore(partner) + adjustment);
        partner.addRelation(nation, partner.relationScore(nation) + adjustment);
        events.push({
          type: 'diplomacy',
          nations: [nation.name, partner.name],
          description: `${nation.name} engages in diplomatic talks with ${partner.name}, relations ${(adjustment >= 0 ? 'improve' : 'worsen')} slightly.`,
        });
      }
    }
    return events;
  }
}

module.exports = { EventEngine };
