const frame = document.getElementById('portfolio');
const loading = document.getElementById('loading');
const mobile = window.matchMedia('(max-width: 700px)');
const pdfUrl = new URL('Zhang%20Xinqian%20portfolio.pdf?v=1646a52ed7cc', location.href);
const sections = [
  { title: '简介', subtitle: '封面 · 关于我', start: 1, end: 2 },
  { title: 'Fizzz', subtitle: 'AI 角色互动与创建', start: 3, end: 11 },
  { title: '互动故事创作工具', subtitle: '多分支故事创作', start: 12, end: 18 },
  { title: 'Echo', subtitle: '职场成长 AI 助手', start: 19, end: 20 },
];

function showError() {
  loading.hidden = false;
  document.getElementById('spinner').hidden = true;
  document.getElementById('loading-message').textContent = '预览暂时无法加载，请直接打开 PDF 查看作品集。';
}

function addViewerStyles(viewer) {
  const stylesheet = viewer.document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('portfolio-viewer.css?v=3', location.href).href;
  viewer.document.head.append(stylesheet);
}

function createSectionNavigation(viewer, app) {
  const content = viewer.document.getElementById('viewsManagerContent');
  if (!content || viewer.document.getElementById('portfolioSectionNav')) return;

  const nav = viewer.document.createElement('nav');
  nav.id = 'portfolioSectionNav';
  nav.className = 'portfolio-section-nav';
  nav.setAttribute('aria-label', '作品集项目目录');

  const heading = viewer.document.createElement('div');
  heading.className = 'portfolio-section-heading';
  heading.innerHTML = `
    <span class="portfolio-section-heading-label">项目目录</span>
    <span class="portfolio-section-current" id="portfolioSectionCurrent">简介</span>
    <button
      class="portfolio-section-toggle"
      id="portfolioSectionToggle"
      type="button"
      aria-controls="portfolioSectionList"
      aria-expanded="true"
      aria-label="收起项目目录"
      title="收起项目目录"
    ><span aria-hidden="true"></span></button>
  `;
  nav.append(heading);

  const sectionList = viewer.document.createElement('div');
  sectionList.id = 'portfolioSectionList';
  sectionList.className = 'portfolio-section-list';

  for (const section of sections) {
    const button = viewer.document.createElement('button');
    button.type = 'button';
    button.className = 'portfolio-section-button';
    button.dataset.start = String(section.start);
    button.dataset.end = String(section.end);
    button.setAttribute('aria-label', `跳转到${section.title}，第 ${section.start} 页`);
    button.innerHTML = `
      <span class="portfolio-section-copy">
        <strong>${section.title}</strong>
        <small>${section.subtitle}</small>
      </span>
      <span class="portfolio-section-pages">${section.start === section.end ? section.start : `${section.start}–${section.end}`}</span>
    `;
    button.addEventListener('click', () => app.pdfLinkService.goToPage(section.start));
    sectionList.append(button);
  }

  nav.append(sectionList);

  const toggle = heading.querySelector('#portfolioSectionToggle');
  toggle?.addEventListener('click', () => {
    const collapsed = nav.classList.toggle('is-collapsed');
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.setAttribute('aria-label', collapsed ? '展开项目目录' : '收起项目目录');
    toggle.title = collapsed ? '展开项目目录' : '收起项目目录';
  });

  content.prepend(nav);

  const updateActiveSection = (pageNumber) => {
    const active = sections.find(section => pageNumber >= section.start && pageNumber <= section.end);
    nav.querySelectorAll('.portfolio-section-button').forEach((button) => {
      const isActive = Boolean(active && Number(button.dataset.start) === active.start);
      button.toggleAttribute('aria-current', isActive);
    });
    const current = viewer.document.getElementById('portfolioSectionCurrent');
    if (current) current.textContent = active?.title || `第 ${pageNumber} 页`;
  };

  app.eventBus.on('pagechanging', ({ pageNumber }) => updateActiveSection(pageNumber));
  updateActiveSection(app.pdfViewer.currentPageNumber || 1);
}

function customizeToolbar(viewer, app) {
  const viewerDocument = viewer.document;
  viewerDocument.documentElement.classList.add('portfolio-customized');
  viewerDocument.title = '张新倩｜UX 作品集';

  const printGroup = viewerDocument.getElementById('printButton')?.parentElement;
  const hiddenControls = [
    viewerDocument.getElementById('viewFindButton')?.parentElement,
    viewerDocument.getElementById('previous')?.parentElement,
    viewerDocument.getElementById('editorModeButtons'),
    viewerDocument.getElementById('editorModeSeparator'),
    viewerDocument.getElementById('secondaryToolbarToggle'),
    printGroup,
    printGroup?.nextElementSibling,
  ];
  hiddenControls.forEach(control => control?.classList.add('portfolio-control-hidden'));

  const toolbarLeft = viewerDocument.getElementById('toolbarViewerLeft');
  const pageNumber = viewerDocument.getElementById('pageNumber');
  if (toolbarLeft && pageNumber && !viewerDocument.getElementById('portfolioBrand')) {
    const brand = viewerDocument.createElement('div');
    brand.id = 'portfolioBrand';
    brand.className = 'portfolio-brand';
    brand.setAttribute('aria-label', '张新倩 UX 作品集');
    brand.innerHTML = '<strong>张新倩</strong><span>UX PORTFOLIO</span>';
    const pageControls = pageNumber.closest('.loadingInput')?.parentElement;
    toolbarLeft.insertBefore(brand, pageControls || null);
  }

  const toolbarRight = viewerDocument.getElementById('toolbarViewerRight');
  if (toolbarRight && !viewerDocument.getElementById('portfolioActions')) {
    const actions = viewerDocument.createElement('div');
    actions.id = 'portfolioActions';
    actions.className = 'toolbarHorizontalGroup portfolio-actions';

    const fullscreen = viewerDocument.createElement('button');
    fullscreen.id = 'portfolioFullscreenButton';
    fullscreen.className = 'toolbarButton portfolio-fullscreen-button';
    fullscreen.type = 'button';
    fullscreen.title = '全屏查看';
    fullscreen.setAttribute('aria-label', '全屏查看作品集');
    fullscreen.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await frame.requestFullscreen();
      } catch {}
    });

    actions.append(fullscreen);
    toolbarRight.prepend(actions);

    document.addEventListener('fullscreenchange', () => {
      const active = Boolean(document.fullscreenElement);
      fullscreen.classList.toggle('toggled', active);
      fullscreen.title = active ? '退出全屏' : '全屏查看';
      fullscreen.setAttribute('aria-label', active ? '退出全屏' : '全屏查看作品集');
    });
  }

  const sidebarLabel = viewerDocument.getElementById('viewsManagerHeaderLabel');
  if (sidebarLabel) sidebarLabel.textContent = '页面导航';
  createSectionNavigation(viewer, app);
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
    addViewerStyles(viewer);
    customizeToolbar(viewer, app);
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
