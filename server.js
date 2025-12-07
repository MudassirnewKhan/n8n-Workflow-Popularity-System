require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// Import our custom fetchers
const { fetchYouTube, fetchForum, fetchTrends } = require('./fetchers');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data.json');

// --- THE ORCHESTRATOR ---
async function runDataPipeline() {
    console.log(`[${new Date().toISOString()}] Starting Data Pipeline...`);
    
    // Run all scrapers in parallel
    const [ytData, forumData, trendsData] = await Promise.all([
        fetchYouTube(process.env.YOUTUBE_API_KEY),
        fetchForum(),
        fetchTrends()
    ]);

    // Combine results
    const allWorkflows = [...ytData, ...forumData, ...trendsData];

    // Create the final data object
    const database = {
        meta: {
            total_count: allWorkflows.length,
            last_updated: new Date().toISOString(),
            sources: ["YouTube API", "n8n Discourse", "Google Trends"]
        },
        data: allWorkflows
    };

    // Save to disk (Simulating DB update)
    fs.writeFileSync(DB_PATH, JSON.stringify(database, null, 2));
    console.log(`[Success] Saved ${allWorkflows.length} workflows to database.`);
}

// --- CRON JOB ---
// Runs every Sunday at midnight (0 0 * * 0)
// For testing, we can change this to run every minute: '* * * * *'
cron.schedule('0 0 * * 0', () => {
    console.log("Running Scheduled Cron Job...");
    runDataPipeline();
});

// --- API ENDPOINTS ---

// 1. Get All Workflows
app.get('/api/workflows', (req, res) => {
    if (!fs.existsSync(DB_PATH)) {
        return res.status(503).json({ error: "Data is initializing. Please try again in 1 minute." });
    }
    const data = JSON.parse(fs.readFileSync(DB_PATH));
    res.json(data);
});

// 2. Manual Trigger (For grading/testing purposes)
app.post('/api/refresh', async (req, res) => {
    await runDataPipeline();
    res.json({ message: "Pipeline triggered manually", status: "completed" });
});

// --- SERVER START ---
app.listen(PORT, async () => {
    console.log(`Server running at http://localhost:${PORT}`);
    
    // Check if data exists on startup; if not, fetch it.
    if (!fs.existsSync(DB_PATH)) {
        console.log("No data found. Running initial fetch...");
        await runDataPipeline();
    }
});