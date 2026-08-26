/*==========================================================
    NAVBAR COMPONENT
==========================================================*/

class Navbar {

    constructor() {

        this.container = document.getElementById("navbar");

        this.currentPage = window.location.pathname.split("/").pop() || "index.html";
        this.params = new URLSearchParams(window.location.search);

    }

    isActive(item) {

        const [itemPage, query = ""] = item.link.split("?");

        if (this.currentPage !== itemPage) return false;

        if (itemPage !== "category.html") return true;

        const itemCategory = new URLSearchParams(query).get("category");
        const currentCategory = this.params.get("category");

        return (itemCategory || "").toLowerCase() === (currentCategory || "").toLowerCase();

    }

    createNavigation() {

        return CONFIG.navigation.map(item => {

            const active = this.isActive(item)
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

                <div
                    id="authAction"
                    class="navbar__auth">

                    <a
                        href="login.html"
                        class="button button--primary">

                        Login

                    </a>

                </div>

                <button
                    type="button"
                    id="menuToggle"
                    class="navbar__icon navbar__mobile-button"
                    aria-label="Open navigation menu">

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

        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-label", "Open navigation menu");

        button.addEventListener("click", event => {

            event.preventDefault();
            event.stopPropagation();
            this.toggleMobileMenu();

        });

        menu.addEventListener("click", event => {

            event.stopPropagation();

        });

        menu.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {

                this.closeMobileMenu();

            });

        });

        document.addEventListener("click", event => {

            if (!this.container.contains(event.target)) {

                this.closeMobileMenu();

            }

        });

        window.addEventListener("resize", () => {

            if (window.innerWidth > 768) {

                this.closeMobileMenu();

            }

        });

    }

    toggleMobileMenu() {

        const button = document.getElementById("menuToggle");
        const menu = document.getElementById("navbarMenu");

        if (!button || !menu) return;

        const isOpen = menu.classList.toggle("show");

        button.setAttribute("aria-expanded", String(isOpen));
        button.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
        button.innerHTML = `<i class="fa-solid ${isOpen ? "fa-xmark" : "fa-bars"}"></i>`;

    }

    closeMobileMenu() {

        const button = document.getElementById("menuToggle");
        const menu = document.getElementById("navbarMenu");

        if (!button || !menu) return;

        menu.classList.remove("show");
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-label", "Open navigation menu");
        button.innerHTML = `<i class="fa-solid fa-bars"></i>`;

    }

    themeToggle() {

        const button = document.getElementById("themeToggle");

        if (!button) return;

        button.addEventListener("click", event => {

            event.preventDefault();
            event.stopPropagation();

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
                    `category.html?search=${encodeURIComponent(keyword)}`;

            }

        });

        input.addEventListener("keypress", (event) => {

            if (event.key === "Enter") {

                event.preventDefault();

                button.click();

            }

        });

    }

    updateAuth(profile) {

        const authAction = document.getElementById("authAction");

        if (!authAction) return;

        if (!profile) {

            authAction.innerHTML = `
                <a href="login.html" class="button button--primary">
                    Login
                </a>
            `;

            return;

        }

        const canAdmin =
            profile.role === "admin" &&
            profile.approved &&
            profile.status !== "blocked";

        const avatar = window.NewsHubAvatar
            ? NewsHubAvatar.imageHtml(profile, "navbar__avatar")
            : "";

        authAction.innerHTML = `
            <div class="navbar__user">
                <a href="profile.html" class="navbar__profile-link">
                    ${avatar}
                    <span>${profile.name || profile.username || "Account"}</span>
                </a>
                ${canAdmin ? '<a href="admin.html">Admin</a>' : ""}
                <button id="navbarLogout" type="button">
                    <i class="fa-solid fa-right-from-bracket"></i>
                </button>
            </div>
        `;

        const logout = document.getElementById("navbarLogout");

        if (logout) {

            logout.addEventListener("click", async event => {

                event.stopPropagation();

                if (typeof auth !== "undefined") {

                    await auth.signOut();

                }

                this.updateAuth(null);

            });

        }

    }

    authState() {

        this.updateAuth(window.currentUserProfile || null);

        window.addEventListener("newshub:user", event => {

            this.updateAuth(event.detail);

        });

    }

    init() {

        this.render();

        window.newshubNavbar = this;
        window.newshubToggleNavbar = () => this.toggleMobileMenu();

        this.mobileMenu();

        this.themeToggle();

        this.search();

        this.authState();

    }

}

document.addEventListener("DOMContentLoaded", () => {

    const navbar = new Navbar();

    navbar.init();

});
