const JIKAN_API = 'https://api.jikan.moe/v4';
const MUSE_ASIA_RSS = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id=UCGbsxJ1S220H1T1SjM2o18g';
// ---- CATALOG DATA ----
const ANIME_CATALOG = [
    {
        id: 'spyxfamily',
        title: 'Spy x Family',
        desc: 'A spy on an undercover mission gets married and adopts a child as part of his cover. His wife and daughter have secrets of their own, and all three must strive to keep together.',
        cover: 'https://cdn.myanimelist.net/images/anime/1441/122795l.jpg',
        seasons: [
            { name: 'Season 1 Part 1', playlistId: 'PLwLSw1_eDZl1wGMYg5oB3uEns0CZNl6sI' },
            { name: 'Season 1 Part 2', playlistId: 'PLwLSw1_eDZl0-34X3d34U9Yx-jIigE80X' },
            { name: 'Season 2', playlistId: 'PLwLSw1_eDZl1Z6x1nK7j1Tf3tX_HnUIf0' }
        ]
    },
    {
        id: 'onepunchman',
        title: 'One Punch Man',
        desc: 'Saitama is a hero who only became a hero for fun. After three years of "special training," he\'s become so strong that he\'s practically invincible. In fact, he\'s too strong—even his mightiest opponents are taken out with a single punch.',
        cover: 'https://cdn.myanimelist.net/images/anime/12/76049l.jpg',
        seasons: [
            { name: 'Seasons 1 & 2', playlistId: 'PLwLSw1_eDZl2XdtLhB9NG2Ch050jWFm9G' }
        ]
    },
    {
        id: 'slime',
        title: 'That Time I Got Reincarnated as a Slime',
        desc: 'Corporate worker Mikami Satoru is stabbed by a random killer, and is reborn to an alternate world. But he turns out to be reborn a slime! Thrown into this new world, he begins his quest to create a world that\'s welcoming to all races.',
        cover: 'https://cdn.myanimelist.net/images/anime/1171/109222l.jpg',
        seasons: [
            { name: 'Season 1', playlistId: 'PLwLSw1_eDZl3_YNRvXA7O' }
        ]
    },
    {
        id: 'mobpsycho',
        title: 'Mob Psycho 100',
        desc: 'Eighth-grader Shigeo "Mob" Kageyama has tapped into his inner wellspring of psychic prowess at a young age. But the power quickly proves to be a liability when he realizes the potential danger in his skills.',
        cover: 'https://cdn.myanimelist.net/images/anime/8/80356l.jpg',
        seasons: [
            { name: 'Season 1', playlistId: 'PLwLSw1_eDZl1pvIv1fBd3oKkP3XEQpT_G' },
            { name: 'Season 2', playlistId: 'PLwLSw1_eDZl2pVrny1PabF7J3AeOozZUS' },
            { name: 'Season 3', playlistId: 'PLwLSw1_eDZl2VGzbi1867Ucw0vJzRfXYU' }
        ]
    },
    {
        id: 'mushokutensei',
        title: 'Mushoku Tensei',
        desc: 'When a 34-year-old underachiever gets run over by a bus, his story doesn\'t end there. Reincarnated in a new world as an infant, Rudy will seize every opportunity to live the life he\'s always wanted.',
        cover: 'https://cdn.myanimelist.net/images/anime/1530/117776l.jpg',
        seasons: [
            { name: 'Season 1', playlistId: 'PLwLSw1_eDZl26t1o97mG9k1d0JgZkHttm' },
            { name: 'Season 2', playlistId: 'PLwLSw1_eDZl2X2t5iN_n9T1uA9G5f1S5n' }
        ]
    }
];

// DOM Elements
const catalogGrid = document.getElementById('catalog-grid');
const trailersGrid = document.getElementById('trailers-grid');
const watchGrid = document.getElementById('watch-grid');
const bookmarksGrid = document.getElementById('bookmarks-grid');
const emptyBookmarksText = document.getElementById('empty-bookmarks');
const modal = document.getElementById('video-modal');
const youtubePlayer = document.getElementById('youtube-player');
const closeBtn = document.querySelector('.close-btn');

// Video Context Controls
const videoContextControls = document.getElementById('video-context-controls');
const btnNextEp = document.getElementById('btn-next-ep');
const btnBackAnime = document.getElementById('btn-back-anime');

// Series Modal Elements
const seriesModal = document.getElementById('series-modal');
const closeSeriesBtn = document.querySelector('.close-series-btn');
const seriesTitleText = document.getElementById('series-title-text');
const seriesDescText = document.getElementById('series-desc-text');
const seriesCover = document.getElementById('series-cover');
const seasonSelector = document.getElementById('season-selector');
const episodesList = document.getElementById('episodes-list');

// Featured Trailer Elements
const featuredTitle = document.getElementById('featured-trailer-title');
const featuredPlayer = document.getElementById('featured-youtube-player');

// State
let bookmarks = JSON.parse(localStorage.getItem('animePulseBookmarks')) || [];
let currentVideoContext = null;

// Initialize
async function init() {
    renderBookmarks();
    renderCatalog();

    await Promise.all([
        fetchTrailers(),
        fetchWatchFree()
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

function createVideoCard(item, context = null) {
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
    card.onclick = () => openModal(item.id, context);
    
    // Handle bookmark click
    const btn = card.querySelector('.bookmark-btn');
    btn.onclick = (e) => toggleBookmark(e, item);
    
    return card;
}

// ---- CATALOG LOGIC ----
function renderCatalog() {
    if (!catalogGrid) return;
    catalogGrid.innerHTML = '';
    
    ANIME_CATALOG.forEach(series => {
        const card = document.createElement('div');
        card.className = 'series-card';
        card.innerHTML = `
            <img src="${series.cover}" alt="${series.title}" loading="lazy" style="border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
            <h3 style="margin-top: 0.5rem; font-size: 1.1rem;">${series.title}</h3>
        `;
        card.onclick = () => openSeriesModal(series);
        catalogGrid.appendChild(card);
    });
}

function openSeriesModal(series) {
    if (!seriesModal) return;
    
    seriesTitleText.textContent = series.title;
    seriesDescText.textContent = series.desc;
    seriesCover.src = series.cover;
    
    // Render season tabs
    seasonSelector.innerHTML = '';
    series.seasons.forEach((season, index) => {
        const btn = document.createElement('button');
        btn.className = 'season-btn' + (index === 0 ? ' active' : '');
        btn.textContent = season.name;
        btn.onclick = () => {
            // Update active tab
            document.querySelectorAll('.season-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Load episodes
            loadSeason(season.playlistId, series.title);
        };
        seasonSelector.appendChild(btn);
    });
    
    // Load first season by default
    if (series.seasons.length > 0) {
        loadSeason(series.seasons[0].playlistId, series);
    }
    
    seriesModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function loadSeason(playlistId, series) {
    episodesList.innerHTML = '<p>Loading episodes...</p>';
    try {
        const response = await fetch(`/api/muse?playlist_id=${playlistId}`);
        const data = await response.json();
        
        episodesList.innerHTML = '';
        if (data && data.items && data.items.length > 0) {
            // We reverse the array because YouTube playlist RSS is usually newest first,
            // but for episodes we usually want to watch oldest (Ep 1) first.
            // If the items are already in correct order, remove .reverse(). For Muse, they are often uploaded in order.
            // Let's assume the API returns them in the order we want to display (usually Ep 1, Ep 2...).
            // We'll just map them.
            
            const episodes = data.items.map(item => ({
                id: item.id,
                title: item.title,
                meta: series.title,
                thumb: `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`
            }));

            episodes.forEach((videoData, index) => {
                const context = {
                    series: series,
                    episodes: episodes,
                    currentIndex: index
                };
                episodesList.appendChild(createVideoCard(videoData, context));
            });
        } else {
            episodesList.innerHTML = '<p>No episodes found for this season.</p>';
        }
    } catch (err) {
        console.error(err);
        episodesList.innerHTML = '<p>Failed to load episodes.</p>';
    }
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

// Modal Logic
function openModal(youtubeId, context = null) {
    if (!youtubeId) return;
    
    currentVideoContext = context;
    
    if (currentVideoContext && currentVideoContext.series) {
        videoContextControls.style.display = 'flex';
        
        // Disable "Next" button if at the end of the episode list
        if (currentVideoContext.currentIndex >= currentVideoContext.episodes.length - 1) {
            btnNextEp.disabled = true;
        } else {
            btnNextEp.disabled = false;
        }
    } else {
        videoContextControls.style.display = 'none';
    }

    // Added controls=1 and cc_load_policy=1 per user request
    youtubePlayer.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&controls=1&cc_load_policy=1`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    youtubePlayer.src = '';
    document.body.style.overflow = '';
}

if (btnNextEp) {
    btnNextEp.onclick = () => {
        if (!currentVideoContext) return;
        const nextIndex = currentVideoContext.currentIndex + 1;
        if (nextIndex < currentVideoContext.episodes.length) {
            const nextVideo = currentVideoContext.episodes[nextIndex];
            // Re-open modal with new video and updated context
            openModal(nextVideo.id, {
                series: currentVideoContext.series,
                episodes: currentVideoContext.episodes,
                currentIndex: nextIndex
            });
        }
    };
}

if (btnBackAnime) {
    btnBackAnime.onclick = () => {
        if (!currentVideoContext) return;
        const series = currentVideoContext.series;
        closeModal();
        openSeriesModal(series);
    };
}

if(closeBtn) closeBtn.onclick = closeModal;
if(closeSeriesBtn) {
    closeSeriesBtn.onclick = () => {
        seriesModal.classList.remove('active');
        document.body.style.overflow = '';
    };
}
if(modal) {
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
}
if(seriesModal) {
    seriesModal.onclick = (e) => {
        if (e.target === seriesModal) {
            seriesModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (modal && modal.classList.contains('active')) {
            closeModal();
        } else if (seriesModal && seriesModal.classList.contains('active')) {
            seriesModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// Start app
init();
