# pdf预览器
## 第一种实现方式：使用pdfjs库
### 特点
优点：简单易用
缺点：
1. 有时展示的pdf文档内容模糊或者缺少一部分
2. 加载平常的pdf并没有什么问题，但加载发票之类的pdf时会出现，另外预览的字体和实际的字体是不一样的，识别不了一部分小众关键字体的问题，十分致命
   1. 无法显示完整是因为pdfjs库需要字体库的支持。
### 实现方式：vue3+ts中
```vue
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
</script>
<template>
  <VuePdf v-for="page in numOfPages" :src="pdfSrc" :key="page" :page="page" />
</template>

<style scoped>
@import '@/assets/base.css';
</style>
```
## 第二种实现方式：iframe标签和embed标签
会出现兼容性问题，不推荐使用，故不再演示
## 第三种实现方式： pdf在服务器端转图片
pdf在服务器端转图片之后，前端直接展示图片即可
```javascript
const pdf = require('pdf-poppler')
const path = require('path')
const Koa = require('koa')
const koaStatic = require('koa-static')
const cors = require('koa-cors')
const app = new Koa()

// 跨域
app.use(cors())

// 静态资源
app.use(koaStatic('./server'))

function getFileName(filePath) {
  return filePath
    .split('/')
    .pop()
    .replace(/\.[^/.]+$/, '')
}

function pdf2png(filePath) {
  // 获取文件名
  const fileName = getFileName(filePath);
  const dir = path.dirname(filePath);

  // 配置参数
  const options = {
    format: 'png',
    out_dir: dir,
    out_prefix: fileName,
    page: null,
  }

  // pdf 转换 png
  return pdf
    .convert(filePath, options)
    .then((res) => {
      console.log('Successfully converted ！')
      return `http://127.0.0.1:4000${dir.replace('./server','')}/${fileName}-1.png`
    })
    .catch((error) => {
      console.error(error)
    })
}

// 响应
app.use(async (ctx) => {
  if(ctx.path.endsWith('/getPdf')){
    const url = await pdf2png('./server/pdf/2.pdf')
    ctx.body = { url }
  }else{
    ctx.body = 'hello world!'
  }
})

app.listen(4000)
```
## 第四种实现方式：客户端将pdf下载到本地预览
a标签+blob
```vue
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

```