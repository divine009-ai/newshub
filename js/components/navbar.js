/*==========================================================
    NAVBAR COMPONENT
==========================================================*/

class Navbar {

    constructor() {

        this.container = document.getElementById("navbar");

        this.currentPage = window.location.pathname.split("/").pop() || "index.html";

    }

    createNavigation() {

        return CONFIG.navigation.map(item => {

            const active = this.currentPage === item.link.split("?")[0]
                ? "active"
                : "";

            return `
                <li class="navbar__item">
                    <a href="${item.link}" class="navbar__link ${active}">
                        ${item.title}
                    </a>
                </li>
            `;

        }).join("");

    }

    render() {

        if (!this.container) return;

        this.container.innerHTML = `

<header class="navbar">

    <div class="container">

        <div class="navbar__top">

            <a href="index.html" class="navbar__logo">

                ${CONFIG.app.name}

            </a>

            <div class="navbar__search">

                <input
                    id="searchInput"
                    class="input"
                    type="search"
                    placeholder="${CONFIG.search.placeholder}">

                <button
                    id="searchButton"
                    class="navbar__search-button">

                    <i class="fa-solid fa-magnifying-glass"></i>

                </button>

            </div>

            <div class="navbar__actions">

                <button
                    id="themeToggle"
                    class="navbar__icon">

                    <i class="fa-solid fa-moon"></i>

                </button>

                <a
                    href="login.html"
                    class="button button--primary">

                    Login

                </a>

                <button
                    id="menuToggle"
                    class="navbar__icon navbar__mobile-button">

                    <i class="fa-solid fa-bars"></i>

                </button>

            </div>

        </div>

        <nav
            class="navbar__menu"
            id="navbarMenu">

            <ul class="navbar__list">

                ${this.createNavigation()}

            </ul>

        </nav>

    </div>

</header>

        `;

    }

    mobileMenu() {

        const button = document.getElementById("menuToggle");

        const menu = document.getElementById("navbarMenu");

        if (!button || !menu) return;

        button.addEventListener("click", () => {

            menu.classList.toggle("show");

        });

    }

    themeToggle() {

        const button = document.getElementById("themeToggle");

        if (!button) return;

        button.addEventListener("click", () => {

            document.body.classList.toggle("dark-mode");

        });

    }

    search() {

        const input = document.getElementById("searchInput");

        const button = document.getElementById("searchButton");

        if (!button || !input) return;

        button.addEventListener("click", () => {

            const keyword = input.value.trim();

            if (keyword !== "") {

                window.location.href =
                    `search.html?q=${encodeURIComponent(keyword)}`;

            }

        });

        input.addEventListener("keypress", (event) => {

            if (event.key === "Enter") {

                event.preventDefault();

                button.click();

            }

        });

    }

    init() {

        this.render();

        this.mobileMenu();

        this.themeToggle();

        this.search();

    }

}

document.addEventListener("DOMContentLoaded", () => {

    const navbar = new Navbar();

    navbar.init();

});