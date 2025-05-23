import { createDojoConfig } from "@dojoengine/core";
 
import manifest from "../../../backend/manifest_sepolia.json";
 
export const dojoConfig = createDojoConfig({
    manifest,
    toriiUrl: "https://api.cartridge.gg/x/dojontdev/torii",
    relayUrl: "https://api.cartridge.gg/x/dojontdev/torii",
    rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia",
});