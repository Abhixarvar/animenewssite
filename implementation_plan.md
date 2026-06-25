# Anime News and Trailers Site

This plan outlines the architecture and design for a premium, dynamic web application that aggregates the latest anime news and promotional trailers, playing them directly on the site.

## User Review Required

> [!IMPORTANT]
> The site will use two free public APIs to gather its data dynamically. Since they are free and unauthenticated, they may have rate limits, but they are the best available public options:
> 1.  **Jikan API (MyAnimeList Unofficial API)**: For fetching the latest anime promo videos and trailers.
> 2.  **Anime News Network RSS (via rss2json API)**: For fetching the latest famous anime news.

Please review the proposed tech stack and UI aesthetic. If this aligns with your vision, hit **Proceed**!

## Open Questions

> [!WARNING]
> Do you prefer a specific primary color theme for the site (e.g., deep neon purple/pink like typical synthwave, or perhaps a sleek dark slate with bright orange accents like Crunchyroll)? The default will be a sleek dark mode with deep purples and blues.

## Proposed Changes

We will build the site using HTML, Vanilla CSS, and Vanilla JavaScript to ensure maximum flexibility and to create a stunning, customized modern web design without being constrained by a framework's default look.

---

### Frontend Foundation

#### [MODIFY] [index.html](file:///c:/Users/abhis/OneDrive/.vscode/my%20projects/animesite/index.html)
-   Set up the semantic HTML5 structure.
-   Include sections for: Hero (featuring the most recent top trailer), Latest News (a scrolling or grid section), and Recent Trailers (a video grid).
-   Include a hidden Modal element that will serve as the on-site YouTube player.
-   Link the custom Google Fonts (e.g., *Inter* or *Outfit*) for premium typography.

#### [NEW] [style.css](file:///c:/Users/abhis/OneDrive/.vscode/my%20projects/animesite/style.css)
-   Implement a modern, premium "Dark Mode" aesthetic.
-   Use CSS variables for color tokens (dark backgrounds, vibrant neon accents).
-   Add glassmorphism effects (translucent backgrounds with blur) for cards and modals.
-   Implement fluid micro-animations (hover effects on cards, smooth modal transitions).
-   Ensure responsive grid layouts for both mobile and desktop screens.

#### [NEW] [script.js](file:///c:/Users/abhis/OneDrive/.vscode/my%20projects/animesite/script.js)
-   **Data Fetching:** 
    -   Fetch `https://api.jikan.moe/v4/watch/promos` for recent trailers.
    -   Fetch `https://api.rss2json.com/v1/api.json?rss_url=https://www.animenewsnetwork.com/news/rss.xml` for news.
-   **DOM Manipulation:** Render the fetched data into the HTML sections dynamically.
-   **Video Player Logic:** Add event listeners to trailer cards. When clicked, open the Modal and embed the associated YouTube video using an `<iframe>` (so the video plays without leaving the site).

## Verification Plan

### Manual Verification
-   Open `index.html` in the browser.
-   Verify that the "Latest Trailers" grid populates with real promotional videos.
-   Click a trailer and verify the YouTube player opens in a modal and plays on the site.
-   Verify that the "Latest News" section displays recent headlines and links to the full articles.
-   Ensure the aesthetics (colors, gradients, animations) look premium and responsive on various screen sizes.
