# n8n Workflow Popularity Engine

## 🚀 Overview
This project is a backend system designed to identify and rank the most popular n8n workflows across the web. It aggregates data from **YouTube**, the **n8n Community Forum**, and **Google Trends** to provide a data-backed "Popularity Score" for automation workflows.

The system is delivered as a **Node.js REST API** with a built-in **Cron scheduler** that ensures data is kept fresh without manual intervention. It focuses on production readiness, zero-setup portability, and transparent engagement metrics.

---

## ⚡ Key Features
* **Multi-Source Aggregation:** Fetches data from YouTube (Videos), Discourse (Community Forums), and Google Trends (Search Interest).
* **Smart Metrics:** Calculates `like_to_view_ratio` and `engagement_score` to filter out clickbait and identify genuine utility.
* **Automated Updates:** Includes a background Cron job (running weekly) to self-heal and refresh data.
* **REST API:** Serves clean, JSON-formatted data ready for frontend consumption or production use.
* **Zero-Database Setup:** Uses a local JSON-based store (`data.json`) for immediate runnability without external database dependencies.

---

## 🛠️ Prerequisites
* **Node.js** (v16 or higher)
* **npm** (Node Package Manager)
* **YouTube Data API Key** (Free tier from Google Cloud Console)

---

## ⚙️ Installation & Setup

1.  **Unzip the project folder**
    ```bash
    cd n8n_Assignment_YourName
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory and add your API credentials:
    ```env
    PORT=3000
    YOUTUBE_API_KEY=your_actual_google_api_key_here
    N8N_FORUM_URL=[https://community.n8n.io](https://community.n8n.io)
    ```
    *(Note: The `N8N_FORUM_URL` is public and does not require a key).*

---

## 🏃‍♂️ Usage

### 1. Start the Server
```bash
node server.js

Automation Strategy
The system uses node-cron to handle background updates.

Schedule: Every Sunday at Midnight (0 0 * * 0).

Behavior: It fetches fresh data from all 3 sources in parallel, normalizes the metrics, and atomically updates the storage file.
