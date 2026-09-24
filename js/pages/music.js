class MusicPage {

    constructor() {

        this.results = document.getElementById("musicResults");
        this.tracks = [];

    }

    escape(value = "") {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

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

    trackCard(track) {

        const title = track.title || track.name || "Untitled track";
        const artist = track.artist || track.author || "Unknown artist";
        const cover = this.safeUrl(track.coverImage || track.image || "") ||
            "assets/images/favicon.png";
        const preview = this.safeUrl(track.previewUrl || track.audioUrl || track.streamUrl || "");
        const download = this.safeUrl(track.downloadUrl || "");
        const canDownload = Boolean(download) && track.downloadAllowed !== false;
        const metadata = [artist, track.genre].filter(Boolean).join(" - ");
        const previewMarkup = preview
            ? '<audio controls preload="none" src="' + this.escape(preview) + '"></audio>'
            : '<span class="music-unavailable">Preview unavailable</span>';
        const downloadMarkup = canDownload
            ? '<a class="music-download" href="' + this.escape(download) +
                '" download target="_blank" rel="noopener"><i class="fa-solid fa-download"></i> Download</a>'
            : '<span class="music-unavailable">Download unavailable</span>';

        return '<article class="music-track">' +
            '<img src="' + this.escape(cover) + '" alt="" loading="lazy">' +
            '<div class="music-track__body"><h3>' + this.escape(title) + "</h3>" +
            "<p>" + this.escape(metadata) + "</p>" + previewMarkup + "</div>" +
            "<div>" + downloadMarkup + "</div></article>";

    }

    render(query = "") {

        const needle = query.trim().toLowerCase();
        const matches = this.tracks.filter(track => {

            return !needle || [
                track.title,
                track.name,
                track.artist,
                track.author,
                track.genre
            ].some(value => String(value || "").toLowerCase().includes(needle));

        });

        this.results.innerHTML = matches.length
            ? matches.map(track => this.trackCard(track)).join("")
            : '<div class="empty-state"><i class="fa-solid fa-music"></i><p>' +
                this.escape(needle
                    ? "No matching music was found."
                    : "No published music is available yet.") +
                "</p></div>";

    }

    setDownloadStatus(markup) {

        const status = document.getElementById("videoDownloadStatus");

        if (status) status.innerHTML = markup;

    }

    providerFor(url) {

        const host = url.hostname.replace(/^www\./, "").toLowerCase();
        const providers = {
            "youtube.com": "YouTube",
            "youtu.be": "YouTube",
            "tiktok.com": "TikTok",
            "instagram.com": "Instagram",
            "facebook.com": "Facebook",
            "x.com": "X",
            "twitter.com": "X"
        };
        const domain = Object.keys(providers).find(item => {

            return host === item || host.endsWith("." + item);

        });

        return domain ? providers[domain] : "";

    }

    isDirectVideo(url) {

        return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url.pathname);

    }

    setupDownloader() {

        const form = document.getElementById("videoDownloadForm");
        const input = document.getElementById("videoUrl");

        if (!form || !input) return;

        form.addEventListener("submit", event => {

            event.preventDefault();

            try {

                const url = new URL(input.value.trim());

                if (!["http:", "https:"].includes(url.protocol)) {

                    throw new Error("Enter a public http or https video URL.");

                }

                const provider = this.providerFor(url);

                if (this.isDirectVideo(url) && url.origin === window.location.origin) {

                    this.setDownloadStatus(
                        '<div class="download-status__ok"><i class="fa-solid fa-circle-check"></i> Direct Hitzone Africa media detected.</div>' +
                        '<video class="download-status__preview" controls preload="metadata" playsinline><source src="' +
                        this.escape(url.href) + '"></video>' +
                        '<a class="music-download" href="' + this.escape(url.href) +
                        '" download><i class="fa-solid fa-download"></i> Download authorized file</a>'
                    );
                    return;

                }

                if (this.isDirectVideo(url)) {

                    this.setDownloadStatus(
                        '<span class="download-status__error"><i class="fa-solid fa-circle-info"></i> This is a direct media file, but its ownership cannot be verified here.</span>' +
                        '<a href="' + this.escape(url.href) +
                        '" target="_blank" rel="noopener">Open the original file</a>'
                    );
                    return;

                }

                if (provider) {

                    this.setDownloadStatus(
                        '<span class="download-status__ok"><i class="fa-solid fa-link"></i> ' +
                        this.escape(provider) + ' link detected.</span>' +
                        '<span>Hitzone Africa cannot retrieve platform-restricted media. Use the creator or platform official save/export option.</span>' +
                        '<a href="' + this.escape(url.href) +
                        '" target="_blank" rel="noopener">Open original post</a>'
                    );
                    return;

                }

                throw new Error("This URL is not a supported public video link.");

            }
            catch(error) {

                this.setDownloadStatus(
                    '<span class="download-status__error"><i class="fa-solid fa-circle-exclamation"></i> ' +
                    this.escape(error.message || "Enter a valid public video URL.") +
                    "</span>"
                );

            }

        });

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

            console.warn("Music page advertisements failed to load:", error);

        }

    }

    async init() {

        const search = document.getElementById("musicSearch");
        const query = document.getElementById("musicQuery");

        if (search && query) {

            search.addEventListener("submit", event => {

                event.preventDefault();
                this.render(query.value);

            });

            query.addEventListener("search", () => this.render(query.value));

        }

        this.setupDownloader();

        try {

            this.tracks = await api.getMusicTracks();
            this.render();

        }
        catch(error) {

            console.warn("Music library could not be loaded:", error);
            this.results.innerHTML = '<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><p>Music is temporarily unavailable.</p></div>';

        }

        this.loadAdvertisements();

    }

}

document.addEventListener("DOMContentLoaded", () => {

    new MusicPage().init();

});
