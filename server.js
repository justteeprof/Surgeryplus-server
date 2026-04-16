const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("SurgeryPlus Server is running 🚀");
});

app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Server is healthy" });
});
// 🔥 Firebase Admin Setup
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://surgeryplus-9a786-default-rtdb.europe-west1.firebasedatabase.app/"
});

const db = admin.database();

// 📧 Email setup (use Gmail or SendGrid)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your@email.com",
    pass: "your-app-password"
  }
});

// 🔑 License generator
function generateLicenseKey() {
  return crypto.randomBytes(8).toString("hex").toUpperCase();
}

// 🎯 WEBHOOK
app.post("/gumroad-webhook", async (req, res) => {

  const email = req.body.email;
  const product = req.body.product_name;

  const licenseKey = generateLicenseKey();

  // Save to Firebase
  await db.ref("Licenses/" + licenseKey).set({
    email: email,
    product: product,
    activated: false,
    deviceId: null,
    userId: null,
    createdAt: Date.now()
  });

  // Send email
  await transporter.sendMail({
    from: "SurgeryPlus",
    to: email,
    subject: "Your License Key",
    text: `Thank you for your purchase!

Your license key:
${licenseKey}

Enter this key inside the app to activate.`
  });

  res.sendStatus(200);
});

// 🚀 Start server
app.listen(3000, () => console.log("Server running on port 3000"));
