/*==========================================================
    ADVERTISEMENT RENDERER
==========================================================*/

class AdvertisementRenderer {

    constructor() {

        this.mediaTimeout = 5000;
        this.popupKey = "newshub:lastPopupAd";
        this.floatingKey = "newshub:lastFloatingAd";
        this.popupShownKey = "newshub:lastPopupShownAt";
        this.popupCooldown = 10 * 60 * 1000;
        this.userInteracted = false;
        this.pendingPopups = [];
        this.interactionEvents = ["pointerdown", "keydown", "touchstart", "click"];
        this.bindInteractionUnlock();

    }

    bindInteractionUnlock() {

        const unlock = event => {

            const target = event?.target;

            if (target && target.closest && target.closest(".ad-popup")) return;

            this.userInteracted = true;

            this.interactionEvents.forEach(type => {

                document.removeEventListener(type, unlock, true);

            });

            const pending = [...this.pendingPopups];
            this.pendingPopups = [];
            pending.forEach(args => this.renderPopup(...args));

        };

        this.interactionEvents.forEach(type => {

            document.addEventListener(type, unlock, true);

        });

    }

    activeNormal(ads = []) {

        return ads.filter(ad =>
            ad &&
            ad.active !== false &&
            String(ad.mode || "normal").toLowerCase() !== "popup"
        );

    }

    activePopups(ads = []) {

        return ads.filter(ad =>
            ad &&
            ad.active !== false &&
            String(ad.mode || "").toLowerCase() === "popup"
        );

    }

    isVideo(ad) {

        return String(ad.type || "").toLowerCase() === "video" ||
            /\.(mp4|webm|ogg)(\?.*)?$/i.test(ad.image || ad.media || "");

    }

    mediaUrl(ad) {

        return ad.media || ad.image || "";

    }

    youtubeEmbedUrl(value = "", options = {}) {

        try {

            const url = new URL(value);
            const params = options.autoplay
                ? "?autoplay=1&mute=0&playsinline=1&controls=0"
                : "";

            if (url.hostname.includes("youtu.be")) {

                return `https://www.youtube.com/embed/${url.pathname.replace("/", "")}${params}`;

            }

            if (url.hostname.includes("youtube.com")) {

                if (url.pathname.startsWith("/embed/")) {

                    if (!options.autoplay) return value;

                    url.searchParams.set("autoplay", "1");
                    url.searchParams.set("mute", "0");
                    url.searchParams.set("playsinline", "1");
                    url.searchParams.set("controls", "0");
                    return url.toString();

                }

                const id = url.searchParams.get("v");

                return id ? `https://www.youtube.com/embed/${id}${params}` : "";

            }

        }
        catch(error) {

            return "";

        }

        return "";

    }

    mediaHtml(ad, options = {}) {

        const url = this.mediaUrl(ad);
        const title = ad.title || "Advertisement";
        const shouldAutoplay = options.autoplay === true;
        const eager = options.eager === true;

        if (this.isVideo(ad)) {

            const embed = this.youtubeEmbedUrl(url, { autoplay: shouldAutoplay });

            if (embed) {

                return `
                    <iframe
                        src="${embed}"
                        title="${title}"
                        loading="${eager ? "eager" : "lazy"}"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowfullscreen>
                    </iframe>
                `;

            }

            return `
                <video ${shouldAutoplay ? "autoplay" : ""} playsinline ${shouldAutoplay ? "" : "controls"} preload="${shouldAutoplay ? "auto" : "metadata"}">
                    <source src="${url}">
                </video>
            `;

        }

        return `<img src="${url}" alt="${title}" loading="${eager ? "eager" : "lazy"}" ${eager ? 'fetchpriority="high"' : ""}>`;

    }

    shouldShowPopupNow() {

        const lastShown = Number(localStorage.getItem(this.popupShownKey) || 0);

        return !lastShown || Date.now() - lastShown > this.popupCooldown;

    }

    markPopupShown() {

        localStorage.setItem(this.popupShownKey, String(Date.now()));

    }

    preloadPopupMedia(ad) {

        const url = this.mediaUrl(ad);

        if (!url || this.youtubeEmbedUrl(url)) return;

        const link = document.createElement("link");

        link.rel = "preload";
        link.href = url;
        link.as = this.isVideo(ad) ? "video" : "image";
        document.head.appendChild(link);

    }

    renderCarousel(container, ads = []) {

        if (!container) return;

        const normalAds = this.activeNormal(ads);

        if (normalAds.length === 0) {

            container.innerHTML = `
                <div class="ad-fallback">Advertisement unavailable</div>
            `;
            return;

        }

        container.innerHTML = `
            <div class="ad-carousel" data-index="0">
                <div class="ad-carousel__track">
                    ${normalAds.map((ad, index) => `
                        <a
                            class="ad-carousel__item ${index === 0 ? "active" : ""}"
                            href="${ad.link || "#"}"
                            target="_blank"
                            rel="noopener">
                            <div class="ad-carousel__media">
                                ${this.mediaHtml(ad)}
                            </div>
                            ${ad.title ? `<span class="ad-carousel__caption">${ad.title}</span>` : ""}
                        </a>
                    `).join("")}
                </div>
                ${normalAds.length > 1 ? `
                    <div class="ad-carousel__indicators">
                        ${normalAds.map((ad, index) => `
                            <button type="button" class="${index === 0 ? "active" : ""}" aria-label="Advertisement ${index + 1}"></button>
                        `).join("")}
                    </div>
                ` : ""}
            </div>
        `;

        this.watchMedia(container, normalAds.length);

        if (normalAds.length > 1) {

            this.startCarousel(container);

        }

    }

    watchMedia(container, total) {

        container.querySelectorAll(".ad-carousel__item").forEach((item, index) => {

            const media = item.querySelector("img, video");

            if (!media) return;

            let settled = false;

            const fail = () => {

                if (settled) return;

                settled = true;
                item.classList.add("ad-carousel__item--failed");

                if (total === 1) {

                    item.innerHTML = `<div class="ad-fallback">Advertisement unavailable</div>`;

                }

            };

            const pass = () => {

                settled = true;

            };

            media.addEventListener("load", pass, { once: true });
            media.addEventListener("loadeddata", pass, { once: true });
            media.addEventListener("error", fail, { once: true });

            setTimeout(fail, this.mediaTimeout);

        });

    }

    startCarousel(container) {

        const items = Array.from(container.querySelectorAll(".ad-carousel__item"));
        const indicators = Array.from(container.querySelectorAll(".ad-carousel__indicators button"));

        if (items.length <= 1) return;

        let index = 0;

        setInterval(() => {

            const visibleItems = items.filter(item => !item.classList.contains("ad-carousel__item--failed"));

            if (visibleItems.length <= 1) return;

            items[index]?.classList.remove("active");
            indicators[index]?.classList.remove("active");

            do {

                index = (index + 1) % items.length;

            } while (items[index].classList.contains("ad-carousel__item--failed"));

            items[index].classList.add("active");
            indicators[index]?.classList.add("active");

        }, 2000);

    }

    pickRotatingAd(ads = [], storageKey = this.popupKey) {

        if (ads.length <= 1) return ads[0] || null;

        const lastId = localStorage.getItem(storageKey);
        const currentIndex = ads.findIndex(ad => ad.id === lastId);
        const next = ads[(currentIndex + 1) % ads.length] || ads[0];

        localStorage.setItem(storageKey, next.id || "");

        return next;

    }

    showPopup(ads = [], failedIds = new Set()) {

        if (!this.shouldShowPopupNow()) return;

        if (!this.userInteracted) {

            this.pendingPopups = [[ads, failedIds]];
            return;

        }

        this.renderPopup(ads, failedIds);

    }

    renderPopup(ads = [], failedIds = new Set()) {

        const popupAds = this.activePopups(ads)
            .filter(ad => !failedIds.has(ad.id));
        const ad = this.pickRotatingAd(popupAds);

        if (!ad) return;

        this.preloadPopupMedia(ad);
        this.markPopupShown();

        const root = document.getElementById("modal-root") || document.body;
        const delay = Number(ad.skipDelay || 5) * 1000;
        const media = this.mediaUrl(ad);
        const link = ad.link || "#";

        const popup = document.createElement("div");

        popup.className = "ad-popup";
        popup.innerHTML = `
            <div class="ad-popup__overlay"></div>
            <div class="ad-popup__card">
                <button class="ad-popup__close hidden" type="button" aria-label="Close advertisement">
                    <i class="fa-solid fa-xmark"></i>
                    <span>Skip</span>
                </button>
                <a class="ad-popup__media" href="${link}" target="_blank" rel="noopener">
                    ${this.mediaHtml({
                        ...ad,
                        image: media
                    }, { autoplay: this.isVideo(ad), eager: true })}
                </a>
                ${ad.title ? `<a class="ad-popup__caption" href="${link}" target="_blank" rel="noopener">${ad.title}</a>` : ""}
            </div>
        `;

        root.appendChild(popup);

        const close = popup.querySelector(".ad-popup__close");
        const video = popup.querySelector("video");

        const remove = event => {

            event?.preventDefault();
            event?.stopPropagation();
            popup.remove();

        };

        const failAndTryNext = () => {

            failedIds.add(ad.id);
            popup.remove();
            this.renderPopup(ads, failedIds);

        };

        close.addEventListener("click", remove);

        setTimeout(() => {

            close.classList.remove("hidden");

        }, Math.max(0, delay));

        if (video) {

            video.muted = false;
            video.volume = 1;
            video.play().catch(() => {

                video.removeAttribute("autoplay");

            });

            video.addEventListener("error", failAndTryNext, { once: true });

            setTimeout(() => {

                if (video.readyState === 0) failAndTryNext();

            }, this.mediaTimeout);

        }

    }

    renderFloatingAd(ads = []) {

        const normalAds = this.activeNormal(ads);
        const ad = this.pickRotatingAd(normalAds, this.floatingKey);
        const existing = document.querySelector(".site-ad-rail");

        if (existing) existing.remove();
        if (!ad) return;

        const rail = document.createElement("aside");

        rail.className = "site-ad-rail";
        rail.setAttribute("aria-label", "Advertisement");
        rail.innerHTML = `
            <a href="${ad.link || "#"}" target="_blank" rel="noopener">
                <span>Advertisement</span>
                <div class="site-ad-rail__media">
                    ${this.mediaHtml(ad, { eager: true })}
                </div>
            </a>
        `;

        document.body.appendChild(rail);

    }

}

const advertisementRenderer = new AdvertisementRenderer();

window.advertisementRenderer = advertisementRenderer;
