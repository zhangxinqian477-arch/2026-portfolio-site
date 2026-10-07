const frame = document.getElementById('portfolio');
const loading = document.getElementById('loading');
const mobile = window.matchMedia('(max-width: 700px)');
const pdfUrl = new URL('Zhang%20Xinqian%20portfolio.pdf?v=1646a52ed7cc', location.href);

function showError() {
  loading.hidden = false;
  document.getElementById('spinner').hidden = true;
  document.getElementById('loading-message').textContent = '预览暂时无法加载，请直接打开 PDF 查看作品集。';
}

// Configure the official viewer before initialization; keep vendor files intact.
document.addEventListener('webviewerloaded', (event) => {
  if (event.detail.source !== frame.contentWindow) return;
  const viewer = event.detail.source;
  viewer.PDFViewerApplicationOptions.setAll({
    disablePreferences: true,
    defaultZoomValue: 'page-width',
    sidebarViewOnLoad: mobile.matches ? 0 : 1,
    viewOnLoad: 1,
    viewerCssTheme: 2,
    annotationEditorMode: -1,
    enableScripting: false,
    localeProperties: { lang: 'zh-CN' },
  });
  const app = viewer.PDFViewerApplication;
  app.initializedPromise.then(() => {
    app.eventBus.on('pagerendered', ({ error }) => {
      if (error) showError();
      else loading.hidden = true;
    });
    app.eventBus.on('documenterror', showError);
    app.eventBus.on('pagechanging', () => {
      if (mobile.matches) app.viewsManager?.close();
    });
    mobile.addEventListener('change', ({ matches }) => {
      if (matches) app.viewsManager?.close();
      else app.viewsManager?.switchView(1, true);
      app.pdfViewer.currentScaleValue = 'page-width';
    });
  }).catch(showError);
});

frame.addEventListener('error', showError);
frame.src = `pdfjs/web/viewer.html?file=${encodeURIComponent(pdfUrl.href)}`;
