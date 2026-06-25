const JIKAN_API = 'https://api.jikan.moe/v4';
const NEWS_RSS = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.animenewsnetwork.com/news/rss.xml';
const MUSE_ASIA_RSS = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id=UCGbsxJ1S220H1T1SjM2o18g';

// DOM Elements
const trailersGrid = document.getElementById('trailers-grid');
const watchGrid = document.getElementById('watch-grid');
const bookmarksGrid = document.getElementById('bookmarks-grid');
const emptyBookmarksText = document.getElementById('empty-bookmarks');
const newsGrid = document.getElementById('news-grid');
const modal = document.getElementById('video-modal');
const youtubePlayer = document.getElementById('youtube-player');
const closeBtn = document.querySelector('.close-btn');

// Featured Trailer Elements
const featuredTitle = document.getElementById('featured-trailer-title');
const featuredPlayer = document.getElementById('featured-youtube-player');

// State
let bookmarks = JSON.parse(localStorage.getItem('animePulseBookmarks')) || [];

// Initialize
async function init() {
    renderBookmarks();
    await Promise.all([
        fetchTrailers(),
        fetchWatchFree(),
        fetchNews()
    ]);
}

// ---- BOOKMARKS LOGIC ----
function toggleBookmark(e, videoData) {
    e.stopPropagation(); // Prevent opening the modal
    const index = bookmarks.findIndex(b => b.id === videoData.id);
    
    if (index > -1) {
        bookmarks.splice(index, 1);
        e.currentTarget.classList.remove('active');
    } else {
        bookmarks.push(videoData);
        e.currentTarget.classList.add('active');
    }
    
    localStorage.setItem('animePulseBookmarks', JSON.stringify(bookmarks));
    renderBookmarks();
}

function isBookmarked(id) {
    return bookmarks.some(b => b.id === id);
}

function renderBookmarks() {
    if (!bookmarksGrid) return;
    
    if (bookmarks.length === 0) {
        bookmarksGrid.innerHTML = '<p id="empty-bookmarks" style="grid-column: 1 / -1; color: var(--text-muted);">You haven\'t bookmarked any videos yet.</p>';
        return;
    }
    
    bookmarksGrid.innerHTML = '';
    bookmarks.forEach(item => {
        const card = createVideoCard(item);
        bookmarksGrid.appendChild(card);
    });
}

function createVideoCard(item) {
    const card = document.createElement('div');
    card.className = 'trailer-card';
    
    const bookmarked = isBookmarked(item.id);
    const starIcon = `<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
    
    card.innerHTML = `
        <div style="position: relative;">
            <img src="${item.thumb}" alt="${item.title}" class="trailer-thumb" loading="lazy">
            <div class="bookmark-btn ${bookmarked ? 'active' : ''}" title="Toggle Bookmark">
                ${starIcon}
            </div>
            <div class="trailer-play-overlay">
                <svg viewBox="0 0 24 24" style="width:48px;height:48px;fill:white;"><path d="M8 5v14l11-7z"/></svg>
            </div>
        </div>
        <div class="trailer-info">
            <h3 class="trailer-title">${item.title}</h3>
            <p class="trailer-meta">${item.meta}</p>
        </div>
    `;
    
    // Play video on click
    card.onclick = () => openModal(item.id);
    
    // Handle bookmark click
    const btn = card.querySelector('.bookmark-btn');
    btn.onclick = (e) => toggleBookmark(e, item);
    
    return card;
}

// ---- FETCHING LOGIC ----
async function fetchTrailers() {
    if(!trailersGrid) return;
    try {
        const response = await fetch(`${JIKAN_API}/watch/promos`);
        const data = await response.json();
        
        if (data && data.data && data.data.length > 0) {
            const uniqueAnime = [];
            const ids = new Set();
            for (let item of data.data) {
                if (!ids.has(item.entry.mal_id) && item.trailer.youtube_id) {
                    ids.add(item.entry.mal_id);
                    uniqueAnime.push(item);
                }
                if (uniqueAnime.length >= 13) break;
            }

            if (uniqueAnime.length > 0) {
                setFeaturedTrailer(uniqueAnime[0]);
                renderTrailers(uniqueAnime.slice(1));
            } else {
                trailersGrid.innerHTML = '<p>No trailers available at the moment.</p>';
            }
        }
    } catch (error) {
        console.error("Error fetching trailers:", error);
        trailersGrid.innerHTML = '<p>Failed to load trailers. Please try again later.</p>';
    }
}

function setFeaturedTrailer(item) {
    if (featuredTitle && item.entry.title) {
        featuredTitle.textContent = "Latest Trailer: " + item.entry.title;
    }
    if (featuredPlayer && item.trailer.youtube_id) {
        featuredPlayer.src = `https://www.youtube.com/embed/${item.trailer.youtube_id}?autoplay=1&mute=1`;
    }
}

function renderTrailers(trailers) {
    trailersGrid.innerHTML = '';
    trailers.forEach(item => {
        const videoData = {
            id: item.trailer.youtube_id,
            title: item.entry.title,
            meta: item.title,
            thumb: item.trailer.images.large_image_url || item.entry.images.jpg.image_url
        };
        trailersGrid.appendChild(createVideoCard(videoData));
    });
}

async function fetchWatchFree() {
    if (!watchGrid) return;
    try {
        // We use the local Vercel serverless function to bypass public API blocks
        const response = await fetch('/api/muse');
        const data = await response.json();
        
        if (data && data.items) {
            watchGrid.innerHTML = '';
            // Render top 12 videos from Muse Asia
            const videos = data.items.slice(0, 12);
            videos.forEach(item => {
                const videoData = {
                    id: item.id,
                    title: item.title,
                    meta: "Muse Asia Full Episode",
                    thumb: `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`
                };
                watchGrid.appendChild(createVideoCard(videoData));
            });
        }
    } catch (error) {
        console.error("Error fetching Muse Asia:", error);
        watchGrid.innerHTML = '<p>Failed to load episodes. Please try again later.</p>';
    }
}

async function fetchNews() {
    if(!newsGrid) return;
    try {
        const response = await fetch(NEWS_RSS);
        const data = await response.json();
        
        if (data && data.items) {
            renderNews(data.items.slice(0, 9));
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
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    youtubePlayer.src = '';
    document.body.style.overflow = '';
}

if(closeBtn) closeBtn.onclick = closeModal;
if(modal) {
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeModal();
    }
});

// Start app
init();
