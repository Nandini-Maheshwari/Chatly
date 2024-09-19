import { Routes, Route } from 'react-router-dom';
import Home from './Screens/Home.jsx';
import Room from './Screens/Room.jsx';
import './App.css';

import { SocketProvider } from './Contexts/Socket.jsx';
import { PeerProvider } from './Contexts/Peer.jsx';

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
 