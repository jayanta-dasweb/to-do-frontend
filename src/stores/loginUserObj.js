import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLoginUserObjStore = defineStore('loginUserObj', () => {
    const loginUserObj = ref({})
    return { loginUserObj }
})
