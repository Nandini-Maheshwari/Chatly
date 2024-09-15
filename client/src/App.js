import { Routes, Route } from 'react-router-dom';
import Home from './Pages/Home.jsx';
import Room from './Pages/Room.jsx';
import './App.css';

import { SocketProvider } from './Providers/Socket.jsx';
import { PeerProvider } from './Providers/Peer.jsx';

function App() {
  return (
    <div className='App'>
      <PeerProvider>
        <SocketProvider>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/room/:romId' element={<Room />} />
          </Routes>
        </SocketProvider>
      </PeerProvider>
    </div>
  );
}

export default App;
 