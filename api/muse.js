export default async function handler(req, res) {
    const channelId = 'UCGbsxJ1S220H1T1SjM2o18g';
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

    try {
        const response = await fetch(rssUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch RSS: ${response.status}`);
        }
        
        const xmlText = await response.text();
        
        // Very basic regex-based XML parsing to extract video IDs and titles
        // For a production app, use an XML parser library like 'xml2js'
        const entries = [];
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        let match;
        
        while ((match = entryRegex.exec(xmlText)) !== null) {
            const entryContent = match[1];
            
            const idMatch = entryContent.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
            const titleMatch = entryContent.match(/<title>(.*?)<\/title>/);
            
            if (idMatch && titleMatch) {
                entries.push({
                    id: idMatch[1],
                    title: titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
                });
            }
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json({ items: entries });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch Muse Asia videos' });
    }
}
