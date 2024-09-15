import React, { useCallback, useEffect, useState } from 'react'
import ReactPlayer from 'react-player';
import { useSocket } from '../Providers/Socket.jsx';
import { usePeer } from '../Providers/Peer.jsx';

function Room() {

    const { socket } = useSocket();
    const { peer, createOffer, createAnswer, setRemoteAns, sendStream, remoteStream } = usePeer();

    const [ myStream, setMyStream ] = useState(null);
    const [ remoteEmailId, setRemoteEmailId ] = useState();
    
    const handleNewUserJoined = useCallback(async (data) => {
        const { emailId } = data;
        console.log(`New user joined room ${emailId}`);
        const offer = await createOffer();
        socket.emit('call-user', { emailId, offer });
        setRemoteEmailId(emailId);
    }, [ createOffer, socket ]);

    const handleIncomingCall = useCallback(async (data) => {
        const { from, offer } = data;
        console.log('Incoming Call from', from, offer);
        const ans = await createAnswer(offer);
        socket.emit('call-accepted', { emailId: from, ans });
        setRemoteEmailId(from);
    }, [ createAnswer, socket ]);

    const handleCallAccepted = useCallback(async (data) => {
        const { ans } = data;
        console.log(`Call got accepted ${ans}`);
        await setRemoteAns(ans);
    }, [ setRemoteAns ]);

    const getUserMediaStream = useCallback( async () => {
        const stream = await navigator.mediaDevices.getUserMedia(
            { 
                audio: true, 
                video: true 
            }
        );
        setMyStream(stream);
    }, [ sendStream ]);

    const handleNegotiation = useCallback(() => {
        const localOffer = peer.localDescription;
        socket.emit('call-user', { emailId: remoteEmailId, offer: localOffer });
    }, [ peer, remoteEmailId, socket ]);

    useEffect(() => {
        socket.on('user-joined', handleNewUserJoined);
        socket.on('incoming-call, handleIncomingCall');
        socket.on('call-accepted', handleCallAccepted);

        return () => {
            socket.off('user-joined', handleNewUserJoined);
            socket.off('incoming-call', handleIncomingCall);
            socket.off('call-accepted', handleCallAccepted);
        };

    }, [ handleNewUserJoined, handleIncomingCall, handleCallAccepted, socket ]);

    useEffect(() => {
        peer.addEventListener('negotiationneeded', handleNegotiation);
        return () => {
            peer.removeEventListener('negotiationneeded', handleNegotiation);
        }
    }, [ handleNegotiation ]);

    useEffect(() => {
        getUserMediaStream();
    }, [ getUserMediaStream ]);

    return (
        <div className='room-page-container'>
            <h3>Lobby</h3>
            <h4>You are connected to {remoteEmailId}</h4>
            <button onClick={e => sendStream(myStream)} >Send My Video</button>
            <ReactPlayer url={myStream} playing muted />
            <ReactPlayer url={remoteStream} playing />
        </div>
    )
}

export default Room