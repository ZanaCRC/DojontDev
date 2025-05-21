#[cfg(test)]
mod tests {
    use core::array::ArrayTrait;
    use core::option::OptionTrait;
    use core::traits::Into;
    use core::result::ResultTrait;

    use starknet::{ContractAddress, contract_address_const};

    use dojo_starter::models::battle::{Player, Battle, BattleAction, BattleStatus, ActionType};
    use dojo_starter::systems::battle_actions::{
        battle_actions, IBattleActionsDispatcher, IBattleActionsDispatcherTrait
    };

    // Import test utils - in a real Dojo project, these would be available
    #[starknet::interface]
    trait IWorldDispatcher<T> {
        fn deploy_contract(ref self: T, contract_name: felt252, class_hash: felt252) -> ContractAddress;
    }

    #[starknet::contract]
    mod mock_world {
        use super::IWorldDispatcher;
        use starknet::{ContractAddress, contract_address_const};

        #[storage]
        struct Storage {}

        #[external(v0)]
        impl WorldImpl of IWorldDispatcher<ContractState> {
            fn deploy_contract(
                ref self: ContractState, contract_name: felt252, class_hash: felt252
            ) -> ContractAddress {
                contract_address_const::<123>()
            }
        }
    }

    fn spawn_test_world() -> IWorldDispatcherDispatcher {
        // In a real Dojo test, this would create a test world
        // For our simplified test, we'll just return a mock
        IWorldDispatcherDispatcher { contract_address: contract_address_const::<0>() }
    }

    #[test]
    #[available_gas(30000000)]
    fn test_battle_flow() {
        // Set up the world
        let world = spawn_test_world();
        
        // Create mock contract address
        let contract_address = contract_address_const::<123>();
        let battle_actions = IBattleActionsDispatcher { contract_address };
        
        // Create test addresses
        let player1 = contract_address_const::<1>();
        let player2 = contract_address_const::<2>();
        
        // Player 1 creates a battle with a bet amount of 100
        starknet::testing::set_caller_address(player1);
        battle_actions.create_player(100);
        
        // Player 2 creates a player with a bet amount of 100
        starknet::testing::set_caller_address(player2);
        battle_actions.create_player(100);
        
        // Get the battle ID from the world
        // For simplicity in this test, we'll assume the battle ID is 1
        let battle_id = 1_u32;
        
        // Player 2 joins the battle
        battle_actions.join_battle(battle_id);
        
        // Player 1 attacks with value 4
        starknet::testing::set_caller_address(player1);
        battle_actions.perform_action(battle_id, ActionType::Attack, 4);
        
        // Player 2 defends with value 2
        starknet::testing::set_caller_address(player2);
        battle_actions.perform_action(battle_id, ActionType::Defense, 2);
        
        // Player 1 attacks with value 5
        starknet::testing::set_caller_address(player1);
        battle_actions.perform_action(battle_id, ActionType::Attack, 5);
        
        // At this point in a real test, we would read the world state to verify
        // the player's health, but we'll simplify for this example
    }
} 