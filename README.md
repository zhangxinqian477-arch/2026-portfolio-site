# 张新倩作品集网站

静态站点，GitHub main 分支通过 Vercel 发布到 https://portfolio.xinqian-design.site/ 。
使用 Mozilla PDF.js 6.4.299 官方发行版，所有阅读器资源由本站提供。
桌面默认展开可收起的项目目录和缩略图，手机默认折叠侧栏；目录按页码同步高亮并支持项目跳转。
顶部工具栏保留页码、缩放和全屏，并显示作品集品牌标题；打印和下载入口隐藏。
保留文本选择与链接。portfolio-viewer.js 和 portfolio-viewer.css 配置阅读器，不修改供应商源码。

更新作品集：替换 Zhang Xinqian portfolio.pdf，并同步更新 portfolio.html 和
portfolio-viewer.js 中 PDF URL 的 v 参数（建议使用新文件 SHA256 前 12 位）。
如果作品集页序发生变化，还需同步更新 portfolio-viewer.js 中的 sections 配置。

第三方来源：https://github.com/mozilla/pdf.js/releases/tag/v6.4.299
许可见 pdfjs/LICENSE。

## 首页入口整合

- 主目录继续使用本 deployed-site 仓库。
- index.html：新首页，包含简历 01、作品集 02。
- portfolio.html：原首页阅读器，保持原有目录、缩放和全屏功能。
- homepage/：首页专用样式、动效、字体和配置；与阅读器样式分离。
- 点击作品集跳转到 ./portfolio.html，简历跳转到 ./resume.html；邮箱尚未配置，后续修改 homepage/config.js。
- 原入口备份保存在项目上级 tmp/before-homepage-1791560319596。
- 在项目上级运行 node preview-server.cjs，访问 http://127.0.0.1:4173/。PDF.js 需要 HTTP 预览，请勿用双击文件的方式测试阅读器。
- 本次仅合并本地文件，未提交、推送或触发线上部署。后续发布仍沿用原 GitHub / Vercel 流程。

## 简历与返回首页

简历入口已连接 resume.html，使用本站 PDF.js 查看 resume.pdf。原始简历文件未改动，副本 SHA256 前 12 位为 a75e65745cf1。
两个阅读页面共用 reader-shell.css，左上角“返回首页”始终可用，包括加载或错误状态；全屏覆盖整个阅读页，保留返回按钮。
后续更新简历请替换 resume.pdf 并更新 resume.html 中 data-pdf 与直接打开链接的 v 参数。邮箱仍待配置。
本次修改前文件已备份到 ../tmp/before-resume-return-1791560738361。

## Field Notes 内页原型

- `/field-notes/` 是“沿途记录 / Field Notes”的独立静态页面，本地草稿首页已增加入口，公开网站尚未更新。
- 页面使用本地打包的 Three.js 和 Natural Earth 大陆轮廓，不依赖外部 CDN；支持拖动、慢速自转、地点聚焦、桌面侧栏和手机底部面板。
- 地点内容集中在 `field-notes/data/locations.js`。当前城市为南京、无锡、青岛、大同、西安、哈尔滨、深圳；新增或替换城市时无需改动地球逻辑。
- 原始照片按城市保存在 `field-notes/assets/places/城市英文名/` 并由 `.gitignore` 排除；页面加载各城市 `web/` 文件夹中的轻量 WebP 版本。
- 南京、无锡、青岛、大同、西安、哈尔滨、深圳均已接入真实旅行照片；青岛另外包含两张路线攻略图。
