use starknet::ContractAddress;
use dojo::meta::introspect::Introspect;

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Player {
    #[key]
    pub player: ContractAddress,
    pub health: u8,
    pub bet_amount: u128,
    pub in_battle: bool,
}

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Battle {
    #[key]
    pub battle_id: u32,
    pub player1: ContractAddress,
    pub player2: ContractAddress,
    pub current_turn: ContractAddress,
    pub status: BattleStatus,
    pub winner: Option<ContractAddress>,
}

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct BattleRegistry {
    #[key]
    pub id: felt252, // Always 0, singleton
    pub total_battles: u32,
    pub last_battle_id: u32,
}

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct BattleAction {
    #[key]
    pub battle_id: u32,
    #[key]
    pub player: ContractAddress,
    pub action_type: ActionType,
    pub value: u8,
    pub turn: u32,
}

#[derive(Serde, Copy, Drop, PartialEq, Debug, Introspect)]
pub enum BattleStatus {
    Waiting,
    InProgress,
    Completed,
}

#[derive(Serde, Copy, Drop, PartialEq, Debug, Introspect)]
pub enum ActionType {
    Attack,
    Defense,
}

impl BattleStatusIntoFelt252 of Into<BattleStatus, felt252> {
    fn into(self: BattleStatus) -> felt252 {
        match self {
            BattleStatus::Waiting => 0,
            BattleStatus::InProgress => 1,
            BattleStatus::Completed => 2,
        }
    }
}

impl ActionTypeIntoFelt252 of Into<ActionType, felt252> {
    fn into(self: ActionType) -> felt252 {
        match self {
            ActionType::Attack => 0,
            ActionType::Defense => 1,
        }
    }
} 