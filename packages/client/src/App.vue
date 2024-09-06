<template>
  <div>
    <audio ref="localAudio" autoplay muted></audio>
    <audio ref="remoteAudio" autoplay></audio>
    <button @click="startCall" :disabled="audioCallStore.callInProgress">Start Call</button>
    <button @click="audioCallStore.endCall" :disabled="!audioCallStore.callInProgress">End Call</button>
    <p v-if="audioCallStore.errorMessage" class="error-message">{{ audioCallStore.errorMessage }}</p>
    <p>Connection Status: {{ audioCallStore.connectionStatus }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAudioCallStore } from './stores/callStore';

const localAudio = ref<HTMLAudioElement | null>(null);
const remoteAudio = ref<HTMLAudioElement | null>(null);
const audioCallStore = useAudioCallStore();

const startCall = async () => {
  await audioCallStore.startCall(localAudio, remoteAudio);
};

onMounted(() => {
  audioCallStore.initializeSocket();
});

onUnmounted(() => {
  audioCallStore.cleanup();
});
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 10px;
}
</style>