<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { VuePdf, createLoadingTask } from 'vue3-pdfjs'
import type { VuePdfPropsType } from 'vue3-pdfjs/components/vue-pdf/vue-pdf-props' // Prop type definitions can also be imported
import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api'
import pdfUrl from './assets/demo.pdf'

const pdfSrc = ref<VuePdfPropsType['src']>(pdfUrl)
const numOfPages = ref(0) // 分页

onMounted(() => {
  const loadingTask = createLoadingTask(pdfSrc.value)
  loadingTask.promise.then((pdf: PDFDocumentProxy) => {
    numOfPages.value = pdf.numPages // 页数等于pdf的页数
  })
})
function downLoad(url, filename){
  const a = document.createElement("a"); // 创建 a 标签
  a.href = url; // 下载路径
  a.download = filename;  // 下载属性，文件名
  a.style.display = "none"; // 不可见
  document.body.appendChild(a); // 挂载
  a.click(); // 触发点击事件
  document.body.removeChild(a); // 移除
}
</script>
<template>
  <button style="height: 50px ; width: 100px;display: flex" @click="downLoad(pdfUrl, '页面中的pdf文件')">下载到本地</button>
  <VuePdf v-for="page in numOfPages" :src="pdfSrc" :key="page" :page="page" />
</template>

<style scoped>
@import '@/assets/base.css';
</style>
