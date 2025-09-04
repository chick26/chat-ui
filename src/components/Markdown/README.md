# Enhanced Markdown Component

基于 ChatUI 设计风格的增强版 Markdown 组件，支持自动思考过程检测和折叠功能。

## 功能特性

### 🧠 自动思考检测
组件会自动检测内容中的 `<think>` 标签，并将其作为思考过程显示：

```markdown
<think>
让我分析一下这个问题...
1. 首先需要理解需求
2. 然后考虑可能的解决方案
3. 最后选择最佳方案
</think>

基于以上分析，我认为最好的解决方案是...
```

### 💬 多种消息类型
- `text` - 普通文本消息
- `stream` - 流式输出消息（带打字机效果）
- `typing` - 加载中状态

### 🎨 ChatUI 风格设计
完全模仿 ChatUI 3.1.0 的 Bubble、TypingBubble、Think 组件样式。

## 使用方法

### 基础使用

```tsx
import { MarkdownBubble } from './components/Markdown'

// 普通消息
<MarkdownBubble content="Hello **world**!" type="text" />

// 带思考过程的消息（自动检测）
<MarkdownBubble 
  content="<think>让我想想...</think>这是我的答案" 
  type="text" 
/>

// 流式消息
<MarkdownBubble content="正在输出..." type="stream" />

// 加载状态
<MarkdownBubble content="" type="typing" isLoading={true} />
```

### 手动指定思考内容

```tsx
<MarkdownBubble 
  content="这是主要回答内容"
  type="text"
  showThinking={true}
  thinkingContent="这是手动指定的思考过程"
/>
```

## 思考标签语法

### 基本语法
```
<think>
思考内容...
支持 **Markdown** 格式
</think>

主要回答内容
```

### 多个思考段落
```
<think>
第一段思考...
</think>

中间的回答

<think>
第二段思考...
</think>

最终回答
```

## 样式特性

### 🌈 主题适配
- 自动适配亮色/暗色主题
- 使用 ChatUI 设计系统变量

### 📱 响应式设计
- 移动端优化
- 自适应宽度

### ⚡ 动画效果
- 思考折叠/展开动画
- 打字机效果
- 加载动画

## API 参考

### MarkdownBubbleProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| content | string | - | 消息内容，支持 Markdown 和 `<think>` 标签 |
| type | 'text' \| 'stream' \| 'typing' | 'text' | 消息类型 |
| className | string | '' | 自定义样式类名 |
| isLoading | boolean | false | 是否显示加载状态 |
| showThinking | boolean | false | 是否显示思考过程（自动检测时无需设置） |
| thinkingContent | string | '' | 手动指定的思考内容 |

## 样式自定义

组件使用 CSS 变量，可以通过覆盖变量来自定义样式：

```css
:root {
  --chat-bubble-bg: #ffffff;
  --chat-bubble-color: #11192d;
  --chat-bubble-radius: 6px;
  --chat-typing-color: #50607a;
  --chat-think-bg: #f3f6f8;
}
```

## 兼容性

- 保持向后兼容的 `Markdown` 组件
- 支持所有原有功能：数学公式、代码高亮、表格等
- 无缝替换原有的 ChatUI 组件
