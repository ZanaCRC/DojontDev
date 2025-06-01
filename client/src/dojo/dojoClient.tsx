import { init } from "@dojoengine/sdk";
// SchemaType is exported from ./typescript/models.gen.ts
// This file contains mapping of your cairo contracts to torii client
import type { SchemaType } from "./typescript/models.gen";
import { dojoConfig } from "./dojoConfig";

export const initDojoClient = () => {
    return init<SchemaType>({
        client: {
            toriiUrl: dojoConfig.toriiUrl, // https://api.cartridge.gg/x/dojontdev/torii
            relayUrl: dojoConfig.relayUrl, // https://api.cartridge.gg/x/dojontdev/torii
            worldAddress: dojoConfig.manifest.world.address, // 0x7466f623d14ac156e7cbb7f6546282d3c36be9d4ff6412058eebcb2e3a16f38
        },
        // Domain values based on your backend configuration
        domain: {
            name: "dojo_starter",           // From Scarb.toml package.name
            revision: "1.5.0",             // From Scarb.toml version
            chainId: "SN_SEPOLIA",         // Sepolia testnet
            version: "1.5.0",              // From Dojo version in Scarb.toml
        },
    });
};

// Funciones para escuchar updates específicos
export const subscribeToBattleUpdates = (db: any, onBattleUpdate: (battle: any) => void) => {
    return db.subscribeToModelUpdates("Battle", onBattleUpdate);
};

export const subscribeToPlayerUpdates = (db: any, onPlayerUpdate: (player: any) => void) => {
    return db.subscribeToModelUpdates("Player", onPlayerUpdate);
};