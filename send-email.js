import { initializeApp } from "firebase/app";
import { getFirestore, collectionGroup, query, where, orderBy, getDocs, doc, updateDoc } from "firebase/firestore";
import { createCanvas, loadImage } from "canvas";
import nodemailer from "nodemailer";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB3VJSEb-0PnbNtD8HbYT--fWdlbynV2mQ",
    authDomain: "hemosoris.firebaseapp.com",
    projectId: "hemosoris",
    storageBucket: "hemosoris.appspot.com",
    messagingSenderId: "918460220164",
    appId: "1:918460220164:web:7876f32fa606815aa98651",
    measurementId: "G-FJQERN8G35"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Konfigurasi Nodemailer dengan SMTP Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hemosoris@gmail.com",      
    pass: "suhu wxmh atyu sddb"            
  }
});

// Fungsi untuk mengambil data dari Firestore
async function getAllEmails() {
  const dataQuery = query(
    collectionGroup(db, "data"),
    where("status", "==", false),
    where("emailSent", "==", false),
    orderBy("timestamp", "asc")
  )

  const querySnapshot = await getDocs(dataQuery);
  console.log("Data yang diambil dari Firestore:");
  let userData = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const timestamp = data.timestamp ? data.timestamp.toDate() : null;
    const formattedTanggal = timestamp
      ? `${String(timestamp.getDate()).padStart(2, "0")}-${String(timestamp.getMonth() + 1).padStart(2, "0")}-${timestamp.getFullYear()}`
      : "-";

    console.log(`ID: ${doc.id}, Nama: ${data.name}, Tanggal Periksa: ${formattedTanggal}`);

    // Filter data yang memiliki field lengkap
    if (
      data.name &&
      data.usia &&
      data.email &&
      data.golonganDarah &&
      data.name.trim() !== "" &&
      data.usia.trim() !== "" &&
      data.email.trim() !== "" &&
      data.golonganDarah.trim() !== ""
    ) {
      userData.push({ ...data, id: doc.id, formattedTanggal, fullPath: doc.ref.path });
    }
  });

  console.log("Data yang memenuhi kriteria field lengkap:", userData);
  return userData;
}

// Fungsi untuk membuat gambar kartu hasil tes
async function createCard(data) {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext("2d");
  const formattedTanggal = data.formattedTanggal || "-";

  const background = await loadImage("./assets/img/hasil-tes-goldar.png");
  ctx.drawImage(background, 0, 0, 800, 600);

  ctx.font = "40px Arial";
  ctx.fillStyle = "black";

  ctx.fillText(`Nama: ${data.name}`, 50, 250);
  ctx.fillText(`Usia: ${data.usia}`, 50, 300);
  ctx.fillText(`Email: ${data.email}`, 50, 350);
  ctx.fillText(`Tanggal Periksa: ${formattedTanggal}`, 50, 400);
  ctx.fillText(`Golongan darah: ${data.golonganDarah}`, 50, 450);
  const buffer = canvas.toBuffer("image/png");
  return buffer;
}

// Fungsi untuk mengirim email
async function sendEmail(buffer, recipientEmail) {
  const mailOptions = {
    from: "your-email@gmail.com",
    to: recipientEmail,
    subject: "Hasil Tes Golongan Darah",
    text: `Terima kasih atas kepercayaan Anda telah menggunakan Hemosoris untuk pengecekan golongan darah. Kami berharap layanan ini memberikan kemudahan dan manfaat bagi Anda dalam mengetahui informasi kesehatan dengan lebih cepat dan akurat.

Hasil pengecekan Anda telah berhasil diproses dan dapat Anda lihat pada file yang kami lampirkan dalam email ini. Jika terdapat pertanyaan atau membutuhkan informasi lebih lanjut, jangan ragu untuk menghubungi tim kami.

Terima kasih atas dukungan Anda. Kami berharap dapat terus melayani Anda dengan lebih baik di masa depan!

Salam sehat,
Tim Hemosoris.`,
    attachments: [
      {
        filename: "hasil-tes-goldar.png",
        content: buffer,
        contentType: "image/png",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent to", recipientEmail);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

// Fungsi utama untuk menjalankan semua proses
async function main() {
  const users = await getAllEmails();
  if (users.length > 0) {
    for (const user of users) {
      const buffer = await createCard(user);

      const emailSentSuccess = await sendEmail(buffer, user.email);

      if (emailSentSuccess) {
        // Update status dan emailSent field di Firestore setelah email berhasil dikirim
        const userDocRef = doc(db, user.fullPath);
        await updateDoc(userDocRef, {
          status: true,
          emailSent: true,
        });
      }
    }
  } else {
    console.log("Tidak ada data yang ditemukan dengan status false, emailSent false, dan field lengkap.");
  }
}

// Setiap interval waktu (misalnya 1 menit), jalankan fungsi main
setInterval(main, 1 * 60 * 1000); // 1 menit