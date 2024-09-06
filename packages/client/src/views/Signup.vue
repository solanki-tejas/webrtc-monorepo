<template>
    <AuthLayout>
        <el-card class="signup-card">
            <template #header>
                <h2>Sign Up</h2>
            </template>
            <el-form :model="signupForm" :rules="rules" ref="signupFormRef" @submit.prevent="handleSignup">
                <el-form-item prop="name">
                    <el-input v-model="signupForm.name" placeholder="Full Name">
                        <template #prefix>
                            <el-icon>
                                <User />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="email">
                    <el-input v-model="signupForm.email" placeholder="Email" type="email">
                        <template #prefix>
                            <el-icon>
                                <Message />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="signupForm.password" placeholder="Password" type="password" show-password>
                        <template #prefix>
                            <el-icon>
                                <Lock />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="confirmPassword">
                    <el-input v-model="signupForm.confirmPassword" placeholder="Confirm Password" type="password"
                        show-password>
                        <template #prefix>
                            <el-icon>
                                <Lock />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" native-type="submit" :loading="loading" class="submit-btn">Sign
                        Up</el-button>
                </el-form-item>
            </el-form>
            <div class="text-center">
                <el-link type="primary" href="/auth/login">Already have an account? Login</el-link>
            </div>
        </el-card>
    </AuthLayout>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Message, Lock } from '@element-plus/icons-vue'
import AuthLayout from '@/layouts/AuthLayout.vue';

const signupFormRef = ref()
const loading = ref(false)

const signupForm = reactive({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
})

const validatePass = (rule: any, value: string, callback: any) => {
    if (value === '') {
        callback(new Error('Please input the password'))
    } else {
        if (signupForm.confirmPassword !== '') {
            if (signupFormRef.value) {
                signupFormRef.value.validateField('confirmPassword')
            }
        }
        callback()
    }
}

const validatePass2 = (rule: any, value: string, callback: any) => {
    if (value === '') {
        callback(new Error('Please input the password again'))
    } else if (value !== signupForm.password) {
        callback(new Error("Passwords don't match!"))
    } else {
        callback()
    }
}

const rules = {
    name: [
        { required: true, message: 'Please input your name', trigger: 'blur' },
        { min: 2, message: 'Name must be at least 2 characters', trigger: 'blur' }
    ],
    email: [
        { required: true, message: 'Please input your email', trigger: 'blur' },
        { type: 'email', message: 'Please input a valid email address', trigger: 'blur' }
    ],
    password: [
        { required: true, validator: validatePass, trigger: 'blur' },
        { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, validator: validatePass2, trigger: 'blur' }
    ]
}

const handleSignup = async () => {
    if (!signupFormRef.value) return

    try {
        await signupFormRef.value.validate()
        loading.value = true
        // Implement your signup logic here
        console.log('Signup form submitted:', signupForm)
        ElMessage.success('Signup successful!')
    } catch (error) {
        console.error('Signup failed:', error)
        ElMessage.error('Signup failed. Please try again.')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.signup-card {
    width: 100%;
    max-width: 400px;
}

.submit-btn {
    width: 100%;
}

.text-center {
    text-align: center;
    margin-top: 1rem;
}
</style>