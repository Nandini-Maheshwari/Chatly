import React, { useMemo, useEffect, useState, useCallback } from 'react';
const PeerContext = React.createContext(null);

export const usePeer = () => React.useContext(PeerContext);

export function PeerProvider(props) {

    const [ remoteStream, setRemoteStream ] = useState(null);

    const peer = useMemo(
        () => new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        'stun:stun.l.google.com:19302',
                        "stun:global.stun.twilio.com:3478",
                    ],
                },
            ],
        }),
    []);

    const createOffer = async () => {
        const offer = await peer.createOffer();
        console.log('Offer created:',offer);
        await peer.setLocalDescription(offer);
        return offer;
    };

    const createAnswer = async (offer) => {
        await peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        return answer;
    };

    const setRemoteAns = async (ans) => {
        await peer.setRemoteDescription(ans);
    };    

    const sendStream = async (stream) => {
        const senders = peer.getSenders();
        stream.getTracks().forEach(track => {
            const sender = senders.find(s => s.track && s.track.kind === track.kind);
            if (sender) {
                sender.replaceTrack(track); // Replace existing track if present
            } else {
                peer.addTrack(track, stream); // Add new track
            }
        });
    };    
    
    // const handleTrackEvent = useCallback((ev) => {
    //     const streams = ev.streams;
    //     console.log('Recieved remote stream:', streams[0]);
    //     setRemoteStream(streams[0]);
    // }, []);

    const handleTrackEvent = useCallback((ev) => {
        const stream = ev.streams[0];
        if (remoteStream && remoteStream.id === stream.id) {
            console.log('Stream already added:', stream.id);
            return;
        }
        console.log('Received remote stream:', stream);
        setRemoteStream(stream);
    }, [remoteStream]);    

    useEffect(() => {
        peer.addEventListener('track', handleTrackEvent);
        return () => {
            peer.removeEventListener('track', handleTrackEvent);
        }
    }, [ handleTrackEvent, peer ]);

    return (
        <div>
            <PeerContext.Provider 
            value={
                { peer, 
                createOffer, 
                createAnswer, 
                setRemoteAns, 
                sendStream, 
                remoteStream 
            }}>
                {props.children}
            </PeerContext.Provider>
        </div>
    )
}