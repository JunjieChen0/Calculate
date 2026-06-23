# 安卓平台构建指南

本指南介绍如何将 calculate_JYY 构建为安卓应用。

## 前提条件

1. **Node.js** >= 18.0.0
2. **pnpm** >= 10.8.1
3. **Android Studio** (用于安卓开发)
4. **Java Development Kit (JDK)** >= 17
5. **Android SDK** (通过Android Studio安装)

## 构建步骤

### 1. 安装依赖

```bash
# 安装项目依赖
pnpm install

# 安装Capacitor依赖
pnpm add @capacitor/core @capacitor/cli @capacitor/android
```

### 2. 初始化Capacitor

```bash
# 初始化Capacitor
pnpm cap:init

# 添加安卓平台
pnpm cap:android
```

### 3. 构建Web版本

```bash
# 构建Web版本
pnpm build:web
```

### 4. 同步到安卓项目

```bash
# 同步Web代码到安卓项目
pnpm cap:sync
```

### 5. 在Android Studio中打开项目

```bash
# 在Android Studio中打开安卓项目
pnpm cap:open
```

### 6. 构建APK

在Android Studio中：
1. 点击 "Build" -> "Build Bundle(s) / APK(s)" -> "Build APK(s)"
2. 等待构建完成
3. APK文件位于 `android/app/build/outputs/apk/debug/app-debug.apk`

## 自动化构建

使用提供的脚本进行自动化构建：

```bash
# 完整构建流程
pnpm build:android
```

## 项目结构

```
D:\calculate\
├── android/                    # 安卓项目目录 (Capacitor生成)
├── dist/renderer/             # Web构建输出
├── renderer/                  # 源代码
│   ├── index-web.html        # Web版入口
│   ├── test-android.html     # 安卓兼容性测试页面
│   └── ...
├── capacitor.config.json     # Capacitor配置
└── package.json              # 项目配置
```

## 平台检测

项目包含自动平台检测功能：

- `renderer/utils/platform.js` - 平台检测工具
- `renderer/utils/store.js` - 多平台存储适配器

支持平台：
- **Electron**: 使用原生`electron-store`
- **安卓/iOS**: 使用IndexedDB
- **Web**: 使用localStorage

## 测试安卓兼容性

1. 启动开发服务器：
   ```bash
   pnpm dev
   ```

2. 访问测试页面：
   ```
   http://localhost:5173/test-android.html
   ```

3. 测试页面包含：
   - 平台检测
   - 存储功能测试
   - 触摸支持检测
   - 计算器功能测试

## PWA支持

Web版支持PWA (Progressive Web App)：

1. **Service Worker**: `renderer/sw.js`
2. **Manifest**: `renderer/manifest.json`
3. **离线支持**: 基本的缓存策略

## 故障排除

### 问题：构建失败

**解决方案**:
1. 确保Android Studio和SDK已正确安装
2. 检查环境变量：`ANDROID_HOME`, `JAVA_HOME`
3. 运行 `pnpm cap:sync` 重新同步

### 问题：应用崩溃

**解决方案**:
1. 检查Android Studio的Logcat输出
2. 确保Web代码在浏览器中正常工作
3. 检查CSP (Content Security Policy)设置

### 问题：存储不工作

**解决方案**:
1. 检查IndexedDB支持
2. 确保在`store.js`中正确使用平台检测
3. 测试页面会显示存储状态

## 性能优化

1. **代码分割**: 已配置Vite进行代码分割
2. **资源压缩**: 生产构建自动压缩
3. **缓存策略**: Service Worker提供基本缓存

## 发布到Google Play

1. 生成签名APK：
   - 在Android Studio中: "Build" -> "Generate Signed Bundle / APK"
   - 选择 "Android App Bundle" 格式

2. 准备应用资源：
   - 应用图标
   - 截图
   - 描述文案

3. 上传到Google Play Console

## 注意事项

1. **权限**: 应用不需要特殊权限
2. **网络**: 应用完全离线工作
3. **存储**: 使用IndexedDB，无需外部存储权限
4. **兼容性**: 支持Android 5.0+ (API 21+)
