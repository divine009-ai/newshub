/*==========================================================
    CATEGORY PAGE
==========================================================*/

class CategoryPage {

    constructor() {

        this.params = new URLSearchParams(window.location.search);
        this.category = this.params.get("category") || "latest";
        this.searchTerm = this.params.get("search") || "";
        this.articlesContainer = document.getElementById("categoryArticles");
        this.title = document.getElementById("categoryTitle");
        this.description = document.getElementById("categoryDescription");
        this.breadcrumbCurrent = document.getElementById("categoryBreadcrumb");

    }

    escape(value = "") {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }

    canonicalCategory(value) {

        const categories = CONFIG.navigation
            .map(item => new URL(item.link, window.location.href).searchParams.get("category"))
            .filter(Boolean);

        const match = categories.find(category =>
            category.toLowerCase() === String(value).toLowerCase()
        );

        if (match) return match;

        return String(value || "latest")
            .trim()
            .replace(/\s+/g, " ")
            .replace(/\b\w/g, letter => letter.toUpperCase());

    }

    pageLabel() {

        if (this.searchTerm) return `Search: ${this.searchTerm}`;

        if (this.category.toLowerCase() === "latest") return "Latest News";

        return this.canonicalCategory(this.category);

    }

    setHeader() {

        const label = this.pageLabel();

        document.title = `${label} | NewsHub`;

        if (this.title) this.title.textContent = label;

        if (this.breadcrumbCurrent) this.breadcrumbCurrent.textContent = label;

        if (!this.description) return;

        this.description.textContent = this.searchTerm
            ? "Stories matching your search across NewsHub."
            : label === "Latest News"
                ? "The newest published stories from across every desk."
                : `Latest published stories in ${label}.`;

    }

    async init() {

        this.setHeader();
        this.renderLoading();

        try {

            if (typeof loader !== "undefined") {

                loader.show({
                    title: "Loading Stories",
                    message: "Fetching articles..."
                });

            }

            const [articles, trending, popular, breaking] = await Promise.all([
                this.loadArticles(),
                api.getTrendingNews(),
                api.getPopularNews(),
                api.getBreakingNews()
            ]);

            this.renderArticles(articles);

            if (typeof sidebar !== "undefined") {

                sidebar.renderTrending(trending);
                sidebar.renderPopular(popular);
            }

            if (typeof breakingNews !== "undefined") {

                breakingNews.setNews(breaking);

            }

            if (typeof loader !== "undefined") loader.hide();

            this.loadAdvertisements();

        }
        catch (error) {

            console.error(error);

            if (typeof loader !== "undefined") loader.hide();

            this.renderError("Unable to load articles for this page.");

        }

    }

    async loadAdvertisements() {

        try {

            const category = this.category.toLowerCase() === "latest"
                ? ""
                : this.canonicalCategory(this.category);

            const [normalAds, homepageAds, popupAds] = await Promise.all([
                api.getAdvertisements("sidebar", category),
                api.getAdvertisements("homepage", category),
                api.getAdvertisements("popup", category)
            ]);

            if (typeof sidebar !== "undefined") {

                sidebar.renderAdvertisement(normalAds);

            }

            if (window.advertisementRenderer) {

                advertisementRenderer.renderFloatingAd([...homepageAds, ...normalAds]);
                advertisementRenderer.showPopup(popupAds);

            }

        }
        catch(error) {

            console.warn("Advertisements failed to load:", error);

            if (typeof sidebar !== "undefined") sidebar.renderAdvertisement([]);

        }

    }

    async loadArticles() {

        const limit = CONFIG.pagination?.perPage || 12;

        if (this.searchTerm) {

            return api.searchArticles(this.searchTerm);

        }

        if (this.category.toLowerCase() === "latest") {

            return api.getLatestNews();

        }

        return api.getCategoryNews(this.canonicalCategory(this.category), limit);

    }

    renderLoading() {

        if (!this.articlesContainer) return;

        this.articlesContainer.innerHTML = `
            <div class="news-empty">Loading articles...</div>
        `;

    }

    renderArticles(articles = []) {

        if (!this.articlesContainer) return;

        this.articlesContainer.innerHTML = articles.length
            ? articles.map(article => this.renderCard(article)).join("")
            : `<div class="news-empty">No articles found for ${this.escape(this.pageLabel())}.</div>`;

    }

    renderCard(article) {

        return `
            <div class="news-card card fade-up">
                <div class="news-card__image">
                    <a href="article.html?id=${article.id}">
                        <img src="${this.escape(article.image)}" alt="${this.escape(article.title || "Article")}">
                    </a>
                </div>
                <div class="news-card__content">
                    <span class="badge">${this.escape(article.category || "News")}</span>
                    <h3 class="news-card__title">
                        <a href="article.html?id=${article.id}">
                            ${this.escape(article.title || "Untitled")}
                        </a>
                    </h3>
                    <p>${this.escape(article.description || "")}</p>
                    <div class="news-card__meta">
                        <span><i class="fa-solid fa-user"></i>${this.escape(article.author || "NewsHub")}</span>
                        <span><i class="fa-solid fa-calendar"></i>${this.escape(article.date || "")}</span>
                    </div>
                </div>
            </div>
        `;

    }

    renderError(message) {

        if (!this.articlesContainer) return;

        this.articlesContainer.innerHTML = `
            <div class="news-empty">
                <h3>${this.escape(message)}</h3>
                <a href="index.html" class="button button--primary">Return Home</a>
            </div>
        `;

    }

}

document.addEventListener("DOMContentLoaded", () => {

    const categoryPage = new CategoryPage();

    categoryPage.init();

});
