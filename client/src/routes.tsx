import { Routes, Route } from 'react-router-dom';
import App from './App';
import { BattleView } from './pages/BattleView';
import { BattleArena } from  './components/BattleArena';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/battleview" element={<BattleView />} />
      <Route path="/BattleArena/:battleId" element={<BattleArena />} />
    </Routes> 
  );
} 