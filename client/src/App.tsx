// src/App.tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {LoginLayout} from "./layout/LoginLayout";
import { StarknetProvider } from "./components/StarknetProvider";
// import { WalletConnect } from "./components/WalletConnect";
// import { BattleLauncher } from "./components/BattleLauncher";
import { LoginWithWallet } from "./components/LoginWithWallet";

export function App() {
  return (
    <StarknetProvider>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<LoginLayout/>}></Route>

          <Route index element={<LoginWithWallet/>}/>
      </Routes>
      </BrowserRouter>
    </StarknetProvider>
  );
}

export default App;