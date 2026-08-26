/*==========================================================
    PROFILE PAGE
==========================================================*/

class ProfilePage {

    constructor() {

        this.form = document.getElementById("profileForm");
        this.nameInput = document.getElementById("profileName");
        this.photoInput = document.getElementById("profilePhoto");
        this.preview = document.getElementById("profilePreview");
        this.removeButton = document.getElementById("removeProfilePhoto");
        this.profile = null;
        this.photoDataUrl = "";
        this.removePhoto = false;

    }

    async init() {

        const profile = await (window.authReady || Promise.resolve(null));

        if (!window.currentUser || !profile) {

            window.location.href = "login.html";
            return;

        }

        this.profile = profile;
        this.photoDataUrl = profile.photoDataUrl || profile.photoURL || profile.photo || "";
        this.render();
        this.bindEvents();

    }

    render() {

        this.nameInput.value = this.profile.name || this.profile.username || "";
        this.preview.src = NewsHubAvatar.src({
            ...this.profile,
            photoDataUrl: this.photoDataUrl
        });

        this.preview.classList.toggle("profile-avatar--admin", this.profile.role === "admin");

    }

    bindEvents() {

        this.photoInput.addEventListener("change", async () => {

            const file = this.photoInput.files[0];

            if (!file) return;

            try {

                this.photoDataUrl = await NewsHubAvatar.compressFile(file);
                this.removePhoto = false;
                this.render();

            }
            catch(error) {

                this.photoInput.value = "";
                modal.error(error.message || "Please select a valid image.");

            }

        });

        this.removeButton.addEventListener("click", () => {

            this.photoInput.value = "";
            this.photoDataUrl = "";
            this.removePhoto = true;
            this.render();

        });

        this.form.addEventListener("submit", event => this.save(event));

    }

    async save(event) {

        event.preventDefault();

        const name = this.nameInput.value.trim();

        if (!name) {

            modal.error("Name is required.");
            return;

        }

        try {

            loader.show("Saving profile...");

            await db
                .collection("users")
                .doc(window.currentUser.uid)
                .update({
                    name,
                    photo: this.photoDataUrl,
                    photoURL: this.photoDataUrl,
                    photoDataUrl: this.photoDataUrl,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            await window.currentUser.updateProfile({
                displayName: name,
                photoURL: this.photoDataUrl || null
            }).catch(() => {});

            this.profile = {
                ...this.profile,
                name,
                photo: this.photoDataUrl,
                photoURL: this.photoDataUrl,
                photoDataUrl: this.photoDataUrl
            };

            window.currentUserProfile = this.profile;
            window.dispatchEvent(new CustomEvent("newshub:user", {
                detail: this.profile
            }));

            loader.hide();
            toast.success("Profile updated successfully.");

        }
        catch(error) {

            loader.hide();
            console.error("Failed to update profile:", error);
            modal.error(error.message || "Failed to update profile.");

        }

    }

}

document.addEventListener("DOMContentLoaded", () => {

    new ProfilePage().init();

});
