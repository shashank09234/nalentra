# Contributing to Nalentra Infrastructure

Thank you for maintaining our systems and automation. Follow these rules to keep our environments stable and secure.

---

## 1. Safety & Verification Rules

* **Secrets & Credentials:** **Never commit plaintext keys or passwords to this repository.** Any secrets must be referenced via environment variables mapping to Vault or AWS Secrets Manager.
* **Pull Request Checklist:**
  * Run `terraform fmt -check` before submitting pull requests.
  * Execute linter validations via `tflint`.
  * Ensure that local plan configurations execute without error.

---

## 2. Infrastructure Deployment Flow

1. Changes must be verified inside the `dev` or `staging` environment branches first.
2. Promoting infrastructure to the `production` environment requires:
   * Explicit approval from the Lead DevOps Architect.
   * Execution of a dry-run plan audit showing all resource modifications (addition, deletion, replacement).

---

## 3. Commit Message Template
Commits must follow the Conventional Commits specification:
`type(scope): ticket-number description`
* **Example:** `feat(aws): ERP-132 enable database replication clusters`
