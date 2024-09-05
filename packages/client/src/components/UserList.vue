<template>
  <div class="user-list">
    <h2>Users in Room</h2>
    <el-input v-model="roomId" placeholder="Enter Room ID" @keyup.enter="joinRoom">
      <template #append>
        <el-button @click="joinRoom">Join</el-button>
      </template>
    </el-input>
    <el-divider />
    <el-scrollbar height="400px">
      <div v-if="users.length">
        <div v-for="user in users" :key="user.id" class="user-item">
          <span>{{ user.id }}</span>
          <el-button @click="startCall(user.id)" :disabled="isInCall" size="small">
            Call
          </el-button>
        </div>
      </div>
      <el-empty v-else description="No users in the room" />
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElInput, ElButton, ElScrollbar, ElEmpty, ElDivider } from 'element-plus'
import { useCallStore } from '@/stores/callStore';


const callStore = useCallStore()
const roomId = ref('')

const users = computed(() => callStore.users)
const isInCall = computed(() => callStore.isInCall)

function joinRoom() {
  if (roomId.value) {
    callStore.joinRoom(roomId.value)
  }
}

function startCall(userId: string) {
  callStore.startCall(userId)
}
</script>

<style scoped>
.user-list {
  padding: 20px;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.user-item:last-child {
  border-bottom: none;
}
</style>