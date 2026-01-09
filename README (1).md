# Tocas UI CMS

這是一個基於 React + Tocas UI 建置的全端（模擬）CMS 網站。
具備完整的前台顯示與後台管理功能，並支援 RWD 響應式設計。

## 功能特色

- **前端設計**：採用 [Tocas UI](https://tocas-ui.com/) (v5) 打造現代化、簡潔的介面。
- **響應式設計 (RWD)**：完美支援手機、平板與桌面裝置。
- **後台管理**：
    - 儀表板概覽
    - 文章管理（新增、編輯、刪除、草稿/發布狀態）
    - 頁面管理（範例）
- **資料儲存**：使用瀏覽器 `localStorage` 模擬資料庫，資料在同一瀏覽器中可持久保存。

## 快速開始

### 開發環境

```bash
# 安裝依賴
pnpm install

# 啟動開發伺服器
pnpm dev
```

### 建置與部署

```bash
# 打包生產版本
pnpm build
```

打包後的檔案位於 `dist/` 目錄，可直接部署至任何靜態網站託管服務（如 GitHub Pages, Vercel, Netlify）。

## 使用說明

### 進入後台

1. 點擊導覽列的 "後台管理" 或前往 `/admin/login`。
2. 輸入任意帳號密碼登入（範例預設：`admin@example.com` / `password`）。
3. 進入儀表板後即可開始管理文章。

### 撰寫文章

- 支援 Markdown 語法（標題 `#`, 列表 `-` 等）。
- 設定狀態為 "Published" 後，文章才會顯示在前台列表中。

## 技術棧

- React 19
- Vite
- Tocas UI 5.0 (CSS Framework)
- Tailwind CSS v4 (Utility helper)
- Wouter (Routing)
- Zustand / LocalStorage (State Management)
