import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DojoSdkProvider } from '@dojoengine/sdk/react'
import { init } from '@dojoengine/sdk'
import { BrowserRouter } from 'react-router-dom'
import type { SchemaType } from './dojo/typescript/models.gen.ts'
import { setupWorld } from './dojo/typescript/contracts.gen.ts'
import { dojoConfig } from './dojo/dojoConfig.ts'
import StarknetProvider from './components/StarknetProvider.tsx'
import { AppRoutes } from './routes'

import './index.css'

function initApp() {
  init<SchemaType>({
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
  }).then(sdk => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <DojoSdkProvider
          sdk={sdk}
          dojoConfig={dojoConfig}
          clientFn={setupWorld}>
          <StarknetProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </StarknetProvider>
        </DojoSdkProvider>
      </StrictMode>,
    )
  }).catch((error) => {
    console.error("App initialization failed:", error);
  });
}

initApp();

