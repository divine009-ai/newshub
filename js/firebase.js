/*==========================================================
    FIREBASE
    Version: 1.0
==========================================================*/

/*==========================================================
    CONFIG
==========================================================*/

const firebaseConfig = {

    apiKey: "AIzaSyBFdvDpOcF2_3q6BKvVRxNPfKlPNR2x3Kw",

    authDomain: "news-a0114.firebaseapp.com",

    projectId: "news-a0114",

    storageBucket: "news-a0114.firebasestorage.app",

    messagingSenderId: "27438759094",

    appId: "1:27438759094:web:382c8913591be2938a7a17",

    measurementId: "G-F67BHXGQ4G"

};


/*==========================================================
    INITIALIZE
==========================================================*/

firebase.initializeApp(firebaseConfig);


/*==========================================================
    SERVICES
==========================================================*/

const db = firebase.firestore();

const auth = firebase.auth();




/*==========================================================
    SETTINGS
==========================================================*/

db.settings({

    ignoreUndefinedProperties: true

});


/*==========================================================
    AUTH STATE
==========================================================*/

auth.onAuthStateChanged(user => {

    window.currentUser = user || null;

});


/*==========================================================
    GLOBAL
==========================================================*/

window.db = db;

window.auth = auth;

