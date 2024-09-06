<template>
    <AuthLayout>
        <el-card class="login-card">
            <template #header>
                <h2 class="card-header">Login</h2>
            </template>
            <el-form :model="loginForm" :rules="rules" ref="loginFormRef" @submit.prevent="handleLogin" class="login-form">
                <el-form-item prop="email">
                    <el-input v-model="loginForm.email" placeholder="Email" type="email">
                        <template #prefix>
                            <el-icon>
                                <Message />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" placeholder="Password" type="password" show-password>
                        <template #prefix>
                            <el-icon>
                                <Lock />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" native-type="submit" :loading="loading"
                        class="submit-btn">Login</el-button>
                </el-form-item>
            </el-form>
            <div class="text-center">
                <el-link type="primary" href="/signup">Don't have an account? Sign up</el-link>
            </div>
        </el-card>
    </AuthLayout>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'
import AuthLayout from '@/layouts/AuthLayout.vue';

const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({
    email: '',
    password: ''
})

const rules = {
    email: [
        { required: true, message: 'Please input your email', trigger: 'blur' },
        { type: 'email', message: 'Please input a valid email address', trigger: 'blur' }
    ],
    password: [
        { required: true, message: 'Please input your password', trigger: 'blur' },
        { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
    ]
}

const handleLogin = async () => {
    if (!loginFormRef.value) return

    try {
        await loginFormRef.value.validate()
        loading.value = true
        // Implement your login logic here
        console.log('Login form submitted:', loginForm)
        ElMessage.success('Login successful!')
    } catch (error) {
        console.error('Login failed:', error)
        ElMessage.error('Login failed. Please try again.')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-card {
    width: 100%;
    max-width: 500px; /* Increased the max-width */
    padding: 2rem; /* Added padding */
    border-radius: 8px; /* Added border-radius for rounded corners */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Added shadow for better appearance */
    margin: 2rem auto; /* Centered the card with margin */
}

.card-header {
    font-size: 1.5rem; /* Increased font size for header */
    margin-bottom: 1rem; /* Added bottom margin */
}

.login-form {
    padding: 1rem 0; /* Added padding to form */
}

.el-form-item {
    margin-bottom: 1rem; /* Added margin between form items */
}

.submit-btn {
    width: 100%;
    padding: 0.75rem; /* Added padding to button */
    font-size: 1rem; /* Increased font size for button */
}

.text-center {
    text-align: center;
    margin-top: 1.5rem; /* Increased margin-top */
}
</style>
