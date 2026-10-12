# Security Policy

We prioritize the security of Nalentra ERP infrastructure networks, keys, and environments. This document describes our security reporting processes.

---

## 1. Supported Versions

Only active stable branches and release candidates are supported:

| Version | Supported |
| :--- | :---: |
| **v1.0.0-rc1** | Yes |
| **< v1.0.0** | No |

---

## 2. Reporting a Vulnerability

**Do not file public Github Issues for security bugs.**

If you discover a security vulnerability in the infrastructure configs or key registries, please email security@nalentra.com with:
* A detailed description of the vulnerability.
* Steps to reproduce (include configuration parameters or setup environments).
* Impact analysis (leakage of database endpoints, open port issues, IAM access concerns).

We will acknowledge receipt of your report within **24 hours** and aim to patch the issue within **7 days**. All security patches are released via hotfix branches.
