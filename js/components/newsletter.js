/*==========================================================
    NEWSLETTER COMPONENT
==========================================================*/

class Newsletter {

    constructor() {

        this.form = document.getElementById("newsletterForm");

        this.emailInput = document.getElementById("newsletterEmail");

    }

    /*==========================================
        VALIDATE EMAIL
    ==========================================*/

    validateEmail(email) {

        const regex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return regex.test(email);

    }

    /*==========================================
        CLEAR FORM
    ==========================================*/

    clearForm() {

        if (this.emailInput) {

            this.emailInput.value = "";

        }

    }

    /*==========================================
        DISABLE FORM
    ==========================================*/

    setLoading(state) {

        if (!this.form) return;

        const button =
            this.form.querySelector("button");

        if (!button) return;

        if (state) {

            button.disabled = true;

            button.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Subscribing...
            `;

        }

        else {

            button.disabled = false;

            button.innerHTML = `
                Subscribe
            `;

        }

    }

    /*==========================================
        SUBMIT
    ==========================================*/

    async subscribe(email) {

        if (typeof api === "undefined") {

            throw new Error("Firebase API is not ready.");

        }

        return await api.subscribe(email);

    }

    /*==========================================
        FORM SUBMIT
    ==========================================*/

    async submit(event) {

        event.preventDefault();

        if (!this.emailInput) return;

        const email =
            this.emailInput.value.trim();

        if (email === "") {

            toast.show({

                type:"warning",

                title:"Email Required",

                message:"Please enter your email."

            });

            return;

        }

        if (!this.validateEmail(email)) {

            toast.show({

                type:"error",

                title:"Invalid Email",

                message:"Please enter a valid email."

            });

            return;

        }

        try {

            this.setLoading(true);

            await this.subscribe(email);

            this.clearForm();

            toast.show({

                type:"success",

                title:"Subscribed",

                message:"Thank you for subscribing."

            });

        }

        catch(error){

            toast.show({

                type:"error",

                title:"Subscription Failed",

                message:error.message

            });

        }

        finally{

            this.setLoading(false);

        }

    }

    /*==========================================
        EVENTS
    ==========================================*/

    events() {

        if (!this.form) return;

        this.form.addEventListener(

            "submit",

            this.submit.bind(this)

        );

    }

    /*==========================================
        INITIALIZE
    ==========================================*/

    init() {

        this.events();

    }

}

/*==========================================================
    GLOBAL INSTANCE
==========================================================*/

const newsletter = new Newsletter();

document.addEventListener(

    "DOMContentLoaded",

    () => {

        newsletter.init();

    }

);
