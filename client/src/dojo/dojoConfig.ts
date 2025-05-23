import { createDojoConfig } from "@dojoengine/core";
import manifest from "../json/manifest_dev.json";

export const dojoConfig = createDojoConfig({
    manifest,
    toriiUrl: import.meta.env.VITE_TORII_URL || "http://localhost:8080",
    relayUrl: import.meta.env.VITE_RELAY_URL || "http://localhost:9090",
}); 