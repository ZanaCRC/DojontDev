import { createDojoConfig } from "@dojoengine/core";
 
import manifest from "../../../backend/manifest_sepolia.json"; 
 
export const dojoConfig = createDojoConfig({
    manifest,
    rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia",
    toriiUrl: "https://api.cartridge.gg/x/dojontdev/torii",
    relayUrl: "https://api.cartridge.gg/x/dojontdev/torii",
});