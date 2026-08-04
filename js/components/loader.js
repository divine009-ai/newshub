/*==========================================================
    LOADER COMPONENT
    Version: 1.0
==========================================================*/

class Loader {

    constructor() {

        this.root = document.getElementById("loader-root");

        this.isVisible = false;

    }

    /*==========================================
        SHOW
    ==========================================*/

    show({

        title = "Loading",

        message = "Please wait...",

        progress = false

    } = {}) {

        if (!this.root) return;

        this.root.innerHTML = `

<div class="loader active">

    <div class="loader__overlay"></div>

    <div class="loader__card">

        <div class="loader__spinner">

            <div></div>

            <div></div>

            <div></div>

            <div></div>

        </div>

        <h3 class="loader__title">

            ${title}

        </h3>

        <p class="loader__message">

            ${message}

        </p>

        ${
            progress
            ?

            `
            <div class="loader__progress">

                <div
                    class="loader__progress-bar"
                    id="loaderProgressBar">

                </div>

            </div>

            <div
                class="loader__progress-text"
                id="loaderProgressText">

                0%

            </div>
            `

            :

            ""

        }

    </div>

</div>

        `;

        this.isVisible = true;

    }

    /*==========================================
        UPDATE TITLE
    ==========================================*/

    setTitle(title) {

        const element =
            document.querySelector(".loader__title");

        if (element) {

            element.textContent = title;

        }

    }

    /*==========================================
        UPDATE MESSAGE
    ==========================================*/

    setMessage(message) {

        const element =
            document.querySelector(".loader__message");

        if (element) {

            element.textContent = message;

        }

    }

    /*==========================================
        UPDATE PROGRESS
    ==========================================*/

    setProgress(value) {

        const bar =
            document.getElementById("loaderProgressBar");

        const text =
            document.getElementById("loaderProgressText");

        if (!bar || !text) return;

        value = Math.max(0, Math.min(100, value));

        bar.style.width = value + "%";

        text.textContent = value + "%";

    }

    /*==========================================
        SUCCESS
    ==========================================*/

    success(message = "Completed Successfully") {

        this.root.innerHTML = `

<div class="loader active">

    <div class="loader__overlay"></div>

    <div class="loader__card">

        <div class="loader__success">

            <i class="fa-solid fa-circle-check"></i>

        </div>

        <h3>

            Success

        </h3>

        <p>

            ${message}

        </p>

    </div>

</div>

        `;

        setTimeout(() => {

            this.hide();

        }, 1500);

    }

    /*==========================================
        ERROR
    ==========================================*/

    error(message = "Something went wrong") {

        this.root.innerHTML = `

<div class="loader active">

    <div class="loader__overlay"></div>

    <div class="loader__card">

        <div class="loader__error">

            <i class="fa-solid fa-circle-xmark"></i>

        </div>

        <h3>

            Error

        </h3>

        <p>

            ${message}

        </p>

    </div>

</div>

        `;

        setTimeout(() => {

            this.hide();

        }, 2000);

    }

    /*==========================================
        HIDE
    ==========================================*/

    hide() {

        if (!this.root) return;

        this.root.innerHTML = "";

        this.isVisible = false;

    }

    /*==========================================
        TOGGLE
    ==========================================*/

    toggle() {

        if (this.isVisible) {

            this.hide();

        }

        else {

            this.show();

        }

    }

}

/*==========================================================
    GLOBAL INSTANCE
==========================================================*/

const loader = new Loader();