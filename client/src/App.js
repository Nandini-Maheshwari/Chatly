import { Routes, Route } from 'react-router-dom';
import Home from './Pages/Home.jsx';
import './App.css';

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
