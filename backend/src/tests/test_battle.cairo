#[cfg(test)]
mod tests {
    use core::option::OptionTrait;
    use starknet::{ContractAddress, contract_address_const};
    use dojo_starter::models::battle::{Player, Battle, BattleAction, BattleStatus, ActionType};

    // Test de modelos y estructuras
    #[test]
    #[available_gas(100000)]
    fn test_player_model() {
        // Crear un jugador
        let player_address = contract_address_const::<1>();
        let player = Player {
            player: player_address,
            health: 100,
            bet_amount: 50,
            in_battle: false,
        };
        
        // Verificar valores
        assert(player.player == player_address, 'Direccion incorrecta');
        assert(player.health == 100, 'Salud incorrecta');
        assert(player.bet_amount == 50, 'Apuesta incorrecta');
        assert(player.in_battle == false, 'Estado de batalla incorrecto');
    }

    #[test]
    #[available_gas(100000)]
    fn test_battle_model() {
        // Crear direcciones para la prueba
        let player1_address = contract_address_const::<1>();
        let player2_address = contract_address_const::<2>();
        
        // Crear batalla
        let battle = Battle {
            battle_id: 123,
            player1: player1_address,
            player2: player2_address,
            current_turn: player1_address,
            status: BattleStatus::InProgress,
            winner: Option::None,
        };
        
        // Verificar valores
        assert(battle.battle_id == 123, 'ID incorrecto');
        assert(battle.player1 == player1_address, 'Jugador 1 incorrecto');
        assert(battle.player2 == player2_address, 'Jugador 2 incorrecto');
        assert(battle.current_turn == player1_address, 'Turno incorrecto');
        assert(battle.status == BattleStatus::InProgress, 'Estado incorrecto');
        assert(battle.winner.is_none(), 'Ganador deberia ser None');
    }

    #[test]
    #[available_gas(100000)]
    fn test_battle_action_model() {
        // Crear acción
        let player_address = contract_address_const::<1>();
        let action = BattleAction {
            battle_id: 123,
            player: player_address,
            action_type: ActionType::Attack,
            value: 4,
            turn: 1,
        };
        
        // Verificar valores
        assert(action.battle_id == 123, 'ID de batalla incorrecto');
        assert(action.player == player_address, 'Jugador incorrecto');
        assert(action.action_type == ActionType::Attack, 'Tipo de accion incorrecto');
        assert(action.value == 4, 'Valor incorrecto');
        assert(action.turn == 1, 'Turno incorrecto');
    }
    
    #[test]
    #[available_gas(100000)]
    fn test_battle_status_enum() {
        // Verificar valores de enumeración
        assert(BattleStatus::Waiting != BattleStatus::InProgress, 'Estados iguales');
        assert(BattleStatus::InProgress != BattleStatus::Completed, 'Estados iguales');
        assert(BattleStatus::Waiting != BattleStatus::Completed, 'Estados iguales');
    }
    
    #[test]
    #[available_gas(100000)]
    fn test_action_type_enum() {
        // Verificar valores de enumeración
        assert(ActionType::Attack != ActionType::Defense, 'Tipos iguales');
    }
} 