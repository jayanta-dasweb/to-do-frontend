import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useApiAccessTokenStore = defineStore('apiAccessToken', () => {
    const apiAccessToken = ref(0)
    return { apiAccessToken }
})
