# H5 俄罗斯方块

一个使用 HTML5 Canvas 开发的现代化俄罗斯方块游戏，具有清新的界面设计和流畅的游戏体验。

## 功能特性

- 经典的俄罗斯方块玩法
- 下一个方块预览
- 方块投影提示
- 虚线连接效果
- 分数统计系统
- 等级进阶机制
- 响应式设计

## 游戏截图

![游戏界面](https://raw.githubusercontent.com/hillyson/h5-tetris/main/screenshots/game.png)

## 技术栈

- HTML5 Canvas
- JavaScript (ES6+)
- Vite
- CSS3

## 安装运行

1. 克隆项目到本地：

```bash
git clone https://github.com/hillyson/h5-tetris.git
cd h5-tetris
```

2. 安装依赖：

```bash
npm install
```

3. 启动开发服务器：

```bash
npm run dev
```

4. 在浏览器中访问 `http://localhost:5173` 即可开始游戏

## 游戏操作

键盘操作：
- ↑ 方向键：旋转方块
- ← 方向键：向左移动
- → 方向键：向右移动
- ↓ 方向键：加速下落

触屏操作：
- 点击屏幕：旋转方块
- 左滑：向左移动
- 右滑：向右移动
- 下滑：加速下落

## 游戏规则

1. 使用方向键控制方块移动和旋转
2. 消除一行可得100分（基础分） × 当前等级
3. 每消除10行提升一个等级
4. 方块堆到顶部时游戏结束

## 开发环境

- Node.js >= 14.0.0
- npm >= 6.0.0

## 构建部署

执行以下命令构建项目：

```bash
npm run build
```

构建后的文件将生成在 `dist` 目录中，可以部署到任何静态文件服务器。

## 贡献

欢迎提交 Issue 或 Pull Request 来帮助改进这个项目。

## 许可

[MIT](LICENSE)
