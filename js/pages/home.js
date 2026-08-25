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

    }

    /*==========================================
        INITIALIZE
    ==========================================*/

    async init() {

        try {

            loader.show({

                title:"Loading News",

                message:"Fetching latest articles..."

            });

            await this.loadHomePage();

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

            breaking,

            advertisement

        ] = await Promise.all([

            api.getFeaturedArticle(),

            api.getHeroArticles(),

            api.getLatestNews(),

            api.getCategoryNews("Technology"),

            api.getCategoryNews("Gaming"),

            api.getCategoryNews("Business"),

            api.getTrendingNews(),

            api.getPopularNews(),

            api.getBreakingNews(),

            api.getAdvertisements("sidebar")

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

        sidebar.renderAdvertisement(advertisement);

        breakingNews.setNews(breaking);

    }

    /*==========================================
        FEATURED ARTICLE
    ==========================================*/

    renderFeatured(article){

        if(!this.featuredContainer) return;

        if(!article){

            this.featuredContainer.innerHTML = `
                <div class="card">
                    No featured article found.
                </div>
            `;

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

    /*==========================================
        HERO SIDE
    ==========================================*/

    renderHero(articles = []){

        if(!this.heroSideContainer) return;

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
