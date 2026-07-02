# Sumirea — Beta Landing Page

Static, self-contained bilingual landing page for the Sumirea beta waitlist.
Product-marketing only. It does not depend on, build with, or modify any of the
product packages (`core`, `sdk`, `cli`, adapters).

## Files

| File                              | Purpose                                                                    |
| --------------------------------- | -------------------------------------------------------------------------- |
| `index.html`                      | English landing page                                                       |
| `index.zh-Hant.html`              | Traditional Chinese landing page                                           |
| `00-ia-and-messaging-strategy.md` | Approved Information Architecture & Messaging Strategy                     |
| `01-copy-deck.md`                 | Approved section-by-section copy (EN + zh-Hant), the single content source |

The two pages are the implementation of the copy deck. Language toggle links the
two together (top-right of the nav and in the footer).

## Content source

All on-page copy derives from `01-copy-deck.md`, which in turn derives from
`00-ia-and-messaging-strategy.md`. Product terminology follows the
[Canonical Product Language](../docs/CANONICAL_PRODUCT_LANGUAGE.md) and is not
translated in the Traditional Chinese page.

## Preview

No build step. Open either file directly, or serve the folder:

```bash
# from the repository root
python3 -m http.server --directory landing 8080
# then open http://localhost:8080/               (English)
#            http://localhost:8080/index.zh-Hant.html  (繁體中文)
```

## Scope guardrails (intentional)

- One conversion goal only: **Join the beta waitlist**.
- The Browser MVP appears strictly as **proof of the product value**, never as
  the whole product.
- No Runtime, SDK, workflow-engine, recorder, architecture, or roadmap content.
- The waitlist form has no backend wired in; the submit handler marks the single
  integration point where an email should be POSTed to the waitlist endpoint.
