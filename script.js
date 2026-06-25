const JIKAN_API = 'https://api.jikan.moe/v4';
const NEWS_RSS = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.animenewsnetwork.com/news/rss.xml';

// DOM Elements
const trailersGrid = document.getElementById('trailers-grid');
const newsGrid = document.getElementById('news-grid');
const modal = document.getElementById('video-modal');
const youtubePlayer = document.getElementById('youtube-player');
const closeBtn = document.querySelector('.close-btn');

// Hero Elements
const heroBg = document.getElementById('hero-bg');
const heroTitle = document.getElementById('hero-title');
const heroDesc = document.getElementById('hero-desc');
const heroPlayBtn = document.getElementById('hero-play-btn');

// Initialize
async function init() {
    await fetchTrailers();
    await fetchNews();
}

async function fetchTrailers() {
    try {
        const response = await fetch(`${JIKAN_API}/watch/promos`);
        const data = await response.json();
        
        if (data && data.data && data.data.length > 0) {
            // Deduplicate logic because Jikan sometimes returns multiple promos for same anime
            const uniqueAnime = [];
            const ids = new Set();
            for (let item of data.data) {
                if (!ids.has(item.entry.mal_id) && item.trailer.youtube_id) {
                    ids.add(item.entry.mal_id);
                    uniqueAnime.push(item);
                }
                if (uniqueAnime.length >= 13) break; // Get top 13 (1 for hero, 12 for grid)
            }

            if (uniqueAnime.length > 0) {
                setHero(uniqueAnime[0]); // Set 0 as Hero
                renderTrailers(uniqueAnime.slice(1)); // Render 1 to 12 in grid
            } else {
                trailersGrid.innerHTML = '<p>No trailers available at the moment.</p>';
            }
        }
    } catch (error) {
        console.error("Error fetching trailers:", error);
        trailersGrid.innerHTML = '<p>Failed to load trailers. Please try again later.</p>';
    }
}

function setHero(item) {
    heroTitle.textContent = item.entry.title;
    heroDesc.textContent = item.title; // Jikan promo title usually says "PV 1" or something
    
    // Try to get maximum resolution, fallback to large
    const hqImage = item.trailer.images.maximum_image_url || item.trailer.images.large_image_url || item.entry.images.jpg.large_image_url;
    heroBg.style.backgroundImage = `url('${hqImage}')`;
    
    heroPlayBtn.style.display = 'flex';
    heroPlayBtn.onclick = () => openModal(item.trailer.youtube_id);
}

function renderTrailers(trailers) {
    trailersGrid.innerHTML = '';
    trailers.forEach(item => {
        const thumbUrl = item.trailer.images.large_image_url || item.entry.images.jpg.image_url;
        const card = document.createElement('div');
        card.className = 'trailer-card';
        card.innerHTML = `
            <div style="position: relative;">
                <img src="${thumbUrl}" alt="${item.entry.title}" class="trailer-thumb" loading="lazy">
                <div class="trailer-play-overlay">
                    <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
            </div>
            <div class="trailer-info">
                <h3 class="trailer-title">${item.entry.title}</h3>
                <p class="trailer-meta">${item.title}</p>
            </div>
        `;
        card.onclick = () => openModal(item.trailer.youtube_id);
        trailersGrid.appendChild(card);
    });
}

async function fetchNews() {
    try {
        const response = await fetch(NEWS_RSS);
        const data = await response.json();
        
        if (data && data.items) {
            renderNews(data.items.slice(0, 9)); // Get top 9 news
        }
    } catch (error) {
        console.error("Error fetching news:", error);
        newsGrid.innerHTML = '<p>Failed to load news. Please try again later.</p>';
    }
}

function renderNews(newsItems) {
    newsGrid.innerHTML = '';
    newsItems.forEach(item => {
        const date = new Date(item.pubDate).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
        
        // Strip HTML from description
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = item.description;
        const textDesc = tempDiv.textContent || tempDiv.innerText || "";
        
        const card = document.createElement('a');
        card.href = item.link;
        card.target = "_blank";
        card.className = 'news-card';
        card.innerHTML = `
            <span class="news-date">${date}</span>
            <h3 class="news-title">${item.title}</h3>
            <p class="news-desc">${textDesc}</p>
        `;
        newsGrid.appendChild(card);
    });
}

// Modal Logic
function openModal(youtubeId) {
    if (!youtubeId) return;
    youtubePlayer.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeModal() {
    modal.classList.remove('active');
    youtubePlayer.src = ''; // Stop video playing
    document.body.style.overflow = '';
}

closeBtn.onclick = closeModal;
modal.onclick = (e) => {
    if (e.target === modal) {
        closeModal();
    }
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// Start app
init();
