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