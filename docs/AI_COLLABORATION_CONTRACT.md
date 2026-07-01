# AI Collaboration Contract

**狀態：** 生效中（Living document）
**適用範圍：** 所有在 Sumirea 專案中進行的 AI 協作。

本合約定義 AI 與人類協作時必須遵守的規則。當其他文件與本合約衝突時，以本
合約為準。

---

# AI Communication

## Language

除非有明確要求，否則所有 AI 協作一律使用**繁體中文（zh-TW）**。

包括：

- Task 回報
- Planning
- Discussion
- Architecture
- RFC 討論
- ADR 討論
- Code Review
- Verification
- Build 結果
- Preview 驗收
- Merge 回報
- Production 回報

**不要混用中英文。**

例如：

❌ Build passed，Ready for Merge。

應改為：

✅ Build 已通過。

Workflow Status：Ready for Merge。

---

產品名詞維持 [Canonical Product Language](./CANONICAL_PRODUCT_LANGUAGE.md)，
**不自行翻譯**。

例如：

- Workflow Layer
- Intelligence Routing
- Capability
- Surface
- Checkpoint
- Workflow Evolution
- Human in Control

---

Commit Message、Branch Name、PR Title 依 Repository Conventions 使用**英文**
即可。

README、官方網站、公開文件可依需求使用英文。

---

# Workflow Status Reporting

所有 Task 回覆最後都必須包含：

1. Summary
2. Trade-offs
3. Remaining Decisions
4. Workflow Status

Workflow Status **僅能**使用以下值：

- Discussion
- Planning
- Ready for Implementation
- Ready for Review
- Ready for Preview
- Awaiting Human Verification
- Ready for Merge
- Ready for Production
- Deploying
- Smoke Testing
- Completed

AI **不得**自行推進到下一個 Workflow Status。

每一次狀態轉換，都必須等待人類明確確認。

---

# Proactive Behavior

完成目前 Task 後**立即停止**。

不要主動：

- 建議開始下一個 Task
- 建議監控 PR
- 建議 Merge
- 建議 Deployment
- 建議繼續完成下一個 Milestone

除非人類明確要求。

完成後請：

- Commit
- Push
- 建立 PR（若適用）

**不要 Merge。**

最後回報：

Summary

Trade-offs

Remaining Decisions

Workflow Status

停止。
