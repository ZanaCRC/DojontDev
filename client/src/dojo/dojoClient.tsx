// src/dojo/dojoClient.ts
import { init } from "@dojoengine/sdk";
import { ModelNameInterface, schema } from "./typescript/models.gen.ts";
import { dojoConfig } from "./dojoConfig";

export const initDojoClient = async () => {
    const db = await init<ModelNameInterface>(
        {
            client: {
                toriiUrl: dojoConfig.toriiUrl,
                relayUrl: dojoConfig.relayUrl,
                worldAddress: dojoConfig.manifest.world.address,
            },
            domain: {
                name: "BattleGame",
                revision: "1.0.0",
                chainId: "SN_SEPOLIA",
                version: "1.0.0",
            },
        },
        schema
    );

    return db;
};

// Funciones para escuchar updates específicos
export const subscribeToBattleUpdates = (db, onBattleUpdate) => {
    return db.subscribeToModelUpdates("Battle", onBattleUpdate);
};

export const subscribeToPlayerUpdates = (db, onPlayerUpdate) => {
    return db.subscribeToModelUpdates("Player", onPlayerUpdate);
};