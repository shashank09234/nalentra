# Contributing to Nalentra Playground

This repository contains experimental projects and research spike prototypes.

---

## 1. Creating a Sandbox Experiment

1. Create a subdirectory under the appropriate area (e.g., `experimental-ai/`).
2. Add a `README.md` containing:
   * Experiment objective.
   * Installation and run instructions.
   * List of dependencies and packages.
3. Keep all package dependency definitions isolated (e.g., use a python `requirements.txt` or node `package.json` inside your subfolder). Do not merge package specifications at root level.

---

## 2. Code Promotion Flow

If a prototype is verified and selected for core integration:
* Refactor the code to comply with the **Engineering Standards & Backend Development Constitution (ESBDC)** or the **Enterprise Frontend Engineering Blueprint (EFEB)**.
* Open a pull request in the `nalentra-backend` or `nalentra-frontend` repository with the refactored code. Do not import raw playground folders directly.
* Keep the original experimental code in the playground as reference.
