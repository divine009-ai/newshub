class AdvertisePage {

    constructor() {

        this.gallery = document.getElementById("advertiseGallery");
        this.models = document.getElementById("advertiseModels");

    }

    escape(value = "") {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }

    displayText(value = "") {

        return String(value || "").replace(/\bnews\s*hub\b/gi, "Hitzone Africa");

    }

    safeUrl(value = "") {

        try {

            const url = new URL(value, window.location.href);

            return ["http:", "https:"].includes(url.protocol)
                ? url.href
                : "";

        }
        catch(error) {

            return "";

        }

    }

    youtubeEmbedUrl(value = "") {

        try {

            const url = new URL(value);

            if (url.hostname.includes("youtu.be")) {

                return "https://www.youtube.com/embed/" + url.pathname.replace("/", "");

            }

            if (url.hostname.includes("youtube.com")) {

                const id = url.searchParams.get("v") ||
                    url.pathname.split("/").filter(Boolean).pop();

                return id ? "https://www.youtube.com/embed/" + id : "";

            }

        }
        catch(error) {

            return "";

        }

        return "";

    }

    campaignMedia(campaign) {

        const source = this.safeUrl(campaign.media || campaign.image || campaign.video || "");

        if (!source) {

            return '<div class="advertise-gallery__placeholder"><i class="fa-solid fa-rectangle-ad"></i></div>';

        }

        const embed = this.youtubeEmbedUrl(source);

        if (embed) {

            return '<iframe src="' + this.escape(embed) + '" title="' +
                this.escape(this.displayText(campaign.title || "Campaign media")) +
                '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';

        }

        if (String(campaign.type || "").toLowerCase() === "video" ||
            /\.(mp4|webm|ogg)(\?.*)?$/i.test(source)) {

            return '<video controls preload="metadata" playsinline><source src="' +
                this.escape(source) + '"></video>';

        }

        return '<img src="' + this.escape(source) + '" alt="' +
            this.escape(this.displayText(campaign.title || "Campaign media")) + '" loading="lazy">';

    }

    campaignCard(campaign) {

        const title = this.displayText(campaign.title || campaign.advertiser || "Hitzone Africa campaign");
        const advertiser = campaign.advertiser
            ? "<small>" + this.escape(this.displayText(campaign.advertiser)) + "</small>"
            : "";
        const destination = this.safeUrl(campaign.link || "");
        const card = '<article class="advertise-gallery__item">' +
            '<div class="advertise-gallery__media">' + this.campaignMedia(campaign) + "</div>" +
            '<div class="advertise-gallery__copy"><span>' + this.escape(title) + "</span>" +
            advertiser + "</div></article>";

        return destination
            ? '<a class="advertise-gallery__link" href="' + this.escape(destination) +
                '" target="_blank" rel="noopener">' + card + "</a>"
            : card;

    }

    modelCard(model) {

        const name = model.name || "Featured profile";
        const subtitle = [model.role, model.location, model.category]
            .filter(Boolean)
            .join(" - ");
        const profileUrl = this.safeUrl(model.profileUrl || model.link || "");
        const imageUrl = this.safeUrl(model.image || model.imageUrl || model.photo || "");
        const image = imageUrl
            ? '<img src="' + this.escape(imageUrl) + '" alt="' +
                this.escape(name) + '" loading="lazy">'
            : '<div class="advertise-model__placeholder"><i class="fa-solid fa-user"></i></div>';
        const card = '<article class="advertise-model">' +
            '<div class="advertise-model__image">' + image + "</div>" +
            '<div class="advertise-model__copy"><h3>' + this.escape(name) + "</h3>" +
            (subtitle ? "<p>" + this.escape(subtitle) + "</p>" : "") +
            "</div></article>";

        return profileUrl
            ? '<a class="advertise-model__link" href="' + this.escape(profileUrl) +
                '" target="_blank" rel="noopener">' + card + "</a>"
            : card;

    }

    renderGallery(campaigns = []) {

        if (!this.gallery) return;

        this.gallery.innerHTML = campaigns.length
            ? campaigns.map(campaign => this.campaignCard(campaign)).join("")
            : '<div class="empty-state"><i class="fa-solid fa-bullhorn"></i><p>No campaign media has been published yet.</p></div>';

    }

    renderModels(models = []) {

        if (!this.models) return;

        this.models.innerHTML = models.length
            ? models.map(model => this.modelCard(model)).join("")
            : '<div class="empty-state"><i class="fa-solid fa-users"></i><p>No model profiles have been published yet.</p></div>';

    }

    renderError(container, message) {

        if (!container) return;

        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><p>' +
            this.escape(message) + "</p></div>";

    }

    async loadAdvertisements() {

        if (!window.advertisementRenderer) return;

        try {

            const [floating, popups] = await Promise.all([
                api.getAdvertisements("homepage"),
                api.getAdvertisements("popup")
            ]);

            advertisementRenderer.renderFloatingAd(floating);
            advertisementRenderer.showPopup(popups);

        }
        catch(error) {

            console.warn("Advertisement page ads failed to load:", error);

        }

    }

    async init() {

        const results = await Promise.allSettled([
            api.getAdvertisementGallery(),
            api.getModels()
        ]);
        const campaigns = results[0];
        const models = results[1];

        if (campaigns.status === "fulfilled") {

            this.renderGallery(campaigns.value);

        }
        else {

            console.warn("Campaign gallery could not be loaded:", campaigns.reason);
            this.renderError(this.gallery, "Campaigns are temporarily unavailable.");

        }

        if (models.status === "fulfilled") {

            this.renderModels(models.value);

        }
        else {

            console.warn("Model gallery could not be loaded:", models.reason);
            this.renderError(this.models, "Models are temporarily unavailable.");

        }

        this.loadAdvertisements();

    }

}

document.addEventListener("DOMContentLoaded", () => {

    new AdvertisePage().init();

});
