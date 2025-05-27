
![Dojo Starter](./backend/assets/cover.png)

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

---

# 🧪 PvP Battle System with Dojo

A simple turn-based PvP game built with the [Dojo framework](https://dojoengine.org) for Cairo/StarkNet.

---

## 🕹️ Game Overview

- Players can create battles with a bet amount.
- Other players can join those battles.
- Players take turns attacking (1–5 damage).
- Each player starts with 100 HP.
- Winner takes the loser's bet. In case of a draw, bets are returned.

---

## 📁 Project Structure

- `backend/src/models/battle.cairo` – Models for players, battles, and actions.
- `backend/src/systems/battle_actions.cairo` – Game logic and systems.
- `backend/src/tests/test_battle.cairo` – Unit tests for the game logic.

---

## 🚀 Running on Sepolia (SN_SEPOLIA)

The world is already deployed on Sepolia. To run the frontend:

## 🌐 Frontend Setup with HTTPS

For Cartridge to work locally, HTTPS is required:

```bash
sudo apt install libnss3-tools
cd client
mkcert --install
mkcert localhost
```

Update your `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import wasm from 'vite-plugin-wasm';
import mkcert from 'vite-plugin-mkcert'
import fs from 'fs'

export default defineConfig({
  plugins: [react(), tailwindcss(), wasm(), mkcert()],
  server: {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem'),
  },
})
```

Then:

```bash
pnpm install
pnpm run dev
```



## 🌍 Deploy a New World (Optional)

If you'd like to deploy a new world to Sepolia:

## 🛠️ Requirements

Install Dojo and other dependencies first:

```bash
curl -L https://install.dojoengine.org | bash
dojoup
```

Full docs: [https://dojoengine.org](https://dojoengine.org)

---
```bash
./deploy_sepolia.sh
```

- Edit `dojo_sepolia.toml`:
  - Change the `seed`
  - Comment out `world_address` and `world_block`
- Move the generated `manifest_sepolia.json` to `client/src/json/`

---

## 🛰️ Setup Cartridge Slot + Torii

You can run the Torii indexer and Katana using Cartridge:

```bash
# Modify torii.toml as needed
slot deployments create <APP_NAME> torii   --world <WORLD_ADDRESS>   --rpc <RPC_ADDRESS>   --config <TORII_CONFIG_FILE>

slot deployments create <APP_NAME> katana
```

You’ll now have the backend running on Sepolia and indexed via Torii.

- Example GraphQL URL:
  ```
  https://api.cartridge.gg/x/<APP_NAME>/torii/graphql
  ```

---

### ⚙️ Configure the Client

1. Copy the world manifest:
   ```bash
   mv manifest_sepolia.json client/src/json/
   ```

2. Update your `.env` file in the `client/` folder with the following:

```
VITE_WORLD_ADDRESS=...
VITE_CONTRACT_ADDRESS=...
VITE_TORII_URL=https://api.cartridge.gg/x/<APP_NAME>/torii/graphql
```

---
## 🧪 Local Testing (Optional)

You can also test locally using Katana:

```bash
# Terminal 1 - Start Katana
katana --dev --dev.no-fee --dev.accounts 3  --dev.seed 0

# Terminal 2
sozo build
sozo migrate
torii --world <WORLD_ADDRESS> --http.cors_origins "*"
```

> ✅ Minimum 2 accounts are required for testing.

---


## 🧑‍💻 Contribution

1. **Report a Bug**  
   Found a bug? Report it [here](https://github.com/dojoengine/dojo-starter/issues).

2. **Request a Feature**  
   Want something added? Suggest it [here](https://github.com/dojoengine/dojo-starter/issues).

3. **Submit a PR**  
   Found a way to improve? Open a pull request – the community will appreciate it!

---

Happy hacking! 🚀
