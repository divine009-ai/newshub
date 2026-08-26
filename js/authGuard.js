/*==========================================================
    PUBLIC AUTH GUARD
    Keeps Firebase Auth synced with Firestore user profiles.
==========================================================*/

const authReady = new Promise(resolve => {

    if (typeof auth === "undefined" || typeof db === "undefined") {

        window.currentUser = null;
        window.currentUserProfile = null;
        resolve(null);
        return;

    }

    const beginAuthWatch = () => auth.onAuthStateChanged(async user => {

        if (!user) {

            window.currentUser = null;
            window.currentUserProfile = null;
            window.dispatchEvent(new CustomEvent("newshub:user", {
                detail: null
            }));
            resolve(null);
            return;

        }

        try {

            const doc = await db
                .collection("users")
                .doc(user.uid)
                .get();

            if (!doc.exists) {

                await auth.signOut();
                window.currentUser = null;
                window.currentUserProfile = null;

                if (typeof toast !== "undefined") {

                    toast.warning(
                        "Account Sync Required",
                        "Please create an account before staying signed in."
                    );

                }

                window.dispatchEvent(new CustomEvent("newshub:user", {
                    detail: null
                }));
                resolve(null);
                return;

            }

            const profile = {
                uid: user.uid,
                ...doc.data()
            };

            if (profile.status === "blocked") {

                await auth.signOut();
                window.currentUser = null;
                window.currentUserProfile = null;

                if (typeof toast !== "undefined") {

                    toast.error(
                        "Account Blocked",
                        "This account can no longer access NewsHub."
                    );

                }

                window.dispatchEvent(new CustomEvent("newshub:user", {
                    detail: null
                }));
                resolve(null);
                return;

            }

            window.currentUser = user;
            window.currentUserProfile = profile;
            window.dispatchEvent(new CustomEvent("newshub:user", {
                detail: profile
            }));
            resolve(profile);

        }
        catch (error) {

            console.error(error);
            resolve(null);

        }

    });

    if (typeof firebase !== "undefined" &&
        firebase.auth?.Auth?.Persistence?.LOCAL &&
        auth.setPersistence) {

        auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(beginAuthWatch)
            .catch(() => beginAuthWatch());

    }
    else {

        beginAuthWatch();

    }

});

window.authReady = authReady;
