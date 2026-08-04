/*==========================================================
    BREAKING NEWS COMPONENT
==========================================================*/

class BreakingNews {

    constructor() {

        this.container = document.getElementById("breakingNews");

        this.news = [];

        this.currentIndex = 0;

        this.interval = null;

        this.delay = 5000;

    }

    /*==========================================
        SET NEWS
    ==========================================*/

    setNews(news = []) {

        this.news = news;

        if (this.news.length > 0) {

            this.currentIndex = 0;

            this.render();

            this.start();

        }

        else {

            this.empty();

        }

    }

    /*==========================================
        RENDER
    ==========================================*/

    render() {

        if (!this.container) return;

        const article = this.news[this.currentIndex];

        this.container.innerHTML = `

            <a
                href="article.html?id=${article.id}"
                class="breaking-news__item fade-up">

                <span
                    class="badge">

                    ${article.category}

                </span>

                <span
                    class="breaking-news__text">

                    ${article.title}

                </span>

            </a>

        `;

    }

    /*==========================================
        NEXT
    ==========================================*/

    next() {

        if (this.news.length === 0) return;

        this.currentIndex++;

        if (this.currentIndex >= this.news.length) {

            this.currentIndex = 0;

        }

        this.render();

    }

    /*==========================================
        START AUTO SLIDER
    ==========================================*/

    start() {

        this.stop();

        this.interval = setInterval(() => {

            this.next();

        }, this.delay);

    }

    /*==========================================
        STOP AUTO SLIDER
    ==========================================*/

    stop() {

        if (this.interval) {

            clearInterval(this.interval);

        }

    }

    /*==========================================
        LOADING
    ==========================================*/

    loading() {

        if (!this.container) return;

        this.container.innerHTML = `

            <div
                class="breaking-news__loading">

                Loading Breaking News...

            </div>

        `;

    }

    /*==========================================
        EMPTY
    ==========================================*/

    empty() {

        if (!this.container) return;

        this.container.innerHTML = `

            <div
                class="breaking-news__empty">

                No Breaking News Available

            </div>

        `;

    }

    /*==========================================
        ERROR
    ==========================================*/

    error(message = "Unable to load breaking news.") {

        if (!this.container) return;

        this.container.innerHTML = `

            <div
                class="breaking-news__error">

                <i class="fa-solid fa-circle-exclamation"></i>

                ${message}

            </div>

        `;

    }

    /*==========================================
        PAUSE ON HOVER
    ==========================================*/

    events() {

        if (!this.container) return;

        this.container.addEventListener(

            "mouseenter",

            () => {

                this.stop();

            }

        );

        this.container.addEventListener(

            "mouseleave",

            () => {

                this.start();

            }

        );

    }

    /*==========================================
        INITIALIZE
    ==========================================*/

    init() {

        this.events();

    }

}

/*==========================================================
    GLOBAL INSTANCE
==========================================================*/

const breakingNews = new BreakingNews();

document.addEventListener(

    "DOMContentLoaded",

    () => {

        breakingNews.init();

    }

);