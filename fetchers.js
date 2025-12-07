const axios = require('axios');
const googleTrends = require('google-trends-api');

// --- Helper: Calculate Ratios ---
const calcRatio = (part, total) => {
    if (!total || total === 0) return 0;
    return parseFloat((part / total).toFixed(4));
};

// --- SOURCE 1: YouTube Scraper ---
async function fetchYouTube(apiKey) {
    console.log(">> Fetching YouTube Data...");
    try {
        // 1. Search for videos
        const searchRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q: 'n8n workflow tutorial',
                type: 'video',
                maxResults: 25,
                key: apiKey
            }
        });

        const videoIds = searchRes.data.items.map(item => item.id.videoId).join(',');

        // 2. Get Statistics for those videos
        const statsRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
                part: 'statistics,snippet',
                id: videoIds,
                key: apiKey
            }
        });

        // 3. Transform to required format
        return statsRes.data.items.map(vid => {
            const views = parseInt(vid.statistics.viewCount) || 0;
            const likes = parseInt(vid.statistics.likeCount) || 0;
            const comments = parseInt(vid.statistics.commentCount) || 0;

            return {
                workflow: vid.snippet.title,
                platform: "YouTube",
                popularity_metrics: {
                    views: views,
                    likes: likes,
                    comments: comments,
                    like_to_view_ratio: calcRatio(likes, views),
                    comment_to_view_ratio: calcRatio(comments, views)
                },
                // Basic logic: if channel is likely US/Global based on language
                country: "US" 
            };
        });
    } catch (err) {
        console.error("YouTube Error:", err.message);
        return [];
    }
}

// --- SOURCE 2: n8n Forum (Discourse) ---
async function fetchForum() {
    console.log(">> Fetching Forum Data...");
    try {
        // Fetch "Top" posts for the month
        const res = await axios.get('https://community.n8n.io/top.json?period=monthly');
        const topics = res.data.topic_list.topics;

        return topics.map(topic => ({
            workflow: topic.title,
            platform: "Forum",
            popularity_metrics: {
                views: topic.views,
                likes: topic.like_count,
                replies: topic.posts_count,
                contributors: topic.posters.length,
                // Forum doesn't have standard "ratios" usually, but we can improvise
                engagement_score: topic.like_count + topic.posts_count
            },
            country: "Global"
        }));
    } catch (err) {
        console.error("Forum Error:", err.message);
        return [];
    }
}

// --- SOURCE 3: Google Trends ---
async function fetchTrends() {
    console.log(">> Fetching Google Trends...");
    try {
        const res = await googleTrends.relatedQueries({ keyword: 'n8n automation' });
        const parsed = JSON.parse(res);
        const queries = parsed.default.rankedList[0].rankedKeyword; // "Top" queries

        return queries.slice(0, 15).map(q => ({
            workflow: `Search: ${q.query}`,
            platform: "Google",
            popularity_metrics: {
                search_volume_index: q.value, // 0-100 scale
                trend_status: "Stable"
            },
            country: "India" // Example segmentation
        }));
    } catch (err) {
        console.error("Trends Error:", err.message);
        return [];
    }
}

module.exports = { fetchYouTube, fetchForum, fetchTrends };