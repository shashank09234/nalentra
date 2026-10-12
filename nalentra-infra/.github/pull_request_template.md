## Pull Request Template

---

### 1. Summary
* **Ticket ID:** [e.g., ERP-132]
* **Description:** A concise description of the changes made and the problem solved.

---

### 2. Infrastructure Changes & Dry Run Plan
* **Terraform Plan output:**
  ```text
  [Copy/paste the output of 'terraform plan' showing added, modified, or deleted resources]
  ```

---

### 3. Verification & Safety Checks
* Have resources been verified in the `dev` or `staging` environment? [Yes/No]
* Any changes to security group rules or firewall configurations? [Yes/No]
* Details: Describe how these security rule changes were verified.

---

### 4. Checklists
* [ ] My configurations follow the **Engineering Standards & Backend Development Constitution (ESBDC)**.
* [ ] I have verified that no plaintext secrets or API keys are committed in these files.
* [ ] I have run `terraform fmt` on all updated modules.

---

### 5. Breaking Changes
* Does this change replace existing resources causing data loss or downtime? [Yes/No]
* If yes, explain the migration or fallback strategy.
