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

    primaryNavigation() {

        return CONFIG.primaryNavigation || CONFIG.navigation || [];

    }

    categoryNavigation() {

        return CONFIG.categories || (CONFIG.navigation || []).filter(item => {

            return item.link.startsWith("category.html?") &&
                !item.link.includes("category=latest");

        });

    }

    categoryIsActive() {

        if (this.currentPage !== "category.html") return false;

        const currentCategory = (this.params.get("category") || "").toLowerCase();

        return this.categoryNavigation().some(item => {

            const category = new URL(item.link, window.location.href)
                .searchParams
                .get("category");

            return String(category || "").toLowerCase() === currentCategory;

        });

    }

    createLinks(items = []) {

        return items.map(item => {

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

    createNavigation(scope = "desktop") {

        const categories = this.categoryNavigation();
        const categoryActive = this.categoryIsActive() ? "active" : "";
        const detailsId = scope === "mobile"
            ? "navbarCategoriesMobile"
            : "navbarCategoriesDesktop";

        return `
            ${this.createLinks(this.primaryNavigation())}
            <li class="navbar__item navbar__item--categories">
                <details class="navbar__categories" id="${detailsId}">
                    <summary class="navbar__link navbar__category-toggle ${categoryActive}">
                        Categories
                        <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                    </summary>
                    <div class="navbar__category-menu">
                        ${categories.map(item => `
                            <a href="${item.link}" class="${this.isActive(item) ? "active" : ""}">
                                ${item.title}
                            </a>
                        `).join("")}
                    </div>
                </details>
            </li>
        `;

    }

    render() {

        if (!this.container) return;

        this.container.innerHTML = `

<header class="navbar">

    <div class="container navbar__container">

        <div class="navbar__top">

            <a href="index.html" class="navbar__brand" aria-label="${CONFIG.app.name} home">
                <span class="navbar__brand-mark" aria-hidden="true">
                    <i class="fa-solid fa-earth-africa"></i>
                </span>
                <span class="navbar__brand-name">
                    <strong>Hitzone</strong><em>Africa</em>
                </span>
            </a>

            <nav class="navbar__desktop-nav" aria-label="Primary navigation">
                <ul class="navbar__list">
                    ${this.createNavigation("desktop")}
                </ul>
            </nav>

            <div class="navbar__actions">

                <button
                    type="button"
                    id="searchToggle"
                    class="navbar__icon navbar__search-toggle"
                    aria-label="Search stories"
                    aria-controls="navbarSearchPanel"
                    aria-expanded="false">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </button>

                <button
                    type="button"
                    class="navbar__icon navbar__theme-toggle navbar__theme-toggle--header"
                    aria-label="Change color theme">
                    <i class="fa-solid fa-moon"></i>
                </button>

                <div id="authAction" class="navbar__auth"></div>

                <button
                    type="button"
                    id="menuToggle"
                    class="navbar__icon navbar__mobile-button"
                    aria-label="Open navigation menu"
                    aria-controls="navbarMenu"
                    aria-expanded="false">
                    <i class="fa-solid fa-bars"></i>
                </button>

            </div>

        </div>

        <form class="navbar__search-panel" id="navbarSearchPanel" role="search">
            <label class="sr-only" for="searchInput">Search stories</label>
            <input
                id="searchInput"
                class="input"
                type="search"
                placeholder="${CONFIG.search.placeholder}">
            <button id="searchButton" class="navbar__search-submit" type="submit">
                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                <span>Search</span>
            </button>
        </form>

        <nav class="navbar__menu" id="navbarMenu" aria-label="Mobile navigation">
            <ul class="navbar__list">
                ${this.createNavigation("mobile")}
            </ul>
            <div class="navbar__menu-tools">
                <button type="button" class="navbar__menu-theme navbar__theme-toggle">
                    <i class="fa-solid fa-moon" aria-hidden="true"></i>
                    <span>Theme</span>
                </button>
            </div>
            <div class="navbar__mobile-account" id="mobileAuthAction"></div>
        </nav>

    </div>

</header>

        `;

    }

    mobileMenu() {

        const button = document.getElementById("menuToggle");
        const menu = document.getElementById("navbarMenu");
        const categories = document.getElementById("navbarCategoriesMobile");
        const searchPanel = document.getElementById("navbarSearchPanel");

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

            if (event.target.closest("a")) {

                this.closeMobileMenu();
                this.closeSearch();

            }

        });

        searchPanel?.addEventListener("click", event => {

            event.stopPropagation();

        });

        document.addEventListener("click", event => {

            if (!this.container.contains(event.target)) {

                this.closeMobileMenu();
                this.closeSearch();

                if (categories) categories.open = false;

            }

        });

        window.addEventListener("resize", () => {

            if (window.innerWidth > 900) {

                this.closeMobileMenu();
                this.closeSearch();

                if (categories) categories.open = false;

            }

        });

    }

    toggleMobileMenu() {

        const button = document.getElementById("menuToggle");
        const menu = document.getElementById("navbarMenu");

        if (!button || !menu) return;

        const isOpen = menu.classList.toggle("show");

        if (isOpen) this.closeSearch();

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

        const categories = document.getElementById("navbarCategoriesMobile");

        if (categories) categories.open = false;

    }

    themeToggle() {

        const buttons = document.querySelectorAll(".navbar__theme-toggle");

        buttons.forEach(button => {

            button.addEventListener("click", event => {

                event.preventDefault();
                event.stopPropagation();

                document.body.classList.toggle("dark-mode");
                this.updateThemeIcons();

            });

        });

        this.updateThemeIcons();

    }

    updateThemeIcons() {

        const isDark = document.body.classList.contains("dark-mode");

        document.querySelectorAll(".navbar__theme-toggle i").forEach(icon => {

            icon.className = `fa-solid ${isDark ? "fa-sun" : "fa-moon"}`;

        });

    }

    search() {

        const input = document.getElementById("searchInput");
        const button = document.getElementById("searchButton");
        const form = document.getElementById("navbarSearchPanel");
        const toggle = document.getElementById("searchToggle");

        if (!button || !input || !form || !toggle) return;

        form.addEventListener("submit", event => {

            event.preventDefault();

            const keyword = input.value.trim();

            if (keyword !== "") {

                window.location.href =
                    `category.html?search=${encodeURIComponent(keyword)}`;

            }

        });

        toggle.addEventListener("click", event => {

            event.preventDefault();
            event.stopPropagation();
            this.toggleSearch();

        });

    }

    toggleSearch() {

        const panel = document.getElementById("navbarSearchPanel");
        const button = document.getElementById("searchToggle");
        const input = document.getElementById("searchInput");

        if (!panel || !button || !input) return;

        const isOpen = panel.classList.toggle("is-open");

        button.setAttribute("aria-expanded", String(isOpen));

        if (isOpen) {

            this.closeMobileMenu();
            window.setTimeout(() => input.focus(), 0);

        }

    }

    closeSearch() {

        const panel = document.getElementById("navbarSearchPanel");
        const button = document.getElementById("searchToggle");

        if (!panel || !button) return;

        panel.classList.remove("is-open");
        button.setAttribute("aria-expanded", "false");

    }

    escape(value = "") {

        return String(value).replace(/[&<>"']/g, character => ({

            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"

        })[character]);

    }

    authMarkup(profile, mobile = false) {

        if (!profile) {

            return mobile
                ? '<a href="login.html" class="navbar__mobile-login"><i class="fa-regular fa-user" aria-hidden="true"></i><span>Log in or create an account</span></a>'
                : '<a href="login.html" class="navbar__auth-login" aria-label="Log in"><i class="fa-regular fa-user" aria-hidden="true"></i><span>Log in</span></a>';

        }

        const canAdmin =
            profile.role === "admin" &&
            profile.approved &&
            profile.status !== "blocked";
        const name = this.escape(profile.name || profile.username || "Account");
        const avatar = window.HitzoneAfricaAvatar
            ? HitzoneAfricaAvatar.imageHtml(profile, "navbar__avatar")
            : '<span class="navbar__avatar navbar__avatar--fallback"><i class="fa-regular fa-user"></i></span>';

        if (mobile) {

            return `
                <div class="navbar__mobile-user">
                    <a href="profile.html" class="navbar__mobile-profile-link">
                        ${avatar}
                        <span>${name}</span>
                    </a>
                    ${canAdmin ? '<a href="admin.html" class="navbar__mobile-account-link">Admin dashboard</a>' : ""}
                    <button type="button" class="navbar__logout navbar__mobile-logout">
                        <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
                        <span>Sign out</span>
                    </button>
                </div>
            `;

        }

        return `
            <div class="navbar__user">
                <a href="profile.html" class="navbar__profile-link" aria-label="Open ${name}'s profile">
                    ${avatar}
                    <span class="navbar__profile-name">${name}</span>
                </a>
                ${canAdmin ? '<a href="admin.html" class="navbar__admin-link">Admin</a>' : ""}
                <button type="button" class="navbar__logout" aria-label="Sign out">
                    <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
                </button>
            </div>
        `;

    }

    updateAuth(profile) {

        const authAction = document.getElementById("authAction");
        const mobileAuthAction = document.getElementById("mobileAuthAction");

        if (authAction) authAction.innerHTML = this.authMarkup(profile);
        if (mobileAuthAction) mobileAuthAction.innerHTML = this.authMarkup(profile, true);

        document.querySelectorAll(".navbar__logout").forEach(logout => {

            logout.addEventListener("click", async event => {

                event.preventDefault();
                event.stopPropagation();

                if (typeof auth !== "undefined") {

                    await auth.signOut();

                }

                this.updateAuth(null);

            });

        });

    }

    authState() {

        this.updateAuth(window.currentUserProfile || null);

        window.addEventListener("hitzoneafrica:user", event => {

            this.updateAuth(event.detail);

        });

    }

    init() {

        this.render();

        window.hitzoneAfricaNavbar = this;
        window.hitzoneAfricaToggleNavbar = () => this.toggleMobileMenu();

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
