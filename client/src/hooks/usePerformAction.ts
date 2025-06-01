import { useAccount } from '@starknet-react/core'
import { useCallback, useState, useEffect } from 'react'
import type { BigNumberish } from 'starknet'

const { VITE_BATTLE_CONTRACT_ADDRESS, VITE_TORII_URL } = import.meta.env;

// Types

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
    const [currentTurn] = useState<string | null>(null);
    const { account } = useAccount();

    const fetchPlayerHealth = async (address: string): Promise<number> => {
        try {
            console.log('🎮 Fetching health for player:', address);
            const response = await fetch(VITE_TORII_URL + "/graphql", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: `{ dojontdevPlayerModels(where: { player: "${address}" }) { edges { node { player health in_battle bet_amount } } } }`
                }),
            });

            const result = await response.json();
            console.log('🎮 Player health data:', result);
            
            const player = result.data?.dojontdevPlayerModels?.edges[0]?.node;
            if (!player) {
                console.error('🎮 No player data found');
                return -10;
            }

            const health = player.health;
            console.log('🎮 Player health value:', health);
            return health;
        } catch (error) {
            console.error("🎮 Error fetching player health:", error);
            return -10;
        }
    };

    const fetchBattleState = useCallback(async () => {
        if (!account) {
            console.log('🎮 No account connected');
            return;
        }

        try {
            console.log('🎮 Fetching battle state for ID:', battleId);
            setLoading(true);
            
            const query = BATTLE_QUERY.replace('BATTLE_ID', battleId.toString());
            const response = await fetch(VITE_TORII_URL + "/graphql", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query })
            });

            const result = await response.json();
            
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
                    status: battle.status
                });

                // Fetch health for both players
                const [player1Health, player2Health] = await Promise.all([
                    fetchPlayerHealth(battle.player1),
                    fetchPlayerHealth(battle.player2)
                ]);

                console.log('🎮 Players health updated:', {
                    player1: battle.player1,
                    player1Health,
                    player2: battle.player2,
                    player2Health
                });

                setBattleState(prev => ({
                    ...prev,
                    battle,
                    isMyTurn,
                    player1Health: player1Health >= 0 ? player1Health : prev.player1Health,
                    player2Health: player2Health >= 0 ? player2Health : prev.player2Health
                }));
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
            
            // Intentar actualizar inmediatamente y luego en intervalos cortos
            const maxAttempts = 10;
            let attempts = 0;

            const tryUpdate = async () => {
                if (attempts >= maxAttempts) {
                    console.log('🎮 Máximo de intentos de actualización alcanzado');
                    return;
                }

                attempts++;
                console.log(`🎮 Intento de actualización #${attempts}`);

                try {
                    // Obtener el estado actualizado de la batalla
                    const query = BATTLE_QUERY.replace('BATTLE_ID', battleId.toString());
                    const response = await fetch(VITE_TORII_URL + "/graphql", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ query })
                    });

                    const battleResult = await response.json();
                    const battle = battleResult.data?.dojontdevBattleModels?.edges[0]?.node;

                    if (battle) {
                        console.log('🎮 Updated battle state after action:', battle);
                        
                        // Obtener la vida actualizada de ambos jugadores
                        const [player1Health, player2Health] = await Promise.all([
                            fetchPlayerHealth(battle.player1),
                            fetchPlayerHealth(battle.player2)
                        ]);

                        console.log('🎮 Updated player health after action:', {
                            player1Health,
                            player2Health
                        });

                        // Verificar si los valores han cambiado
                        if (player1Health !== battleState.player1Health || 
                            player2Health !== battleState.player2Health) {
                            console.log('🎮 Cambios detectados en la vida de los jugadores');
                            setBattleState(prev => ({
                                ...prev,
                                battle,
                                isMyTurn: battle.current_turn === account.address,
                                player1Health: player1Health >= 0 ? player1Health : prev.player1Health,
                                player2Health: player2Health >= 0 ? player2Health : prev.player2Health
                            }));
                            return true; // Cambios detectados
                        }
                    }
                } catch (error) {
                    console.error('🎮 Error en intento de actualización:', error);
                }
                return false; // No se detectaron cambios
            };

            // Primer intento inmediato
            const updated = await tryUpdate();
            if (!updated) {
                // Si no hay cambios, intentar cada 500ms
                const updateInterval = setInterval(async () => {
                    const updated = await tryUpdate();
                    if (updated) {
                        clearInterval(updateInterval);
                    }
                }, 500);

                // Limpiar el intervalo después de maxAttempts * 500ms
                setTimeout(() => clearInterval(updateInterval), maxAttempts * 500);
            }

            return result;
        } catch (e) {
            console.error('🎮 Error performing action:', e);
            throw e;
        } finally {
            setSubmitted(false);
        }
    }, [account, battleId, battleState.isMyTurn, battleState.player1Health, battleState.player2Health, fetchPlayerHealth]);

    // Set up automatic refresh of battle state
    useEffect(() => {
        console.log('🎮 Setting up battle state refresh');
        fetchBattleState(); // Initial fetch
        
        const interval = setInterval(() => {
            console.log('🎮 Auto-refreshing battle state');
            fetchBattleState();
        }, 2000);
        
        return () => {
            console.log('🎮 Cleaning up battle state refresh');
            clearInterval(interval);
        };
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
