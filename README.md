# extension-template
浏览器插件模板

## Google Analytics 埋点配置

本项目已集成 Google Analytics 4 (GA4) 埋点功能，可以追踪用户的各种操作和页面链接。

### 配置步骤

1. **创建 Google Analytics 4 属性**
   - 访问 [Google Analytics](https://analytics.google.com/)
   - 创建新的 GA4 属性（如果还没有）

2. **获取 Measurement ID 和 API Secret**
   - 在 GA4 中，进入 **管理** > **数据流** > 选择你的数据流
   - 复制 **Measurement ID**（格式类似：`G-XXXXXXXXXX`）
   - 进入 **管理** > **数据流** > **Measurement Protocol API secrets**
   - 创建新的 API Secret，复制生成的密钥

3. **配置插件**
   - 打开 `lib/analytics.ts` 文件
   - 替换以下两个值：
     ```typescript
     const MEASUREMENT_ID = '<measurement_id>'  // 替换为你的 Measurement ID
     const API_SECRET = '<api_secret>'          // 替换为你的 API Secret
     ```

### 追踪的事件

插件会自动追踪以下用户操作：

#### 背景脚本事件
- `icon_click` - 用户点击插件图标打开侧边栏
- `tab_activated` - 用户切换标签页
- `page_updated` - 页面 URL 更新

#### 侧边栏事件
- `sidepanel_opened` - 侧边栏打开
- `extension_copy` - 复制代码（单个或批量）
- `extension_scroll_to_element` - 滚动到代码元素
- `refresh_list` - 刷新代码列表
- `settings_opened` - 打开设置
- `toggle_expand` - 展开/收起代码块
- `toggle_check` - 选择/取消选择代码块
- `toggle_all_check` - 全选/取消全选
- `copy_selected_no_selection` - 尝试复制但未选择任何项
- `language_selected` - 选择语言
- `language_selected_from_history` - 从历史记录选择语言
- `language_reset` - 重置语言设置

### 事件参数

所有事件都包含以下参数：
- `page_url` - 用户操作时的页面链接（这是你特别关心的功能）
- `session_id` - 会话 ID
- `engagement_time_msec` - 参与时间（毫秒）

特定事件还包含额外参数，例如：
- `copy_type` - 复制类型（'single' 或 'multiple'）
- `code_length` - 代码长度
- `element_id` - 元素 ID
- `language` - 选择的语言
- `checked` - 复选框状态
- `expanded` - 展开状态
- `total_items` - 总项目数

### 查看数据

1. 在 Google Analytics 中，进入 **报告** > **实时**
2. 可以实时查看用户活动
3. 在 **探索** 中创建自定义报告，按 `page_url` 参数分析用户在不同页面的行为

### 调试模式

在开发环境下，Analytics 会自动启用调试模式，会在控制台输出详细的请求信息。生产环境下会自动关闭调试模式。

### 注意事项

- 如果未配置 `MEASUREMENT_ID` 和 `API_SECRET`，埋点功能不会工作，但不会影响插件的其他功能
- 所有事件都包含 `page_url` 参数，方便你分析用户在不同页面的使用情况
- 数据会发送到 Google Analytics 服务器，请确保遵守隐私政策
