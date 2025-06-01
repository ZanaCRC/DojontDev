
import type { BigNumberish, Call } from "starknet";
import manifest from "../json/manifest_sepolia.json";
import { DojoProvider } from "@dojoengine/core";

interface Contract {
  address: string;
  class_hash: string;
  tag: string;
}

interface BattleActionsContract extends Contract {
  tag: "battle_actions";
}

export const useDojo = () => {
  const setup = async (controller: any) => {
    try {
      // Validar que el manifest tenga la estructura correcta
      if (!manifest) {
        throw new Error('El manifest no está definido');
      }

      if (!manifest.world) {
        throw new Error('manifest.world no está definido');
      }

      if (!manifest.world.address) {
        throw new Error('manifest.world.address no está definido');
      }

      // Obtener la cuenta del controlador
      const account = await controller.account();
      
      console.log('Configurando Dojo con:', {
        manifest: {
          world: manifest.world,
          worldAddress: manifest.world.address,
          contracts: manifest.contracts
        },
        account: {
          type: account?.constructor?.name,
          methods: Object.keys(account || {}),
          address: account?.address
        }
      });

      if (!account) {
        throw new Error('No se pudo obtener la cuenta del controlador');
      }

      // Crear el proveedor de Dojo
      const worldAddress = manifest.world.address;
      const toriiUrl = import.meta.env.VITE_TORII_URL || "http://localhost:8080";
      const rpcUrl = import.meta.env.VITE_STARKNET_RPC_URL || "http://localhost:5050";

      console.log('Creando DojoProvider con:', {
        worldAddress,
        toriiUrl,
        rpcUrl
      });

      const dojoProvider = new DojoProvider({
        manifest,
        worldAddress,
        toriiUrl,
        rpcUrl
      });

      // Encontrar el contrato battle_actions
      const battleActionsContract = manifest.contracts?.find(
        c => c.tag === "battle_actions"
      ) as BattleActionsContract;

      if (!battleActionsContract) {
        throw new Error('No se encontró el contrato battle_actions en el manifest');
      }

      console.log('Contrato battle_actions encontrado:', battleActionsContract);

      return {
        async createPlayer(stake: BigNumberish) {
          try {
            console.log('Creando jugador con:', {
              account: account?.address,
              stake,
              contractAddress: battleActionsContract.address
            });

            const call: Call = {
              contractAddress: battleActionsContract.address,
              entrypoint: "create_player",
              calldata: [stake]
            };

            const response = await dojoProvider.execute(
              account,
              [call],
              "dojontdev"
            );

            console.log('Respuesta de create_player:', response);
            return response;
          } catch (error) {
            console.error('Error al crear jugador:', error);
            throw error;
          }
        },

        async joinBattle(battleId: BigNumberish) {
          try {
            console.log('Uniéndose a batalla:', {
              account: account?.address,
              battleId,
              contractAddress: battleActionsContract.address
            });

            const call: Call = {
              contractAddress: battleActionsContract.address,
              entrypoint: "join_battle",
              calldata: [battleId]
            };

            const response = await dojoProvider.execute(
              account,
              [call],
              "dojontdev"
            );

            console.log('Respuesta de join_battle:', response);
            return response;
          } catch (error) {
            console.error('Error al unirse a la batalla:', error);
            throw error;
          }
        },

        async performAction(battleId: BigNumberish, actionType: any, value: BigNumberish) {
          try {
            console.log('Realizando acción:', {
              account: account?.address,
              battleId,
              actionType,
              value,
              contractAddress: battleActionsContract.address
            });

            const call: Call = {
              contractAddress: battleActionsContract.address,
              entrypoint: "perform_action",
              calldata: [battleId, actionType, value]
            };

            const response = await dojoProvider.execute(
              account,
              [call],
              "dojontdev"
            );

            console.log('Respuesta de perform_action:', response);
            return response;
          } catch (error) {
            console.error('Error al realizar acción:', error);
            throw error;
          }
        }
      };
    } catch (error) {
      console.error('Error en setup de Dojo:', error);
      throw error;
    }
  };

  return {
    setup
  };
}; 