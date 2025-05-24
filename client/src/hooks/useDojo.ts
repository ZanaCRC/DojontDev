import { AccountInterface, RpcProvider, Contract, Account } from "starknet";
<<<<<<< HEAD
import type { BigNumberish } from "starknet";
import manifest from "../json/manifest_dev.json";
=======
import type { BigNumberish, CairoCustomEnum } from "starknet";
import { setupWorld } from "../dojo/typescript/contracts.gen";
import manifest from "../json/manifest_sepolia.json";
>>>>>>> 61d66bea591ac9eea4dca20066d33cdc507615d4

// Configuración básica para desarrollo local
const config = {
  rpcUrl: import.meta.env.VITE_STARKNET_RPC_URL || "https://starknet-sepolia.public.blastapi.io",
  toriiUrl: import.meta.env.VITE_TORII_URL || "http://localhost:8080",
  manifest: {
    ...manifest,
    world: {
      ...manifest.world,
      address: import.meta.env.VITE_WORLD_ADDRESS || manifest.world.address
    }
  }
};

interface ExtendedAccount extends AccountInterface {
  provider?: RpcProvider;
  signer: any;
}

interface SystemInfo {
  tag: string;
  address: string;
  abi: any[];
  selector: string;
}

export const useDojo = () => {
  const rpcProvider = new RpcProvider({ nodeUrl: config.rpcUrl });
  const worldAddress = config.manifest.world.address;
  console.log("Usando World Address:", worldAddress);

  const getExecutableAccount = async (account: ExtendedAccount) => {
    try {
      console.log('Analizando cuenta recibida:', {
        type: typeof account,
        isAccount: account instanceof Account,
        properties: Object.keys(account),
        address: account.address,
        hasExecute: typeof account.execute === 'function',
        hasSigner: !!account.signer,
        methods: Object.getOwnPropertyNames(Object.getPrototypeOf(account))
      });

      // Si la cuenta ya es una instancia de Account y tiene todo lo necesario
      if (account instanceof Account && account.signer) {
        console.log('Usando cuenta existente');
        return account;
      }

      // Crear una nueva instancia de Account con los datos necesarios
      console.log('Creando nueva instancia de Account');
      const newAccount = new Account(
        rpcProvider,
        account.address,
        account.signer
      );

      console.log('Nueva cuenta creada:', {
        address: newAccount.address,
        hasExecute: typeof newAccount.execute === 'function',
        hasSigner: !!newAccount.signer,
        methods: Object.getOwnPropertyNames(Object.getPrototypeOf(newAccount))
      });

      return newAccount;
    } catch (error) {
      console.error('Error al obtener cuenta ejecutable:', error);
      throw error;
    }
  };

  const setup = async (account: ExtendedAccount) => {
    try {
      console.log('Iniciando setup con cuenta:', account);
      
      const executableAccount = await getExecutableAccount(account);
      console.log('Cuenta ejecutable obtenida:', executableAccount);

      // Asegurarse de que la cuenta tenga los métodos necesarios
      if (!executableAccount.execute || !executableAccount.signer) {
        throw new Error('La cuenta no tiene los métodos necesarios para ejecutar transacciones');
      }

      // Buscar el contrato battle_actions en el manifest
      const battleActionsContract = (manifest as any).contracts?.find((contract: any) => 
        contract.abi.some((item: any) => 
          item.type === "interface" && 
          item.name === "dojo_starter::systems::battle_actions::IBattleActions"
        )
      );

      if (!battleActionsContract) {
        throw new Error('No se encontró el contrato battle_actions en el manifest');
      }

      console.log('Contrato battle_actions encontrado:', battleActionsContract);

      // Obtener los modelos y eventos relacionados
      const models = (manifest as any).models?.filter((model: any) => 
        model.tag.startsWith("dojo_starter-")
      );

      const events = (manifest as any).events?.filter((event: any) => 
        event.tag.startsWith("dojo_starter-")
      );

      // Combinar todos los elementos del ABI
      const fullAbi = [
        ...battleActionsContract.abi,
        ...models.map((model: any) => ({
          type: "struct",
          name: model.tag,
          members: model.members || []
        })),
        ...events.map((event: any) => ({
          type: "event",
          name: event.tag,
          members: event.members || []
        }))
      ];

      console.log('ABI completo:', fullAbi);

      // Crear una nueva instancia del contrato con la cuenta
      const connectedContract = new Contract(
        fullAbi,
        battleActionsContract.address,
        executableAccount
      );

      console.log('Contrato conectado:', connectedContract);

      return {
        async createPlayer(stake: BigNumberish) {
          try {
            console.log('Creando jugador con stake:', stake);
            console.log('Usando cuenta:', executableAccount.address);
            console.log('Usando contrato:', battleActionsContract.address);
            
            const response = await connectedContract.invoke("create_player", [stake]);
            console.log('Respuesta de create_player:', response);
            return response;
          } catch (error) {
            console.error('Error al crear jugador:', error);
            throw error;
          }
        },

        async joinBattle(battleId: BigNumberish) {
          try {
            console.log('Uniéndose a batalla:', battleId);
            const response = await connectedContract.invoke("join_battle", [battleId]);
            console.log('Respuesta de join_battle:', response);
            return response;
          } catch (error) {
            console.error('Error al unirse a la batalla:', error);
            throw error;
          }
        },

        async performAction(battleId: BigNumberish, actionType: any, value: BigNumberish) {
          try {
            console.log('Realizando acción:', { battleId, actionType, value });
            const response = await connectedContract.invoke(
              "perform_action",
              [battleId, actionType, value]
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
      console.error('Error en setup:', error);
      throw error;
    }
  };

  return {
    setup,
    config
  };
}; 