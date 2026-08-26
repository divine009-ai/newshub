/*==========================================================
    AVATAR HELPERS
==========================================================*/

const NewsHubAvatar = {

    initials(profile = {}) {

        const source = profile.name || profile.username || profile.email || "N";

        return String(source)
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join("") || "N";

    },

    color(profile = {}) {

        const source = String(profile.uid || profile.email || profile.username || profile.name || "newshub");
        let hash = 0;

        for (let index = 0; index < source.length; index++) {

            hash = source.charCodeAt(index) + ((hash << 5) - hash);

        }

        const hue = Math.abs(hash) % 360;

        return `hsl(${hue}, 78%, 48%)`;

    },

    fallback(profile = {}) {

        const initials = this.initials(profile);
        const color = this.color(profile);
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
                <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                        <stop stop-color="${color}" offset="0"/>
                        <stop stop-color="#22d3ee" offset="1"/>
                    </linearGradient>
                </defs>
                <rect width="160" height="160" rx="80" fill="url(#g)"/>
                <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
                    font-family="Arial, sans-serif" font-size="58" font-weight="700" fill="#fff">${initials}</text>
            </svg>
        `.trim();

        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

    },

    src(profile = {}) {

        return profile.photoDataUrl || profile.photoURL || profile.photo || this.fallback(profile);

    },

    imageHtml(profile = {}, className = "profile-avatar") {

        const adminClass = profile.role === "admin" ? " profile-avatar--admin" : "";

        return `
            <img
                class="${className}${adminClass}"
                src="${this.src(profile)}"
                alt="${profile.name || profile.username || "User"}">
        `;

    },

    validateFile(file, maxSize = 2 * 1024 * 1024) {

        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {

            throw new Error("Please select a valid image file: JPG, PNG or WebP.");

        }

        if (file.size > maxSize) {

            throw new Error("Profile picture must be 2MB or smaller.");

        }

    },

    compressFile(file, options = {}) {

        this.validateFile(file, options.maxInputSize);

        const maxSize = options.maxSize || 320;
        const quality = options.quality || 0.78;

        return new Promise((resolve, reject) => {

            const reader = new FileReader();

            reader.onload = () => {

                const image = new Image();

                image.onload = () => {

                    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
                    const canvas = document.createElement("canvas");

                    canvas.width = Math.max(1, Math.round(image.width * scale));
                    canvas.height = Math.max(1, Math.round(image.height * scale));

                    const context = canvas.getContext("2d");

                    context.drawImage(image, 0, 0, canvas.width, canvas.height);

                    const dataUrl = canvas.toDataURL("image/webp", quality);

                    if (dataUrl.length > 180000) {

                        reject(new Error("Compressed profile picture is still too large. Please choose a smaller image."));
                        return;

                    }

                    resolve(dataUrl);

                };

                image.onerror = () => reject(new Error("Could not read that image."));
                image.src = reader.result;

            };

            reader.onerror = () => reject(new Error("Could not read that image."));
            reader.readAsDataURL(file);

        });

    }

};

window.NewsHubAvatar = NewsHubAvatar;
