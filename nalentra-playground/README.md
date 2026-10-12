# Nalentra Sandbox Playground (`nalentra-playground`)

This repository serves as an experimental sandbox for **Nalentra ERP** developers to write proof-of-concept (PoC) code, prototype third-party integrations, evaluate camera SDKs, and research AI capabilities.

---

## 1. Tech Stack
This sandbox supports multi-language developments:
* **AI & Machine Learning Prototypes:** Python (Jupyter notebooks, PyTorch, OpenCV)
* **Face Recognition System (FRS) & OCR:** Python / Go / C++
* **Camera Web/Mobile SDK Integrations:** Javascript / Kotlin / Swift
* **Database & Vector Index Experiments:** SQL / pgvector / Python

---

## 2. Directory Structure

```text
nalentra-playground/
├── experimental-ai/                     # LLM prompt tuning and RAG search spikes
├── experimental-frs/                    # Face recognition local algorithms
├── experimental-ocr/                    # Student admission document readers
├── experimental-camera/                 # HTML5 camera stream performance checks
└── external-integrations/               # Draft Stripe/Keycloak endpoint mockups
```

---

## 3. Playroom Guidelines

1. **Keep it isolated:** Each experiment must exist in its own subdirectory containing a dedicated `README.md` explaining setups, dependencies, and execution commands.
2. **Do not link core code:** Do not import files from core `backend` or `frontend` repositories. Code from here is promotional: once validated, logic is refactored and merged into core modules.
3. **No secrets:** Do not commit API test keys or personal files.

---

## 4. License

Proprietary and Confidential. For internal engineering use only.
See [LICENSE](file:///c:/D_Drive/erp/nalentra-playground/LICENSE) for terms.
