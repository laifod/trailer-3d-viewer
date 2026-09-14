# TRAILER LAB — 挂车结构与细节查看器

本项目用于 GitHub Pages，浏览器通过同源 ES 模块加载 Three.js 和建模源码，无需后端、账号或数据库。保留白色工业外观、蓝色机械件，细化车架、牵引销与鞍座、悬挂、车桥与制动、支撑、防护和挂车附件。驾驶室、内饰、动力系统与挂车厢体也可独立显示。

## 使用方法

左侧勾选决定显示哪些部件，“单独”聚焦一个系统。“全部显示”和“仅挂车底盘”提供快捷组合。

右侧“聚焦位置”只改变取景，不重置手动勾选。底部可切换斜视、左视、右视、俯视、仰视、前视和后视；也可拖动旋转、滚轮缩放、右键或 Shift 拖动平移。手机支持单指旋转、双指缩放和平移，通过底部“部件显示”和“视角 / 细节”打开控制面板。

- **基础轮廓**：主要承载件、壳体、轮组。
- **结构组件**：增加支架、管路、连杆、锁止机构。
- **完整细节**：增加螺栓、垫圈、焊缝、ABS传感线、丝杠螺纹等。
- **车厢透明度**：只改变已勾选车厢的材质，不重新开启隐藏系统。
- **牵引组件分离**：将牵引销和安装板向上移动 0–70 cm，便于查看销颈、开口鞍座和锁止钳口。这是展示分离，不是实际工作行程。
- **恢复整车**：恢复全部系统、完整细节、48%透明度和未分离状态。

键盘：聚焦画布后方向键旋转，`+` / `-` 缩放，`0` 复位。支持自动旋转和全屏。

## 发布到 GitHub Pages

1. 新建或选择你的 GitHub 仓库，默认分支使用 `main`。
2. 将本项目内容上传到仓库根目录，保留 `dist/`、`scripts/`、`.github/workflows/deploy-pages.yml` 的相对位置。不要只上传 ZIP 文件。
3. 进入 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。
4. 打开 **Actions → Deploy GitHub Pages**，等待自动运行完成；如首次运行早于第3步，可点击 **Run workflow** 重新运行。
5. 成功部署后的地址显示在工作流和 Pages 设置中，通常为 `https://用户名.github.io/仓库名/`。

所有页面和模型引用使用相对路径，支持项目子路径。工作流先验证模型与显示逻辑，再生成 GLB，最后发布 `dist/`。源码包不包含大体积 GLB，部署时会生成并提供下载。GLB 按系统分组，并附带 `system` / `detail` 元数据。

官方说明：[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 本地运行（Node.js 22）

不需要安装 npm 依赖。

```bash
node scripts/verify.mjs
node scripts/export-model.mjs
node scripts/serve.mjs
```

打开终端显示的预览地址（默认 `http://127.0.0.1:8788/`）。请通过 HTTP 服务预览，不要直接双击 HTML：浏览器通常限制 `file://` 页面的 ES 模块导入。

## 项目结构

```text
dist/index.html               网页入口
dist/styles.css               桌面与手机布局
dist/src/app.mjs              交互、渲染、触控
dist/src/state.mjs            显示级别与视角状态
dist/src/systems.mjs          七大系统细化几何与分类
dist/src/model.mjs            原始完整车辆模型
dist/src/three.module.mjs     Three.js r160
dist/assets/trailer.glb       自动生成的完整模型
scripts/verify.mjs            几何与显示状态检查
scripts/export-model.mjs      GLB 导出
scripts/serve.mjs             本地静态服务
.github/workflows/            GitHub Pages 自动发布
```

## 模型说明

单位米，Y轴向上；整体按照片估算。机械结构为概念展示，不代表某一厂商的工程尺寸、承载能力、装配间隙或法规符合性。丝杠螺纹和油槽采用展示几何；牵引销分离是视图功能，不是工作仿真。

Three.js 来自 [mrdoob/three.js](https://github.com/mrdoob/three.js) r160，MIT许可见 `dist/THREE-LICENSE.txt`。车辆几何依据用户提供的参考图程序化制作，不依赖外部模型链接。运行时无需第三方 CDN。

可选 WebMCP：支持 `document.modelContext` 的浏览器会注册 `inspect_trailer_system`，与网页“单独”按钮使用同一套逻辑；不支持的浏览器不影响操作。
