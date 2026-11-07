export const profile = {
  name: '张新倩',
  direction: '产品体验 / 交互设计 / AI 产品设计',
  introduction: '关注 AI 创作与复杂工具产品，从真实用户任务出发，梳理信息结构与交互路径，并探索更自然的人机协作体验。',
  phone: '17685587780',
  email: 'xinqian_zhang@163.com',
  education: [
    {
      school: '南京大学',
      degree: '建筑学 · 硕士',
      period: '2024.09 — 2027.06',
      notes: ['GPA 4.44 / 5.0', '专业前 30%', '研究：数字化空间与交互'],
    },
    {
      school: '青岛理工大学',
      degree: '建筑学 · 本科',
      period: '2018.09 — 2023.06',
      notes: ['GPA 4.08 / 5.0', '专业前 15%', '连续三年获优秀学生称号'],
    },
  ],
};

export const experiences = [
  {
    id: 'gamehaus',
    company: 'Gamehaus',
    label: 'Gamehaus',
    period: '2026.08—2026.10',
    role: 'UX 设计实习生',
    product: 'Anamana｜AI 漫剧编辑器',
    summary: '参与 AI 漫剧编辑器的核心体验优化，重点负责新手引导、复杂功能引导与交互设计走查。',
    details: [
      { label: '产品与体验优化', text: '参与 AI 漫剧编辑器的核心交互链路优化、用户调研与体验设计，结合内容团队的真实使用反馈，协同产品与研发推进方案落地。' },
      { label: '用户引导体系', text: '针对新用户理解成本较高、功能操作较复杂的问题，主导样例项目跟练式新手引导设计，梳理关键任务路径与操作提示。' },
      { label: '复杂功能引导', text: '针对后续新增的 AI 生成功能，设计 Tooltip 和动态操作演示，帮助用户理解功能作用、操作方式与使用场景。' },
    ],
  },
  {
    id: 'vivix',
    company: 'Vivix AI',
    label: 'Vivix AI',
    period: '2026.03—2026.07',
    role: 'AI 产品设计实习生',
    overview: '参与两条 AI 产品线的体验设计，覆盖 C 端数字人互动与 AI 内容创作工具，围绕核心交互、复杂信息结构和生成式创作流程完成设计与交付。',
    summary: '参与 Fizzz 数字人互动产品及 AI 多分支故事工具的体验设计，覆盖 Web / iOS 创建链路、Canvas 交互和设计交付。',
    projects: [
      {
        title: 'Fizzz — AI 数字人互动与创作产品',
        details: [
          { label: 'Web 端体验', text: '参与 Web 主站重构及信息架构讨论，独立完成数字人互动二级页面设计，并推动落地上线。' },
          { label: 'iOS 创建体验', text: '完善数字人创建链路，补充生成前角色定义、发布前实时互动验证等关键环节，细化编辑、等待与生成反馈状态；同时参与搭建 iOS 设计基础组件库。' },
        ],
      },
      {
        title: 'AI 多分支互动故事创作工具',
        details: [
          { label: '创作流程', text: '参与产品探索阶段的体验设计，围绕 Canvas + Agent 梳理多分支故事创作流程，组织剧本、素材、视频节点和分支关系。' },
          { label: '核心交互与交付', text: '负责剧本卡片与视频节点的核心交互，制作完整的 Figma 交互演示；主导设计走查，整理并推动 70+ 项体验问题跟进修复。' },
        ],
      },
    ],
  },
  {
    id: 'institute',
    company: '南京大学建筑设计规划研究院',
    label: '设计研究院',
    period: '2025.04—2025.12',
    role: '建筑设计实习生',
    summary: '参与前期调研与设计策略表达，并探索 AIGC 在建筑设计流程中的实际应用。',
    details: [
      { label: '方案研究与表达', text: '参与项目前期调研，将复杂设计策略转化为清晰的逻辑架构与规划表达，辅助建筑师梳理需求并完善方案。' },
      { label: 'AI 辅助设计', text: '探索将 AI 工具融入传统设计工作流，利用 AIGC 辅助前期方案生成与后期视觉表现。' },
    ],
  },
];

export const campus = {
  title: '南京大学乡村工作站宣传部｜负责人',
  period: '2024.09—2025.09',
  details: [
    { label: '品牌与内容策划', text: '负责工作站视觉规范体系建设，结合 AIGC 辅助视觉内容产出，统筹公众号 50+ 篇深度内容。' },
    { label: '项目与活动统筹', text: '参与工作站重大会议、展览及活动策划，与其他部门协作推进项目落地。' },
  ],
};

export const about = {
  paragraphs: [
    '我是一个好奇心比较强、也喜欢观察生活细节的人。',
    '建筑学习让我逐渐养成了观察人与空间关系的习惯；摄影则让我喜欢记录那些容易被忽略的瞬间。',
    '工作之外，也会主动体验新的产品和 AI 工具。遇到感兴趣的东西，也会去研究尝试。',
  ],
  interests: [
    { name: '建筑', english: 'Architecture' },
    { name: '摄影', english: 'Photography' },
    { name: '探索', english: 'Exploring' },
  ],
  archive: [
    {
      id: 'festival', file: 'p19-festival-section', width: 2500, height: 2312,
      title: '民俗社区 · 节庆剖面',
      alt: '烟花、灯笼和舞狮环绕的民俗社区剖面拼贴，展示建筑各层的节庆活动',
    },
    {
      id: 'cat', file: 'curious-cat-poster', width: 1767, height: 2500,
      title: '好奇小猫咪 · 海报',
      alt: '粉色手绘小猫咪海报，配有黄色背景、剪贴文字和烟花',
    },
    {
      id: 'street', file: 'p08-qingdao-neighborhood', width: 2500, height: 1995,
      title: '青岛老城区 · 街区拼贴',
      alt: '青岛老城区改造轴测图，橙红屋顶围合街道、广场与庭院',
    },
    {
      id: 'type', file: 'bamboo-type-study', width: 1024, height: 1024,
      title: '竹子字体 · 字形实验',
      alt: '由英文字母排列而成的竹子轮廓，搭配绿色竹节字形 BAMBOO',
    },
    {
      id: 'museum', file: 'museum-at-night', width: 2495, height: 2500,
      title: '博物馆 · 夜景',
      alt: '深蓝夜色下的博物馆建筑效果图，灯光倒映在水面',
    },
    {
      id: 'timber', file: 'p16-timber-installation', width: 2128, height: 2398,
      title: '纵川觅城 · 木构装置',
      alt: '山水背景中的传统木构装置，前景有站在木平台上的人物',
    },
    {
      id: 'exhibition', file: 'rural-life-exhibition', width: 2500, height: 1282,
      title: '乡土生息 · 展览视觉',
      alt: '浅绿色乡土生息主题展板，使用植物形态和乡村摄影拼贴',
    },
    {
      id: 'aerial', file: 'architecture-site-aerial', width: 1800, height: 1088,
      title: '建筑场地 · 鸟瞰',
      alt: '树木与道路之间的白色建筑群鸟瞰图',
    },
    {
      id: 'structure', file: 'truss-structure-model', width: 2500, height: 1406,
      title: '结构模型 · 桁架',
      alt: '黑色背景下的白色桁架结构模型侧视图',
    },
    {
      id: 'night', file: 'p21-night-axonometric', width: 2355, height: 2098,
      title: '民俗社区 · 夜景轴测',
      alt: '烟花夜色下的民俗社区建筑轴测，展现多层屋顶和节庆活动空间',
    },
  ],
};
