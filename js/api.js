/*==========================================================
    API SERVICE
    Version: 2.0
==========================================================*/

class API {

    constructor() {

        this.db = firebase.firestore();
        this.auth = firebase.auth();

    }

    /*==========================================
        HELPERS
    ==========================================*/

    normalizeRecord(collection, id, data) {

        if (collection !== "articles") {

            return {
                id,
                ...data
            };

        }

        const createdDate = data.createdAt && typeof data.createdAt.toDate === "function"
            ? data.createdAt.toDate()
            : null;

        return {
            id,
            ...data,
            image: data.coverImage || data.image || "images/avatar.png",
            video: data.coverVideo || data.video || "",
            date: data.date || (createdDate ? createdDate.toLocaleDateString() : ""),
            views: data.views || 0,
            likes: data.likes || 0,
            comments: data.comments || 0
        };

    }

    mapDocuments(snapshot, collection = "") {

        return snapshot.docs.map(doc =>
            this.normalizeRecord(collection, doc.id, doc.data())
        );

    }

    async getDocument(collection, id) {

        const doc = await this.db
            .collection(collection)
            .doc(id)
            .get();

        if (!doc.exists) {

            return null;

        }

        return this.normalizeRecord(collection, doc.id, doc.data());

    }

    /*==========================================
        FEATURED ARTICLE
    ==========================================*/

    async getFeaturedArticle() {

        const snapshot = await this.db

            .collection("articles")

            .where("published", "==", true)

            .where("featured", "==", true)

            .limit(1)

            .get();

        if (snapshot.empty) {

            return null;

        }

        return this.normalizeRecord("articles", snapshot.docs[0].id, snapshot.docs[0].data());

    }

    /*==========================================
        HERO ARTICLES
    ==========================================*/

    async getHeroArticles() {

        const snapshot = await this.db

            .collection("articles")

            .where("published", "==", true)

            .orderBy("createdAt", "desc")

            .limit(CONFIG.articles.heroSideLimit)

            .get();

        return this.mapDocuments(snapshot, "articles");

    }

    /*==========================================
        LATEST NEWS
    ==========================================*/

    async getLatestNews() {

        const snapshot = await this.db

            .collection("articles")

            .where("published", "==", true)

            .orderBy("createdAt", "desc")

            .limit(CONFIG.articles.latestLimit)

            .get();

        return this.mapDocuments(snapshot, "articles");

    }

    /*==========================================
        CATEGORY
    ==========================================*/

    async getCategoryNews(category, limit = 6) {

        const snapshot = await this.db

            .collection("articles")

            .where("published", "==", true)

            .where("category", "==", category)

            .orderBy("createdAt", "desc")

            .limit(limit)

            .get();

        return this.mapDocuments(snapshot, "articles");

    }

    /*==========================================
        ARTICLE
    ==========================================*/

    async getArticle(id) {

        return await this.getDocument(

            "articles",

            id

        );

    }

    /*==========================================
        BREAKING NEWS
    ==========================================*/

    async getBreakingNews() {

        const snapshot = await this.db

            .collection("articles")

            .where("published", "==", true)

            .where("breaking", "==", true)

            .orderBy("createdAt", "desc")

            .limit(10)

            .get();

        return this.mapDocuments(snapshot, "articles");

    }

    /*==========================================
        TRENDING
    ==========================================*/

    async getTrendingNews() {

        const snapshot = await this.db

            .collection("articles")

            .where("published", "==", true)

            .orderBy("views", "desc")

            .limit(CONFIG.articles.trendingLimit)

            .get();

        return this.mapDocuments(snapshot, "articles");

    }

    /*==========================================
        POPULAR
    ==========================================*/

    async getPopularNews() {

        const snapshot = await this.db

            .collection("articles")

            .where("published", "==", true)

            .orderBy("views", "desc")

            .limit(CONFIG.articles.popularLimit)

            .get();

        return this.mapDocuments(snapshot, "articles");

    }

    /*==========================================
        RELATED ARTICLES
    ==========================================*/

    async getRelatedArticles(category, currentId) {

        const snapshot = await this.db

            .collection("articles")

            .where("published", "==", true)

            .where("category", "==", category)

            .limit(CONFIG.articles.relatedLimit + 1)

            .get();

        return this.mapDocuments(snapshot, "articles")

            .filter(article => article.id !== currentId)

            .slice(0, CONFIG.articles.relatedLimit);

    }    /*==========================================
        PREVIOUS ARTICLE
    ==========================================*/

    async getPreviousArticle(createdAt) {

        const snapshot = await this.db

            .collection("articles")

            .where("published", "==", true)

            .where("createdAt", "<", createdAt)

            .orderBy("createdAt", "desc")

            .limit(1)

            .get();

        if (snapshot.empty) {

            return null;

        }

        return this.normalizeRecord("articles", snapshot.docs[0].id, snapshot.docs[0].data());

    }

    /*==========================================
        NEXT ARTICLE
    ==========================================*/

    async getNextArticle(createdAt) {

        const snapshot = await this.db

            .collection("articles")

            .where("published", "==", true)

            .where("createdAt", ">", createdAt)

            .orderBy("createdAt", "asc")

            .limit(1)

            .get();

        if (snapshot.empty) {

            return null;

        }

        return this.normalizeRecord("articles", snapshot.docs[0].id, snapshot.docs[0].data());

    }

    /*==========================================
        INCREASE VIEWS
    ==========================================*/

    async increaseViews(articleId) {

        await this.db

            .collection("articles")

            .doc(articleId)

            .update({

                views: firebase.firestore.FieldValue.increment(1)

            });

    }

    /*==========================================
        COMMENTS
    ==========================================*/

    async getComments(articleId) {

        const snapshot = await this.db

            .collection("comments")

            .where("articleId", "==", articleId)

            .orderBy("createdAt", "desc")

            .get();

        return this.mapDocuments(snapshot, "comments");

    }

    async addComment(comment) {

        await this.db

            .collection("comments")

            .add({

                ...comment,

                createdAt: firebase.firestore.FieldValue.serverTimestamp()

            });

    }

    async deleteComment(commentId) {

        await this.db

            .collection("comments")

            .doc(commentId)

            .delete();

    }

    /*==========================================
        NEWSLETTER
    ==========================================*/

    async subscribe(email) {

        await this.db

            .collection("newsletter")

            .add({

                email,

                subscribedAt: firebase.firestore.FieldValue.serverTimestamp()

            });

    }

    /*==========================================
        ADVERTISEMENTS
    ==========================================*/

    async getAdvertisements(position, category = "") {

        const snapshot = await this.db

            .collection("advertisements")

            .where("position", "==", position)

            .where("active", "==", true)

            .get();

        if (snapshot.empty) {

            return [];

        }

        const now = new Date();
        const requestedCategory = String(category || "").toLowerCase();

        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(ad => {

                const adCategory = String(ad.category || "global").toLowerCase();

                if (adCategory !== "global" && requestedCategory && adCategory !== requestedCategory) {

                    return false;

                }

                if (adCategory !== "global" && !requestedCategory) {

                    return false;

                }

                const start = ad.startDate ? new Date(ad.startDate) : null;
                const end = ad.endDate ? new Date(ad.endDate) : null;

                if (start && !Number.isNaN(start.getTime()) && start > now) return false;
                if (end && !Number.isNaN(end.getTime()) && end < now) return false;

                return true;

            });

    }

    async getAdvertisement(position, category = "") {

        const advertisements = await this.getAdvertisements(position, category);

        return advertisements[0] || null;

    }

    async getSidebarAdvertisement(category = "") {

        return await this.getAdvertisement("sidebar", category);

    }

    async getArticleAdvertisement(category = "") {

        return await this.getAdvertisement("article", category);

    }

    async getWebsiteSettings() {

        return await this.getDocument("settings", "website") || {};

    }

    /*==========================================
        SEARCH
    ==========================================*/

    async searchArticles(keyword) {

        const normalizedKeyword = String(keyword || "").toLowerCase();

        const snapshot = await this.db

            .collection("articles")

            .where("published", "==", true)

            .orderBy("createdAt", "desc")

            .limit(50)

            .get();

        return this.mapDocuments(snapshot, "articles").filter(article => {

            const haystack = [
                article.title,
                article.description,
                article.category,
                article.author
            ].join(" ").toLowerCase();

            return haystack.includes(normalizedKeyword);

        });

    }

    /*==========================================
        AUTH
    ==========================================*/

    getCurrentUser() {

        return this.auth.currentUser;

    }

    async logout() {

        return this.auth.signOut();

    }

    /*==========================================
        USER
    ==========================================*/

    async getUser(uid) {

        return await this.getDocument(

            "users",

            uid

        );

    }

}

/*==========================================================
    GLOBAL INSTANCE
==========================================================*/

const api = new API();
