![Dojo Starter](./assets/cover.png)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/mark-dark.svg">
  <img alt="Dojo logo" align="right" width="120" src=".github/mark-light.svg">
</picture>

<a href="https://x.com/ohayo_dojo">
<img src="https://img.shields.io/twitter/follow/dojostarknet?style=social"/>
</a>
<a href="https://github.com/dojoengine/dojo/stargazers">
<img src="https://img.shields.io/github/stars/dojoengine/dojo?style=social"/>
</a>

[![discord](https://img.shields.io/badge/join-dojo-green?logo=discord&logoColor=white)](https://discord.com/invite/dojoengine)
[![Telegram Chat][tg-badge]][tg-url]

[tg-badge]: https://img.shields.io/endpoint?color=neon&logo=telegram&label=chat&style=flat-square&url=https%3A%2F%2Ftg.sumanjay.workers.dev%2Fdojoengine
[tg-url]: https://t.me/dojoengine

# Dojo Starter: Official Guide

A quickstart guide to help you build and deploy your first Dojo provable game.

Read the full tutorial [here](https://dojoengine.org/tutorial/dojo-starter).

## Running Locally

#### Terminal one (Make sure this is running)

```bash
# Run Katana
katana --dev --dev.no-fee
```

#### Terminal two

```bash
# Build the example
sozo build

# Inspect the world
sozo inspect

# Migrate the example
sozo migrate

# Start Torii
# Replace <WORLD_ADDRESS> with the address of the deployed world from the previous step
torii --world <WORLD_ADDRESS> --http.cors_origins "*"
```

## Docker
You can start stack using docker compose. [Here are the installation instruction](https://docs.docker.com/engine/install/)

```bash
docker compose up
```
You'll get all services logs in the same terminal instance. Whenever you want to stop just ctrl+c

---

## Contribution

1. **Report a Bug**

    - If you think you have encountered a bug, and we should know about it, feel free to report it [here](https://github.com/dojoengine/dojo-starter/issues) and we will take care of it.

2. **Request a Feature**

    - You can also request for a feature [here](https://github.com/dojoengine/dojo-starter/issues), and if it's viable, it will be picked for development.

3. **Create a Pull Request**
    - It can't get better then this, your pull request will be appreciated by the community.

Happy coding!

# PvP Battle System with Dojo

A simple PvP battle system built with Dojo framework for Cairo/StarkNet.

## Game Overview

This is a simple turn-based PvP game where:

- Players can create battles with bet amounts
- Other players can join these battles
- Players take turns attacking (1-5 damage) or defending (1-5 protection)
- Defense reduces incoming attack damage
- Players start with 100 health
- The winner takes the loser's bet amount
- If the battle ends in a draw, each player keeps their bet

## Project Structure

- `backend/src/models/battle.cairo` - Game models for players, battles, and actions
- `backend/src/systems/battle_actions.cairo` - Game systems and logic
- `backend/src/tests/test_battle.cairo` - Test file for gameplay

## Important Notes About Linter Errors

When viewing this code in an IDE, you will see many linter errors like:
- "Unsupported attribute" for `#[dojo::model]` and `#[dojo::event]`
- "Unknown derive" for Dojo-specific traits
- "Type not found" for Dojo-specific types
- "Trait has no implementation" for ModelStorage

**These errors are expected and normal** when working with Dojo. The code will compile and work correctly when built with the Dojo toolchain, as these attributes and types are processed by Dojo's build system, not the standard Cairo compiler used by the IDE.

## Setup & Installation

1. Install Dojo and dependencies:
   ```bash
   curl -L https://install.dojoengine.org | bash
   dojoup
   ```

2. Build the project:
   ```bash
   cd backend
   sozo build
   ```

3. Test the project:
   ```bash
   sozo test
   ```

## Game Flow

1. Player creates a battle with a bet amount:
   ```cairo
   battle_actions.create_player(bet_amount);
   ```

2. Another player joins the battle:
   ```cairo
   battle_actions.join_battle(battle_id);
   ```

3. Players take turns performing actions:
   ```cairo
   // Attack with value 4
   battle_actions.perform_action(battle_id, ActionType::Attack, 4);
   
   // Defend with value 2
   battle_actions.perform_action(battle_id, ActionType::Defense, 2);
   ```

4. The battle continues until one player's health reaches 0
