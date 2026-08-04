/*==========================================================
    ADMIN PANEL
    Version: 1.0
==========================================================*/

document.addEventListener("DOMContentLoaded", () => {

    /*======================================================
        FIREBASE CHECK
    ======================================================*/

    if (typeof auth === "undefined" || typeof db === "undefined") {

        console.error("Firebase not initialized.");

        return;

    }



    /*======================================================
        ELEMENTS
    ======================================================*/

    const sidebar =
        document.getElementById("adminSidebar");

    const collapseSidebar =
        document.getElementById("collapseSidebar");

    const logoutButton =
        document.getElementById("logoutButton");

    const pageTitle =
        document.getElementById("pageTitle");

    const adminName =
        document.getElementById("adminName");

    const adminPhoto =
        document.getElementById("adminPhoto");



    const pages = {

        dashboard:
            document.getElementById("dashboardPage"),

        publish:
            document.getElementById("publishPage"),

        articles:
            document.getElementById("articlesPage"),

        developers:
            document.getElementById("developersPage"),

        users:
            document.getElementById("usersPage"),

        advertisements:
            document.getElementById("advertisementsPage"),

        comments:
            document.getElementById("commentsPage"),

        newsletter:
            document.getElementById("newsletterPage"),

        settings:
            document.getElementById("settingsPage")

    };



    const sidebarLinks =
        document.querySelectorAll(".sidebar-link");



    /*======================================================
        CURRENT USER
    ======================================================*/

    let currentUser = null;



    /*======================================================
        SHOW PAGE
    ======================================================*/

    function showPage(page) {

        Object.values(pages).forEach(section => {

            section.classList.add("hidden");

        });

        pages[page].classList.remove("hidden");

        pageTitle.textContent =

            page.charAt(0).toUpperCase() +

            page.slice(1);

        sidebarLinks.forEach(link => {

            link.classList.remove("active");

            if (link.dataset.page === page) {

                link.classList.add("active");

            }

        });

    }



    /*======================================================
        SIDEBAR NAVIGATION
    ======================================================*/

    sidebarLinks.forEach(link => {

        if (!link.dataset.page) return;

        link.addEventListener("click", () => {

            showPage(

                link.dataset.page

            );

        });

    });



    /*======================================================
        COLLAPSE SIDEBAR
    ======================================================*/

    if (collapseSidebar) {

        collapseSidebar.addEventListener("click", () => {

            sidebar.classList.toggle(

                "collapsed"

            );

        });

    }



    /*======================================================
        AUTHENTICATION
    ======================================================*/

    auth.onAuthStateChanged(async user => {

        if (!user) {

            window.location.href =

                "login.html";

            return;

        }

        try {

            const doc =

                await db

                    .collection("users")

                    .doc(user.uid)

                    .get();

            if (!doc.exists) {

                await auth.signOut();

                return;

            }

            currentUser = doc.data();

            if (

                currentUser.role !== "admin" ||

                !currentUser.approved ||

                currentUser.status === "blocked"

            ) {

                await auth.signOut();

                window.location.href =

                    "login.html";

                return;

            }

            adminName.textContent =

                currentUser.name;

            if (currentUser.photo) {

                adminPhoto.src =

                    currentUser.photo;

            }

            showPage("dashboard");

        }

        catch (error) {

            console.error(error);

        }

    });



    /*======================================================
        LOGOUT
    ======================================================*/

    if (logoutButton) {

        logoutButton.addEventListener("click", async () => {

            try {

                await auth.signOut();

                window.location.href =

                    "login.html";

            }

            catch (error) {

                console.error(error);

            }

        });

    }    /*======================================================
        DASHBOARD
    ======================================================*/

    async function loadDashboard() {

        try {

            if (typeof loader !== "undefined") {

                loader.show("Loading dashboard...");

            }

            const [

                articles,

                users,

                comments,

                newsletter

            ] = await Promise.all([

                db.collection("articles").get(),

                db.collection("users").get(),

                db.collection("comments").get(),

                db.collection("newsletter").get()

            ]);

            const pendingDevelopers =

                users.docs.filter(doc => {

                    const user = doc.data();

                    return (

                        user.developerRequest === true &&

                        user.approved === false &&

                        user.status === "pending"

                    );

                });

            pages.dashboard.innerHTML = `

                <div class="dashboard-grid">

                    <div class="dashboard-card">

                        <h4>Total Articles</h4>

                        <h2>${articles.size}</h2>

                        <span>

                            <i class="fa-solid fa-newspaper"></i>

                            Published Articles

                        </span>

                    </div>

                    <div class="dashboard-card">

                        <h4>Total Users</h4>

                        <h2>${users.size}</h2>

                        <span>

                            <i class="fa-solid fa-users"></i>

                            Registered Users

                        </span>

                    </div>

                    <div class="dashboard-card">

                        <h4>Developer Requests</h4>

                        <h2>${pendingDevelopers.length}</h2>

                        <span>

                            <i class="fa-solid fa-user-shield"></i>

                            Awaiting Approval

                        </span>

                    </div>

                    <div class="dashboard-card">

                        <h4>Comments</h4>

                        <h2>${comments.size}</h2>

                        <span>

                            <i class="fa-solid fa-comments"></i>

                            Total Comments

                        </span>

                    </div>

                    <div class="dashboard-card">

                        <h4>Subscribers</h4>

                        <h2>${newsletter.size}</h2>

                        <span>

                            <i class="fa-solid fa-envelope"></i>

                            Newsletter Members

                        </span>

                    </div>

                </div>

                <div class="admin-card">

                    <div class="admin-card-header">

                        <div>

                            <h3>

                                Quick Actions

                            </h3>

                            <p>

                                Frequently used tools

                            </p>

                        </div>

                    </div>

                    <div class="quick-actions">

                        <div
                            class="quick-card"
                            data-page="publish">

                            <i class="fa-solid fa-pen"></i>

                            <h4>

                                Publish Article

                            </h4>

                        </div>

                        <div
                            class="quick-card"
                            data-page="developers">

                            <i class="fa-solid fa-user-shield"></i>

                            <h4>

                                Developer Requests

                            </h4>

                        </div>

                        <div
                            class="quick-card"
                            data-page="advertisements">

                            <i class="fa-solid fa-rectangle-ad"></i>

                            <h4>

                                Advertisements

                            </h4>

                        </div>

                        <div
                            class="quick-card"
                            data-page="settings">

                            <i class="fa-solid fa-gear"></i>

                            <h4>

                                Settings

                            </h4>

                        </div>

                    </div>

                </div>

            `;

            document

                .querySelectorAll(".quick-card")

                .forEach(card => {

                    card.addEventListener("click", () => {

                        showPage(

                            card.dataset.page

                        );

                    });

                });

            if (typeof loader !== "undefined") {

                loader.hide();

            }

        }

        catch (error) {

            console.error(error);

            if (typeof loader !== "undefined") {

                loader.hide();

            }

            if (typeof modal !== "undefined") {

                modal.error(

                    "Failed to load dashboard."

                );

            }

        }

    }



    /*======================================================
        INITIALIZE
    ======================================================*/

    loadDashboard();    /*======================================================
        PUBLISH PAGE
    ======================================================*/

    function renderPublishPage() {

        pages.publish.innerHTML = `

            <div class="admin-card">

                <div class="admin-card-header">

                    <div>

                        <h3>

                            Publish Article

                        </h3>

                        <p>

                            Create and publish a new article.

                        </p>

                    </div>

                </div>

                <form
                    id="publishForm"
                    class="admin-form">

                    <div class="form-row">

                        <div class="form-group">

                            <label>

                                Title

                            </label>

                            <input
                                type="text"
                                id="articleTitle"
                                required>

                        </div>

                        <div class="form-group">

                            <label>

                                Slug

                            </label>

                            <input
                                type="text"
                                id="articleSlug"
                                readonly>

                        </div>

                    </div>

                    <div class="form-group">

                        <label>

                            Description

                        </label>

                        <textarea
                            id="articleDescription"
                            required></textarea>

                    </div>

                    <div class="form-row">

                        <div class="form-group">

                            <label>

                                Category

                            </label>

                            <select
                                id="articleCategory">

                                <option>

                                    Technology

                                </option>

                                <option>

                                    Gaming

                                </option>

                                <option>

                                    Business

                                </option>

                                <option>

                                    Sports

                                </option>

                                <option>

                                    Entertainment

                                </option>

                                <option>

                                    AI

                                </option>

                                <option>

                                    World

                                </option>

                                <option>

                                    Education

                                </option>

                                <option>

                                    Lifestyle

                                </option>

                            </select>

                        </div>

                        <div class="form-group">

                            <label>

                                Tags

                            </label>

                            <input
                                type="text"
                                id="articleTags"
                                placeholder="AI, Apple, Gaming">

                        </div>

                    </div>

                    <div class="form-group">

                        <label>

                            Cover Image URL

                        </label>

                        <input
                            type="text"
                            id="coverImage">

                    </div>

                    <div class="form-group">

                        <label>

                            Cover Video URL (Optional)

                        </label>

                        <input
                            type="text"
                            id="coverVideo">

                    </div>

                    <div class="form-group">

                        <label>

                            Article Content

                        </label>

                        <textarea
                            id="articleContent"></textarea>

                    </div>

                    <div class="form-row">

                        <label>

                            <input
                                type="checkbox"
                                id="featured">

                            Featured

                        </label>

                        <label>

                            <input
                                type="checkbox"
                                id="breaking">

                            Breaking News

                        </label>

                    </div>

                    <button
                        class="admin-btn primary"
                        type="submit">

                        Publish Article

                    </button>

                </form>

            </div>

        `;

        initializePublishForm();

    }



    /*======================================================
        PUBLISH FORM
    ======================================================*/

    function initializePublishForm() {

        const title =

            document.getElementById(

                "articleTitle"

            );

        const slug =

            document.getElementById(

                "articleSlug"

            );

        const form =

            document.getElementById(

                "publishForm"

            );

        title.addEventListener("input", () => {

            slug.value =

                title.value

                .toLowerCase()

                .trim()

                .replace(/[^a-z0-9]+/g,"-")

                .replace(/^-|-$/g,"");

        });

        form.addEventListener("submit", async e => {

            e.preventDefault();

            try{

                loader.show(

                    "Publishing article..."

                );

                await db

                .collection("articles")

                .add({

                    title:

                        title.value,

                    slug:

                        slug.value,

                    description:

                        document.getElementById("articleDescription").value,

                    content:

                        document.getElementById("articleContent").value,

                    coverImage:

                        document.getElementById("coverImage").value,

                    coverVideo:

                        document.getElementById("coverVideo").value,

                    category:

                        document.getElementById("articleCategory").value,

                    tags:

                        document

                        .getElementById("articleTags")

                        .value

                        .split(",")

                        .map(tag=>tag.trim()),

                    author:

                        currentUser.name,

                    featured:

                        document.getElementById("featured").checked,

                    breaking:

                        document.getElementById("breaking").checked,

                    published:true,

                    views:0,

                    likes:0,

                    comments:0,

                    createdAt:

                        firebase.firestore.FieldValue.serverTimestamp(),

                    updatedAt:

                        firebase.firestore.FieldValue.serverTimestamp()

                });

                loader.hide();

                toast.success(

                    "Article published successfully."

                );

                form.reset();

            }

            catch(error){

                loader.hide();

                modal.error(

                    error.message

                );

            }

        });

    }



    renderPublishPage();    /*======================================================
        ARTICLES PAGE
    ======================================================*/

    async function renderArticlesPage() {

        try {

            loader.show(

                "Loading articles..."

            );

            const snapshot =

                await db

                    .collection("articles")

                    .orderBy("createdAt", "desc")

                    .get();

            let rows = "";

            snapshot.forEach(doc => {

                const article = doc.data();

                rows += `

                    <tr>

                        <td>

                            ${article.title}

                        </td>

                        <td>

                            ${article.category}

                        </td>

                        <td>

                            ${article.author}

                        </td>

                        <td>

                            ${article.views}

                        </td>

                        <td>

                            ${article.featured
                                ? '<span class="badge active">Featured</span>'
                                : '<span class="badge user">Normal</span>'}

                        </td>

                        <td>

                            <div class="table-actions">

                                <button

                                    class="edit"

                                    data-id="${doc.id}">

                                    <i class="fa-solid fa-pen"></i>

                                </button>

                                <button

                                    class="delete"

                                    data-id="${doc.id}">

                                    <i class="fa-solid fa-trash"></i>

                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            });

            pages.articles.innerHTML = `

                <div class="admin-card">

                    <div class="admin-card-header">

                        <div>

                            <h3>

                                Manage Articles

                            </h3>

                            <p>

                                Search, edit and delete published articles.

                            </p>

                        </div>

                    </div>

                    <div class="admin-search">

                        <input

                            type="text"

                            id="articleSearch"

                            placeholder="Search article title...">

                    </div>

                    <table class="admin-table">

                        <thead>

                            <tr>

                                <th>

                                    Title

                                </th>

                                <th>

                                    Category

                                </th>

                                <th>

                                    Author

                                </th>

                                <th>

                                    Views

                                </th>

                                <th>

                                    Status

                                </th>

                                <th>

                                    Actions

                                </th>

                            </tr>

                        </thead>

                        <tbody id="articlesTableBody">

                            ${rows}

                        </tbody>

                    </table>

                </div>

            `;

            initializeArticleActions();

            loader.hide();

        }

        catch(error){

            loader.hide();

            modal.error(

                error.message

            );

        }

    }



    /*======================================================
        ARTICLE ACTIONS
    ======================================================*/

    function initializeArticleActions() {

        document

            .querySelectorAll(".delete")

            .forEach(button=>{

                button.addEventListener("click", async()=>{

                    const id=

                        button.dataset.id;

                    if(

                        !confirm(

                            "Delete this article?"

                        )

                    ) return;

                    try{

                        loader.show(

                            "Deleting..."

                        );

                        await db

                            .collection("articles")

                            .doc(id)

                            .delete();

                        loader.hide();

                        toast.success(

                            "Article deleted."

                        );

                        renderArticlesPage();

                        loadDashboard();

                    }

                    catch(error){

                        loader.hide();

                        modal.error(

                            error.message

                        );

                    }

                });

            });

        document

            .getElementById(

                "articleSearch"

            )

            .addEventListener(

                "input",

                function(){

                    const keyword=

                        this.value

                        .toLowerCase();

                    document

                        .querySelectorAll(

                            "#articlesTableBody tr"

                        )

                        .forEach(row=>{

                            row.style.display=

                                row.innerText

                                .toLowerCase()

                                .includes(keyword)

                                ? ""

                                : "none";

                        });

                }

            );

    }



    renderArticlesPage();/*==========================================================
    EDIT ARTICLE
==========================================================*/

async function editArticle(articleId) {

    try {

        loader.show("Loading article...");

        const doc = await db
            .collection("articles")
            .doc(articleId)
            .get();

        loader.hide();

        if (!doc.exists) {

            modal.error("Article not found.");

            return;

        }

        const article = doc.data();

        showPage("publish");

        renderPublishPage();

        document.getElementById("articleTitle").value =
            article.title || "";

        document.getElementById("articleSlug").value =
            article.slug || "";

        document.getElementById("articleDescription").value =
            article.description || "";

        document.getElementById("articleCategory").value =
            article.category || "Technology";

        document.getElementById("articleTags").value =
            article.tags
                ? article.tags.join(", ")
                : "";

        document.getElementById("coverImage").value =
            article.coverImage || "";

        document.getElementById("coverVideo").value =
            article.coverVideo || "";

        document.getElementById("articleContent").value =
            article.content || "";

        document.getElementById("featured").checked =
            article.featured;

        document.getElementById("breaking").checked =
            article.breaking;

        const form = document.getElementById("publishForm");

        form.dataset.editing = articleId;

        const submitButton =
            form.querySelector("button[type='submit']");

        submitButton.innerHTML =

            '<i class="fa-solid fa-floppy-disk"></i> Update Article';

    }

    catch (error) {

        loader.hide();

        modal.error(error.message);

    }

}



/*==========================================================
    UPDATE ARTICLE
==========================================================*/

async function updateArticle(articleId) {

    try {

        loader.show("Updating article...");

const editingId = form.dataset.editing;

if (editingId) {

    await updateArticle(editingId);

    delete form.dataset.editing;

    return;

}

await db.collection("articles").add({

            });

        loader.hide();

        toast.success(

            "Article updated successfully."

        );

        renderArticlesPage();

        loadDashboard();

        showPage("articles");

    }

    catch (error) {

        loader.hide();

        modal.error(error.message);

    }

}



/*==========================================================
    EDIT BUTTON
==========================================================*/

document

.querySelectorAll(".edit")

.forEach(button => {

    button.addEventListener("click", () => {

        editArticle(

            button.dataset.id

        );

    });

});/*==========================================================
    DEVELOPER REQUESTS
==========================================================*/

async function renderDevelopersPage() {

    try {

        loader.show("Loading developer requests...");

        const snapshot = await db
            .collection("users")
            .where("developerRequest", "==", true)
            .get();

        let rows = "";

        snapshot.forEach(doc => {

            const user = doc.data();

            rows += `

                <tr>

                    <td>${user.name}</td>

                    <td>${user.email}</td>

                    <td>${user.username}</td>

                    <td>

                        <span class="badge ${user.status}">

                            ${user.status}

                        </span>

                    </td>

                    <td>

                        <div class="table-actions">

                            <button
                                class="approve"
                                data-id="${doc.id}">

                                <i class="fa-solid fa-check"></i>

                            </button>

                            <button
                                class="reject"
                                data-id="${doc.id}">

                                <i class="fa-solid fa-xmark"></i>

                            </button>

                        </div>

                    </td>

                </tr>

            `;

        });

        pages.developers.innerHTML = `

            <div class="admin-card">

                <div class="admin-card-header">

                    <div>

                        <h3>

                            Developer Requests

                        </h3>

                        <p>

                            Approve or reject developer applications.

                        </p>

                    </div>

                </div>

                <table class="admin-table">

                    <thead>

                        <tr>

                            <th>Name</th>

                            <th>Email</th>

                            <th>Username</th>

                            <th>Status</th>

                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody>

                        ${rows}

                    </tbody>

                </table>

            </div>

        `;

        initializeDeveloperActions();

        loader.hide();

    }

    catch(error){

        loader.hide();

        modal.error(error.message);

    }

}



/*==========================================================
    DEVELOPER ACTIONS
==========================================================*/

function initializeDeveloperActions() {

    document

    .querySelectorAll(".approve")

    .forEach(button=>{

        button.addEventListener("click",async()=>{

            try{

                loader.show("Approving developer...");

                await db

                .collection("users")

                .doc(button.dataset.id)

                .update({

                    role:"admin",

                    approved:true,

                    status:"active"

                });

                loader.hide();

                toast.success("Developer approved.");

                renderDevelopersPage();

                loadDashboard();

            }

            catch(error){

                loader.hide();

                modal.error(error.message);

            }

        });

    });



    document

    .querySelectorAll(".reject")

    .forEach(button=>{

        button.addEventListener("click",async()=>{

            try{

                loader.show("Rejecting request...");

                await db

                .collection("users")

                .doc(button.dataset.id)

                .update({

                    approved:false,

                    developerRequest:false,

                    status:"active"

                });

                loader.hide();

                toast.success("Developer request rejected.");

                renderDevelopersPage();

                loadDashboard();

            }

            catch(error){

                loader.hide();

                modal.error(error.message);

            }

        });

    });

}



renderDevelopersPage();/*==========================================================
    USERS
==========================================================*/

async function renderUsersPage() {

    try {

        loader.show("Loading users...");

        const snapshot = await db

            .collection("users")

            .orderBy("createdAt", "desc")

            .get();

        let rows = "";

        snapshot.forEach(doc => {

            const user = doc.data();

            rows += `

                <tr>

                    <td>${user.name}</td>

                    <td>${user.username}</td>

                    <td>${user.email}</td>

                    <td>

                        <span class="badge ${user.role}">

                            ${user.role}

                        </span>

                    </td>

                    <td>

                        <span class="badge ${user.status}">

                            ${user.status}

                        </span>

                    </td>

                    <td>

                        <div class="table-actions">

                            <button

                                class="block"

                                data-id="${doc.id}"

                                data-status="${user.status}">

                                <i class="fa-solid fa-ban"></i>

                            </button>

                            <button

                                class="delete-user"

                                data-id="${doc.id}">

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </div>

                    </td>

                </tr>

            `;

        });

        pages.users.innerHTML = `

            <div class="admin-card">

                <div class="admin-card-header">

                    <div>

                        <h3>

                            Users

                        </h3>

                        <p>

                            Manage registered users.

                        </p>

                    </div>

                </div>

                <div class="admin-search">

                    <input

                        type="text"

                        id="userSearch"

                        placeholder="Search users...">

                </div>

                <table class="admin-table">

                    <thead>

                        <tr>

                            <th>Name</th>

                            <th>Username</th>

                            <th>Email</th>

                            <th>Role</th>

                            <th>Status</th>

                            <th>Actions</th>

                        </tr>

                    </thead>

                    <tbody id="usersTableBody">

                        ${rows}

                    </tbody>

                </table>

            </div>

        `;

        initializeUserActions();

        loader.hide();

    }

    catch(error){

        loader.hide();

        modal.error(error.message);

    }

}



/*==========================================================
    USER ACTIONS
==========================================================*/

function initializeUserActions() {

    document

    .querySelectorAll(".block")

    .forEach(button=>{

        button.addEventListener("click",async()=>{

            try{

                const status =

                    button.dataset.status;

                loader.show("Updating user...");

                await db

                .collection("users")

                .doc(button.dataset.id)

                .update({

                    status:

                        status === "blocked"

                        ? "active"

                        : "blocked"

                });

                loader.hide();

                toast.success(

                    "User updated."

                );

                renderUsersPage();

            }

            catch(error){

                loader.hide();

                modal.error(error.message);

            }

        });

    });



    document

    .querySelectorAll(".delete-user")

    .forEach(button=>{

        button.addEventListener("click",async()=>{

            if(

                !confirm(

                    "Delete this user?"

                )

            ) return;

            try{

                loader.show("Deleting user...");

                await db

                .collection("users")

                .doc(button.dataset.id)

                .delete();

                loader.hide();

                toast.success(

                    "User deleted."

                );

                renderUsersPage();

                loadDashboard();

            }

            catch(error){

                loader.hide();

                modal.error(error.message);

            }

        });

    });



    document

    .getElementById("userSearch")

    .addEventListener("input",function(){

        const keyword =

            this.value.toLowerCase();

        document

        .querySelectorAll(

            "#usersTableBody tr"

        )

        .forEach(row=>{

            row.style.display =

                row.innerText

                .toLowerCase()

                .includes(keyword)

                ? ""

                : "none";

        });

    });

}



renderUsersPage();/*==========================================================
    ADVERTISEMENTS
==========================================================*/

async function renderAdvertisementsPage() {

    try {

        loader.show("Loading advertisements...");

        const snapshot = await db

            .collection("advertisements")

            .get();

        let rows = "";

        snapshot.forEach(doc => {

            const ad = doc.data();

            rows += `

                <tr>

                    <td>${doc.id}</td>

                    <td>${ad.title || "-"}</td>

                    <td>

                        <span class="badge ${ad.active ? "active" : "blocked"}">

                            ${ad.active ? "Active" : "Inactive"}

                        </span>

                    </td>

                    <td>

                        <div class="table-actions">

                            <button

                                class="edit-ad"

                                data-id="${doc.id}">

                                <i class="fa-solid fa-pen"></i>

                            </button>

                        </div>

                    </td>

                </tr>

            `;

        });

        pages.advertisements.innerHTML = `

            <div class="admin-card">

                <div class="admin-card-header">

                    <div>

                        <h3>

                            Advertisements

                        </h3>

                        <p>

                            Manage all advertisement positions.

                        </p>

                    </div>

                </div>

                <table class="admin-table">

                    <thead>

                        <tr>

                            <th>Position</th>

                            <th>Title</th>

                            <th>Status</th>

                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody>

                        ${rows}

                    </tbody>

                </table>

            </div>

        `;

        initializeAdvertisementActions();

        loader.hide();

    }

    catch(error){

        loader.hide();

        modal.error(error.message);

    }

}



/*==========================================================
    EDIT ADVERTISEMENT
==========================================================*/

function initializeAdvertisementActions() {

    document

    .querySelectorAll(".edit-ad")

    .forEach(button=>{

        button.addEventListener("click",async()=>{

            try{

                loader.show("Loading advertisement...");

                const doc = await db

                .collection("advertisements")

                .doc(button.dataset.id)

                .get();

                loader.hide();

                if(!doc.exists){

                    modal.error(

                        "Advertisement not found."

                    );

                    return;

                }

                const ad = doc.data();

                pages.advertisements.innerHTML = `

                    <div class="admin-card">

                        <div class="admin-card-header">

                            <h3>

                                Edit Advertisement

                            </h3>

                        </div>

                        <form
                            id="advertisementForm"
                            class="admin-form">

                            <div class="form-group">

                                <label>

                                    Position

                                </label>

                                <input

                                    value="${button.dataset.id}"

                                    readonly>

                            </div>

                            <div class="form-group">

                                <label>

                                    Title

                                </label>

                                <input

                                    id="adTitle"

                                    value="${ad.title || ""}">

                            </div>

                            <div class="form-group">

                                <label>

                                    Image URL

                                </label>

                                <input

                                    id="adImage"

                                    value="${ad.image || ""}">

                            </div>

                            <div class="form-group">

                                <label>

                                    Redirect URL

                                </label>

                                <input

                                    id="adLink"

                                    value="${ad.link || ""}">

                            </div>

                            <label>

                                <input

                                    type="checkbox"

                                    id="adActive"

                                    ${ad.active ? "checked" : ""}>

                                Advertisement Active

                            </label>

                            <button

                                class="admin-btn primary"

                                type="submit">

                                Save Advertisement

                            </button>

                        </form>

                    </div>

                `;

                document

                .getElementById(

                    "advertisementForm"

                )

                .addEventListener("submit",async e=>{

                    e.preventDefault();

                    try{

                        loader.show(

                            "Saving advertisement..."

                        );

                        await db

                        .collection("advertisements")

                        .doc(button.dataset.id)

                        .update({

                            title:

                                document.getElementById("adTitle").value,

                            image:

                                document.getElementById("adImage").value,

                            link:

                                document.getElementById("adLink").value,

                            active:

                                document.getElementById("adActive").checked

                        });

                        loader.hide();

                        toast.success(

                            "Advertisement updated."

                        );

                        renderAdvertisementsPage();

                    }

                    catch(error){

                        loader.hide();

                        modal.error(

                            error.message

                        );

                    }

                });

            }

            catch(error){

                loader.hide();

                modal.error(

                    error.message

                );

            }

        });

    });

}



renderAdvertisementsPage();/*==========================================================
    COMMENTS
==========================================================*/

async function renderCommentsPage() {

    try {

        loader.show("Loading comments...");

        const snapshot = await db

            .collection("comments")

            .orderBy("createdAt", "desc")

            .get();

        let rows = "";

        snapshot.forEach(doc => {

            const comment = doc.data();

            rows += `

                <tr>

                    <td>${comment.username}</td>

                    <td>${comment.message}</td>

                    <td>${comment.likes}</td>

                    <td>

                        <div class="table-actions">

                            <button

                                class="delete-comment"

                                data-id="${doc.id}">

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </div>

                    </td>

                </tr>

            `;

        });

        pages.comments.innerHTML = `

            <div class="admin-card">

                <div class="admin-card-header">

                    <div>

                        <h3>

                            Comments

                        </h3>

                        <p>

                            Manage comments across all articles.

                        </p>

                    </div>

                </div>

                <div class="admin-search">

                    <input

                        type="text"

                        id="commentSearch"

                        placeholder="Search comments...">

                </div>

                <table class="admin-table">

                    <thead>

                        <tr>

                            <th>User</th>

                            <th>Comment</th>

                            <th>Likes</th>

                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody id="commentsTableBody">

                        ${rows}

                    </tbody>

                </table>

            </div>

        `;

        initializeCommentActions();

        loader.hide();

    }

    catch(error){

        loader.hide();

        modal.error(error.message);

    }

}



/*==========================================================
    COMMENT ACTIONS
==========================================================*/

function initializeCommentActions() {

    document

    .querySelectorAll(".delete-comment")

    .forEach(button=>{

        button.addEventListener("click",async()=>{

            if(

                !confirm(

                    "Delete this comment?"

                )

            ) return;

            try{

                loader.show(

                    "Deleting comment..."

                );

                await db

                .collection("comments")

                .doc(button.dataset.id)

                .delete();

                loader.hide();

                toast.success(

                    "Comment deleted."

                );

                renderCommentsPage();

                loadDashboard();

            }

            catch(error){

                loader.hide();

                modal.error(

                    error.message

                );

            }

        });

    });



    document

    .getElementById(

        "commentSearch"

    )

    .addEventListener("input",function(){

        const keyword =

            this.value

            .toLowerCase();

        document

        .querySelectorAll(

            "#commentsTableBody tr"

        )

        .forEach(row=>{

            row.style.display =

                row.innerText

                .toLowerCase()

                .includes(keyword)

                ? ""

                : "none";

        });

    });

}



renderCommentsPage();/*==========================================================
    NEWSLETTER
==========================================================*/

async function renderNewsletterPage() {

    try {

        loader.show("Loading subscribers...");

        const snapshot = await db

            .collection("newsletter")

            .orderBy("subscribedAt", "desc")

            .get();

        let rows = "";

        snapshot.forEach(doc => {

            const subscriber = doc.data();

            rows += `

                <tr>

                    <td>${subscriber.email}</td>

                    <td>

                        ${subscriber.subscribedAt
                            ? subscriber.subscribedAt.toDate().toLocaleString()
                            : "-"}

                    </td>

                    <td>

                        <div class="table-actions">

                            <button

                                class="delete-subscriber"

                                data-id="${doc.id}">

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </div>

                    </td>

                </tr>

            `;

        });

        pages.newsletter.innerHTML = `

            <div class="admin-card">

                <div class="admin-card-header">

                    <div>

                        <h3>

                            Newsletter Subscribers

                        </h3>

                        <p>

                            View and manage newsletter subscribers.

                        </p>

                    </div>

                </div>

                <div class="admin-search">

                    <input

                        type="text"

                        id="subscriberSearch"

                        placeholder="Search email...">

                </div>

                <table class="admin-table">

                    <thead>

                        <tr>

                            <th>Email</th>

                            <th>Subscribed On</th>

                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody id="newsletterTableBody">

                        ${rows}

                    </tbody>

                </table>

            </div>

        `;

        initializeNewsletterActions();

        loader.hide();

    }

    catch(error){

        loader.hide();

        modal.error(error.message);

    }

}



/*==========================================================
    NEWSLETTER ACTIONS
==========================================================*/

function initializeNewsletterActions() {

    document

    .querySelectorAll(".delete-subscriber")

    .forEach(button=>{

        button.addEventListener("click",async()=>{

            if(

                !confirm(

                    "Delete this subscriber?"

                )

            ) return;

            try{

                loader.show(

                    "Deleting subscriber..."

                );

                await db

                .collection("newsletter")

                .doc(button.dataset.id)

                .delete();

                loader.hide();

                toast.success(

                    "Subscriber removed."

                );

                renderNewsletterPage();

                loadDashboard();

            }

            catch(error){

                loader.hide();

                modal.error(

                    error.message

                );

            }

        });

    });



    document

    .getElementById(

        "subscriberSearch"

    )

    .addEventListener("input",function(){

        const keyword =

            this.value

            .toLowerCase();

        document

        .querySelectorAll(

            "#newsletterTableBody tr"

        )

        .forEach(row=>{

            row.style.display =

                row.innerText

                .toLowerCase()

                .includes(keyword)

                ? ""

                : "none";

        });

    });

}



renderNewsletterPage();/*==========================================================
    SETTINGS
==========================================================*/

async function renderSettingsPage() {

    try {

        loader.show("Loading settings...");

        const doc = await db

            .collection("settings")

            .doc("website")

            .get();

        let settings = {};

        if (doc.exists) {

            settings = doc.data();

        }

        pages.settings.innerHTML = `

            <div class="admin-card">

                <div class="admin-card-header">

                    <div>

                        <h3>

                            Website Settings

                        </h3>

                        <p>

                            Manage your website configuration.

                        </p>

                    </div>

                </div>

                <form
                    id="settingsForm"
                    class="admin-form">

                    <div class="form-group">

                        <label>

                            Website Name

                        </label>

                        <input

                            id="websiteName"

                            value="${settings.websiteName || ""}">

                    </div>

                    <div class="form-group">

                        <label>

                            Logo URL

                        </label>

                        <input

                            id="websiteLogo"

                            value="${settings.logo || ""}">

                    </div>

                    <div class="form-group">

                        <label>

                            Favicon URL

                        </label>

                        <input

                            id="websiteFavicon"

                            value="${settings.favicon || ""}">

                    </div>

                    <div class="form-group">

                        <label>

                            Footer Text

                        </label>

                        <textarea

                            id="footerText">${settings.footerText || ""}</textarea>

                    </div>

                    <label>

                        <input

                            type="checkbox"

                            id="maintenanceMode"

                            ${settings.maintenance ? "checked" : ""}>

                        Maintenance Mode

                    </label>

                    <button

                        type="submit"

                        class="admin-btn primary">

                        Save Settings

                    </button>

                </form>

            </div>

        `;

        initializeSettings();

        loader.hide();

    }

    catch(error){

        loader.hide();

        modal.error(error.message);

    }

}



/*==========================================================
    SAVE SETTINGS
==========================================================*/

function initializeSettings() {

    document

    .getElementById("settingsForm")

    .addEventListener("submit", async e => {

        e.preventDefault();

        try {

            loader.show("Saving settings...");

            await db

                .collection("settings")

                .doc("website")

                .set({

                    websiteName:

                        document.getElementById("websiteName").value,

                    logo:

                        document.getElementById("websiteLogo").value,

                    favicon:

                        document.getElementById("websiteFavicon").value,

                    footerText:

                        document.getElementById("footerText").value,

                    maintenance:

                        document.getElementById("maintenanceMode").checked

                });

            loader.hide();

            toast.success(

                "Settings saved successfully."

            );

        }

        catch(error){

            loader.hide();

            modal.error(

                error.message

            );

        }

    });

}



renderSettingsPage();/*==========================================================
    PAGE ROUTER
==========================================================*/

function loadCurrentPage(page){

    switch(page){

        case "dashboard":

            loadDashboard();

            break;

        case "publish":

            renderPublishPage();

            break;

        case "articles":

            renderArticlesPage();

            break;

        case "developers":

            renderDevelopersPage();

            break;

        case "users":

            renderUsersPage();

            break;

        case "advertisements":

            renderAdvertisementsPage();

            break;

        case "comments":

            renderCommentsPage();

            break;

        case "newsletter":

            renderNewsletterPage();

            break;

        case "settings":

            renderSettingsPage();

            break;

    }

}



/*==========================================================
    SIDEBAR EVENTS
==========================================================*/

sidebarLinks.forEach(link=>{

    if(!link.dataset.page) return;

    link.addEventListener("click",()=>{

        const page =

            link.dataset.page;

        showPage(page);

        loadCurrentPage(page);

    });

});



/*==========================================================
    DEFAULT PAGE
==========================================================*/

showPage("dashboard");

loadCurrentPage("dashboard");



/*==========================================================
    GLOBAL REFRESH
==========================================================*/

window.refreshDashboard = ()=>{

    loadDashboard();

};



window.refreshArticles = ()=>{

    renderArticlesPage();

};



window.refreshUsers = ()=>{

    renderUsersPage();

};



window.refreshDevelopers = ()=>{

    renderDevelopersPage();

};



window.refreshAdvertisements = ()=>{

    renderAdvertisementsPage();

};



window.refreshComments = ()=>{

    renderCommentsPage();

};



window.refreshNewsletter = ()=>{

    renderNewsletterPage();

};



window.refreshSettings = ()=>{

    renderSettingsPage();

};



/*==========================================================
    END
==========================================================*/

console.log(

    "NewsHub CMS Loaded Successfully."

);

});