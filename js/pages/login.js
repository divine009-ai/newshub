/*==========================================================
    LOGIN PAGE
    Version: 1.0
==========================================================*/

document.addEventListener("DOMContentLoaded", () => {

    /*======================================================
        ELEMENTS
    ======================================================*/

    const loginContainer =
        document.getElementById("loginFormContainer");

    const registerContainer =
        document.getElementById("registerFormContainer");

    const showRegister =
        document.getElementById("showRegister");

    const showLogin =
        document.getElementById("showLogin");

    const loginForm =
        document.getElementById("loginForm");

    const registerForm =
        document.getElementById("registerForm");

    const developerButton =
        document.getElementById("developerLogin");

    const forgotPassword =
        document.getElementById("forgotPassword");

    const togglePassword =
        document.getElementById("togglePassword");

    const loginPassword =
        document.getElementById("loginPassword");

    const loginEmail =
        document.getElementById("loginEmail");

    const rememberMe =
        document.getElementById("rememberMe");

    const registerName =
        document.getElementById("registerName");

    const registerUsername =
        document.getElementById("registerUsername");

    const registerEmail =
        document.getElementById("registerEmail");

    const registerPassword =
        document.getElementById("registerPassword");

    const confirmPassword =
        document.getElementById("confirmPassword");

    const registerPhoto =
        document.getElementById("registerPhoto");

    const applyDeveloper =
        document.getElementById("applyDeveloper");

    const pageParams = new URLSearchParams(window.location.search);

    function safeNextUrl() {

        const next = pageParams.get("next");

        if (!next) return "index.html";

        try {

            const url = new URL(next, window.location.href);

            if (url.origin !== window.location.origin) return "index.html";

            return `${url.pathname.replace(/^\/+/, "")}${url.search}${url.hash}` || "index.html";

        }
        catch(error) {

            return "index.html";

        }

    }



    /*======================================================
        SHOW LOGIN
    ======================================================*/

    function openLogin() {

        loginContainer.classList.remove("hidden");

        registerContainer.classList.add("hidden");

        loginEmail.focus();

    }



    /*======================================================
        SHOW REGISTER
    ======================================================*/

    function openRegister() {

        registerContainer.classList.remove("hidden");

        loginContainer.classList.add("hidden");

        registerName.focus();

    }



    /*======================================================
        PAGE SWITCHING
    ======================================================*/

    if (showRegister) {

        showRegister.addEventListener("click", e => {

            e.preventDefault();

            openRegister();

        });

    }

    if (showLogin) {

        showLogin.addEventListener("click", e => {

            e.preventDefault();

            openLogin();

        });

    }



    /*======================================================
        PASSWORD VISIBILITY
    ======================================================*/

    if (togglePassword) {

        togglePassword.addEventListener("click", () => {

            if (loginPassword.type === "password") {

                loginPassword.type = "text";

                togglePassword.setAttribute("aria-label", "Hide password");

                togglePassword.innerHTML =
                    '<i class="fa-solid fa-eye-slash"></i>';

            }

            else {

                loginPassword.type = "password";

                togglePassword.setAttribute("aria-label", "Show password");

                togglePassword.innerHTML =
                    '<i class="fa-solid fa-eye"></i>';

            }

        });

    }



    /*======================================================
        HELPERS
    ======================================================*/

    function showSuccess(message) {

        if (typeof modal !== "undefined") {

            modal.success("Success", message);

        }

        else {

            alert(message);

        }

    }

    function showError(message) {

        if (typeof modal !== "undefined") {

            modal.error("Login Error", message);

        }

        else {

            alert(message);

        }

    }

    function showLoading(message = "Please wait...") {

        if (typeof loader !== "undefined") {

            loader.show(message);

        }

    }

    function hideLoading() {

        if (typeof loader !== "undefined") {

            loader.hide();

        }

    }

    if (pageParams.get("mode") === "register") {

        openRegister();

    }

    function validateProfileImage(file) {

        if (!file) return "";

        if (!window.NewsHubAvatar) {

            throw new Error("Profile image tools are not ready.");

        }

        NewsHubAvatar.validateFile(file);

    }    /*======================================================
        LOGIN
    ======================================================*/

    if (loginForm) {

        loginForm.addEventListener("submit", async e => {

            e.preventDefault();

            const email =
                loginEmail.value.trim();

            const password =
                loginPassword.value;

            if (!email || !password) {

                showError("Please enter your email and password.");

                return;

            }

            try {

                showLoading("Signing you in...");

                await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

                const credential =

                    await auth.signInWithEmailAndPassword(

                        email,

                        password

                    );

                const uid = credential.user.uid;

                const userDoc =

                    await db

                        .collection("users")

                        .doc(uid)

                        .get();

                hideLoading();

                if (!userDoc.exists) {

                    await auth.signOut();

                    showError(

                        "Your account could not be found."

                    );

                    return;

                }

                const userData = userDoc.data();

                if (userData.status === "blocked") {

                    await auth.signOut();

                    showError(

                        "Your account has been blocked."

                    );

                    return;

                }

                await db

                    .collection("users")

                    .doc(uid)

                    .update({

                        lastLogin:

                        firebase.firestore.FieldValue.serverTimestamp()

                    });

                showSuccess(

                    "Login successful."

                );

                setTimeout(() => {

                    window.location.href = safeNextUrl();

                }, 1800);

            }

            catch (error) {

                hideLoading();

                switch (error.code) {

                    case "auth/user-not-found":

                        showError(

                            "No account exists with this email."

                        );

                        break;

                    case "auth/wrong-password":

                        showError(

                            "Incorrect password."

                        );

                        break;

                    case "auth/invalid-email":

                        showError(

                            "Please enter a valid email."

                        );

                        break;

                    case "auth/too-many-requests":

                        showError(

                            "Too many attempts. Please try again later."

                        );

                        break;

                    default:

                        showError(

                            error.message

                        );

                }

            }

        });

    }    /*======================================================
        REGISTER
    ======================================================*/

    if (registerForm) {

        registerForm.addEventListener("submit", async e => {

            e.preventDefault();

            const name =
                registerName.value.trim();

            const username =
                registerUsername.value.trim();

            const email =
                registerEmail.value.trim();

            const password =
                registerPassword.value;

            const confirm =
                confirmPassword.value;

            const developer =
                applyDeveloper.checked;

            const photoFile =
                registerPhoto?.files?.[0] || null;

            if (
                !name ||
                !username ||
                !email ||
                !password ||
                !confirm
            ) {

                showError(

                    "Please fill in all fields."

                );

                return;

            }

            if (password !== confirm) {

                showError(

                    "Passwords do not match."

                );

                return;

            }

            if (password.length < 6) {

                showError(

                    "Password must be at least 6 characters."

                );

                return;

            }

            try {

                validateProfileImage(photoFile);

            }
            catch(error) {

                showError(error.message);

                return;

            }

            try {

                showLoading(

                    "Creating your account..."

                );

                const credential =

                    await auth.createUserWithEmailAndPassword(

                        email,

                        password

                    );

                const user = credential.user;

                await user.updateProfile({

                    displayName: name

                });

                const photoDataUrl = photoFile && window.NewsHubAvatar
                    ? await NewsHubAvatar.compressFile(photoFile)
                    : "";

                await db

                    .collection("users")

                    .doc(user.uid)

                    .set({

                        uid: user.uid,

                        name: name,

                        username: username,

                        email: email,

                        photo: photoDataUrl,

                        photoURL: photoDataUrl,

                        photoDataUrl,

                        role: "user",

                        approved: false,

                        developerRequest: developer,

                        status: developer

                            ? "pending"

                            : "active",

                        createdAt:

                            firebase.firestore.FieldValue.serverTimestamp(),

                        lastLogin:

                            firebase.firestore.FieldValue.serverTimestamp()

                    });

                hideLoading();

                if (developer) {

                    showSuccess(

                        "Account created successfully. Your developer request has been submitted and will be reviewed."

                    );

                }

                else {

                    showSuccess(

                        "Account created successfully."

                    );

                }

                registerForm.reset();

                openLogin();

            }

            catch (error) {

                hideLoading();

                switch (error.code) {

                    case "auth/email-already-in-use":

                        showError(

                            "An account already exists with this email."

                        );

                        break;

                    case "auth/invalid-email":

                        showError(

                            "Please enter a valid email."

                        );

                        break;

                    case "auth/weak-password":

                        showError(

                            "Choose a stronger password."

                        );

                        break;

                    default:

                        showError(

                            error.message

                        );

                }

            }

        });

    }    /*======================================================
        FORGOT PASSWORD
    ======================================================*/

    if (forgotPassword) {

        forgotPassword.addEventListener("click", async e => {

            e.preventDefault();

            const email = loginEmail.value.trim();

            if (!email) {

                showError(

                    "Enter your email first."

                );

                return;

            }

            try {

                showLoading(

                    "Sending reset email..."

                );

                await auth.sendPasswordResetEmail(

                    email

                );

                hideLoading();

                showSuccess(

                    "Password reset email sent successfully."

                );

            }

            catch (error) {

                hideLoading();

                showError(

                    error.message

                );

            }

        });

    }



    /*======================================================
        DEVELOPER LOGIN
    ======================================================*/

    if (developerButton) {

        developerButton.addEventListener("click", async () => {

            const email =
                loginEmail.value.trim();

            const password =
                loginPassword.value;

            if (!email || !password) {

                showError(

                    "Enter your email and password first."

                );

                return;

            }

            try {

                showLoading(

                    "Checking developer account..."

                );

                await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

                const credential =

                    await auth.signInWithEmailAndPassword(

                        email,

                        password

                    );

                const uid =
                    credential.user.uid;

                const userDoc =

                    await db

                        .collection("users")

                        .doc(uid)

                        .get();

                hideLoading();

                if (!userDoc.exists) {

                    await auth.signOut();

                    showError(

                        "User account not found."

                    );

                    return;

                }

                const user = userDoc.data();

                if (user.role !== "admin") {

                    await auth.signOut();

                    showError(

                        "You are not an approved developer. Please log in as a user."

                    );

                    return;

                }

                if (!user.approved) {

                    await auth.signOut();

                    showError(

                        "Your developer request is still pending approval."

                    );

                    return;

                }

                if (user.status === "blocked") {

                    await auth.signOut();

                    showError(

                        "Your developer account has been blocked."

                    );

                    return;

                }

                showSuccess(

                    "Welcome back, Developer!"

                );

                setTimeout(() => {

                    window.location.href =

                        "admin.html";

                }, 1200);

            }

            catch (error) {

                hideLoading();

                showError(

                    error.message

                );

            }

        });

    }



    /*======================================================
        AUTH STATE
    ======================================================*/

    auth.onAuthStateChanged(async user => {

        if (!user) return;

        try {

            const doc =

                await db

                    .collection("users")

                    .doc(user.uid)

                    .get();

            if (!doc.exists) return;

            const data = doc.data();

            window.currentUser = data;

        }

        catch (error) {

            console.error(error);

        }

    });

});
