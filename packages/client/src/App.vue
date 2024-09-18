<template>
  <RouterView />
  <!-- <audio-call /> -->
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useCommonStore } from './stores/commonStore';

const commonStore = useCommonStore()
onMounted(() => {
  let token = localStorage.getItem('token')
  let userInfo = localStorage.getItem('userInfo')

  if (token) {
    commonStore.setToken(token);
  }

  if (userInfo) {
    commonStore.setUserInfo(JSON.parse(userInfo))
  }

})

// import AudioCall from './components/AudioCall.vue';
</script>

<style scoped></style>