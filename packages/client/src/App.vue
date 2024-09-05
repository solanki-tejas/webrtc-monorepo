<template>
  <div>
    <video v-if="localStream" ref="localVideo" autoplay muted></video>
    <video v-if="remoteStream" ref="remoteVideo" autoplay></video>
    <button @click="startCall" :disabled="callInProgress">Start Call</button>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <p>Connection Status: {{ connectionStatus }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { io } from 'socket.io-client';

const localVideo = ref(null);
const remoteVideo = ref(null);
const socket = ref(null);
const localStream = ref(null);
const remoteStream = ref(null);
const peerConnection = ref(null);
const roomId = "test-room"; // Generate a unique room ID
const errorMessage = ref('');
const callInProgress = ref(false);
const connectionStatus = ref('Disconnected');

const startCall = async () => {
  try {
    errorMessage.value = '';
    callInProgress.value = true;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia is not supported in this browser');
    }

    localStream.value = await navigator.mediaDevices.getUserMedia({ audio: true });

    await nextTick();  // Ensure DOM is updated before accessing refs

    if (localVideo.value) {
      localVideo.value.srcObject = localStream.value;
    } else {
      throw new Error('Local video element not found');
    }

    createPeerConnection();
    socket.value.emit('join-room', roomId);
  } catch (error) {
    console.error('Error starting the call:', error);
    if (error.name === 'NotFoundError') {
      errorMessage.value = 'Camera or microphone not found. Please check your device settings.';
    } else if (error.name === 'NotAllowedError') {
      errorMessage.value = 'Permission to use camera and microphone was denied. Please allow access and try again.';
    } else if (error.name === 'NotReadableError') {
      errorMessage.value = 'Your camera or microphone is busy. Please close other applications that might be using it.';
    } else {
      errorMessage.value = `An error occurred: ${error.message}`;
    }
  } finally {
    callInProgress.value = false;
  }
};

const createPeerConnection = () => {
  peerConnection.value = new RTCPeerConnection();

  localStream.value.getTracks().forEach(track => {
    peerConnection.value.addTrack(track, localStream.value);
  });

  peerConnection.value.ontrack = async (event) => {
    remoteStream.value = event.streams[0];

    await nextTick();  // Ensure DOM is updated before accessing refs

    if (remoteVideo.value) {
      remoteVideo.value.srcObject = remoteStream.value;
    } else {
      throw new Error('Local video element not found');
    }
  };

  peerConnection.value.onicecandidate = (event) => {
    if (event.candidate) {
      socket.value.emit('ice-candidate', event.candidate, roomId);
    }
  };
};

const setupSocketListeners = () => {
  socket.value.on('user-connected', async () => {
    console.log('A user connected, creating offer...');
    const offer = await peerConnection.value.createOffer();
    await peerConnection.value.setLocalDescription(offer);
    socket.value.emit('offer', offer, roomId);
  });

  socket.value.on('offer', async (offer) => {
    console.log('Received offer, creating answer...');
    await peerConnection.value.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.value.createAnswer();
    await peerConnection.value.setLocalDescription(answer);
    socket.value.emit('answer', answer, roomId);
  });

  socket.value.on('answer', async (answer) => {
    console.log('Received answer');
    await peerConnection.value.setRemoteDescription(new RTCSessionDescription(answer));
  });

  socket.value.on('ice-candidate', async (candidate) => {
    console.log('Received ICE candidate');
    await peerConnection.value.addIceCandidate(new RTCIceCandidate(candidate));
  });
};

onMounted(() => {
  const serverUrl = 'http://localhost:8000';
  console.log(`Attempting to connect to: ${serverUrl}`);

  socket.value = io(serverUrl, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.value.on('connect', () => {
    connectionStatus.value = 'Connected to server';
    console.log('Connected to server');
  });

  socket.value.on('disconnect', (reason) => {
    connectionStatus.value = `Disconnected: ${reason}`;
    console.log(`Disconnected: ${reason}`);
  });

  socket.value.on('connect_error', (error) => {
    connectionStatus.value = `Connection error: ${error.message}`;
    console.error('Connection error:', error);
  });

  setupSocketListeners();
});

onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect();
  }
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => track.stop());
  }
});
</script>


<style scoped>
.error-message {
  color: red;
  margin-top: 10px;
}
</style>