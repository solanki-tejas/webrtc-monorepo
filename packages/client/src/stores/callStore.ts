import { nextTick, ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { io, Socket } from 'socket.io-client'
import { ElMessageBox } from 'element-plus'

interface User {
  id: string
}

interface CallOffer {
  fromUserId: string
  targetUserId: string
  offer: RTCSessionDescriptionInit
}

interface CallAnswer {
  fromUserId: string
  targetUserId: string
  answer: RTCSessionDescriptionInit
}

interface IceCandidate {
  fromUserId: string
  targetUserId: string
  candidate: RTCIceCandidateInit
}

interface CallStoreState {
  socket: Ref<Socket | null>
  roomId: Ref<string>
  users: Ref<User[]>
  localStream: Ref<MediaStream | null>
  remoteStream: Ref<MediaStream | null>
  peerConnection: Ref<RTCPeerConnection | null>
  isInCall: Ref<boolean>
  isRecording: Ref<boolean>
  mediaRecorder: Ref<MediaRecorder | null>
  recordedChunks: Ref<Blob[]>
}

interface CallStoreMethods {
  initializeSocket: () => void
  joinRoom: (newRoomId: string) => void
  startCall: (targetUserId: string) => Promise<void>
  endCall: () => void
  startRecording: () => void
  stopRecording: () => void
}

type CallStore = CallStoreState & CallStoreMethods

export const useCallStore = defineStore('call', (): CallStore => {
  const socket: Ref<Socket | null> = ref(null)
  const roomId = ref('')
  const currentUserId = ref<String>('')

  const users = ref<User[]>([])
  const localStream = ref<MediaStream | null>(null)
  const remoteStream = ref<MediaStream | null>(null)
  const peerConnection = ref<RTCPeerConnection | null>(null)
  const isInCall = ref(false)
  const isRecording = ref(false)
  const mediaRecorder = ref<MediaRecorder | null>(null)
  const recordedChunks = ref<Blob[]>([])

  async function initializeSocket() {
    socket.value = io('http://localhost:8000', {
      transports: ['websocket', 'polling']
    })

    socket.value.on('connect', async () => {
      console.log('Connected')

      if (socket.value) {
        currentUserId.value = socket.value.id ?? ''
      }
      await nextTick()
    })

    socket.value.on('user-list-update', (updatedUsers: User[]) => {
      users.value = updatedUsers.filter((item) => item.id !== currentUserId.value)
    })

    socket.value.on('call-offer', (data: CallOffer) => handleCallOffer(data))
    socket.value.on('call-answer', (data: CallAnswer) => handleCallAnswer(data))
    socket.value.on('ice-candidate', (data: IceCandidate) => handleIceCandidate(data))
    socket.value.on('user-disconnected', (userId: string) => {
      users.value = users.value.filter((user) => user.id !== userId)
    })
  }

  function joinRoom(newRoomId: string) {
    roomId.value = newRoomId
    socket.value?.emit('join-room', newRoomId)
  }

  async function startCall(targetUserId: string) {
    try {
      localStream.value = await navigator.mediaDevices.getUserMedia({ audio: true })
      createPeerConnection()

      if (peerConnection.value) {
        const offer = await peerConnection.value.createOffer()
        await peerConnection.value.setLocalDescription(offer)
        socket.value?.emit('call-offer', {
          fromUserId: socket.value?.id || '',
          targetUserId,
          offer
        })
      }
    } catch (error) {
      console.error('Error starting call:', error)
    }
  }

  async function handleCallOffer({ fromUserId, offer, targetUserId }: CallOffer) {
    const userAccepted = await showIncomingCallNotification(fromUserId)

    if (userAccepted) {
      try {
        localStream.value = await navigator.mediaDevices.getUserMedia({ audio: true })
        createPeerConnection()

        if (peerConnection.value) {
          await peerConnection.value.setRemoteDescription(new RTCSessionDescription(offer))
          const answer = await peerConnection.value.createAnswer()
          await peerConnection.value.setLocalDescription(answer)

          socket.value?.emit('call-answer', {
            fromUserId: socket.value?.id || '',
            targetUserId: fromUserId,
            answer
          })

          isInCall.value = true
        }
      } catch (error) {
        console.error('Error handling call offer:', error)
      }
    }
  }

  async function handleCallAnswer({ fromUserId, answer }: CallAnswer) {
    if (peerConnection.value) {
      await peerConnection.value.setRemoteDescription(new RTCSessionDescription(answer))
      isInCall.value = true
    }
  }

  async function handleIceCandidate({ candidate, sdpMid, sdpMLineIndex }: any) {
    if (peerConnection.value) {
      // Check if all necessary fields are present
      if (candidate && sdpMid !== undefined && sdpMLineIndex !== undefined) {
        await peerConnection.value.addIceCandidate(
          new RTCIceCandidate({
            candidate,
            sdpMid,
            sdpMLineIndex
          })
        )
      } else {
        console.error('Invalid ICE candidate data:', { candidate, sdpMid, sdpMLineIndex })
      }
    }
  }

  function createPeerConnection() {
    peerConnection.value = new RTCPeerConnection()

    if (localStream.value) {
      localStream.value.getTracks().forEach((track) => {
        if (peerConnection.value && localStream.value) {
          peerConnection.value.addTrack(track, localStream.value)
        }
      })
    }

    peerConnection.value.ontrack = (event: RTCTrackEvent) => {
      remoteStream.value = event.streams[0]
    }

    peerConnection.value.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        socket.value?.emit('ice-candidate', {
          targetUserId: users.value[0]?.id, // Replace with the appropriate user ID
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex
        })
      }
    }
  }

  function endCall() {
    if (peerConnection.value) {
      peerConnection.value.close()
      peerConnection.value = null
    }
    if (localStream.value) {
      localStream.value.getTracks().forEach((track) => track.stop())
      localStream.value = null
    }
    remoteStream.value = null
    isInCall.value = false
    stopRecording()
  }

  function startRecording() {
    if (!isInCall.value || isRecording.value || !localStream.value) return

    mediaRecorder.value = new MediaRecorder(localStream.value)
    recordedChunks.value = []

    mediaRecorder.value.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        recordedChunks.value.push(event.data)
      }
    }

    mediaRecorder.value.onstop = () => {
      const blob = new Blob(recordedChunks.value, { type: 'audio/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      document.body.appendChild(a)
      a.style.display = 'none'
      a.href = url
      a.download = 'call-recording.webm'
      a.click()
      window.URL.revokeObjectURL(url)
    }

    mediaRecorder.value.start()
    isRecording.value = true
  }

  function stopRecording() {
    if (mediaRecorder.value && isRecording.value) {
      mediaRecorder.value.stop()
      isRecording.value = false
    }
  }

  function showIncomingCallNotification(fromUserId: string): Promise<boolean> {
    return new Promise((resolve) => {
      ElMessageBox.confirm(`Incoming call from ${fromUserId}`, 'Incoming Call', {
        confirmButtonText: 'Accept',
        cancelButtonText: 'Decline',
        type: 'info'
      })
        .then(() => resolve(true))
        .catch(() => resolve(false))
    })
  }

  return {
    socket,
    roomId,
    users,
    localStream,
    remoteStream,
    peerConnection,
    isInCall,
    isRecording,
    mediaRecorder,
    recordedChunks,
    initializeSocket,
    joinRoom,
    startCall,
    endCall,
    startRecording,
    stopRecording
  }
})
