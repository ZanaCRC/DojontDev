import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DojoSdkProvider } from '@dojoengine/sdk/react'
import { init } from '@dojoengine/sdk'
import type { SchemaType } from './dojo/typescript/models.gen.ts'
import { setupWorld } from './dojo/typescript/contracts.gen.ts'
import { dojoConfig, DojoConfig } from './dojo/dojoConfig.ts'
import  StarknetProvider  from './components/StarknetProvider.tsx'


import './index.css'
import App from './App.tsx'


async function main() {
  const sdk = await init<SchemaType>({
  client: {
    toriiUrl: dojoConfig.toriiUrl,
    relayUrl: dojoConfig.relayUrl,
    worldAddress: dojoConfig.manifest.world.address,
  },
  domain: {
    name: "dojontdev",
    version: "1.0",
    chainId: "SN_SEPOLIA",
    revision: "1",
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DojoSdkProvider
    sdk={sdk}
    dojoConfig={dojoConfig}
    clientFn={setupWorld}>
    <StarknetProvider>
      <App />
    </StarknetProvider>
    </DojoSdkProvider>
  </StrictMode>,
)
}

main().catch((error) => {
  console.error("Hello: Falló la inicialización de la aplicación:", error);
});

