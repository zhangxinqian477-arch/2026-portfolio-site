export const locations = Object.freeze([
  {
    id: 'nanjing',
    city: '南京',
    cityEn: 'Nanjing',
    country: 'Jiangsu, China',
    lat: 32.0603,
    lng: 118.7969,
    date: 'TRAVEL PHOTOGRAPHY',
    previewMeta: 'Travel photography · 8 photos',
    title: '光落在树影、水面和旧城的轮廓之间',
    description: '南京的一组旅行摄影：从梧桐路、秋日湖面，到城墙远眺与傍晚水光。城市的层次藏在不同季节和光线里。',
    cover: './assets/places/nanjing/web/cover.webp',
    coverAlt: '南京秋日湖面与岸边树木的旅行摄影',
    assets: [
      ['01.webp', '梧桐路', '南京梧桐树下的街道'],
      ['02.webp', '城市远眺', '从高处远眺南京城市建筑'],
      ['03.webp', '檐角与远景', '南京传统建筑檐角与城市远景'],
      ['04.webp', '湖面晚舟', '傍晚湖面上的船与水光'],
      ['05.webp', '金色水光', '夕阳照在水面形成金色倒影'],
      ['06.webp', '树与倒影', '树木与水面倒影'],
      ['07.webp', '花影与阳台', '花朵映衬下的建筑阳台']
    ].map(([file, caption, alt]) => ({ src: `./assets/places/nanjing/web/${file}`, type: 'photo', caption, alt })),
    camera: null,
    demo: false
  },
  {
    id: 'wuxi',
    city: '无锡',
    cityEn: 'Wuxi',
    country: 'Jiangsu, China',
    lat: 31.4912,
    lng: 120.3119,
    date: 'TRAVEL PHOTOGRAPHY',
    previewMeta: 'Travel photography · 4 photos',
    title: '水面落日与窗边的片刻',
    description: '无锡的旅行摄影围绕水、夕阳和飞鸟展开：有远处的岛与船，也有隔着窗框看见的安静一刻。',
    cover: './assets/places/wuxi/web/cover.webp',
    coverAlt: '无锡水面夕阳、飞鸟与船的旅行摄影',
    assets: [
      ['01.webp', '树影里的水光', '从树木之间望见的金色水面'],
      ['02.webp', '夕阳、飞鸟与亭子', '夕阳和飞鸟组成的旅行摄影拼图'],
      ['03.webp', '窗框里的湖面', '透过室内窗框望见的湖面']
    ].map(([file, caption, alt]) => ({ src: `./assets/places/wuxi/web/${file}`, type: 'photo', caption, alt })),
    camera: null,
    demo: false
  },
  {
    id: 'qingdao',
    city: '青岛',
    cityEn: 'Qingdao',
    country: 'Shandong, China',
    lat: 36.0671,
    lng: 120.3826,
    date: 'TRAVEL PHOTOGRAPHY',
    previewMeta: 'Travel photography · 4 photos + 2 guides',
    title: '海岸线把日常拉得很长',
    description: '青岛的一组海边观察：远处的城市、退潮后的沙滩、海面上的船，以及沿岸层层展开的生活。',
    cover: './assets/places/qingdao/web/cover.webp',
    coverAlt: '青岛沙滩与远处城市海岸线的旅行摄影',
    assets: [
      ['01.webp', '沿海远眺', '青岛海岸线和远处城市'],
      ['02.webp', '海面上的船', '青岛海面上的船只'],
      ['03.webp', '沿岸展开的城市', '青岛海湾与沿岸红屋顶建筑']
    ].map(([file, caption, alt]) => ({ src: `./assets/places/qingdao/web/${file}`, type: 'photo', caption, alt })).concat([
      { src: './assets/places/qingdao/web/04.webp', type: 'guide', caption: '沿海看海指南', alt: '青岛沿海看海地点攻略图' },
      { src: './assets/places/qingdao/web/05.webp', type: 'guide', caption: '旅行路线参考', alt: '青岛市区与沿海旅行路线攻略图' }
    ]),
    camera: null,
    demo: false
  },
  {
    id: 'datong',
    city: '大同',
    cityEn: 'Datong',
    country: 'Shanxi, China',
    lat: 40.0903,
    lng: 113.2953,
    date: 'TRAVEL PHOTOGRAPHY',
    previewMeta: 'Travel photography · 6 photos',
    title: '木构、壁画与古城里的时间',
    description: '大同的一组建筑与细节记录：寺院、木塔、梁柱、壁画和城门，让时间在结构与颜色里被看见。',
    cover: './assets/places/datong/web/cover.webp',
    coverAlt: '大同古建筑院落与木构细节的旅行摄影',
    assets: [
      ['01.webp', '古建远望', '大同古建筑与天空'],
      ['02.webp', '塔与檐', '大同古塔和层叠屋檐'],
      ['03.webp', '木构细节', '传统建筑梁柱与彩绘细节'],
      ['04.webp', '壁画的颜色', '大同古建筑内的壁画细节'],
      ['05.webp', '穿过城门', '大同古城门洞与街景']
    ].map(([file, caption, alt]) => ({ src: `./assets/places/datong/web/${file}`, type: 'photo', caption, alt })),
    camera: null,
    demo: false
  },
  {
    id: 'xian',
    city: '西安',
    cityEn: "Xi'an",
    country: 'Shaanxi, China',
    lat: 34.3416,
    lng: 108.9398,
    date: 'TRAVEL PHOTOGRAPHY',
    previewMeta: 'Travel photography · 5 photos',
    title: '城门、屋檐与雪后的城市边缘',
    description: '西安的一组建筑与冬日记录：从永宁门的正面秩序、城墙上的屋檐与灯笼，到雪后城郊安静的灰白层次。',
    cover: './assets/places/xian/web/cover.webp',
    coverAlt: '西安永宁门与城墙建筑的旅行摄影',
    assets: [
      { src: './assets/places/xian/web/01.webp', type: 'photo', caption: '城市里的钟楼', alt: '西安城市街道与传统钟楼建筑' },
      { src: './assets/places/xian/web/02.webp', type: 'photo', caption: '城墙与灯笼', alt: '西安城墙、屋檐与红色灯笼' },
      { src: './assets/places/xian/web/03.webp', type: 'photo', caption: '屋檐向远处展开', alt: '西安城墙建筑屋檐和成排灯笼' },
      { src: './assets/places/xian/web/04.webp', type: 'photo', caption: '雪后的城市边缘', alt: '西安雪后树木、院落与远处建筑' }
    ],
    camera: null,
    demo: false
  },
  {
    id: 'haerbin',
    city: '哈尔滨',
    cityEn: 'Harbin',
    country: 'Heilongjiang, China',
    lat: 45.8038,
    lng: 126.5349,
    date: 'TRAVEL PHOTOGRAPHY',
    previewMeta: 'Travel photography · 3 photos',
    title: '冰雪让城市的曲线更清楚',
    description: '哈尔滨的冬日旅行摄影：雪地里的现代建筑、手作小雪人，以及夕阳照亮的桥与冰面。',
    cover: './assets/places/haerbin/web/cover.webp',
    coverAlt: '哈尔滨雪地中的现代建筑与人物旅行摄影',
    assets: [
      ['01.webp', '雪地里的小雪人', '哈尔滨冬日雪人与旅行片段拼图'],
      ['02.webp', '夕阳下的桥与冰面', '哈尔滨夕阳照亮桥梁与冰雪']
    ].map(([file, caption, alt]) => ({ src: `./assets/places/haerbin/web/${file}`, type: 'photo', caption, alt })),
    camera: null,
    demo: false
  },
  {
    id: 'shenzhen',
    city: '深圳',
    cityEn: 'Shenzhen',
    country: 'Guangdong, China',
    lat: 22.5431,
    lng: 114.0579,
    date: 'TRAVEL PHOTOGRAPHY',
    previewMeta: 'Travel photography · 4 photos',
    title: '海面与城市一起进入傍晚',
    description: '从山海之间望向深圳：落日、天际线、跨海桥和压低的云，组成城市另一种缓慢的节奏。',
    cover: './assets/places/shenzhen/web/cover.webp',
    coverAlt: '深圳海边天际线与夕阳的旅行摄影',
    assets: [
      ['01.webp', '海面落日', '深圳海面上的夕阳'],
      ['02.webp', '水与桥', '深圳水面与远处跨海桥'],
      ['03.webp', '云压向海面', '深圳海边低垂的云层']
    ].map(([file, caption, alt]) => ({ src: `./assets/places/shenzhen/web/${file}`, type: 'photo', caption, alt })),
    camera: null,
    demo: false
  }
]);
