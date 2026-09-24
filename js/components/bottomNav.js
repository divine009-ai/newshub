class BottomNav {

    render() {
        document.getElementById("mobileBottomNav")?.remove();

        const page = window.location.pathname.split("/").pop() || "index.html";
        const active = value => page === value ? "is-active" : "";
        const profileHref = window.currentUserProfile ? "profile.html" : "login.html";

        document.body.insertAdjacentHTML("beforeend", `
            <nav class="mobile-bottom-nav" id="mobileBottomNav" aria-label="Primary mobile navigation">
                <a class="mobile-bottom-nav__item ${active("index.html")}" href="index.html">
                    <i class="fa-solid fa-house" aria-hidden="true"></i><span>Home</span>
                </a>
                <a class="mobile-bottom-nav__item ${page === "category.html" ? "is-active" : ""}" href="category.html?category=latest">
                    <i class="fa-solid fa-compass" aria-hidden="true"></i><span>Explore</span>
                </a>
                <a class="mobile-bottom-nav__item ${active("videos.html")}" href="videos.html">
                    <i class="fa-solid fa-circle-play" aria-hidden="true"></i><span>Videos</span>
                </a>
                <a class="mobile-bottom-nav__item ${active("music.html")}" href="music.html">
                    <i class="fa-solid fa-music" aria-hidden="true"></i><span>Music</span>
                </a>
                <a class="mobile-bottom-nav__item ${active("profile.html")}" href="${profileHref}">
                    <i class="fa-regular fa-user" aria-hidden="true"></i><span>Profile</span>
                </a>
            </nav>
        `);
    }

    init() {

        this.render();

        window.addEventListener("hitzoneafrica:user", () => this.render());

    }
}

window.bottomNav = new BottomNav();
document.addEventListener("DOMContentLoaded", () => window.bottomNav.init());
