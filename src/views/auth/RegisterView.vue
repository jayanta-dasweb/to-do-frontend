
<script setup>
import { Icon } from '@iconify/vue';
import { FwbInput, FwbCard, FwbButton } from 'flowbite-vue';
import { reactive, computed, ref } from 'vue'; 
import { useVuelidate } from '@vuelidate/core';
import { required, email, helpers, sameAs } from '@vuelidate/validators';
import axios from 'axios';
import { useApiAccessTokenStore } from '../../stores/apiAccessToken';
import { useLoginUserObjStore } from '../../stores/loginUserObj';


const formData = reactive({
    name: "",
    email: "",
    password: {
        password: "",
        confirm: "",
    }
});

const serverSideErrors = reactive({
    name: {
        error: ref(false),
        msg: ref(''),
    },
    email: {
        error: ref(false),
        msg: ref(''),
    },
    password: {
        error: ref(false),
        msg: ref(''),
    },
    confirm: {
        error: ref(false),
        msg: ref(''),
    }
});


const loading = ref(false);
const apiAccessTokenStore = useApiAccessTokenStore()
const loginUserObjStore = useLoginUserObjStore()

const validations = computed(() => {
    return {
        name: {
            required: helpers.withMessage('This field cannot be empty.', required)
        },
        email: {
            required: helpers.withMessage('This field cannot be empty.', required),
            email: helpers.withMessage('Enter a valid email.', email)
        },
        password: {
            password: {
                required: helpers.withMessage('This field cannot be empty.', required)
            },
            confirm: {
                required: helpers.withMessage('This field cannot be empty.', required),
                sameAs: helpers.withMessage('Passwords do not match.', sameAs(formData.password.password))
            }
        }
    }
}) 



const v$ = useVuelidate(validations, formData);

const handleFormSubmit = async () => {
    loading.value = true;
    const validation_result = await v$.value.$validate();
    if (validation_result) {
        await axios.post(`http://127.0.0.1:8000/api/register`, {
            name: formData.name,
            email: formData.email,
            password: formData.password.password,
            password_confirmation: formData.password.confirm
        }).then(response => {
            // reset server sider error state
            serverSideErrors.name.error = false;
            serverSideErrors.name.msg = ''

            serverSideErrors.email.error = false;
            serverSideErrors.email.msg = ''

            serverSideErrors.password.error = false;
            serverSideErrors.password.msg = ''

            serverSideErrors.confirm.error = false;
            serverSideErrors.confirm.msg = ''
            
            loginUserObjStore.loginUserObj = response.data.user
            console.log(loginUserObjStore.loginUserObj)
            const parts = response.data.token.split('|');
            const extractedValue = parts[1];
            apiAccessTokenStore.apiAccessToken = extractedValue
            console.log(apiAccessTokenStore.apiAccessToken)
            loading.value = false;
        }).catch(e => {
            if (e.response.data.errors) {
                console.log(e.response.data.errors)
                if (e.response.data.errors.name) {
                    serverSideErrors.name.error = true;
                    serverSideErrors.name.msg = e.response.data.errors.name[0]
                } else if (e.response.data.errors.email) {
                    serverSideErrors.email.error = true;
                    serverSideErrors.email.msg = e.response.data.errors.email[0]
                } else if (e.response.data.errors.password) {
                    if (/confirm/.test(e.response.data.errors.password)) {
                        serverSideErrors.confirm.error = true;
                        serverSideErrors.confirm.msg = e.response.data.errors.password[0]
                    } else {
                        serverSideErrors.password.error = true;
                        serverSideErrors.password.msg = e.response.data.errors.password[0]
                    }
                }
                loading.value = false;
            }
        })

    } else {
        loading.value = false;
    }
};

</script>

<template>
   <div class=" bg-slate-100 flex flex-col items-center justify-center w-screen h-screen">
        <Icon icon="eos-icons:atom-electron" class="mb-3 text-6xl text-cyan-600" />
        <fwb-card class="w-full p-6" variant="image">
            <h1 class="mb-5 text-2xl font-semibold">Create an account</h1>
            <form @submit.prevent="handleFormSubmit">
                <fwb-input
                    v-model="formData.name"
                    placeholder="Enter your name"
                    label="Your name"
                    type="text"
                    :validation-status="v$.name.$error ? 'error' : serverSideErrors.name.error ? 'error': ''">
                    <template v-if="v$.name.$error || serverSideErrors.name.error" #validationMessage>
                        {{ v$.name.$error ? v$.name.$errors[0].$message : serverSideErrors.name.msg }}
                    </template>
                </fwb-input>
                <hr class="mt-4 border-0">
                <fwb-input
                    v-model="formData.email"
                    placeholder="Enter your email"
                    label="Your email"
                    type="email"
                    :validation-status="v$.email.$error ? 'error' : serverSideErrors.email.error ? 'error' : ''">
                    <template v-if="v$.email.$error || serverSideErrors.email.error" #validationMessage>
                        {{ v$.email.$error ? v$.email.$errors[0].$message : serverSideErrors.email.msg }}
                    </template>
                </fwb-input>
                <hr class="mt-4 border-0">
                <fwb-input
                    v-model="formData.password.password"
                    placeholder="*************"
                    type="password"
                    label="Enter password"
                    :validation-status="v$.password.password.$error ? 'error' : serverSideErrors.password.error ? 'error' : ''">
                    <template v-if="v$.password.password.$error || serverSideErrors.password.error" #validationMessage>
                        {{ v$.password.password.$error ? v$.password.password.$errors[0].$message : serverSideErrors.password.msg }}
                    </template>
                </fwb-input>
                <hr class="mt-4 border-0">
                <fwb-input
                    v-model="formData.password.confirm"
                    placeholder="*************"
                    type="password"
                    label="Enter confirm password"
                    :validation-status="v$.password.confirm.$error ? 'error' : serverSideErrors.confirm.error ? 'error' : ''">
                    <template v-if="v$.password.confirm.$error || serverSideErrors.confirm.error" #validationMessage>
                        {{ v$.password.confirm.$error ? v$.password.confirm.$errors[0].$message : serverSideErrors.confirm.msg }}
                    </template>
                </fwb-input>
                <fwb-button :loading="loading" gradient="cyan-blue" size="lg" @click="loading = !loading" class="w-full mt-5">
                    {{ loading ? 'Loading' : 'Submit' }}
                </fwb-button>
                <p class="text-sm font-light mt-2">
                    Already have an account? <router-link to="/" class="font-medium text-primary-600 hover:underline dark:text-blue-500">Login here</router-link>
                </p>
            </form>
        </fwb-card>
   </div>
</template>

<style scoped>
    
</style>

