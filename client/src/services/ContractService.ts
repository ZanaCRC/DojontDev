import { Contract } from 'starknet';
import type { Abi } from 'starknet';
import BattleAbi from '../abi/Battle.json';
import TurnBattlesAbi from '../abi/TurnBattles.json';

export class ContractService {
  private provider: any;
  private account: any | null;
  private battleContract: Contract;
  private turnBattlesContract: Contract;

  constructor(provider: any, account: any | null = null) {
    this.provider = provider;
    this.account = account;
    
    // Inicializar contratos con sus direcciones correspondientes
    this.battleContract = new Contract(
      BattleAbi as Abi,
      import.meta.env.VITE_BATTLE_CONTRACT_ADDRESS,
      provider
    );

    this.turnBattlesContract = new Contract(
      TurnBattlesAbi as Abi,
      import.meta.env.VITE_TURN_BATTLES_CONTRACT_ADDRESS,
      provider
    );
  }

  // Método para iniciar una batalla
  async startBattle(opponent: string) {
    if (!this.account) throw new Error('No wallet connected');
    
    return await this.battleContract.invoke('start_battle', [opponent]);
  }

  // Método para obtener el estado de una batalla
  async getBattleState(battleId: string) {
    return await this.battleContract.call('get_battle_state', [battleId]);
  }

  // Método para realizar un turno
  async makeTurn(battleId: string, move: number) {
    if (!this.account) throw new Error('No wallet connected');
    
    return await this.turnBattlesContract.invoke('make_turn', [battleId, move]);
  }

  // Método para conectar una wallet
  setAccount(account: any) {
    this.account = account;
    this.battleContract.connect(account);
    this.turnBattlesContract.connect(account);
  }
}

export default ContractService; 