# Reppley World Simulation

This prototype implements the end-to-end flow for the grand-strategy / immersive life-sim concept described by the user. The simulation is written in Node.js and focuses on: character customisation, AI-generated nations, ongoing world simulation with autonomous wars and diseases, and the ability to role-play as a citizen—up to attempting a GTA-style escape from oppressive regimes.

## Features

- **AI-generated world** – Provide a year and optional alternate-history prompt (e.g. `--prompt="Rome survives to 2020"`). The generator builds nations, cities, ideologies, and diplomatic relations that match the setting.
- **Character creation** – Choose name, age, origin nation, occupation, ideology, and skill set from the command line.
- **Autonomous simulation** – Each day nations update their economy, stability, war state, and public health. Cities model prosperity, unrest, sanitation, infrastructure, and war damage.
- **Dynamic events** – The event engine injects plausible wars, peace deals, diplomacy shifts, and disease outbreaks that can ripple across the world.
- **Citizen life loop** – The playable citizen tracks morale, wealth, and health influenced by job fit, national policies, and city conditions.
- **Escape route gameplay** – In highly authoritarian nations your citizen automatically plans an escape. Progress, failure, or success is recorded with GTA-flavoured flavour text.
- **Exportable history** – Save the full run (including daily world summaries and events) as JSON for further tooling or visualisation.

## Getting Started

Install dependencies (only Node.js is required) and run the simulation script with Node:

```bash
node game/index.js --year=2020 --prompt="Rome survives to 2020" --nation="Nova Roma" --occupation=Engineer --name="Cassius" --days=60 --output=rome_sim.json
```

Arguments are optional. Key options include:

| Flag | Description |
| --- | --- |
| `--year` | Year to initialise the simulation (default `2020`). |
| `--prompt` | Alternate-history prompt to shape the generator (e.g. `"Rome survives"`, `"북한"`). |
| `--nations` | Number of nations to generate (default `6`). |
| `--seed` | String seed for deterministic runs (default `"reppley-alpha"`). |
| `--nation` | Origin nation for the player (defaults to the first generated nation). |
| `--occupation` | Occupation choice (`Engineer`, `Doctor`, `Teacher`, `Artist`, `Technician`, `Trader`, `Intelligence Officer`). |
| `--skills` | Comma-separated custom skills overriding the defaults. |
| `--days` | Number of in-game days to simulate (default `120`). |
| `--output` | Path to save the JSON history; if omitted the simulation prints to stdout. |

## Output Structure

The simulator returns a JSON document:

- `metadata` – Summary of the scenario and player configuration.
- `history[]` – One entry per simulated day containing:
  - `events[]` – Dynamic world events triggered that day.
  - `player` – Current morale, wealth, health, and escape progress (including event message).
  - `nations[]` – Snapshot of each nation's GDP, stability, total population, and war status.

## Extending the Prototype

- Integrate the JSON output into a visual map editor or HOI4-style UI.
- Replace the deterministic generator with LLM-backed content creation for richer lore and city layouts.
- Add interactive commands to choose daily citizen actions instead of automatic routines.
- Hook the event log into mission scripting for playable infiltration or combat sequences.

This foundation covers the complete gameplay loop from scenario generation through citizen survival, fulfilling the requested end-to-end experience.
