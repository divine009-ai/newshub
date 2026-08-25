const admin = require("firebase-admin");
const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

admin.initializeApp();

function getTransporter() {
  const config = functions.config().smtp || {};

  if (!config.host || !config.user || !config.pass) {
    throw new Error("SMTP configuration is missing.");
  }

  return nodemailer.createTransport({
    host: config.host,
    port: Number(config.port || 587),
    secure: config.secure === "true",
    auth: {
      user: config.user,
      pass: config.pass
    }
  });
}

function articleEmail({ article, articleId, siteUrl }) {
  const url = `${siteUrl.replace(/\/$/, "")}/article.html?id=${articleId}`;
  const image = article.coverImage || article.image || "";

  return `
    <div style="font-family:Arial,sans-serif;background:#07111f;color:#f8fafc;padding:28px">
      <div style="max-width:640px;margin:auto;background:#101b2d;border:1px solid rgba(148,163,184,.25);padding:26px;border-radius:8px">
        <h1 style="margin:0 0 8px;color:#fff">NewsHub</h1>
        <p style="margin:0 0 22px;color:#94a3b8">A new story has just been published.</p>
        ${image ? `<img src="${image}" alt="" style="width:100%;border-radius:8px;margin-bottom:22px">` : ""}
        <h2 style="color:#fff;margin:0 0 12px">${article.title || "New Article"}</h2>
        <p style="color:#cbd5e1;line-height:1.6">${article.description || ""}</p>
        <a href="${url}" style="display:inline-block;margin-top:18px;background:#4f7cff;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:bold">Read Article</a>
      </div>
    </div>
  `;
}

exports.sendArticleNewsletter = functions.firestore
  .document("newsletterNotifications/{articleId}")
  .onCreate(async (snapshot, context) => {
    const db = admin.firestore();
    const articleId = context.params.articleId;
    const notificationRef = snapshot.ref;
    const notification = snapshot.data() || {};

    if (notification.status === "sent") return null;

    const articleDoc = await db.collection("articles").doc(articleId).get();

    if (!articleDoc.exists || articleDoc.data().published === false) {
      await notificationRef.set({
        status: "skipped",
        reason: "Article missing or unpublished",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return null;
    }

    const subscribers = await db.collection("newsletter").get();
    const emails = subscribers.docs
      .map(doc => doc.data().email)
      .filter(Boolean);

    if (emails.length === 0) {
      await notificationRef.set({
        status: "skipped",
        reason: "No subscribers",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return null;
    }

    const transporter = getTransporter();
    const config = functions.config();
    const siteUrl = config.newshub?.site_url || "https://news-a0114.web.app";
    const from = config.smtp.from || config.smtp.user;
    const article = articleDoc.data();

    await transporter.sendMail({
      from,
      bcc: emails,
      subject: `New on NewsHub: ${article.title || "Latest story"}`,
      html: articleEmail({ article, articleId, siteUrl })
    });

    await notificationRef.set({
      status: "sent",
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      subscriberCount: emails.length,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return null;
  });
