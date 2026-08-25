/*==========================================================
    NEWSHUB CONFIGURATION
    Version: 1.0
==========================================================*/

const CONFIG = {

    /*==========================================
        APPLICATION
    ==========================================*/

    app: {

        name: "NewsHub",

        version: "1.0.0",

        slogan: "Latest News Around The World",

        logo: "assets/images/logo.png",

        favicon: "assets/images/favicon.png"

    },



    /*==========================================
        WEBSITE
    ==========================================*/

    website: {

        url: "http://localhost",

        language: "en",

        timezone: "Africa/Lagos",

        currency: "NGN"

    },



    /*==========================================
        THEME
    ==========================================*/

    theme: {

        default: "light",

        primaryColor: "#2563eb",

        darkMode: true

    },



    /*==========================================
        NAVIGATION
    ==========================================*/

    navigation: [

        {
            title: "Home",
            link: "index.html"
        },

        {
            title: "Technology",
            link: "category.html?category=Technology"
        },

        {
            title: "Gaming",
            link: "category.html?category=Gaming"
        },

        {
            title: "Business",
            link: "category.html?category=Business"
        },

        {
            title: "Sports",
            link: "category.html?category=Sports"
        },

        {
            title: "Entertainment",
            link: "category.html?category=Entertainment"
        },

        {
            title: "AI",
            link: "category.html?category=AI"
        },

        {
            title: "World",
            link: "category.html?category=World"
        }

    ],



    /*==========================================
        SOCIAL MEDIA
    ==========================================*/

    social: {

        facebook: "#",

        twitter: "#",

        instagram: "#",

        youtube: "#",

        linkedin: "#"

    },



    /*==========================================
        CONTACT
    ==========================================*/

    contact: {

        email: "info@newshub.com",

        phone: "+2340000000000",

        address: "Nigeria"

    },



    /*==========================================
        ADVERTISEMENTS
    ==========================================*/

    ads: {

        enabled: true,

        homepageTop: true,

        homepageSidebar: true,

        articleTop: true,

        articleMiddle: true,

        articleBottom: true

    },



    /*==========================================
        ARTICLES
    ==========================================*/

    articles: {

        featuredLimit: 1,

        heroSideLimit: 4,

        latestLimit: 12,

        trendingLimit: 6,

        popularLimit: 6,

        relatedLimit: 4

    },



    /*==========================================
        NEWSLETTER
    ==========================================*/

    newsletter: {

        enabled: true

    },



    /*==========================================
        COMMENTS
    ==========================================*/

    comments: {

        enabled: true,

        requireApproval: false

    },



    /*==========================================
        SEARCH
    ==========================================*/

    search: {

        placeholder: "Search news..."

    },



    /*==========================================
        PAGINATION
    ==========================================*/

    pagination: {

        perPage: 12

    },



    /*==========================================
        ANIMATION
    ==========================================*/

    animation: {

        duration: 300

    }

};



/*==========================================================
    GLOBAL HELPERS
==========================================================*/

const APP_NAME = CONFIG.app.name;

const NAVIGATION = CONFIG.navigation;

const SOCIAL = CONFIG.social;

const CONTACT = CONFIG.contact;
