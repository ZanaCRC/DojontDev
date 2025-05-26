import { Routes, Route } from 'react-router-dom';
import App from './App';
import { BattleView } from './pages/BattleView';
import { BattleArena } from  './components/BattleArena';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/battleview" element={<BattleView />} />
      <Route path="/BattleArena" 
        element={
          <BattleArena
            player1Health={100}
            player2Health={100}
            isMyTurn={true}
            onAttack={() => console.log("Ataque!")}
            battleId="0001"
          />
        } />
    </Routes>
  );
} 