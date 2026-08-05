

/*==========================================================
    EMAIL.JS
    NewsHub Email Service
==========================================================*/

const EMAIL_CONFIG = {

    PUBLIC_KEY: "g5eE5Fb3bnnC1yfhy",

    SERVICE_ID: "service_z2vzwii",

    APPROVAL_TEMPLATE: "template_z4iq4cf",

    REJECTION_TEMPLATE: "template_vztu69b"

};



/*==========================================================
    INITIALIZE EMAILJS
==========================================================*/

function initEmailService() {

    emailjs.init({

        publicKey: EMAIL_CONFIG.PUBLIC_KEY

    });

    console.log("✅ EmailJS Initialized");

}



/*==========================================================
    AUTO INITIALIZE
==========================================================*/

document.addEventListener("DOMContentLoaded", () => {

    initEmailService();

});



/*==========================================================
    SEND EMAIL
==========================================================*/

async function sendEmail(templateId, templateParams) {

    try {

        const response = await emailjs.send(

            EMAIL_CONFIG.SERVICE_ID,

            templateId,

            templateParams

        );

        console.log("✅ Email Sent Successfully");

        return {

            success: true,

            response

        };

    }

    catch (error) {

        console.error("❌ Email Error:", error);

        return {

            success: false,

            error

        };

    }

}/*==========================================================
    APPROVAL EMAIL
==========================================================*/

async function sendApprovalEmail(user) {

    const templateParams = {

        to_name: user.name,

        to_email: user.email,

        login_link: `${window.location.origin}/login.html`

    };

    const result = await sendEmail(

        EMAIL_CONFIG.APPROVAL_TEMPLATE,

        templateParams

    );

    if (result.success) {

        console.log(

            `✅ Approval Email Sent To ${user.email}`

        );

    }

    return result;

}



/*==========================================================
    REJECTION EMAIL
==========================================================*/

async function sendRejectionEmail(user) {

    const templateParams = {

        to_name: user.name,

        to_email: user.email

    };

    const result = await sendEmail(

        EMAIL_CONFIG.REJECTION_TEMPLATE,

        templateParams

    );

    if (result.success) {

        console.log(

            `✅ Rejection Email Sent To ${user.email}`

        );

    }

    return result;

}



/*==========================================================
    TEST DATA
==========================================================*/

const TEST_USER = {

    name: "Sergio Ramos",

    email: "info.erenyeager2k7@gmail.com"

};/*==========================================================
    TEST APPROVAL EMAIL
==========================================================*/

async function sendTestApprovalEmail() {

    console.log("📧 Sending Test Approval Email...");

    const result = await sendApprovalEmail(TEST_USER);

    if (result.success) {

        if (typeof showToast === "function") {

            showToast(

                "success",

                "Test approval email sent successfully."

            );

        }

        console.log("✅ Test Approval Email Sent");

    }

    else {

        if (typeof showToast === "function") {

            showToast(

                "error",

                "Failed to send approval email."

            );

        }

        console.error(result.error);

    }

}



/*==========================================================
    TEST REJECTION EMAIL
==========================================================*/

async function sendTestRejectionEmail() {

    console.log("📧 Sending Test Rejection Email...");

    const result = await sendRejectionEmail(TEST_USER);

    if (result.success) {

        if (typeof showToast === "function") {

            showToast(

                "success",

                "Test rejection email sent successfully."

            );

        }

        console.log("✅ Test Rejection Email Sent");

    }

    else {

        if (typeof showToast === "function") {

            showToast(

                "error",

                "Failed to send rejection email."

            );

        }

        console.error(result.error);

    }

}



/*==========================================================
    WINDOW FUNCTIONS
==========================================================*/

window.sendTestApprovalEmail =

    sendTestApprovalEmail;



window.sendTestRejectionEmail =

    sendTestRejectionEmail;/*==========================================================
    DEVELOPER EMAIL SERVICE
==========================================================*/

async function sendDeveloperApproval(user) {

    const result = await sendApprovalEmail(user);

    if (result.success) {

        console.log(

            `✅ Developer approval email sent to ${user.email}`

        );

        if (typeof showToast === "function") {

            showToast(

                "success",

                `Approval email sent to ${user.email}`

            );

        }

    }

    else {

        console.error(result.error);

        if (typeof showToast === "function") {

            showToast(

                "error",

                "Failed to send approval email."

            );

        }

    }

    return result;

}



/*==========================================================
    DEVELOPER REJECTION SERVICE
==========================================================*/

async function sendDeveloperRejection(user) {

    const result = await sendRejectionEmail(user);

    if (result.success) {

        console.log(

            `✅ Developer rejection email sent to ${user.email}`

        );

        if (typeof showToast === "function") {

            showToast(

                "success",

                `Rejection email sent to ${user.email}`

            );

        }

    }

    else {

        console.error(result.error);

        if (typeof showToast === "function") {

            showToast(

                "error",

                "Failed to send rejection email."

            );

        }

    }

    return result;

}



/*==========================================================
    EXPORT
==========================================================*/

window.EmailService = {

    sendApprovalEmail,

    sendRejectionEmail,

    sendDeveloperApproval,

    sendDeveloperRejection,

    sendTestApprovalEmail,

    sendTestRejectionEmail

};



console.log("📧 Email Service Ready");