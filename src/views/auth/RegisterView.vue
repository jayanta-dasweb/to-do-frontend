
<script setup>
import { Icon } from '@iconify/vue';
import { FwbInput, FwbCard, FwbButton } from 'flowbite-vue'
import {  reactive, computed, ref } from 'vue' 
import { useVuelidate } from '@vuelidate/core'
import { required, email, helpers, sameAs } from '@vuelidate/validators'
import axios from 'axios';


const formData = reactive({
    name: "",
    email: "",
    password: {
        password: "",
        confirm: "",
    }
});

const initialState = {
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
};

const serverSideErrors = reactive({ ...initialState });

let api_access_token = ref('');

let login_user = reactive({});

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
    const validation_result = await v$.value.$validate();
    if (validation_result) {
        await axios.post(`http://127.0.0.1:8000/api/register`, {
            name: formData.name,
            email: formData.email,
            password: formData.password.password,
            password_confirmation: formData.password.confirm
        }).then(response => {
            Object.assign(serverSideErrors, initialState);
            login_user = response.data.user
            console.log(login_user.value)
            api_access_token.value = response.data.token
             console.log(response.data.token)
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
            }
        })

    } else {
        console.log("error, form not submited!");

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
                <fwb-button gradient="cyan-blue" type="submit" class="w-full mt-5">Submit</fwb-button>
                <p class="text-sm font-light mt-2">
                    Already have an account? <router-link to="/" class="font-medium text-primary-600 hover:underline dark:text-blue-500">Login here</router-link>
                </p>
            </form>
        </fwb-card>
   </div>
</template>

<style scoped>
    
</style>

