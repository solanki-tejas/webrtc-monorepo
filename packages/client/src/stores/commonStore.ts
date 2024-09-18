import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface UserInfo {
  id: string
  fullName: string
  email: string
}

export const useCommonStore = defineStore('common', () => {
  const token = ref<string | null>(null)
  const userInfo = ref<UserInfo | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  function setToken(newToken: string) {
    localStorage.setItem('token', newToken)
    token.value = newToken
  }

  function clearToken() {
    localStorage.setItem('token', '')
    token.value = null
  }

  function setUserInfo(newUserInfo: UserInfo) {
    localStorage.setItem('userInfo', JSON.stringify(newUserInfo))
    userInfo.value = newUserInfo
  }

  function clearUserInfo() {
    localStorage.setItem('userInfo', '')
    userInfo.value = null
  }

  function logout() {
    clearToken()
    clearUserInfo()
  }

  return {
    token,
    userInfo,
    isAuthenticated,
    setToken,
    clearToken,
    setUserInfo,
    clearUserInfo,
    logout
  }
})
