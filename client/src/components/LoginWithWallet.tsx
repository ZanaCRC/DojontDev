import { WalletConnect } from "./WalletConnect";
import { BattleLauncher } from "./BattleLauncher";
export const LoginWithWallet = () => {
  return (
    <div>
       <div className="">
        <WalletConnect />
        <BattleLauncher />
      </div>
    </div>
  )
}
