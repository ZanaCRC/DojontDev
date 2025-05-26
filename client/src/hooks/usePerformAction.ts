import { useAccount } from '@starknet-react/core'
import { useCallback, useState, useEffect } from 'react'
import type { BigNumberish } from 'starknet'

const { VITE_BATTLE_CONTRACT_ADDRESS, VITE_TORII_URL } = import.meta.env;

// Types
interface PlayerNode {
  player: string;
  health: number;
  in_battle: number;
  bet_amount: string;
}

interface BattleNode {
  battle_id: number;
  player1: string;
  player2: string;
  current_turn: string;
  status: string;
  bet: string;
}

interface BattleState {
  battle: BattleNode | null;
  player1Health: number;
  player2Health: number;
  isMyTurn: boolean;
}

interface UsePerformActionProps {
    battleId: string | number;
}

const BATTLE_QUERY = `
  query {
    dojontdevBattleModels(first: 1, where: { battle_id: BATTLE_ID }) {
      edges {
        node {
          battle_id
          player1
          player2
          current_turn
          status
          bet
        }
      }
    }
  }
`;

const PLAYER_QUERY = `
  query GetPlayer($playerAddress: String!) {
    dojontdevPlayerModels(where: { player: { eq: $playerAddress } }) {
      edges {
        node {
          player
          health
          in_battle
          bet_amount
        }
      }
    }
  }
`;

export const usePerformAction = ({ battleId }: UsePerformActionProps) => {
    const [battleState, setBattleState] = useState<BattleState>({
        battle: null,
        player1Health: 100,
        player2Health: 100,
        isMyTurn: false
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [txnHash, setTxnHash] = useState<string>();
    const [currentTurn, setCurrentTurn] = useState<string | null>(null);
    const { account } = useAccount();

    const fetchBattleState = useCallback(async () => {
        if (!account) {
            console.log('🎮 No account connected');
            return;
        }

        try {
            console.log('🎮 Fetching battle state for ID:', battleId);
            setLoading(true);
            
            // Construir la consulta con el ID específico
            const query = BATTLE_QUERY.replace('BATTLE_ID', battleId.toString());
            
            const queryBody = {
                query
            };
            console.log('🎮 Query body:', JSON.stringify(queryBody, null, 2));

            const response = await fetch(VITE_TORII_URL + "/graphql", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(queryBody)
            });

            const result = await response.json();
            console.log('🎮 Battle query result:', JSON.stringify(result, null, 2));

            if (result.errors) {
                console.error('🎮 GraphQL Errors:', result.errors);
                return;
            }

            const battle = result.data?.dojontdevBattleModels?.edges[0]?.node;
            if (battle) {
                const isMyTurn = battle.current_turn === account.address;
                
                console.log('🎮 Battle state:', {
                    id: battle.battle_id,
                    player1: battle.player1,
                    player2: battle.player2,
                    currentTurn: battle.current_turn,
                    myAddress: account.address,
                    isMyTurn,
                    status: battle.status,
                    bet: battle.bet
                });

                // Fetch health for both players
                const [player1Health, player2Health] = await Promise.all([
                    fetchPlayerHealth(battle.player1),
                    fetchPlayerHealth(battle.player2)
                ]);

                console.log('🎮 Players health:', {
                    player1Health,
                    player2Health
                });

                setBattleState(prev => ({
                    ...prev,
                    battle,
                    isMyTurn,
                    player1Health: player1Health >= 0 ? player1Health : prev.player1Health,
                    player2Health: player2Health >= 0 ? player2Health : prev.player2Health
                }));
            } else {
                console.log('🎮 No battle found for ID:', battleId);
            }
        } catch (error) {
            console.error('🎮 Error fetching battle state:', error);
        } finally {
            setLoading(false);
        }
    }, [battleId, account]);

    const isMyTurn = useCallback(() => {
        return battleState.isMyTurn;
    }, [battleState.isMyTurn]);

    const fetchPlayerHealth = async (address: string): Promise<number> => {
        try {
            console.log('🎮 Fetching health for player:', address);
            const response = await fetch(VITE_TORII_URL + "/graphql", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: PLAYER_QUERY,
                    variables: { playerAddress: address }
                }),
            });

            const result = await response.json();
            console.log('🎮 Player data:', result);
            const player = result.data?.dojontdevPlayerModels?.edges[0]?.node;
            const health = player?.health ?? -10;
            console.log('🎮 Player health:', health);
            return health;
        } catch (error) {
            console.error("🎮 Error fetching player health:", error);
            return -10;
        }
    };

    const performAction = useCallback(async (actionType: BigNumberish, attackValue: BigNumberish) => {
        if (!account) {
            console.log('🎮 No account connected for action');
            return;
        }
        
        if (!battleState.isMyTurn) {
            console.log('🎮 Not your turn!');
            return;
        }

        console.log('🎮 Performing action:', {
            battleId,
            actionType,
            attackValue,
            playerAddress: account.address
        });

        if (actionType === 0 && (Number(attackValue) < 1 || Number(attackValue) > 5)) {
            console.error('🎮 Invalid attack value:', attackValue);
            throw new Error('Attack value must be between 1 and 5');
        }

        setSubmitted(true);
        setTxnHash(undefined);
        try {
            console.log('🎮 Executing contract call...');
            const result = await account.execute([{
                contractAddress: VITE_BATTLE_CONTRACT_ADDRESS,
                entrypoint: 'perform_action',
                calldata: [battleId, actionType, attackValue],
            }]);
            console.log('🎮 Action executed successfully:', result);
            setTxnHash(result.transaction_hash);
            
            // Esperar un momento para que la transacción se procese
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Actualizar el estado después de la acción
            await fetchBattleState();
            return result;
        } catch (e) {
            console.error('🎮 Error performing action:', e);
            throw e;
        } finally {
            setSubmitted(false);
        }
    }, [account, battleId, battleState.isMyTurn, fetchBattleState]);

    // Set up automatic refresh of battle state
    useEffect(() => {
        fetchBattleState();
        const interval = setInterval(fetchBattleState, 5000);
        return () => clearInterval(interval);
    }, [fetchBattleState]);

    return {
        battleState,
        loading,
        submitted,
        txnHash,
        performAction,
        refreshBattleState: fetchBattleState,
        isMyTurn,
        currentTurn
    };
};
