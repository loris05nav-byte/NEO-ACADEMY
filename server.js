/* =================================================================
   NEO-ACADEMY SERVER v1.0
   Architecture : Node.js + Express + Firebase REST API
   ================================================================= */

const express = require('express');
const bodyParser = require('body-parser');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const path = require('path');

const app = express();
const PORT = 3000;

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCazvx8e8KYjuII8DK8iVSPo3MLDhVb5Mw",
  authDomain: "neo-academy-lolo.firebaseapp.com",
  projectId: "neo-academy-lolo",
  storageBucket: "neo-academy-lolo.firebasestorage.app",
  messagingSenderId: "577132494103",
  appId: "1:577132494103:web:48016ed2e44bbb6d7e0b52",
  measurementId: "G-C74L8TVKS6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '.'))); // Sert index.html

// --- ROUTES D'AUTHENTIFICATION ---

// 1. INSCRIPTION (Register)
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Validation basique
    if (!email || !password) {
        return res.status(400).json({ error: "Tous les champs sont requis." });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: "Le mot de passe doit faire au moins 6 caractères." });
    }

    try {
        // Appel à l'API Firebase pour créer un utilisateur
        const response = await fetch(`${FIREBASE_AUTH_URL}:signUp?key=${FIREBASE_API_KEY}`, {
            method: 'POST',
            body: JSON.stringify({
                email: email,
                password: password,
                returnSecureToken: true
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        // Succès
        res.status(200).json({ 
            success: true, 
            message: "Compte créé avec succès !",
            userId: data.localId,
            token: data.idToken
        });

    } catch (error) {
        res.status(400).json({ error: parseFirebaseError(error.message) });
    }
});

// 2. CONNEXION (Login)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis." });
    }

    try {
        // Appel à l'API Firebase pour vérifier le mot de passe
        const response = await fetch(`${FIREBASE_AUTH_URL}:signInWithPassword?key=${FIREBASE_API_KEY}`, {
            method: 'POST',
            body: JSON.stringify({
                email: email,
                password: password,
                returnSecureToken: true
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        // Succès - On renvoie les infos pour charger la session
        res.status(200).json({
            success: true,
            userId: data.localId,
            email: data.email,
            token: data.idToken
        });

    } catch (error) {
        res.status(401).json({ error: "Identifiants incorrects." });
    }
});

// 3. SAUVEGARDE (Structure pour le futur)
app.post('/save-progress', (req, res) => {
    const { userId, xp, stats } = req.body;
    // TODO: Connecter à Firebase Firestore ici
    console.log(`[SAVE] User: ${userId} | XP: ${xp}`);
    res.status(200).json({ success: true, message: "Progression sauvegardée (Simulé)" });
});

// --- UTILITAIRES ---
function parseFirebaseError(msg) {
    if (msg.includes("EMAIL_EXISTS")) return "Cet email est déjà utilisé.";
    if (msg.includes("INVALID_EMAIL")) return "Format d'email invalide.";
    if (msg.includes("WEAK_PASSWORD")) return "Mot de passe trop faible.";
    return "Erreur lors de l'opération.";
}

// --- DÉMARRAGE ---
app.listen(PORT, () => {
    console.log(`🚀 SERVEUR NEO-ACADEMY EN LIGNE : http://localhost:${PORT}`);
    console.log(`👉 Ouvrez votre navigateur pour commencer.`);
});