// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB3VJSEb-0PnbNtD8HbYT--fWdlbynV2mQ",
    authDomain: "hemosoris.firebaseapp.com",
    projectId: "hemosoris",
    storageBucket: "hemosoris.appspot.com",
    messagingSenderId: "918460220164",
    appId: "1:918460220164:web:7876f32fa606815aa98651",
    measurementId: "G-FJQERN8G35"
};

// Initialize Firebase 
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Initialize Firestore

// Fungsi untuk login
async function login(username, password) {
    const adminCollection = collection(db, "admin");
    const customerCollection = collection(db, "customer");

    // Query untuk mencocokkan username dan password di koleksi admin dan customer
    const adminQuery = query(adminCollection, where("username", "==", username), where("password", "==", password));
    const customerQuery = query(customerCollection, where("username", "==", username), where("password", "==", password));

    try {
        const [adminSnapshot, customerSnapshot] = await Promise.all([getDocs(adminQuery), getDocs(customerQuery)]);

        if (!adminSnapshot.empty) {
            // Jika login sebagai admin
            console.log("Login berhasil sebagai admin!");

            // Ambil ID dokumen admin 
            const adminDocId = adminSnapshot.docs[0].id;
            
            sessionStorage.setItem("loggedInUser", adminDocId); // Simpan ID dokumen admin
            sessionStorage.setItem("userRole", "admin"); // Simpan role sebagai admin

            window.location.href = "/pages/dashboard-admin.html"; // Redirect ke dashboard admin
        } else if (!customerSnapshot.empty) {
            // Jika login sebagai customer
            console.log("Login berhasil sebagai customer!");

            // Ambil ID dokumen customer 
            const customerDocId = customerSnapshot.docs[0].id;
            
            sessionStorage.setItem("loggedInUser", customerDocId); // Simpan ID dokumen customer
            sessionStorage.setItem("userRole", "customer"); // Simpan role sebagai customer

            window.location.href = "/pages/dashboard.html"; // Redirect ke dashboard customer
        } else {
            // Jika username atau password tidak cocok di kedua koleksi
            alert("Login gagal: Username atau password salah.");
        }
    } catch (error) {
        console.error("Error saat melakukan login:", error);
        alert("Terjadi kesalahan saat login. Silakan coba lagi.");
    }
}

// Event listener untuk tombol login
document.getElementById("submit").addEventListener("click", function(event) {
    event.preventDefault(); // Mencegah form dari refresh otomatis
    const username = document.getElementById("username").value.trim(); // Ambil username dari input
    const password = document.getElementById("password").value; // Ambil password dari input

    // Validasi input
    if (username && password) {
        login(username, password); // Panggil fungsi login jika input valid
    } else {
        alert("Username dan Password harus diisi!"); // Pesan kesalahan jika input kosong
    }
});
