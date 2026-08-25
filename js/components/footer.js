/*==========================================================
    FOOTER COMPONENT
==========================================================*/

class Footer {

    constructor() {

        this.container = document.getElementById("footer");

    }

    createNavigation() {

        return CONFIG.navigation.map(item => {

            return `
                <li>
                    <a href="${item.link}">
                        ${item.title}
                    </a>
                </li>
            `;

        }).join("");

    }

    createSocials() {

        const icons = {
            facebook: "fa-facebook-f",
            instagram: "fa-instagram",
            twitter: "fa-x-twitter",
            youtube: "fa-youtube",
            tiktok: "fa-tiktok",
            linkedin: "fa-linkedin-in"
        };

        return Object.entries(this.social || {})
            .filter(([, url]) => this.isValidUrl(url))
            .map(([platform, url]) => `
                <a href="${url}" target="_blank" rel="noopener" aria-label="${platform}">
                    <i class="fab ${icons[platform] || "fa-globe"}"></i>
                </a>
            `)
            .join("");

    }

    isValidUrl(value) {

        try {

            const url = new URL(value);

            return ["http:", "https:"].includes(url.protocol);

        }
        catch(error) {

            return false;

        }

    }

    async loadSettings() {

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

            console.warn("Footer social settings could not be loaded:", error);

        }

    }

    render() {

        if (!this.container) return;

        const year = new Date().getFullYear();

        this.container.innerHTML = `

<footer class="footer">

    <div class="container">

        <div class="footer__grid">

            <!-- About -->

            <div class="footer__column">

                <h2 class="footer__logo">

                    ${CONFIG.app.name}

                </h2>

                <p>

                    ${CONFIG.app.slogan}

                </p>

                <div class="footer__social">

                    ${this.createSocials()}

                </div>

            </div>

            <!-- Categories -->

            <div class="footer__column">

                <h3>

                    Categories

                </h3>

                <ul>

                    ${this.createNavigation()}

                </ul>

            </div>

            <!-- Quick Links -->

            <div class="footer__column">

                <h3>

                    Quick Links

                </h3>

                <ul>

                    <li>

                        <a href="index.html">

                            Home

                        </a>

                    </li>

                    <li>

                        <a href="category.html?category=latest">

                            Latest News

                        </a>

                    </li>

                    <li>

                        <a href="category.html?category=Technology">

                            Technology

                        </a>

                    </li>

                    <li>

                        <a href="category.html?category=Gaming">

                            Gaming

                        </a>

                    </li>

                    <li>

                        <a href="login.html">

                            Login

                        </a>

                    </li>

                </ul>

            </div>

            <!-- Contact -->

            <div class="footer__column">

                <h3>

                    Contact

                </h3>

                <ul>

                    <li>

                        <i class="fa-solid fa-envelope"></i>

                        ${CONFIG.contact.email}

                    </li>

                    <li>

                        <i class="fa-solid fa-phone"></i>

                        ${CONFIG.contact.phone}

                    </li>

                    <li>

                        <i class="fa-solid fa-location-dot"></i>

                        ${CONFIG.contact.address}

                    </li>

                </ul>

            </div>

        </div>

        <div class="footer__bottom">

            <p>

                &copy; ${year} ${CONFIG.app.name}. All Rights Reserved.

            </p>

            <p>

                Version ${CONFIG.app.version}

            </p>

        </div>

    </div>

</footer>

        `;

    }

    async init() {

        await this.loadSettings();

        this.render();

    }

}

document.addEventListener("DOMContentLoaded", () => {

    const footer = new Footer();

    footer.init();

});
