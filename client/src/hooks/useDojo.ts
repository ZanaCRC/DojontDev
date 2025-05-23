import { AccountInterface, RpcProvider, Contract, Account } from "starknet";
import type { BigNumberish, CairoCustomEnum } from "starknet";
import { setupWorld } from "../dojo/contracts.gen";
import manifest from "../json/manifest_dev.json";

// Configuración básica para desarrollo local
const config = {
  rpcUrl: import.meta.env.VITE_RPC_URL || "http://localhost:5050",
  toriiUrl: import.meta.env.VITE_TORII_URL || "http://localhost:8080",
  manifest
};

interface ExtendedAccount extends AccountInterface {
  provider?: RpcProvider;
}

export const useDojo = () => {
  const rpcProvider = new RpcProvider({ nodeUrl: config.rpcUrl });
  const worldAddress = config.manifest.world.address;
  const contract = new Contract(config.manifest.world.abi, worldAddress, rpcProvider);

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

      // Si tiene signer, siempre crear una nueva instancia de Account
      if (account.signer) {
        console.log('Creando nueva instancia de Account con signer');
        try {
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
          console.error('Error al crear nueva cuenta:', error);
          throw error;
        }
      }

      // Si tiene execute, intentar usarlo directamente
      if (typeof account.execute === 'function') {
        console.log('Usando cuenta con execute directamente');
        return account;
      }

      // Si la cuenta es una instancia de Account
      if (account instanceof Account) {
        console.log('Cuenta es instancia de Account');
        const extendedAccount = account as ExtendedAccount;
        if (!extendedAccount.provider) {
          console.log('Añadiendo provider a la cuenta');
          extendedAccount.provider = rpcProvider;
        }
        return extendedAccount;
      }

      console.error('Cuenta inválida:', {
        address: account.address,
        hasExecute: typeof account.execute === 'function',
        hasSigner: !!account.signer,
        methods: Object.getOwnPropertyNames(Object.getPrototypeOf(account))
      });

      throw new Error('La cuenta proporcionada no es válida para ejecutar transacciones');
    } catch (error) {
      console.error('Error al obtener cuenta ejecutable:', error);
      throw error;
    }
  };

  const worldContract = setupWorld({
    provider: rpcProvider,
    manifest: config.manifest,
    contract,
    logger: console,
    entity: async () => Promise.resolve([BigInt(0)]),
    entities: async () => Promise.resolve([]),
    execute: async (account: ExtendedAccount, call: any, systemName: string) => {
      try {
        // Obtener una cuenta ejecutable
        const executableAccount = await getExecutableAccount(account);
        
        console.log('Ejecutando llamada con cuenta:', {
          address: executableAccount.address,
          hasExecute: typeof executableAccount.execute === 'function',
          hasSigner: !!executableAccount.signer,
          call,
          systemName
        });

        // Preparar la llamada
        const callArray = [{
          contractAddress: worldAddress,
          entrypoint: call.entrypoint,
          calldata: call.calldata
        }];

        if (!executableAccount.execute) {
          throw new Error('La cuenta no tiene método execute');
        }

        const result = await executableAccount.execute(callArray);
        console.log(`Executed ${systemName} call:`, result);
        return result;

      } catch (error) {
        console.error(`Error executing ${systemName} call:`, error);
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
        }
        throw error;
      }
    }
  } as any);

  return {
    config,
    setup: (account: ExtendedAccount) => ({
      createPlayer: async (betAmount: BigNumberish) => {
        console.log("Creando jugador con apuesta:", betAmount, "usando cuenta:", {
          address: account.address,
          hasExecute: typeof account.execute === 'function',
          hasSigner: !!account.signer,
          methods: Object.getOwnPropertyNames(Object.getPrototypeOf(account))
        });
        return await worldContract.battle_actions.createPlayer(account, betAmount);
      },
      joinBattle: async (battleId: BigNumberish) => {
        console.log("Uniéndose a la batalla:", battleId, "usando cuenta:", {
          address: account.address,
          hasExecute: typeof account.execute === 'function',
          hasSigner: !!account.signer,
          methods: Object.getOwnPropertyNames(Object.getPrototypeOf(account))
        });
        return await worldContract.battle_actions.joinBattle(account, battleId);
      },
      performAction: async (battleId: BigNumberish, actionType: CairoCustomEnum, value: BigNumberish) => {
        console.log("Realizando acción en batalla:", battleId, "tipo:", actionType, "valor:", value, "usando cuenta:", {
          address: account.address,
          hasExecute: typeof account.execute === 'function',
          hasSigner: !!account.signer,
          methods: Object.getOwnPropertyNames(Object.getPrototypeOf(account))
        });
        return await worldContract.battle_actions.performAction(account, battleId, actionType, value);
      }
    })
  };
}; 