/*==========================================================
    ARTICLE PAGE
    Version: 2.0
==========================================================*/

class ArticlePage {

    constructor() {

        this.params = new URLSearchParams(window.location.search);
        this.articleId = this.params.get("id");
        this.article = null;

    }

    escape(value = "") {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }

    formatDate(value) {

        if (!value) return "";

        const date = typeof value.toDate === "function"
            ? value.toDate()
            : new Date(value);

        if (Number.isNaN(date.getTime())) return "";

        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        });

    }

    readTime(content = "") {

        const words = String(content).trim().split(/\s+/).filter(Boolean).length;

        return `${Math.max(1, Math.ceil(words / 220))} min read`;

    }

    contentHtml(content = "") {

        return this.escape(content)
            .split(/\n{2,}/)
            .map(paragraph => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
            .join("");

    }

    setText(id, value) {

        const element = document.getElementById(id);

        if (element) element.textContent = value;

    }

    setLink(id, href) {

        const element = document.getElementById(id);

        if (element) element.href = href;

    }

    async init() {

        if (!this.articleId) {

            this.showMissing("No article was selected.");
            return;

        }

        try {

            if (typeof loader !== "undefined") {

                loader.show({
                    title: "Loading Article",
                    message: "Fetching the story..."
                });

            }

            await Promise.all([
                window.authReady || Promise.resolve(),
                this.loadArticle()
            ]);

            await this.loadSurroundingContent();

            if (typeof loader !== "undefined") loader.hide();

        }
        catch (error) {

            console.error(error);

            if (typeof loader !== "undefined") loader.hide();

            this.showMissing("Unable to load this article.");

        }

    }

    async loadArticle() {

        this.article = await api.getArticle(this.articleId);

        if (!this.article || this.article.published === false) {

            this.showMissing("This article is not available.");
            return;

        }

        await api.increaseViews(this.articleId).catch(() => {});

        this.renderArticle();

    }

    renderArticle() {

        const article = this.article;
        const category = article.category || "News";
        const title = article.title || "Untitled Article";
        const date = article.date || this.formatDate(article.createdAt);

        document.title = `${title} | NewsHub`;
        this.setText("articleCategory", category);
        this.setText("articleCategoryLink", category);
        this.setText("breadcrumbTitle", title);
        this.setText("articleTitle", title);
        this.setText("articleAuthor", article.author || "NewsHub");
        this.setText("articleDate", date);
        this.setText("articleViews", `${(article.views || 0) + 1}`);
        this.setText("articleReadTime", this.readTime(article.content));
        this.setLink("articleCategoryLink", `category.html?category=${encodeURIComponent(category)}`);

        const image = document.getElementById("articleImage");

        if (image) {

            image.src = article.image || "images/avatar.png";
            image.alt = title;

        }

        this.renderArticleVideo(article.video || article.coverVideo || "");

        const content = document.getElementById("articleContent");

        if (content) content.innerHTML = this.contentHtml(article.content || article.description || "");

        const tags = document.getElementById("articleTags");

        if (tags) {

            const tagList = Array.isArray(article.tags)
                ? article.tags
                : String(article.tags || "").split(",");

            tags.innerHTML = tagList
                .map(tag => tag.trim())
                .filter(Boolean)
                .map(tag => `<span class="badge">${this.escape(tag)}</span>`)
                .join("");

        }

        this.setupShareLinks(title);

    }

    youtubeEmbedUrl(videoUrl) {

        if (!videoUrl) return "";

        try {

            const url = new URL(videoUrl);

            if (url.hostname.includes("youtu.be")) {

                return `https://www.youtube.com/embed/${this.escape(url.pathname.replace("/", ""))}`;

            }

            if (url.hostname.includes("youtube.com")) {

                if (url.pathname.startsWith("/embed/")) {

                    return videoUrl;

                }

                const id = url.searchParams.get("v");

                return id ? `https://www.youtube.com/embed/${this.escape(id)}` : "";

            }

        }
        catch(error) {

            return "";

        }

        return "";

    }

    renderArticleVideo(videoUrl = "") {

        const container = document.getElementById("articleVideo");

        if (!container) return;

        const url = String(videoUrl || "").trim();

        if (!url) {

            container.classList.add("hidden");
            container.innerHTML = "";
            return;

        }

        if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {

            container.classList.remove("hidden");
            container.innerHTML = `
                <video controls preload="metadata">
                    <source src="${this.escape(url)}">
                    Your browser does not support the video tag.
                </video>
            `;
            return;

        }

        const embedUrl = this.youtubeEmbedUrl(url);

        if (embedUrl) {

            container.classList.remove("hidden");
            container.innerHTML = `
                <iframe
                    src="${this.escape(embedUrl)}"
                    title="Article video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen>
                </iframe>
            `;
            return;

        }

        container.classList.add("hidden");
        container.innerHTML = "";

    }

    setupShareLinks(title) {

        const links = document.querySelectorAll(".article-share .social-links a");
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(title);
        const targets = [
            `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
            `https://wa.me/?text=${text}%20${url}`,
            `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`
        ];

        links.forEach((link, index) => {

            link.href = targets[index] || "#";
            link.target = "_blank";
            link.rel = "noopener";

        });

    }

    async loadSurroundingContent() {

        if (!this.article) return;

        const [
            related,
            previous,
            next,
            trending,
            popular,
            breaking,
            sidebarAd,
            articleAd,
            comments
        ] = await Promise.all([
            api.getRelatedArticles(this.article.category || "", this.articleId),
            this.article.createdAt ? api.getPreviousArticle(this.article.createdAt) : Promise.resolve(null),
            this.article.createdAt ? api.getNextArticle(this.article.createdAt) : Promise.resolve(null),
            api.getTrendingNews(),
            api.getPopularNews(),
            api.getBreakingNews(),
            api.getAdvertisements("sidebar", this.article.category || ""),
            api.getAdvertisements("article", this.article.category || ""),
            api.getComments(this.articleId)
        ]);

        this.renderRelated(related);
        this.renderNavigation(previous, next);
        this.renderArticleAd(articleAd);
        this.renderComments(comments);
        this.initCommentForm();

        if (typeof sidebar !== "undefined") {

            sidebar.renderTrending(trending);
            sidebar.renderPopular(popular);
            sidebar.renderAdvertisement(sidebarAd);

        }

        if (typeof breakingNews !== "undefined") {

            breakingNews.setNews(breaking);

        }

    }

    renderNewsCard(article) {

        return `
            <div class="news-card card fade-up">
                <div class="news-card__image">
                    <a href="article.html?id=${article.id}">
                        <img src="${article.image}" alt="${this.escape(article.title)}">
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
                        <span><i class="fa-solid fa-calendar"></i>${this.escape(article.date || this.formatDate(article.createdAt))}</span>
                    </div>
                </div>
            </div>
        `;

    }

    renderRelated(articles = []) {

        const container = document.getElementById("relatedArticles");

        if (!container) return;

        container.innerHTML = articles.length
            ? articles.map(article => this.renderNewsCard(article)).join("")
            : '<div class="news-empty">No related articles yet.</div>';

    }

    renderNavigation(previous, next) {

        this.renderNavigationItem("previousArticle", previous, "Previous Article");
        this.renderNavigationItem("nextArticle", next, "Next Article");

    }

    renderNavigationItem(id, article, label) {

        const link = document.getElementById(id);

        if (!link) return;

        if (!article) {

            link.href = "#";
            link.classList.add("hidden");
            return;

        }

        link.href = `article.html?id=${article.id}`;
        link.classList.remove("hidden");
        link.innerHTML = `
            <small>${label}</small>
            <h4>${this.escape(article.title || "Untitled")}</h4>
        `;

    }

    renderArticleAd(ad) {

        const image = document.getElementById("articleAdImage");
        const link = document.getElementById("articleAdLink");

        if (!image || !link) return;

        const ads = Array.isArray(ad)
            ? ad
            : ad
                ? [ad]
                : [];

        if (ads.length === 0) {

            image.closest(".article-ad")?.classList.add("hidden");
            return;

        }

        const firstAd = ads[0];

        image.closest(".article-ad")?.classList.remove("hidden");
        image.src = firstAd.image || "";
        image.alt = firstAd.title || "Advertisement";
        link.href = firstAd.link || "#";
        link.target = "_blank";
        link.rel = "noopener";

        const wrapper = image.closest(".article-ad");

        wrapper.querySelectorAll(".article-ad-extra").forEach(element => element.remove());

        ads.slice(1).forEach(extraAd => {

            const extraLink = document.createElement("a");

            extraLink.className = "article-ad-extra";
            extraLink.href = extraAd.link || "#";
            extraLink.target = "_blank";
            extraLink.rel = "noopener";
            extraLink.innerHTML = `
                <img src="${extraAd.image || ""}" alt="${extraAd.title || "Advertisement"}">
            `;

            wrapper.appendChild(extraLink);

        });

    }

    renderComments(comments = []) {

        const container = document.getElementById("commentsContainer");

        if (!container) return;

        container.innerHTML = comments.length
            ? comments.map(comment => `
                <div class="comment">
                    <div class="comment-header">
                        <span class="comment-name">${this.escape(comment.username || comment.name || "Reader")}</span>
                        <span class="comment-date">${this.formatDate(comment.createdAt)}</span>
                    </div>
                    <p class="comment-text">${this.escape(comment.message || "")}</p>
                </div>
            `).join("")
            : '<div class="news-empty">Be the first to comment.</div>';

    }

    initCommentForm() {

        const form = document.getElementById("commentForm");
        const name = document.getElementById("commentName");
        const message = document.getElementById("commentMessage");

        if (!form || !name || !message || form.dataset.ready === "true") return;

        form.dataset.ready = "true";

        if (window.currentUserProfile) {

            name.value = window.currentUserProfile.name || window.currentUserProfile.username || "";

        }

        form.addEventListener("submit", async event => {

            event.preventDefault();

            const username = name.value.trim() || window.currentUserProfile?.name || "Reader";
            const text = message.value.trim();

            if (!text) {

                if (typeof toast !== "undefined") {

                    toast.warning("Comment Required", "Write a comment before posting.");

                }

                return;

            }

            try {

                await api.addComment({
                    articleId: this.articleId,
                    username,
                    message: text,
                    likes: 0,
                    userId: window.currentUser?.uid || null
                });

                message.value = "";

                if (typeof toast !== "undefined") {

                    toast.success("Comment Posted", "Your comment has been added.");

                }

                this.renderComments(await api.getComments(this.articleId));

            }
            catch (error) {

                if (typeof toast !== "undefined") {

                    toast.error("Comment Failed", error.message);

                }

            }

        });

    }

    showMissing(message) {

        const article = document.querySelector(".article");

        if (!article) return;

        article.innerHTML = `
            <div class="news-empty">
                <h2>${this.escape(message)}</h2>
                <p>Return to the homepage and choose another story.</p>
                <a class="button button--primary" href="index.html">Go Home</a>
            </div>
        `;

    }

}

document.addEventListener("DOMContentLoaded", () => {

    const articlePage = new ArticlePage();

    articlePage.init();

});
