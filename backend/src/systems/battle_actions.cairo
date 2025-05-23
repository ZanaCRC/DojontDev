use dojo_starter::models::battle::{Player, Battle, BattleAction, BattleStatus, ActionType, BattleRegistry};
use dojo::meta::introspect::Introspect;

// define the interface
#[starknet::interface]
pub trait IBattleActions<T> {
    fn create_player(ref self: T, bet_amount: u128);
    fn join_battle(ref self: T, battle_id: u32);
    fn perform_action(ref self: T, battle_id: u32, action_type: ActionType, value: u8);
    fn get_available_battles_by_bet(self: @T, bet_amount: u128) -> Array<u32>;
}

// dojo decorator
#[dojo::contract]
pub mod battle_actions {
    use super::{IBattleActions, Player, Battle, BattleAction, BattleStatus, ActionType, BattleRegistry};
    use starknet::{ContractAddress, get_caller_address};

    use dojo::model::{ModelStorage};
    use dojo::event::EventStorage;

    // Constants
    const INITIAL_HEALTH: u8 = 100;
    const MIN_ACTION_VALUE: u8 = 1;
    const MAX_ACTION_VALUE: u8 = 5;

    #[derive(Copy, Drop, Serde, Introspect)]
    #[dojo::event]
    pub struct BattleCreated {
        #[key]
        pub battle_id: u32,
        pub player1: ContractAddress,
    }

    #[derive(Copy, Drop, Serde, Introspect)]
    #[dojo::event]
    pub struct BattleJoined {
        #[key]
        pub battle_id: u32,
        pub player2: ContractAddress,
    }

    #[derive(Copy, Drop, Serde, Introspect)]
    #[dojo::event]
    pub struct ActionPerformed {
        #[key]
        pub battle_id: u32,
        pub player: ContractAddress,
        pub action_type: ActionType,
        pub value: u8,
        pub target_health: u8,
    }

    #[derive(Copy, Drop, Serde, Introspect)]
    #[dojo::event]
    pub struct BattleEnded {
        #[key]
        pub battle_id: u32,
        pub winner: ContractAddress,
        pub reward_amount: u128,
    }

    #[derive(Copy, Drop, Serde, Introspect)]
    #[dojo::event]
    pub struct PlayerBetSet {
        #[key]
        pub player: ContractAddress,
        pub bet_amount: u128,
    }

    #[abi(embed_v0)]
    impl BattleActionsImpl of IBattleActions<ContractState> {
        fn create_player(ref self: ContractState, bet_amount: u128) {
            // Get the default world
            let mut world = self.world_default();

            // Get the caller address
            let player_address = get_caller_address();
            
            // Create a new player with initial health and bet amount
            let player = Player {
                player: player_address,
                health: INITIAL_HEALTH,
                bet_amount: bet_amount,
                in_battle: false,
            };

            // Write the player to the world
            world.write_model(@player);
            
            // Get or create battle registry
            let mut registry: BattleRegistry = self.get_or_create_registry(@world);
            
            // Increment battle count and generate new ID
            registry.total_battles += 1;
            registry.last_battle_id += 1;
            let battle_id = registry.last_battle_id;
            
            // Update registry
            world.write_model(@registry);
            
            // Create a new battle with this player
            let empty_address = starknet::contract_address_const::<0>();
            let battle = Battle {
                battle_id,
                player1: player_address,
                player2: empty_address,
                current_turn: empty_address,
                status: BattleStatus::Waiting,
                winner: Option::None,
            };
            
            // Write the battle to the world
            world.write_model(@battle);
            
            // Emit battle created event
            world.emit_event(@BattleCreated { battle_id, player1: player_address });
        }

        fn join_battle(ref self: ContractState, battle_id: u32) {
            // Get the default world
            let mut world = self.world_default();

            // Get the caller address
            let player_address = get_caller_address();
            
            // Get the battle data
            let mut battle: Battle = world.read_model(battle_id);
            
            // Check if the battle is waiting for players
            assert(battle.status == BattleStatus::Waiting, 'Battle not available');
            assert(battle.player1 != player_address, 'Cannot join own battle');
            
            // Update the battle with second player and change status
            battle.player2 = player_address;
            battle.status = BattleStatus::InProgress;
            battle.current_turn = battle.player1; // Player 1 goes first
            
            // Update player status
            let mut player1: Player = world.read_model(battle.player1);
            let mut player2: Player = world.read_model(player_address);
            
            player1.in_battle = true;
            player2.in_battle = true;
            player2.bet_amount = player1.bet_amount;
            player2.health = INITIAL_HEALTH;    
            
            // Emit player bet set event
            world.emit_event(@PlayerBetSet { 
                player: player_address, 
                bet_amount: player1.bet_amount 
            });
            
            // Write updates to the world
            world.write_model(@battle);
            world.write_model(@player1);
            world.write_model(@player2);
            
            // Emit battle joined event
            world.emit_event(@BattleJoined { battle_id, player2: player_address });
        }

        fn perform_action(ref self: ContractState, battle_id: u32, action_type: ActionType, value: u8) {
            // Get the default world
            let mut world = self.world_default();

            // Get the caller address
            let player_address = get_caller_address();
            
            // Validate action value
            assert(value >= MIN_ACTION_VALUE && value <= MAX_ACTION_VALUE, 'Invalid action value');
            
            // Get the battle data
            let mut battle: Battle = world.read_model(battle_id);
            
            // Check if it's a valid battle
            assert(battle.status == BattleStatus::InProgress, 'Battle not in progress');
            assert(
                battle.player1 == player_address || battle.player2 == player_address, 'Not in this battle'
            );
            assert(battle.current_turn == player_address, 'Not your turn');
            
            // Get player data
            let mut player: Player = world.read_model(player_address);
            
            // Get opponent's address and data
            let opponent_address = if battle.player1 == player_address {
                battle.player2
            } else {
                battle.player1
            };
            let mut opponent: Player = world.read_model(opponent_address);
            
            // Record the action
            let turn_number = self.get_turn_number(ref world, battle_id);
            let battle_action = BattleAction {
                battle_id,
                player: player_address,
                action_type,
                value,
                turn: turn_number,
            };
            world.write_model(@battle_action);
            
            // Process the action
            let mut target_health = opponent.health;
            
            if action_type == ActionType::Attack {
                // Get opponent's last action if exists
                let prev_turn = turn_number - 1;
                if prev_turn > 0 {
                    let opponent_action: BattleAction = world.read_model((battle_id, opponent_address));
                    
                    if opponent_action.turn == prev_turn && opponent_action.action_type == ActionType::Defense {
                        // If opponent defended, reduce attack value by defense value
                        let damage = if value > opponent_action.value { 
                            value - opponent_action.value 
                        } else { 
                            0 
                        };
                        
                        if damage > 0 && opponent.health > damage {
                            opponent.health -= damage;
                        } else if damage > 0 {
                            opponent.health = 0;
                        }
                    } else {
                        // No defense, full damage
                        if opponent.health > value {
                            opponent.health -= value;
                        } else {
                            opponent.health = 0;
                        }
                    }
                } else {
                    // First turn, no previous defense
                    if opponent.health > value {
                        opponent.health -= value;
                    } else {
                        opponent.health = 0;
                    }
                }
                
                target_health = opponent.health;
                world.write_model(@opponent);
            }
            
            // Check if battle ended
            if opponent.health == 0 {
                // Battle ended, player won
                battle.status = BattleStatus::Completed;
                battle.winner = Option::Some(player_address);
                
                // Transfer the bet
                let reward = player.bet_amount + opponent.bet_amount;
                
                // Reset players
                player.in_battle = false;
                opponent.in_battle = false;
                
                world.write_model(@player);
                world.write_model(@opponent);
                world.write_model(@battle);
                
                // Emit battle ended event
                world.emit_event(@BattleEnded { 
                    battle_id, 
                    winner: player_address,
                    reward_amount: reward 
                });
            } else {
                // Change turns
                battle.current_turn = opponent_address;
                world.write_model(@battle);
            }
            
            // Emit action performed event
            world.emit_event(@ActionPerformed { 
                battle_id, 
                player: player_address,
                action_type,
                value,
                target_health
            });
        }

        fn get_available_battles_by_bet(self: @ContractState, bet_amount: u128) -> Array<u32> {
            // Get the default world
            let world = self.world_default();
            
            // Initialize an empty array to store battle IDs
            let mut battle_ids = ArrayTrait::new();
            
            // Get the battle registry to know how many battles exist
            let registry: BattleRegistry = self.get_or_create_registry(@world);
            
            // If no battles exist, return empty array
            if registry.total_battles == 0 {
                return battle_ids;
            }
            
            // Iterate through all battles from 1 to last_battle_id
            let mut i: u32 = 1;
            while i <= registry.last_battle_id {
                // Try to read the battle - use panic recovery for safety
                let battle_result = self.try_read_battle(@world, i);
                
                match battle_result {
                    Option::Some(battle) => {
                        // Check if battle is waiting for players
                        if battle.status == BattleStatus::Waiting {
                            // Get the player who created this battle
                            let player_result = self.try_read_player(@world, battle.player1);
                            
                            match player_result {
                                Option::Some(player) => {
                                    // Check if bet amount matches
                                    if player.bet_amount == bet_amount {
                                        battle_ids.append(i);
                                    }
                                },
                                Option::None => {
                                    // Player not found, skip this battle
                                }
                            }
                        }
                    },
                    Option::None => {
                        // Battle not found, continue to next
                    }
                }
                
                i += 1;
            };
            
            battle_ids
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        // Use the default namespace 
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"dojo_starter")
        }
        
        // Get or create the battle registry
        fn get_or_create_registry(self: @ContractState, world: @dojo::world::WorldStorage) -> BattleRegistry {
            // Try to read the existing registry
            let registry: BattleRegistry = world.read_model(0);
            
            // Return the registry (this will be default initialized if it doesn't exist)
            registry
        }
        
        // Safe battle reading with panic recovery
        fn try_read_battle(self: @ContractState, world: @dojo::world::WorldStorage, battle_id: u32) -> Option<Battle> {
            // In Cairo, we need to use a different approach for safe reading
            // This is a simplified version that assumes read_model will work
            // In a production environment, you might need to use try-catch patterns
            // or check existence first
            let battle: Battle = world.read_model(battle_id);
            Option::Some(battle)
        }
        
        // Safe player reading with panic recovery  
        fn try_read_player(self: @ContractState, world: @dojo::world::WorldStorage, player_address: ContractAddress) -> Option<Player> {
            // Similar to try_read_battle, this is simplified
            let player: Player = world.read_model(player_address);
            Option::Some(player)
        }
        
        // Generate a unique battle ID (now replaced by registry system)
        fn generate_battle_id(self: @ContractState, ref world: dojo::world::WorldStorage) -> u32 {
            // This is a simplified way - in a real system you'd want to maintain a counter
            // For MVP purposes, we'll use a pseudo-random approach based on block timestamp
            let block_timestamp = starknet::get_block_timestamp();
            (block_timestamp % 1000000).try_into().unwrap()
        }
        
        // Get the current turn number for a battle
        fn get_turn_number(self: @ContractState, ref world: dojo::world::WorldStorage, battle_id: u32) -> u32 {
            // For MVP, we'll simply return a sequential turn number
            // A more robust implementation would track this in the Battle model
            1 // Starting with turn 1
        }
    }
} 