# 匿名新民 - GitHub Pages 前端網站 (github_frontend)

這是「匿名新民」的 React 前端單頁應用程式，專為部署於 **GitHub Pages (github.io)** 設計。

---

## 🌐 快速部署至 GitHub Pages 指南 (使用 GitHub Actions)

### 步驟 1：新增 GitHub Actions 部署工作流 (.github/workflows/deploy.yml)

在您的 GitHub 儲存庫根目錄下建立 `.github/workflows/deploy.yml` 檔案（若儲存庫直接就是前端程式碼，請依據註解調整 `working-directory`）：

```yaml
name: Deploy Frontend to GitHub Pages

on:
  push:
    branches: [ main ] # 或 master

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          # 如果沒有推送 package-lock.json，請將 cache 註解掉，避免找不到 lockfile 報錯：
          # cache: 'npm'
          # cache-dependency-path: './github_frontend/package-lock.json'

      - name: Install Dependencies
        working-directory: ./github_frontend # 👈 如果您的專案在 github_frontend 子資料夾，必須加上此行！
        run: npm install

      - name: Build Project
        working-directory: ./github_frontend # 👈 如果您的專案在 github_frontend 子資料夾，必須加上此行！
        # 於此處寫入打包時所需的環境變數 (Vite 會在打包時嵌入這些數值)
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }} # 或直接填入後端網址：https://your-backend.onrender.com/api
          VITE_TURNSTILE_SITE_KEY: "0x4AAAAAAD_Exkr-g2QpaNgb"
          VITE_SUPABASE_URL: "https://yeqvfyxwuyyjlxqtzvbc.supabase.co"
          VITE_SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY"
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          # 如果您的專案在 github_frontend 子資料夾，請改為 ./github_frontend/dist
          path: ./github_frontend/dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

### 步驟 2：設定 GitHub Pages 來源

1. 前往您的 GitHub 儲存庫 -> **Settings** -> **Pages**。
2. 在 **Build and deployment** -> **Source** 選擇 **`GitHub Actions`**。
3. 推送程式碼後，前往 **Actions** 頁籤即可看到自動構建與部署進度。

---

## 🔑 環境變數說明與設定方法

Vite 框架要求前端環境變數必須以 `VITE_` 開頭，且**是在打包 (Build Time) 時寫死進入 JavaScript 檔案**中。

提供以下兩種設定方式：

### 方式 A：GitHub Secrets / YAML 部署設定 (推薦)
在 GitHub 儲存庫的 **Settings -> Secrets and variables -> Actions** 中新增 Secret，例如：
* `VITE_API_URL`: 您的 Render 後端 API 網址 (例如 `https://your-backend.onrender.com/api`)

並在 YAML 的 `env:` 區塊直接參照即可。

### 方式 B：本地端建立 `.env` 檔案
1. 參考資料夾中的 `env.example` 範本。
2. 複製並建立一個檔名為 `.env` 的檔案（注意開頭有句點 `.`)。
3. 填入您的正確參數後進行 `npm run build`。
> ⚠️ **注意**：`env.example` 只是參考範本，Vite 只會自動讀取 `.env` 檔案，請勿直接修改 `env.example` 後以為它會生效！

---

## 🔗 頁面內建設定面板

就算部署時未填寫 `VITE_API_URL`，使用者開啟網站後，亦可點擊頂部導覽列的 **「部署與 API 設定」** 按鈕，手動輸入 Render API 網址完成連線！

