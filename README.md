# 智能对话助手 (Chat-UI)

基于React和ChatUI库构建的智能对话应用，支持多场景问答和自定义对话界面。

## 功能介绍

本应用是一个多功能的聊天界面，主要提供以下功能：

### 核心功能
- 多场景智能对话（路由方案生成、海缆故障问答、运维规程问答）
- 基于ChatUI的美观聊天界面
- 消息历史记录管理
- 支持多种消息类型（文本、图片、路由信息等）
- 快速回复/示例问题功能
- 响应式设计，支持移动端和桌面端

### 特色功能
- 场景切换：可在不同聊天机器人之间切换
- 清空历史：支持一键清空聊天记录
- 自定义消息组件：支持路由地图、故障报告等特定消息类型
- 安全区适配：支持iPhone等设备的刘海屏和底部指示条

## 项目结构

```
src/
├── components/         # UI组件
│   ├── ChatWindow/     # 聊天窗口组件
│   ├── Sidebar/        # 侧边栏组件
│   ├── CableResponse/  # 海缆故障回复组件
│   ├── RouteResponse/  # 路由方案回复组件
│   └── MaintenanceResponse/ # 运维规程回复组件
├── data/               # 数据相关
│   └── bots.ts         # 机器人配置和示例问题
├── mock/               # 模拟数据
│   └── chatResponses.js # 模拟API响应
├── pages/              # 页面组件
│   └── Main/           # 主页面
├── router/             # 路由配置
│   └── index.tsx       # 路由定义
├── utils/              # 工具函数
├── App.tsx             # 应用入口
└── index.tsx           # React入口
```

## 开始使用

### 安装依赖

```bash
npm install
```

### 运行开发环境

```bash
npm start
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动。

### 构建生产环境

```bash
npm run build
```

## 修改指南

### 添加/修改场景

编辑 `src/data/bots.ts` 文件中的 `bots` 数组：

```typescript
export const bots: Bot[] = [
  {
    id: 'new-scene',            // 场景ID，唯一标识
    name: '新场景名称',          // 显示的场景名称
    description: '场景描述',     // 场景简短描述
    icon: 'icon-name',          // 图标名称，使用ChatUI图标库
  },
  // 其他场景...
];
```

同时添加该场景的示例问题：

```typescript
export const examples: Record<string, ChatExample[]> = {
  // 现有示例...
  'new-scene': [
    { text: '示例问题1' },
    { text: '示例问题2' },
    // 更多示例问题...
  ],
};
```

### 添加新的消息类型

1. 创建新的响应组件，例如 `src/components/NewResponse/index.tsx`
2. 在 `src/components/ChatWindow/index.tsx` 的 `renderMessageContent` 函数中添加处理：

```typescript
if (type === 'new-type') {
  return (
    <Bubble type="text">
      <NewResponse 
        // 传递所需属性
        property1={content.property1}
        property2={content.property2}
      />
    </Bubble>
  );
}
```

### 修改样式

主要样式文件:
- `src/components/ChatWindow/style.css` - 聊天窗口样式
- `src/pages/Main/style.css` - 主页面布局样式

ChatUI支持主题定制，可以通过CSS变量覆盖默认样式：

```css
:root {
  --brand-1: #255bda; /* 主题色 */
  --brand-2: #255bda; /* 主题色-重点 */
  --brand-3: #316cf1; /* 主题色-轻量 */
}
```

### 图标使用

ChatUI 图标通过以下方式引入：

```html
<script src="//g.alicdn.com/chatui/icons/2.0.2/index.js"></script>
```

在组件中使用图标:

```jsx
// 导航栏图标
<Chat
  navbar={{ 
    title: "标题",
    rightContent: [{ icon: 'icon-name', onClick: handleClick }]
  }}
/>
```

## API接入

目前应用使用 `src/mock/chatResponses.js` 模拟后端响应。如需接入真实API，请修改 `ChatWindow` 组件中的 `handleSend` 函数，将 `mockSendMessage` 替换为真实的API调用。

## 许可证

ISC
