/*==========================================================
    MODAL COMPONENT
    Version: 1.0
==========================================================*/

class Modal {

    constructor() {

        this.root = document.getElementById("modal-root");

        this.isOpen = false;

    }

    /*==========================================
        CREATE
    ==========================================*/

    create({

        type = "default",

        title = "Notification",

        message = "",

        confirmText = "OK",

        cancelText = "Cancel",

        showCancel = false,

        closable = true,

        onConfirm = null,

        onCancel = null

    } = {}) {

        if (!this.root) return;

        this.root.innerHTML = `

<div class="modal active">

    <div class="modal__overlay"></div>

    <div class="modal__card">

        ${closable ? `

        <button
            class="modal__close">

            <i class="fa-solid fa-xmark"></i>

        </button>

        ` : ""}

        <div class="modal__icon modal__icon--${type}">

            ${this.getIcon(type)}

        </div>

        <h2>

            ${title}

        </h2>

        <p>

            ${message}

        </p>

        <div class="modal__buttons">

            ${showCancel ? `

            <button
                class="button button--outline modal-cancel">

                ${cancelText}

            </button>

            ` : ""}

            <button
                class="button button--primary modal-confirm">

                ${confirmText}

            </button>

        </div>

    </div>

</div>

        `;

        this.events(onConfirm,onCancel,closable);

        this.isOpen = true;

    }

    /*==========================================
        ICON
    ==========================================*/

    getIcon(type){

        switch(type){

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
        EVENTS
    ==========================================*/

    events(onConfirm,onCancel,closable){

        const confirmBtn =
            this.root.querySelector(".modal-confirm");

        const cancelBtn =
            this.root.querySelector(".modal-cancel");

        const overlay =
            this.root.querySelector(".modal__overlay");

        const closeBtn =
            this.root.querySelector(".modal__close");

        if(confirmBtn){

            confirmBtn.addEventListener(

                "click",

                ()=>{

                    if(onConfirm){

                        onConfirm();

                    }

                    this.close();

                }

            );

        }

        if(cancelBtn){

            cancelBtn.addEventListener(

                "click",

                ()=>{

                    if(onCancel){

                        onCancel();

                    }

                    this.close();

                }

            );

        }

        if(closable){

            if(overlay){

                overlay.addEventListener(

                    "click",

                    ()=>{

                        this.close();

                    }

                );

            }

            if(closeBtn){

                closeBtn.addEventListener(

                    "click",

                    ()=>{

                        this.close();

                    }

                );

            }

        }

        document.addEventListener(

            "keydown",

            this.escapeHandler = (e)=>{

                if(e.key==="Escape" && this.isOpen){

                    this.close();

                }

            }

        );

    }

    /*==========================================
        SUCCESS
    ==========================================*/

    normalizeText(title, message, fallbackTitle) {

        if (message === undefined || message === null || message === "") {

            return {
                title: fallbackTitle,
                message: title || ""
            };

        }

        return { title, message };

    }

    success(title,message,onConfirm=null){

        const text = this.normalizeText(title, message, "Success");

        this.create({

            type:"success",

            title:text.title,

            message:text.message,

            confirmText:"OK",

            onConfirm

        });

    }

    /*==========================================
        ERROR
    ==========================================*/

    error(title,message){

        const text = this.normalizeText(title, message, "Error");

        this.create({

            type:"error",

            title:text.title,

            message:text.message

        });

    }

    /*==========================================
        WARNING
    ==========================================*/

    warning(title,message){

        const text = this.normalizeText(title, message, "Warning");

        this.create({

            type:"warning",

            title:text.title,

            message:text.message

        });

    }

    /*==========================================
        INFO
    ==========================================*/

    info(title,message){

        const text = this.normalizeText(title, message, "Notice");

        this.create({

            type:"info",

            title:text.title,

            message:text.message

        });

    }

    /*==========================================
        CONFIRM
    ==========================================*/

    confirm({

        title,

        message,

        confirmText="Yes",

        cancelText="No",

        onConfirm,

        onCancel

    }){

        this.create({

            type:"warning",

            title,

            message,

            showCancel:true,

            confirmText,

            cancelText,

            onConfirm,

            onCancel

        });

    }

    confirmAsync({

        title = "Please Confirm",

        message = "Are you sure?",

        confirmText = "Yes",

        cancelText = "No"

    } = {}) {

        return new Promise(resolve => {

            this.confirm({

                title,

                message,

                confirmText,

                cancelText,

                onConfirm: () => resolve(true),

                onCancel: () => resolve(false)

            });

            const overlay = this.root?.querySelector(".modal__overlay");
            const close = this.root?.querySelector(".modal__close");

            overlay?.addEventListener("click", () => resolve(false), { once: true });
            close?.addEventListener("click", () => resolve(false), { once: true });

        });

    }

    /*==========================================
        CLOSE
    ==========================================*/

    close(){

        if(!this.root) return;

        this.root.innerHTML = "";

        this.isOpen = false;

        document.removeEventListener(

            "keydown",

            this.escapeHandler

        );

    }

}

/*==========================================================
    GLOBAL INSTANCE
==========================================================*/

const modal = new Modal();
