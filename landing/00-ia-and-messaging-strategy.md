# Sumirea Landing Page — Information Architecture & Messaging Strategy

> **狀態：** Planning（提案中，待人類確認）
> **範圍：** 僅產品行銷。Hero、敘事、IA、CTA、Demo 定位、Messaging。
> **語言原則：** 產品名詞維持 [Canonical Product Language](../docs/CANONICAL_PRODUCT_LANGUAGE.md)，不自行翻譯。
> **本文件用途：** 確認方向後，才據此撰寫完整中英文 Landing Page 文案。

---

## 0. 成功標準（每一個決策都回扣這裡）

一位第一次到訪的開發者，應在 **30 秒內** 能回答：

1. **這是什麼？** —— 在 AI 工作時，把我叫回來的一道界線。
2. **解決我什麼問題？** —— 等待、Micro Decision、不斷切換造成的 Decision Fatigue。
3. **它不是什麼？** —— 不是通知工具，不是瀏覽器自動化。
4. **下一步？** —— 留下 email 加入 Beta 候補名單。

Landing Page 的每一個 Section 都必須服務其中至少一項；不服務的就砍掉。

---

## 1. Messaging Strategy

### 1.1 核心定位（Positioning）

> **Walk away. We'll call you when you're needed.**
> 放心離開。需要你的時候，我們會叫你。

- **產品類別（我們自己說的）：** 一道守護注意力的界線 / Protected Focus 的守門人。
- **不主張的類別：** notification app、browser automation、AI agent、AI IDE、AI chat。
- **一句話電梯簡報：** 「你的 AI 工具去做又長又慢的活；Sumirea 只在真正需要人來決定的那一刻，把你叫回來 —— 其餘時間保持安靜。」

### 1.2 訊息階層（Messaging Hierarchy）

| 層級 | 訊息 | 出現位置 |
| --- | --- | --- |
| **Primary（唯一主張）** | 需要你的時候才叫你，其餘時間安靜。Protect Cognitive Bandwidth。 | Hero、Waitlist |
| **Secondary（支撐）** | 消除等待與 Micro Decision 帶來的 Decision Fatigue。 | Problem、Value |
| **Proof（證明）** | Browser MVP 的「Claude 等你 → 通知 → 回來」故事。 | How it works / Demo |
| **Trust（信任）** | Human in Control：只觀察，絕不替你動手。 | Is/Is-not、Philosophy、FAQ |

### 1.3 語氣（Voice & Tone）—— 讓頁面本身就是 Quiet Intelligence

- **克制、冷靜、留白多。** 頁面的設計本身就示範「不打擾」。
- **誠實、不誇大。** 這是 Beta / MVP，不宣稱支援全部工具。
- **以人為中心。** 講「你拿回一小時的專注」，不講「我們的偵測引擎」。
- **不擬人化 AI。** 不寫「the AI 決定…」；主詞是 Sumirea 或「你」。

### 1.4 反定位（關鍵，因為最容易被誤解）

| Sumirea 是 | Sumirea 不是 |
| --- | --- |
| AI 工作時守護注意力的界線 | 什麼都嗶你一下的通知工具 |
| 判斷「你何時真正被需要」的判斷力 | 會點擊 / 核准 / 編輯的瀏覽器自動化 |
| 安靜地待在既有工具旁 | 又一個要重新學的 AI chat / agent / IDE |
| 自動化「干擾」 | 自動化「你」 |

> 通知只是 **mechanism（手段）**，不是 product。難的是「只在對的一刻」響，其餘保持安靜 —— 那份判斷才是產品。

---

## 2. Hero 方向

提出三個候選，並附推薦。

### 方向 A —（推薦）「Walk away.」— 情緒 + 承諾

- **Headline：** Walk away. We'll call you when you're needed.／放心離開。需要你的時候，我們會叫你。
- **Sub：** 讓 AI 工具去做又長又慢的工作。Sumirea 在旁邊看著 —— 只在真正需要人決定的那一刻，把你叫回來。
- **為何推薦：** 直接就是官方 Positioning，30 秒理解門檻最低；情緒（放心離開）+ 明確承諾（會叫你）兼具。

### 方向 B —「Stop babysitting your AI.」— 痛點切入

- **Headline：** Stop babysitting your AI.／別再當 AI 的保母。
- **為何不作主打：** 較嗆、較負面，開場即批評使用者現況；適合放在 Problem Section，不適合 Hero 定調。

### 方向 C —「Silence is the feature.」— 哲學切入

- **Headline：** Silence is the feature.／安靜，就是功能。
- **為何不作主打：** 太抽象，第一次到訪者無法在 30 秒內判斷「這到底是什麼」；適合作為 Statement Section 的大標。

**建議：Hero 用 A，把 B 收進 Problem、把 C 收進 Statement。** 三個方向不浪費，各安其位。

### Hero 元件清單

- Eyebrow：`Protect Cognitive Bandwidth`
- Headline（A）+ Sub
- Primary CTA：Join the beta waitlist
- Secondary CTA：See the 30-second story →（錨到 Demo/How）
- 信任微文案：It never clicks, approves, or changes anything. Human in Control, always.
- 右側：**動態 Demo 裝置**（見 §5）

---

## 3. Story Flow（整體敘事弧線）

採用「**張力 → 翻轉 → 證明 → 信任 → 行動**」的經典弧線：

```
Hero          承諾（放心離開）              ← 情緒鉤子 + 一句話懂
  ↓
Problem       張力（等待 / Micro Decision / 切換）   ← 「對，這就是我」
  ↓
Statement     翻轉（機器等你，而非你等機器）    ← Aha moment
  ↓
How / Demo    證明（Browser MVP 的實際故事）    ← 「原來長這樣」
  ↓
Is / Is-not   釐清（打掉誤解）              ← 「喔，不是那種東西」
  ↓
Philosophy    信任（不自動化你 / Human in Control）  ← 「我可以放心」
  ↓
Who           歸屬（多 AI 工具開發者）          ← 「這是為我做的」
  ↓
Waitlist      行動（留 email）                ← 轉換
  ↓
FAQ           解除最後疑慮                    ← 補上臨門一腳
```

---

## 4. Section-by-Section IA（每個 Section 的目的）

| # | Section | 唯一目的 | 關鍵訊息 | 服務的成功標準 |
| --- | --- | --- | --- | --- |
| 1 | **Hero** | 3 秒定調、給承諾 | Walk away… + Primary CTA | 這是什麼 / 下一步 |
| 2 | **Problem** | 讓使用者對號入座 | 等待、Micro Decision、切換＝Decision Fatigue | 解決什麼 |
| 3 | **Statement**（翻轉） | 製造 Aha | 機器等你，其餘安靜；Silence is a feature | 這是什麼 |
| 4 | **How it works / Demo** | 用故事證明可信 | Claude 工作→你離開→需要人→通知→回來 | 這是什麼（可信度） |
| 5 | **Is / Is-not** | 打掉三大誤解 | 不是通知工具 / 不是自動化 / 不自動化你 | 不是什麼 |
| 6 | **Philosophy** | 建立信任與差異 | 不自動化開發者；Human in Control；Quiet Intelligence | 不是什麼 / 信任 |
| 7 | **Who it's for** | 給歸屬感 | 同時用 Claude Code / ChatGPT / Cursor / Codex / Gemini | 解決誰 |
| 8 | **Beta Waitlist** | 轉換：收 email | 名額有限、免費、一起定義「什麼配得上打擾你」 | 下一步 |
| 9 | **FAQ** | 解除最後疑慮 | 通知？會替我動手？支援哪些？會一直吵？要學嗎？收費？ | 信任 |
| — | **Footer** | 收束品牌句 | Protect Cognitive Bandwidth. Human in Control. | — |

> **刻意排除**（符合 Scope，不在此頁出現）：Runtime、SDK、Workflow Engine、Recorder、Architecture、Infrastructure、平台 roadmap。

---

## 5. Demo 在敘事中的位置

- **定位：** Demo ＝ Primary Message 的 **Proof**，不是功能展示。它證明「只在對的一刻叫你」是真的做得到，而不是承諾。
- **出現兩次，強度遞進：**
  1. **Hero 右側（輕量、動態）：** 一個小型「裝置」動畫，循環演示五步流程（Claude 工作 → 你離開 → 需要人 → Sumirea 叫你 → 回來決定）。目的：在首屏就把抽象承諾視覺化，降低 30 秒理解門檻。
  2. **How it works Section（完整、可讀）：** 同一個故事攤成 5 步時間軸，第 3、4 步（需要人 / Sumirea 叫你）以 signal 色強調 —— 這是整個產品的高潮。
- **敘事作用：** 它是 Problem（張力）與 Philosophy（信任）之間的橋。看完 Demo，使用者才有具體畫面去理解後面的「不是通知工具」與「Human in Control」。
- **誠實邊界：** Demo 呈現 Browser MVP 的真實故事，不暗示尚未存在的能力（例如尚未支援的工具）。措辭上以「一則安靜的通知」呈現，避免讓它看起來像自動化。

---

## 6. CTA 設計

### 6.1 CTA 階層

| 類型 | 文案 | 位置 | 行為 |
| --- | --- | --- | --- |
| **Primary** | Join the beta waitlist／加入 Beta 候補名單 | Nav、Hero、Waitlist | 錨到 / 聚焦 email 欄位 |
| **Secondary** | See the 30-second story →／看 30 秒的故事 → | Hero | 錨到 How/Demo |
| **In-form** | Request beta access／申請 Beta 使用權 | Waitlist 表單按鈕 | 送出 email |

### 6.2 Waitlist Messaging（轉換區）

- **大標：** Get called back, not burned out.／被叫回來，而不是被燒乾。
- **副文：** 名額有限；邀請第一批開發者，一起定義「什麼配得上打擾你、什麼永遠不該」。
- **表單微文案：** One email when your invite is ready. No spam.／邀請就緒時只寄一封信，不寄垃圾信、隨時退訂。
- **送出後狀態：** 「你已在名單上。在邀請就緒前我們會保持安靜 —— 這正是重點。」（連確認訊息都示範 Quiet Intelligence）

### 6.3 CTA 原則

- 全站 **只有一個轉換目標**：加入 Beta 候補名單。不放次要轉換（下載、GitHub、訂閱電子報）稀釋。
- Nav 常駐 Primary CTA，隨捲動一直在。
- Secondary CTA 永遠是「往下看」而非「離開頁面」。

---

## 7. Visual Direction（if needed，先給方向不落地）

- **概念：整頁安靜、單一 signal 色。** 全站近乎單色（暖紙白 / 深墨），只有「Sumirea 叫你」的那一刻用一個 signal 色（暖橘紅）。頁面本身就演出「克制 + 只在關鍵時刻出聲」。
- **大量留白、克制動態、支援深色模式與 `prefers-reduced-motion`。**
- **字體：** 系統 sans 為主、mono 作標籤/技術感點綴；中文用 PingFang / Noto Sans TC。

---

## 8. 交付順序（確認本文件後）

1. Section-by-section 完整文案（EN）
2. Section-by-section 完整文案（zh-Hant）
3. 完整 Landing Page（EN + zh-Hant，雙語切換）
4. Demo script（口播 / 錄影腳本）
5. Launch positioning（發布定位與一句話對外說法）

> 上述皆 **待本 IA 與 Messaging Strategy 經人類確認後** 才開始。Workflow Status 維持 Planning。
