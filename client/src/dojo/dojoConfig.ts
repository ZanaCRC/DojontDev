import { createDojoConfig } from "@dojoengine/core";
 
import manifest from "../../../backend/manifest_sepolia.json";
 
export const dojoConfig = createDojoConfig({
    manifest,
    toriiUrl: import.meta.env.VITE_TORII_URL,
    relayUrl: import.meta.env.VITE_RELAY_URL,
    rpcUrl: import.meta.env.VITE_RPC_URL,
});