// ============================================
// Firebase Configuration - Preguntas Mapfre
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyCbDnwI3LJ1rTAOgYeorSmeXhBAsmm1BbQ",
  authDomain: "preguntas-mapfre.firebaseapp.com",
  databaseURL: "https://preguntas-mapfre-default-rtdb.firebaseio.com",
  projectId: "preguntas-mapfre",
  storageBucket: "preguntas-mapfre.firebasestorage.app",
  messagingSenderId: "668179710134",
  appId: "1:668179710134:web:667fc42cda4efa2357e617",
  measurementId: "G-D3XRQXDQRQ"
};

// PIN de acceso al dashboard (cambiar antes del evento)
const DASHBOARD_PIN = "2030";

// Initialize Firebase (usando el SDK compat cargado por CDN en el HTML)
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
