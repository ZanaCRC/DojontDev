import { Connector } from "@starknet-react/core";
import { ControllerConnector } from "@cartridge/connector";
import { ColorMode, SessionPolicies, ControllerOptions, } from "@cartridge/controller";
import { constants } from "starknet";

const { VITE_PUBLIC_DEPLOY_TYPE } = import.meta.env;
const { VITE_PUBLIC_SLOT_ADDRESS } = import.meta.env;
const { VITE_BATTLE_CONTRACT_ADDRESS } = import.meta.env;

const CONTRACT_ADDRESS_BATTLE_SYSTEM = VITE_BATTLE_CONTRACT_ADDRESS

const policies: SessionPolicies = {
  contracts:{
    [CONTRACT_ADDRESS_BATTLE_SYSTEM]: {
      methods: [
        {
          name: "createPlayer",
          entrypoint: "create_player"
        },
        {
          name: "joinBattle",
          entrypoint: "join_battle"
        },
        {
          name: "performAction",
          entrypoint: "perform_action"
        },
       
      ],
    },
  },
}





const options: ControllerOptions = {
  // @ts-ignore
  chains: [
    {
      rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia",
    },
  ],
  defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
  policies,
  namespace: "dojontdev",
  slot: "dojontdev"
};

const cartridgeConnector = new ControllerConnector(
  options,
) as never as Connector;

export default cartridgeConnector;
