import React, { useCallback, useEffect, useState } from 'react'
import ReactPlayer from 'react-player';
import { useSocket } from '../Contexts/Socket.jsx';
import { usePeer } from '../Contexts/Peer.jsx';

function Room() {

    const { socket } = useSocket();
    const { peer, createOffer, createAnswer, setRemoteAns, sendStream, remoteStream } = usePeer();

    const [ myStream, setMyStream ] = useState(null);
    const [ remoteEmailId, setRemoteEmailId ] = useState();
    
    const handleNewUserJoined = useCallback(async (data) => {
        const { emailId } = data;
        console.log(`New user joined room ${emailId}`);
        const offer = await createOffer();
        console.log('Emitting call-user with offer', offer);
        socket.emit('call-user', { emailId, offer });
        // if (socket.connected) {
        //     console.log('Socket is connected');
        //     socket.emit('call-user', { emailId, offer });
        //     console.log('call-user event emitted');
        // } else {
        //     console.log('Socket is not connected');
        // }
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
        console.log('Call got accepted', ans);
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

    const handleNegotiation = useCallback(async () => {
        try {
            if (!peer.localDescription || peer.signalingState === "stable") {
                const offer = await peer.createOffer();
                await peer.setLocalDescription(offer);
                socket.emit('call-user', { emailId: remoteEmailId, offer });
            }
        } catch (error) {
            console.error('Error during renegotiation:', error);
        }
    }, [ peer, remoteEmailId, socket ]);    

    useEffect(() => {
        socket.on('user-joined', handleNewUserJoined);
        socket.on('incoming-call', handleIncomingCall);
        socket.on('call-accepted', handleCallAccepted);

        return () => {
            socket.off('user-joined', handleNewUserJoined);
            socket.off('incoming-call', handleIncomingCall);
            socket.off('call-accepted', handleCallAccepted);
        };

    }, [ handleNewUserJoined, handleIncomingCall, handleCallAccepted, socket ]);

    //After the initial offer/answer exchange, if there are changes in the media streams 
    //WebRTC will automatically fire the negotiationneeded event.
    useEffect(() => {
        peer.addEventListener('negotiationneeded', handleNegotiation);
        return () => {
            peer.removeEventListener('negotiationneeded', handleNegotiation);
        }
    }, [ handleNegotiation ]);

    useEffect(() => {
        getUserMediaStream();
    }, [ getUserMediaStream ]);

    useEffect(() => {
        if (myStream) {
            sendStream(myStream);
        }
    }, [myStream, sendStream]);

    return (
        <div className='room-page-container'>
            <h3>Room</h3>
            <h4>You are connected to {remoteEmailId}</h4>
            <button onClick={e => sendStream(myStream)} >Send My Video</button>
            <video 
                playsInline 
                muted 
                ref={(video) => { 
                    if (video && myStream) {
                        video.srcObject = myStream;
                    }
                }} 
                autoPlay 
                style={{ width: '300px' }} 
            />
            <video 
                playsInline 
                ref={(video) => { 
                    if (video && remoteStream) {
                        video.srcObject = remoteStream;
                    }
                }} 
                autoPlay 
                style={{ width: '300px' }} 
            />
        </div>
    );
    
}

export default Room