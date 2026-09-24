/*==========================================================
    HOME PAGE
    Version: 1.0
==========================================================*/

class Home {

    constructor() {

        this.featuredContainer =
            document.getElementById("featuredArticle");

        this.heroSideContainer =
            document.getElementById("heroSide");

        this.latestContainer =
            document.getElementById("latestNews");

        this.technologyContainer =
            document.getElementById("technologyNews");

        this.gamingContainer =
            document.getElementById("gamingNews");

        this.businessContainer =
            document.getElementById("businessNews");

        this.userProfile = window.currentUserProfile || null;
        this.social = CONFIG.social || {};

    }

    /*==========================================
        INITIALIZE
    ==========================================*/

    async init() {

        try {

            this.watchAuthActions();

            loader.show({

                title:"Loading News",

                message:"Fetching latest articles..."

            });

            await this.loadHomePage();
            await this.loadSocialSettings();
            this.renderSocialLinks();
            this.updateHeroActions(this.userProfile);

            loader.hide();

        }

        catch(error){

            console.error(error);

            loader.error("Failed to load homepage.");

        }

    }

    /*==========================================
        LOAD PAGE
    ==========================================*/

    async loadHomePage(){

        const [

            featured,

            hero,

            latest,

            technology,

            gaming,

            business,

            trending,

            popular,

            breaking

        ] = await Promise.all([

            api.getFeaturedArticle(),

            api.getHeroArticles(),

            api.getLatestNews(),

            api.getCategoryNews("Technology"),

            api.getCategoryNews("Gaming"),

            api.getCategoryNews("Business"),

            api.getTrendingNews(),

            api.getPopularNews(),

            api.getBreakingNews()

        ]);

        this.renderFeatured(featured);

        this.renderHero(hero);

        this.renderSection(

            this.latestContainer,

            latest

        );

        this.renderSection(

            this.technologyContainer,

            technology

        );

        this.renderSection(

            this.gamingContainer,

            gaming

        );

        this.renderSection(

            this.businessContainer,

            business

        );

        sidebar.renderTrending(trending);

        sidebar.renderPopular(popular);

        breakingNews.setNews(breaking);

        this.loadAdvertisements();

    }

    async loadAdvertisements() {

        try {

            const [normalAds, homepageAds, popupAds] = await Promise.all([
                api.getAdvertisements("sidebar"),
                api.getAdvertisements("homepage"),
                api.getAdvertisements("popup")
            ]);

            sidebar.renderAdvertisement(normalAds);

            if (window.advertisementRenderer) {

                advertisementRenderer.renderFloatingAd([...homepageAds, ...normalAds]);
                advertisementRenderer.showPopup(popupAds);

            }

        }
        catch(error) {

            console.warn("Advertisements failed to load:", error);

            sidebar.renderAdvertisement([]);

        }

    }

    /*==========================================
        FEATURED ARTICLE
    ==========================================*/

    renderFeatured(article){

        if(!this.featuredContainer) return;

        if(!article){

            this.featuredContainer.innerHTML = `
                <div class="brand-hero-fallback">
                    <img src="${CONFIG.app.logo}" alt="${CONFIG.app.name}">
                    <p>${CONFIG.app.slogan}</p>
                    <div class="brand-hero-fallback__actions" id="brandHeroActions"></div>
                </div>
            `;

            this.updateHeroActions(this.userProfile);

            return;

        }

        this.featuredContainer.innerHTML = `

<div class="news-card news-card--featured">

    <a href="article.html?id=${article.id}">

        <img
            src="${article.image}"
            alt="${article.title}">

    </a>

    <div class="news-card__content">

        <span class="badge">

            ${article.category}

        </span>

        <h2>

            <a href="article.html?id=${article.id}">

                ${article.title}

            </a>

        </h2>

        <p>

            ${article.description}

        </p>

        <div class="news-card__meta">

            <span>

                ${article.author}

            </span>

            <span>

                ${article.date}

            </span>

        </div>

    </div>

</div>

        `;

    }

    isValidSocialUrl(value) {

        if (!value || value === "#") return false;

        try {

            const url = new URL(value);

            return ["http:", "https:"].includes(url.protocol);

        }
        catch(error) {

            return false;

        }

    }

    async loadSocialSettings() {

        this.social = CONFIG.social || {};

        if (typeof db === "undefined") return;

        try {

            const doc = await db
                .collection("settings")
                .doc("website")
                .get();

            if (doc.exists && doc.data().social) {

                this.social = doc.data().social;

            }

        }
        catch(error) {

            console.warn("Social settings could not be loaded:", error);

        }

    }

    socialLinks(className = "brand-community__social"){

        const icons = {
            facebook: "fa-brands fa-facebook-f",
            twitter: "fa-brands fa-x-twitter",
            instagram: "fa-brands fa-instagram",
            youtube: "fa-brands fa-youtube",
            whatsapp: "fa-brands fa-whatsapp",
            tiktok: "fa-brands fa-tiktok",
            linkedin: "fa-brands fa-linkedin-in"
        };

        return Object.entries(this.social || {})
            .filter(([name]) => icons[name])
            .filter(([, url]) => this.isValidSocialUrl(url))
            .map(([name, url]) => `
                <a
                    href="${url}"
                    class="${className}"
                    aria-label="${name}"
                    target="_blank"
                    rel="noopener">
                    <i class="${icons[name]}"></i>
                </a>
            `)
            .join("");

    }

    renderSocialLinks(){

        const container = document.getElementById("homepageSocialLinks");

        if (!container) return;

        container.innerHTML = this.socialLinks("");

        const socialCard = container.closest(".sidebar-card");

        if (socialCard) {

            socialCard.hidden = container.children.length === 0;

        }

    }

    updateHeroActions(profile = null){

        const actions = document.getElementById("brandHeroActions");

        if (!actions) return;

        if (profile) {

            const links = this.socialLinks();

            actions.innerHTML = `
                <a href="category.html?category=latest" class="button button--primary">
                    Explore News
                </a>
                ${links ? `
                    <div class="brand-community">
                        <span>Join Our Community</span>
                        <div class="brand-community__links">
                            ${links}
                        </div>
                    </div>
                ` : ""}
            `;

            return;

        }

        actions.innerHTML = `
            <a href="category.html?category=latest" class="button button--primary">
                Explore News
            </a>
            <a href="login.html" class="button button--outline">
                Join Now
            </a>
        `;

    }

    watchAuthActions(){

        window.addEventListener("hitzoneafrica:user", event => {

            this.userProfile = event.detail || null;
            this.updateHeroActions(this.userProfile);

        });

        if (window.authReady) {

            window.authReady.then(profile => {

                this.userProfile = profile || window.currentUserProfile || null;
                this.updateHeroActions(this.userProfile);

            });

        }

    }

    /*==========================================
        HERO SIDE
    ==========================================*/

    renderHero(articles = []){

        if(!this.heroSideContainer) return;

        if (articles.length === 0) {

            this.heroSideContainer.innerHTML = "";
            this.heroSideContainer.classList.add("hero__side--empty");
            this.heroSideContainer.parentElement?.classList.add("hero__grid--featured-only");

            return;

        }

        this.heroSideContainer.classList.remove("hero__side--empty");
        this.heroSideContainer.parentElement?.classList.remove("hero__grid--featured-only");

        this.heroSideContainer.innerHTML = articles.map(article => `

<div class="news-card">

    <a href="article.html?id=${article.id}">

        <img
            src="${article.image}"
            alt="${article.title}">

    </a>

    <div class="news-card__content">

        <span class="badge">

            ${article.category}

        </span>

        <h4>

            <a href="article.html?id=${article.id}">

                ${article.title}

            </a>

        </h4>

    </div>

</div>

        `).join("");

    }    /*==========================================
        NEWS SECTION
    ==========================================*/

    renderSection(container, articles = []) {

        if (!container) return;

        if (articles.length === 0) {

            container.innerHTML = `

                <div class="card">

                    <h3>

                        No Articles Found

                    </h3>

                </div>

            `;

            return;

        }

        container.innerHTML = articles.map(article =>

            this.createNewsCard(article)

        ).join("");

    }

    /*==========================================
        NEWS CARD
    ==========================================*/

    createNewsCard(article) {

        return `

<div class="news-card card fade-up">

    <div class="news-card__image">

        <a href="article.html?id=${article.id}">

            <img

                src="${article.image}"

                alt="${article.title}">

        </a>

    </div>

    <div class="news-card__content">

        <span class="badge">

            ${article.category}

        </span>

        <h3 class="news-card__title">

            <a href="article.html?id=${article.id}">

                ${article.title}

            </a>

        </h3>

        <p>

            ${article.description}

        </p>

        <div class="news-card__meta">

            <span>

                <i class="fa-solid fa-user"></i>

                ${article.author}

            </span>

            <span>

                <i class="fa-solid fa-calendar"></i>

                ${article.date}

            </span>

        </div>

    </div>

</div>

        `;

    }

    /*==========================================
        LOADING
    ==========================================*/

    loading() {

        const skeleton = `

            <div class="card">

                Loading...

            </div>

        `;

        if (this.latestContainer)
            this.latestContainer.innerHTML = skeleton;

        if (this.technologyContainer)
            this.technologyContainer.innerHTML = skeleton;

        if (this.gamingContainer)
            this.gamingContainer.innerHTML = skeleton;

        if (this.businessContainer)
            this.businessContainer.innerHTML = skeleton;

    }

    /*==========================================
        ERROR
    ==========================================*/

    error(message = "Unable to load news.") {

        const html = `

            <div class="card">

                <h3>

                    ${message}

                </h3>

            </div>

        `;

        if (this.latestContainer)
            this.latestContainer.innerHTML = html;

        if (this.technologyContainer)
            this.technologyContainer.innerHTML = html;

        if (this.gamingContainer)
            this.gamingContainer.innerHTML = html;

        if (this.businessContainer)
            this.businessContainer.innerHTML = html;

    }

}

/*==========================================================
    GLOBAL INSTANCE
==========================================================*/

const home = new Home();

/*==========================================================
    START PAGE
==========================================================*/

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        home.loading();

        await home.init();

    }

);
