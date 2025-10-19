class City {
  constructor({
    name,
    population,
    infrastructure,
    sanitation,
    unrest = 0,
    prosperity = 0.5,
  }) {
    this.name = name;
    this.population = population;
    this.infrastructure = infrastructure; // 0 - 1
    this.sanitation = sanitation; // 0 - 1
    this.unrest = unrest; // 0 - 1
    this.prosperity = prosperity; // 0 - 1
    this.diseaseLevel = 0;
    this.warDamage = 0;
  }

  improveInfrastructure(amount) {
    this.infrastructure = Math.min(1, this.infrastructure + amount);
  }

  degradeInfrastructure(amount) {
    this.infrastructure = Math.max(0, this.infrastructure - amount);
  }

  updateDaily({ random, publicHealthModifier = 0 }) {
    // Disease progression influenced by sanitation and infrastructure
    const sanitationEffect = (1 - this.sanitation) * 0.01;
    const infrastructureEffect = (1 - this.infrastructure) * 0.008;
    const unrestEffect = this.unrest * 0.005;
    const newDisease = Math.max(
      0,
      this.diseaseLevel + sanitationEffect + infrastructureEffect + unrestEffect - publicHealthModifier
    );
    this.diseaseLevel = Math.min(1, newDisease);

    // Population changes
    const populationGrowth = this.population * (0.0008 + this.prosperity * 0.0005);
    const diseaseDeaths = this.population * this.diseaseLevel * 0.0006;
    const warDeaths = this.population * this.warDamage * 0.0009;
    this.population = Math.max(
      1000,
      Math.floor(this.population + populationGrowth - diseaseDeaths - warDeaths)
    );

    // Adjust prosperity based on infrastructure and war damage
    const prosperityShift = this.infrastructure * 0.002 - this.warDamage * 0.003;
    this.prosperity = Math.min(1, Math.max(0, this.prosperity + prosperityShift));

    // Unrest influenced by prosperity and disease
    const unrestShift = this.diseaseLevel * 0.002 - this.prosperity * 0.0015;
    this.unrest = Math.min(1, Math.max(0, this.unrest + unrestShift));

    // War damage slowly recovers
    if (this.warDamage > 0) {
      this.warDamage = Math.max(0, this.warDamage - 0.01);
    }

    // Random local events
    if (random.chance(0.002)) {
      this.prosperity = Math.min(1, this.prosperity + 0.05);
    }
    if (random.chance(0.002)) {
      this.unrest = Math.min(1, this.unrest + 0.05);
    }
  }

  applyDiseaseOutbreak(severity) {
    this.diseaseLevel = Math.min(1, this.diseaseLevel + severity);
    this.sanitation = Math.max(0, this.sanitation - severity * 0.1);
  }

  applyWarImpact(intensity) {
    this.warDamage = Math.min(1, this.warDamage + intensity);
    this.infrastructure = Math.max(0, this.infrastructure - intensity * 0.2);
    this.unrest = Math.min(1, this.unrest + intensity * 0.2);
  }
}

module.exports = { City };
