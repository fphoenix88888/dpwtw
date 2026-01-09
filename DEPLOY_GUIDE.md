# Tocas UI CMS 部署與使用說明

恭喜您！您的網站已經建置完成。這是一份完整的部署與使用指南，協助您將網站發布到網路上。

## 1. 專案結構

此專案是基於 **React 19** + **Vite** + **Tocas UI** 構建的單頁應用程式 (SPA)。

*   `src/`: 原始碼目錄
    *   `pages/`: 前台與後台頁面
    *   `components/`: 共用元件
    *   `services/`: 資料庫邏輯 (LocalStorage)
    *   `assets/`: 圖片資源
*   `dist/`: 建置後的靜態檔案 (部署用)
*   `public/`: 公開靜態資源

## 2. 本地開發 (若需修改程式碼)

如果您需要修改網站功能，請依照以下步驟在您的電腦上執行：

### 前置需求
*   請先安裝 [Node.js](https://nodejs.org/) (建議 v18 或以上)
*   建議安裝 [pnpm](https://pnpm.io/) (執行 `npm install -g pnpm`)

### 安裝與啟動
1.  解壓縮 `tocas-rwd-cms-package.zip`。
2.  開啟終端機 (Terminal)，進入專案資料夾。
3.  安裝依賴套件：
    ```bash
    pnpm install
    # 或者使用 npm install
    ```
4.  啟動開發伺服器：
    ```bash
    pnpm dev
    # 或者 npm run dev
    ```
5.  開啟瀏覽器訪問 `http://localhost:5173`。

## 3. 部署上線 (發布網站)

此專案為**靜態網站**，您可以免費部署到多種託管服務。

### 方法 A：GitHub Pages (推薦)
1.  在 GitHub 建立一個新的 Repository。
2.  將專案推送到 GitHub。
3.  在 Repository 的 `Settings` > `Pages` 中，將來源設為 `dist` 資料夾 (若您使用 GitHub Actions) 或依照 Vite 官方文件的 GitHub Pages 部署流程設定。
4.  **注意**：若部署在非根目錄 (如 `username.github.io/repo-name/`)，請在 `vite.config.ts` 中設定 `base: '/repo-name/'` 並重新打包。

### 方法 B：Vercel / Netlify (最簡單)
1.  註冊 [Vercel](https://vercel.com/) 或 [Netlify](https://netlify.com/)。
2.  連結您的 GitHub 帳號並選擇此 Repository。
3.  Build Command 設定為 `pnpm build` (或 `npm run build`)。
4.  Output Directory 設定為 `dist`。
5.  點擊 Deploy，幾秒鐘後即可獲得正式網址。

### 方法 C：傳統 Web 伺服器 (Apache/Nginx/IIS)
1.  在本地執行打包指令：
    ```bash
    pnpm build
    ```
2.  將產生的 `dist/` 資料夾內的所有檔案，上傳至您的伺服器根目錄 (如 `/var/www/html`)。
3.  **重要**：因為是 SPA，請設定伺服器將所有 404 請求導向至 `index.html`，否則重新整理頁面時會出現 404 錯誤。
    *   **Nginx 範例**: `try_files $uri $uri/ /index.html;`
    *   **Apache 範例**: 使用 `.htaccess` 設定 RewriteRule。

## 4. 網站初始化 (Setup)

網站首次部署上線後，請依照以下步驟啟用：

1.  **進入安裝頁面**：開啟首頁，系統會自動導向至安裝導引 (`/setup`)。
2.  **填寫資訊**：設定您的網站名稱、管理員姓名、Email 與密碼。
3.  **完成設定**：安裝完成後，網站預設為「維護模式」。
4.  **開啟網站**：
    *   登入後台 (`/admin/login`，連結已隱藏，需手動輸入或從安裝完成頁面跳轉)。
    *   進入「網站設定」。
    *   將「維護模式」排程移除或關閉，網站即可對外開放。

## 5. 資料備份與注意事項

*   **資料儲存位置**：本系統使用瀏覽器的 **LocalStorage** 模擬資料庫。這意味著：
    *   資料**僅儲存在您目前的瀏覽器中**。
    *   若清除瀏覽器快取或更換電腦/瀏覽器，資料將會消失。
    *   訪客看到的內容取決於他們自己的瀏覽器 (此為模擬 CMS，適合個人演示或單機使用)。
*   **備份方式**：
    *   請定期進入後台「系統資訊」頁面。
    *   點擊「備份資料」下載 JSON 檔。
    *   若需在其他裝置使用，請在該裝置進入後台「系統資訊」並使用「還原資料」上傳 JSON 檔。

如有任何問題，歡迎參考原始碼或聯絡開發人員。
