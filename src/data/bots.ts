export interface Bot {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface ChatExample {
  text: string;
  onClick?: () => void;
}

// 机器人数据
export const bots: Bot[] = [
  {
    id: 'route',
    name: '路由方案生成',
    description: '输入起点和终点，获取路线图和详细说明',
    icon: 'compass',
  },
  {
    id: 'cable',
    name: '海缆故障问答',
    description: '解答海缆故障相关的各种问题',
    icon: 'network',
  },
  {
    id: 'maintenance',
    name: '运维规程问答',
    description: '解答运维规程相关的各种问题',
    icon: 'tools',
  },
];

// 示例问题
export const examples: Record<string, ChatExample[]> = {
  route: [
    { text: '从上海到北京的最佳路线是什么？' },
    { text: '从广州到深圳怎么走最快？' },
    { text: '我想从杭州去苏州，有什么推荐的路线吗？' },
  ],
  cable: [
    { text: '海缆故障的常见原因有哪些？' },
    { text: '如何排查海缆中断问题？' },
    { text: '海缆故障定位的方法有哪些？' },
  ],
  maintenance: [
    { text: '设备巡检的流程是什么？' },
    { text: '如何处理设备告警？' },
    { text: '机房日常维护包括哪些内容？' },
  ],
};

// 根据ID获取机器人
export const getBotById = (id: string): Bot | undefined => {
  return bots.find((bot) => bot.id === id);
};

// 获取默认机器人ID（第一个）
export const getDefaultBotId = (): string => {
  return bots[0].id;
};

// 根据ID获取示例问题
export const getExamplesByBotId = (id: string): ChatExample[] => {
  return examples[id] || [];
}; 