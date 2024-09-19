import React, { useMemo } from 'react';
import { io } from 'socket.io-client';

const SocketContext = React.createContext(null);

export const useSocket = () => {
    return React.useContext(SocketContext);
};

export const SocketProvider = (props) => {
    const socket = useMemo(() => io(
        'http://localhost:8001'
    ),[])
    return (
        <SocketContext.Provider value={{socket}}>
            {props.children};
        </SocketContext.Provider>
    )
}

//The context ensures all react components can access the same socket instance.
//We need same socket for tasks like sending call invites, accepting/declining calls, and maintaining peer-to-peer communication.