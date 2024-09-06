<template>
    <el-container class="layout-container">
        <el-main class="main-content">
            <slot></slot>
        </el-main>
        <el-footer class="footer-container">
            <p>&copy; 2024 WebRTC Monorepo. All rights reserved.</p>
        </el-footer>
    </el-container>
</template>

<script lang="ts" setup>
import { ElContainer, ElMain, ElFooter } from 'element-plus'
</script>

<style scoped>
.layout-container {
    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    background: url('https://images.unsplash.com/photo-1506748686214e9df14f5e6b3d8e28c26d3d72762d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGZvcmVzdHxlbnwwfHx8fDE2NTUyNjY0NzU&ixlib=rb-1.2.1&q=80') no-repeat center center fixed;
    background-size: cover;
    position: relative;
}

.main-content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeInUp 1s ease-out;
}

.footer-container {
    text-align: center;
    background: rgba(0, 0, 0, 0.5);
    color: #ffffff;
    padding: 1rem;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.2);
    animation: fadeIn 1s ease-out;
}

.footer-container p {
    margin: 0;
}

/* Animations */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
</style>
