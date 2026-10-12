# Nalentra Infrastructure & Local Environment (`nalentra-infra`)

This repository coordinates the local development environment orchestration scripts and deployment specifications for **Nalentra ERP**.

---

## 1. Prerequisites
Before launching the local platform, ensure you have installed:
*   **Docker Desktop** (v24.0 or later recommended). Ensure the Docker daemon is running.
*   **PowerShell** (for Windows hosts) or **Bash** (for Unix hosts).

---

## 2. Platform Architecture & Port Mappings

The orchestration environment exposes public services through a centralized **Nginx Reverse Proxy**.

| Container Name | Service | Internal Port | External Port | Data Volume |
| :--- | :--- | :---: | :---: | :--- |
| **nalentra-nginx** | Nginx Reverse Proxy | `80` | `80` | None |
| **nalentra-frontend** | React Vite UI App | `80` | None (Proxied) | None |
| **nalentra-backend** | Spring Boot API | `8080` | None (Proxied) | None |
| **nalentra-postgres** | PostgreSQL Database | `5432` | `5432` | `postgres_data` |
| **nalentra-redis** | Redis Session Cache | `6379` | `6379` | `redis_data` |
| **nalentra-rabbitmq** | RabbitMQ Message Broker | `5672` | `5672`, `15672` | `rabbitmq_data` |
| **nalentra-minio** | MinIO Object Storage | `9000`, `9001` | `9000`, `9001` | `minio_data` |

---

## 3. Platform Operations

Orchestration scripts are located inside the [scripts/](file:///c:/D_Drive/erp/nalentra-infra/scripts/) directory.

### 1. Launch Platform
To build, download, and start the local environment:
*   **Windows (PowerShell):**
    ```powershell
    .\scripts\start-local.ps1
    ```
*   **Unix (Bash):**
    ```bash
    ./scripts/start-local.sh
    ```

### 2. Shutdown Platform
To stop all platform containers:
*   **Windows (PowerShell):**
    ```powershell
    .\scripts\stop-local.ps1
    ```
*   **Unix (Bash):**
    ```bash
    ./scripts/stop-local.sh
    ```

### 3. Reset Platform Data
To stop containers and delete database/storage volumes:
*   **Windows (PowerShell):**
    ```powershell
    .\scripts\reset-local.ps1
    ```
*   **Unix (Bash):**
    ```bash
    ./scripts/reset-local.sh
    ```

### 4. Trace Log Feeds
To view container stdout streams:
*   **Windows (PowerShell):**
    ```powershell
    .\scripts\logs-local.ps1
    ```
*   **Unix (Bash):**
    ```bash
    ./scripts/logs-local.sh
    ```
