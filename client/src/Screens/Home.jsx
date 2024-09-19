import React, { useState, useEffect, useCallback } from 'react'
import { useSocket } from '../Contexts/Socket.jsx';
import { useNavigate } from 'react-router-dom';

function Home() {

  const { socket } = useSocket();
  const navigate = useNavigate();
  const [ email,setEmail ] = useState('');
  const [ roomId,setRoomId ] = useState('');

  const handleRoomJoined = useCallback(({roomId}) => {
    navigate(`/room/${roomId}`);
  }, [ navigate ]);

  useEffect(() => {
    socket.on('joined-room', handleRoomJoined);

    return () => {
      socket.off('joined-room', handleRoomJoined);
    };

  }, [ handleRoomJoined, socket ]);

  const handleJoinRoom = ({}) => {
    socket.emit('join-room', { emailId: email, roomId});  
  }

  return (
    <div className='homepage-container'>
        <div className='input-container'>
            <h3>Lobby</h3>
            <input value={email}
              type='email' 
              placeholder='Enter your email here' 
              onChange={e => setEmail(e.target.value)}
            />
            <input value={roomId} 
              type='text' 
              placeholder='Enter Room Code' 
              onChange={e => setRoomId(e.target.value)}
            />
            <button onClick={ handleJoinRoom }>Enter Room</button>
        </div>
    </div>
  )
}

export default Home