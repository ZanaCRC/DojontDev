import { Connector } from "@starknet-react/core";
import { ControllerConnector } from "@cartridge/connector";
import { ColorMode, SessionPolicies, ControllerOptions, } from "@cartridge/controller";
import { constants } from "starknet";

const { VITE_PUBLIC_DEPLOY_TYPE } = import.meta.env;
const { VITE_PUBLIC_SLOT_ADDRESS } = import.meta.env;

const CONTRACT_ADDRESS_BATTLE_SYSTEM = '0x1ea84cd064968ff336c6287307299e24f14e393c5e23e3c4dffb8d827de3261'

const policies: SessionPolicies = {
  contracts:{
    [CONTRACT_ADDRESS_BATTLE_SYSTEM]: {
      methods: [
        {
          name: "battle_actions",
          entrypoint: "create_player"
        },
        {
          name: "battle_actions",
          entrypoint: "get_available_battles_by_bet"
        },
        {
          name: "battle_actions",
          entrypoint: "join_battle"
        },
        {
          name: "battle_actions",
          entrypoint: "perform_action"
        },
       
      ],
    },
  },
}

// Controller basic configuration
const colorMode: ColorMode = "dark";
const theme = "bytebeasts-tamagotchi";
const namespace = "dojontdev"; 
const slot = `dojontdev}`; 

const getRpcUrl = () => {
  switch (VITE_PUBLIC_DEPLOY_TYPE) {
    case "mainnet":
      return "https://api.cartridge.gg/x/starknet/mainnet";
    case "sepolia":
      return "https://api.cartridge.gg/x/starknet/sepolia";
    default:
      return VITE_PUBLIC_SLOT_ADDRESS;
  }
};

const options: ControllerOptions = {
  // @ts-ignore
  chains: [
    {
      rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia",
    },
  ],
  defaultChainId: VITE_PUBLIC_DEPLOY_TYPE === 'mainnet' ?  constants.StarknetChainId.SN_MAIN : constants.StarknetChainId.SN_SEPOLIA,
  policies,
  theme,
  colorMode,
  preset: "dojontdev",
namespace: "dojontdev",
  slot: "dojontdev"
};

const cartridgeConnector = new ControllerConnector(
  options,
) as never as Connector;

export default cartridgeConnector;
