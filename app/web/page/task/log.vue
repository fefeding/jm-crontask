<template>      
    
            <div class="log-container">
                <p v-for="(item, index) in logLines" :key="index">
                    {{ item }}
                </p>
            </div>
</template>
<style>
.log-container {
    background: #000;
    border: 1px solid #ccc;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12);
    padding: 4px;
    min-height: 800px;
}

.log-container > p {
    margin: 4px;
    padding: 0;
    word-wrap:break-word;
    word-break:normal; 
    color: rgb(235, 221, 221);
}
</style>
<script lang="ts" src="./log.ts"></script>
