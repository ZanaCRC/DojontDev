import { WalletConnect } from "./WalletConnect";
import { BattleLauncher } from "./BattleLauncher";
export const LoginWithWallet = () => {
  return (
    <div>
       <div className="max-w-md mx-auto mt-10 space-y-6">
        <WalletConnect />
        <BattleLauncher />
      </div>
    </div>
  )
}
