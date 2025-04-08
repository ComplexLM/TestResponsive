import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getDatabase, ref, push, update, onValue } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";
import { firebaseConfig } from "../firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
// Fonction utilitaire pour obtenir une référence à la base de données
function getDatabaseRef(path) {
    return ref(database, path);
}
console.log("Firebase initialisé avec succès !");
console.log("Référence de la base de données :", database);

const recettesRef = getDatabaseRef('recettes');

const recettesList = document.getElementById('recettesList');
const recetteDetails = document.getElementById('recetteDetails');
const closeDetailsBtn = document.getElementById('closeDetailsBtn');

// Fonction pour récupérer jusqu'à 12 recettes aléatoires depuis Firebase
function fetchRandomRecipes() {
    const recettesRef = getDatabaseRef('recettes');
    onValue(recettesRef, (snapshot) => {
        const recipes = snapshot.val();
        if (recipes) {
            const recipeKeys = Object.keys(recipes);
            const randomKeys = recipeKeys.sort(() => 0.5 - Math.random()).slice(0, 12);
            const recipeListElement = document.getElementById('recipeList');
            recipeListElement.innerHTML = ''; // Efface les recettes existantes

            randomKeys.forEach((key) => {
                const recipe = recipes[key];
                const listItem = document.createElement('li');
                listItem.textContent = recipe.nom; // Affiche le nom de la recette
                recipeListElement.appendChild(listItem);
            });
        } else {
            console.log('Aucune recette trouvée dans la base de données.');
        }
    }, (error) => {
        console.error('Erreur lors de la récupération des recettes :', error);
    });
}

// Chargement des ingrédients lorsque la page est prête
document.addEventListener('DOMContentLoaded', () => {
    fetchRandomRecipes();
    console.log('Le site est chargé et prêt !');
});