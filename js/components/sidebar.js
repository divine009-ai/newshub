/*==========================================================
    SIDEBAR COMPONENT
==========================================================*/

class Sidebar {

    constructor() {

        this.trendingContainer = document.getElementById("trendingNews");

        this.popularContainer = document.getElementById("popularNews");

        this.adImage = document.getElementById("sidebarAdImage");

        this.adLink = document.getElementById("sidebarAdLink");

    }

    /*==========================================
        TRENDING
    ==========================================*/

    renderTrending(articles = []) {

        if (!this.trendingContainer) return;

        if (articles.length === 0) {

            this.trendingContainer.innerHTML = `
                <p>No trending news available.</p>
            `;

            return;

        }

        this.trendingContainer.innerHTML = articles.map(article => `

            <div class="sidebar-news-card">

                <a href="article.html?id=${article.id}">

                    <img
                        src="${article.image}"
                        alt="${article.title}">

                </a>

                <div class="sidebar-news-content">

                    <span class="badge">

                        ${article.category}

                    </span>

                    <h4>

                        <a href="article.html?id=${article.id}">

                            ${article.title}

                        </a>

                    </h4>

                    <small>

                        <i class="fa-solid fa-calendar"></i>

                        ${article.date}

                    </small>

                </div>

            </div>

        `).join("");

    }

    /*==========================================
        POPULAR
    ==========================================*/

    renderPopular(articles = []) {

        if (!this.popularContainer) return;

        if (articles.length === 0) {

            this.popularContainer.innerHTML = `
                <p>No popular news available.</p>
            `;

            return;

        }

        this.popularContainer.innerHTML = articles.map((article,index)=>`

            <div class="sidebar-news-card">

                <div class="sidebar-news-number">

                    ${index+1}

                </div>

                <div class="sidebar-news-content">

                    <h4>

                        <a href="article.html?id=${article.id}">

                            ${article.title}

                        </a>

                    </h4>

                    <small>

                        ${article.views} Views

                    </small>

                </div>

            </div>

        `).join("");

    }

    /*==========================================
        ADVERTISEMENT
    ==========================================*/

    renderAdvertisement(ad) {

        if (!this.adImage || !this.adLink) return;

        if (!ad) {

            this.adImage.style.display = "none";

            return;

        }

        this.adImage.src = ad.image;

        this.adImage.alt = "Advertisement";

        this.adLink.href = ad.link;

        this.adLink.target = "_blank";

    }

    /*==========================================
        LOADING
    ==========================================*/

    showLoading() {

        const loading = `

            <div class="sidebar-loading">

                Loading...

            </div>

        `;

        if(this.trendingContainer)
            this.trendingContainer.innerHTML = loading;

        if(this.popularContainer)
            this.popularContainer.innerHTML = loading;

    }

    /*==========================================
        ERROR
    ==========================================*/

    showError(message="Something went wrong.") {

        const error = `

            <div class="sidebar-error">

                <i class="fa-solid fa-circle-exclamation"></i>

                <p>

                    ${message}

                </p>

            </div>

        `;

        if(this.trendingContainer)
            this.trendingContainer.innerHTML = error;

        if(this.popularContainer)
            this.popularContainer.innerHTML = error;

    }

}

/*==========================================================
    GLOBAL INSTANCE
==========================================================*/

const sidebar = new Sidebar();