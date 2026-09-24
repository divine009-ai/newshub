class VideosPage {

    constructor() {
        this.grid = document.getElementById("videoFeed");
        this.filter = "All";
    }

    escape(value = "") {
        return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    source(video = "") {
        const url = String(video).trim();
        try {
            const parsed = new URL(url);
            if (parsed.hostname.includes("youtu.be")) return { type: "youtube", url: `https://www.youtube.com/embed/${this.escape(parsed.pathname.slice(1))}` };
            if (parsed.hostname.includes("youtube.com")) {
                const id = parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).pop();
                if (id) return { type: "youtube", url: `https://www.youtube.com/embed/${this.escape(id)}` };
            }
            if (/twitter\.com|x\.com/i.test(parsed.hostname)) return { type: "external", url };
            if (/facebook\.com/i.test(parsed.hostname)) return { type: "external", url };
        } catch (error) { /* direct media URLs can still be rendered below */ }
        if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) return { type: "file", url };
        return { type: "external", url };
    }

    media(article, featured = false) {
        const video = this.source(article.video || article.coverVideo);
        if (video.type === "youtube") return `<iframe class="video-feed__player" src="${video.url}" title="${this.escape(article.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
        if (video.type === "file") return `<video class="video-feed__player" controls preload="metadata" playsinline poster="${this.escape(article.image)}"><source src="${this.escape(video.url)}">Your browser does not support video playback.</video>`;
        return `<a class="video-feed__fallback" href="${this.escape(video.url)}" target="_blank" rel="noopener"><img src="${this.escape(article.image)}" alt=""><span><i class="fa-solid fa-arrow-up-right-from-square"></i> Open original video</span></a>`;
    }

    card(article, featured = false) {
        return `<article class="video-feed__card ${featured ? "video-feed__card--featured" : ""}">
            <div class="video-feed__media">${this.media(article, featured)}</div>
            <div class="video-feed__body"><a class="video-feed__title" href="article.html?id=${this.escape(article.id)}">${this.escape(article.title)}</a>
            <div class="video-feed__meta"><span><i class="fa-regular fa-clock"></i> ${this.escape(article.date || "Latest")}</span><span><i class="fa-regular fa-eye"></i> ${Number(article.views || 0).toLocaleString()} views</span></div></div>
        </article>`;
    }

    render(articles) {
        const filtered = this.filter === "All" ? articles : articles.filter(article => article.category === this.filter);
        this.grid.innerHTML = filtered.length ? filtered.map((article, index) => this.card(article, index === 0)).join("") : `<div class="empty-state"><i class="fa-solid fa-video-slash"></i><p>No published videos in this category yet.</p></div>`;
    }

    async loadAdvertisements() {

        if (!window.advertisementRenderer) return;

        try {

            const [floating, popups] = await Promise.all([
                api.getAdvertisements("homepage"),
                api.getAdvertisements("popup")
            ]);

            advertisementRenderer.renderFloatingAd(floating);
            advertisementRenderer.showPopup(popups);

        }
        catch(error) {

            console.warn("Video page advertisements failed to load:", error);

        }

    }

    async init() {
        const articles = await api.getVideoNews();
        const categories = [...new Set(articles.map(article => article.category).filter(Boolean))];
        document.getElementById("videoFilters").insertAdjacentHTML("beforeend", categories.map(category => `<button class="video-filter" data-category="${this.escape(category)}">${this.escape(category)}</button>`).join(""));
        document.querySelectorAll(".video-filter").forEach(button => button.addEventListener("click", () => {
            document.querySelectorAll(".video-filter").forEach(item => item.classList.remove("is-active"));
            button.classList.add("is-active"); this.filter = button.dataset.category; this.render(articles);
        }));
        this.render(articles);
        this.loadAdvertisements();
    }
}

document.addEventListener("DOMContentLoaded", () => new VideosPage().init().catch(error => {
    console.error(error);
    document.getElementById("videoFeed").innerHTML = `<div class="empty-state"><p>Videos are temporarily unavailable.</p></div>`;
}));
