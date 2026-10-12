# Security Policy

We prioritize security across all Nalentra development operations, including experimental sandboxes. This document describes our security reporting processes.

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

If you discover a security vulnerability in any experimental script or prototype, please email security@nalentra.com with:
* A detailed description of the vulnerability.
* Steps to reproduce.
* Impact analysis (leakage of test database credentials, exposure of endpoints).

We will acknowledge receipt of your report within **24 hours** and aim to patch or delete the experimental code within **7 days**. All security patches are released via hotfix branches.
