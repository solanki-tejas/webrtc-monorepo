import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { io, Socket } from 'socket.io-client'

interface PeerConnection extends RTCPeerConnection {
  ontrack: ((this: RTCPeerConnection, ev: RTCTrackEvent) => any) | null
  onicecandidate: ((this: RTCPeerConnection, ev: RTCPeerConnectionIceEvent) => any) | null
  oniceconnectionstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null
}

export const useAudioCallStore = defineStore('audioCall', () => {
  const socket: Ref<Socket | null> = ref(null)
  const localStream: Ref<MediaStream | null> = ref(null)
  const remoteStream: Ref<MediaStream | null> = ref(null)
  const peerConnection: Ref<PeerConnection | null> = ref(null)
  const roomId = 'test-room'
  const errorMessage = ref('')
  const callInProgress = ref(false)
  const connectionStatus = ref('Disconnected')

  const startCall = async (
    localAudioRef: Ref<HTMLAudioElement | null>,
    remoteAudioRef: Ref<HTMLAudioElement | null>
  ) => {
    try {
      errorMessage.value = ''
      callInProgress.value = true

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser')
      }

      localStream.value = await navigator.mediaDevices.getUserMedia({ audio: true })

      if (localAudioRef.value) {
        localAudioRef.value.srcObject = localStream.value
      } else {
        throw new Error('Local audio element not found')
      }

      createPeerConnection(remoteAudioRef)
      socket.value?.emit('join-room', roomId)
    } catch (error) {
      console.error('Error starting the call:', error)
      handleError(error as Error)
    }
  }

  const endCall = () => {
    localStream.value?.getTracks().forEach((track) => track.stop())
    peerConnection.value?.close()
    callInProgress.value = false
    connectionStatus.value = 'Call Ended'
  }

  const createPeerConnection = (remoteAudioRef: Ref<HTMLAudioElement | null>) => {
    peerConnection.value = new RTCPeerConnection() as PeerConnection

    localStream.value?.getTracks().forEach((track) => {
      peerConnection.value?.addTrack(track, localStream.value!)
    })

    peerConnection.value.ontrack = async (event: RTCTrackEvent) => {
      remoteStream.value = event.streams[0]
      if (remoteAudioRef.value) {
        remoteAudioRef.value.srcObject = remoteStream.value
      }
    }

    peerConnection.value.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        socket.value?.emit('ice-candidate', event.candidate, roomId)
      }
    }

    peerConnection.value.oniceconnectionstatechange = () => {
      connectionStatus.value = `ICE Connection State: ${peerConnection.value?.iceConnectionState}`
    }
  }

  const setupSocketListeners = () => {
    socket.value?.on('user-connected', async () => {
      console.log('A user connected, creating offer...')
      const offer = await peerConnection.value?.createOffer()
      await peerConnection.value?.setLocalDescription(offer)
      socket.value?.emit('offer', offer, roomId)
    })

    socket.value?.on('offer', async (offer: RTCSessionDescriptionInit) => {
      console.log('Received offer, creating answer...')
      await peerConnection.value?.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await peerConnection.value?.createAnswer()
      await peerConnection.value?.setLocalDescription(answer)
      socket.value?.emit('answer', answer, roomId)
    })

    socket.value?.on('answer', async (answer: RTCSessionDescriptionInit) => {
      console.log('Received answer')
      await peerConnection.value?.setRemoteDescription(new RTCSessionDescription(answer))
    })

    socket.value?.on('ice-candidate', async (candidate: RTCIceCandidateInit) => {
      console.log('Received ICE candidate')
      try {
        await peerConnection.value?.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (e) {
        console.error('Error adding received ice candidate', e)
      }
    })
  }

  const handleError = (error: Error) => {
    if (error.name === 'NotFoundError') {
      errorMessage.value = 'Microphone not found. Please check your device settings.'
    } else if (error.name === 'NotAllowedError') {
      errorMessage.value =
        'Permission to use microphone was denied. Please allow access and try again.'
    } else if (error.name === 'NotReadableError') {
      errorMessage.value =
        'Your microphone is busy. Please close other applications that might be using it.'
    } else {
      errorMessage.value = `An error occurred: ${error.message}`
    }
    callInProgress.value = false
  }

  const initializeSocket = () => {
    const serverUrl = 'http://localhost:8000'
    console.log(`Attempting to connect to: ${serverUrl}`)

    socket.value = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    socket.value.on('connect', () => {
      connectionStatus.value = 'Connected to server'
      console.log('Connected to server')
    })

    socket.value.on('disconnect', (reason: string) => {
      connectionStatus.value = `Disconnected: ${reason}`
      console.log(`Disconnected: ${reason}`)
    })

    socket.value.on('connect_error', (error: Error) => {
      connectionStatus.value = `Connection error: ${error.message}`
      console.error('Connection error:', error)
    })

    setupSocketListeners()
  }

  const cleanup = () => {
    socket.value?.disconnect()
    endCall()
  }

  return {
    localStream,
    remoteStream,
    errorMessage,
    callInProgress,
    connectionStatus,
    startCall,
    endCall,
    initializeSocket,
    cleanup
  }
})
