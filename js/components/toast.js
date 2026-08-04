/*==========================================================
    TOAST COMPONENT
    Version: 1.0
==========================================================*/

class Toast {

    constructor() {

        this.root = document.getElementById("toast-root");

        this.duration = 4000;

    }

    /*==========================================
        SHOW
    ==========================================*/

    show({

        type = "info",

        title = "Notification",

        message = "",

        duration = this.duration

    } = {}) {

        if (!this.root) return;

        const toast = document.createElement("div");

        toast.className = `toast toast--${type}`;

        toast.innerHTML = `

<div class="toast__icon">

    ${this.getIcon(type)}

</div>

<div class="toast__content">

    <h4>

        ${title}

    </h4>

    <p>

        ${message}

    </p>

</div>

<button class="toast__close">

    <i class="fa-solid fa-xmark"></i>

</button>

`;

        this.root.appendChild(toast);

        requestAnimationFrame(() => {

            toast.classList.add("show");

        });

        const timer = setTimeout(() => {

            this.remove(toast);

        }, duration);

        const closeButton =
            toast.querySelector(".toast__close");

        closeButton.addEventListener("click", () => {

            clearTimeout(timer);

            this.remove(toast);

        });

    }

    /*==========================================
        ICON
    ==========================================*/

    getIcon(type) {

        switch (type) {

            case "success":

                return `<i class="fa-solid fa-circle-check"></i>`;

            case "error":

                return `<i class="fa-solid fa-circle-xmark"></i>`;

            case "warning":

                return `<i class="fa-solid fa-triangle-exclamation"></i>`;

            case "info":

                return `<i class="fa-solid fa-circle-info"></i>`;

            default:

                return `<i class="fa-solid fa-bell"></i>`;

        }

    }

    /*==========================================
        REMOVE
    ==========================================*/

    remove(toast) {

        if (!toast) return;

        toast.classList.remove("show");

        toast.classList.add("hide");

        setTimeout(() => {

            toast.remove();

        }, 300);

    }

    /*==========================================
        SUCCESS
    ==========================================*/

    success(title, message, duration) {

        this.show({

            type: "success",

            title,

            message,

            duration

        });

    }

    /*==========================================
        ERROR
    ==========================================*/

    error(title, message, duration) {

        this.show({

            type: "error",

            title,

            message,

            duration

        });

    }

    /*==========================================
        WARNING
    ==========================================*/

    warning(title, message, duration) {

        this.show({

            type: "warning",

            title,

            message,

            duration

        });

    }

    /*==========================================
        INFO
    ==========================================*/

    info(title, message, duration) {

        this.show({

            type: "info",

            title,

            message,

            duration

        });

    }

    /*==========================================
        CLEAR ALL
    ==========================================*/

    clear() {

        if (!this.root) return;

        this.root.innerHTML = "";

    }

}

/*==========================================================
    GLOBAL INSTANCE
==========================================================*/

const toast = new Toast();