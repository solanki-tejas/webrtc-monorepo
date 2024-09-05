<template>
  <div class="call-interface">
    <div v-if="isInCall" class="call-controls">
      <el-button @click="toggleRecording" :type="isRecording ? 'danger' : 'primary'">
        {{ isRecording ? 'Stop Recording' : 'Start Recording' }}
      </el-button>
      <el-button @click="endCall" type="danger">End Call</el-button>
    </div>
    <div v-else>
      <h2>Not in a call</h2>
      <p>Select a user from the list to start a call.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElButton } from 'element-plus'
import { useCallStore } from '../stores/callStore'

const callStore = useCallStore()

const isInCall = computed(() => callStore.isInCall)
const isRecording = computed(() => callStore.isRecording)

function toggleRecording() {
  if (isRecording.value) {
    callStore.stopRecording()
  } else {
    callStore.startRecording()
  }
}

function endCall() {
  callStore.endCall()
}
</script>

<style scoped>
.call-interface {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.call-controls {
  display: flex;
  gap: 10px;
}
</style>