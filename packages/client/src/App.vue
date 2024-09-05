<template>
  <el-container class="app-container">
    <el-aside width="300px">
      <user-list />
    </el-aside>
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script setup>
import { ElContainer, ElAside, ElMain } from 'element-plus'
import UserList from '@/components/UserList.vue'
import { onMounted } from 'vue';
import { useCallStore } from './stores/callStore';

const callStore = useCallStore()

onMounted(() => {
  callStore.initializeSocket()
})
</script>

<style>
.app-container {
  height: 100vh;
}
</style>