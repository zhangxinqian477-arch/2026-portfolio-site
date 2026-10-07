# 张新倩作品集网站

静态站点，GitHub main 分支通过 Vercel 发布到 https://portfolio.xinqian-design.site/ 。
使用 Mozilla PDF.js 6.4.299 官方发行版，所有阅读器资源由本站提供。
桌面默认展开可收起的项目目录和缩略图，手机默认折叠侧栏；目录按页码同步高亮并支持项目跳转。
顶部工具栏保留页码、缩放和全屏，并显示作品集品牌标题；打印和下载入口隐藏。
保留文本选择与链接。portfolio-viewer.js 和 portfolio-viewer.css 配置阅读器，不修改供应商源码。

更新作品集：替换 Zhang Xinqian portfolio.pdf，并同步更新 index.html 和
portfolio-viewer.js 中 PDF URL 的 v 参数（建议使用新文件 SHA256 前 12 位）。
如果作品集页序发生变化，还需同步更新 portfolio-viewer.js 中的 sections 配置。

第三方来源：https://github.com/mozilla/pdf.js/releases/tag/v6.4.299
许可见 pdfjs/LICENSE。
