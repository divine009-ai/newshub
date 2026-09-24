/*==========================================================
    Hitzone Africa CONFIGURATION
    Version: 1.0
==========================================================*/

const CONFIG = {

    /*==========================================
        APPLICATION
    ==========================================*/

    app: {

        name: "Hitzone Africa",

        version: "1.0.0",

        slogan: "Africa's Stories. Global Reach.",

        logo: "assets/images/hitzone-africa-logo.png",

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

        default: "dark",

        primaryColor: "#2563eb",

        darkMode: true

    },



    /*==========================================
        NAVIGATION
    ==========================================*/

    primaryNavigation: [

        {
            title: "Home",
            link: "index.html"
        },

        {
            title: "Explore",
            link: "category.html?category=latest"
        },

        {
            title: "Videos",
            link: "videos.html"
        },

        {
            title: "Music",
            link: "music.html"
        },

        {
            title: "Advertisement",
            link: "advertise.html"
        }

    ],

    categories: [

        {
            title: "Politics",
            link: "category.html?category=Politics"
        },

        {
            title: "Africa",
            link: "category.html?category=Africa"
        },

        {
            title: "Business",
            link: "category.html?category=Business"
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
            title: "Sports",
            link: "category.html?category=Sports"
        },

        {
            title: "Entertainment",
            link: "category.html?category=Entertainment"
        }

    ],

    navigation: [

        {
            title: "Home",
            link: "index.html"
        },

        {
            title: "Explore",
            link: "category.html?category=latest"
        },

        {
            title: "Politics",
            link: "category.html?category=Politics"
        },

        {
            title: "Africa",
            link: "category.html?category=Africa"
        },

        {
            title: "Business",
            link: "category.html?category=Business"
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
            title: "Sports",
            link: "category.html?category=Sports"
        },

        {
            title: "Entertainment",
            link: "category.html?category=Entertainment"
        },

        {
            title: "Videos",
            link: "videos.html"
        },

        {
            title: "Music",
            link: "music.html"
        },

        {
            title: "Advertisement",
            link: "advertise.html"
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

        whatsapp: "#",

        linkedin: "#"

    },



    /*==========================================
        CONTACT
    ==========================================*/

    contact: {

        email: "info.erenyeager2k7.com",

        phone: "+2349073434443",

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
