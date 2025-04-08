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

// Initialize the ingredient list
const ingredientList = [];

// Événement : Soumettre le formulaire de recette
document.getElementById('recipeForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const recipeName = document.getElementById('recipeName').value;
    const servings = document.getElementById('servings').value;
    const cookingMethod = document.getElementById('cookingMethod').value;
    const steps = document.getElementById('steps').value.split(';').map(step => step.trim());

    if (!window.ingredientList || ingredientList.length === 0) {
        alert("Veuillez ajouter au moins un ingrédient !");
        return;
    }

    const recipe = {
        nom: recipeName,
        pour_x_personnes: servings,
        ingrédients: ingredientList,
        mode_cuisson: cookingMethod,
        nbr_etapes: steps.length,
        recette_etapes: steps.reduce((acc, step, index) => {
            acc[`etape${index + 1}`] = step;
            return acc;
        }, {})
    };

    // Affichage de la recette générée dans la console
    console.log('Recette générée :', JSON.stringify(recipe, null, 2));

    // Envoi des données à Firebase
    const recettesRef = getDatabaseRef('recettes');
    push(recettesRef, recipe)
        .then(() => {
            console.log('Recette ajoutée avec succès à Firebase !');
            alert('La recette a été créée et ajoutée à Firebase !');
            document.getElementById('recipeForm').reset();
        })
        .catch((error) => {
            console.error('Erreur lors de l\'ajout de la recette à Firebase :', error);
            alert('Une erreur est survenue lors de l\'ajout de la recette.');
        });
});

// Fonction pour charger le fichier JSON contenant les ingrédients possibles
let ingredientData = {};

async function loadIngredients() {
    try {
        const response = await fetch('../ingredients.json'); // Chemin vers le fichier JSON
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        ingredientData = await response.json();
        console.log('Données des ingrédients chargées :', ingredientData);
    } catch (error) {
        console.error('Erreur lors du chargement des ingrédients :', error);
        alert('Impossible de charger les données des ingrédients. Veuillez réessayer plus tard.');
    }
}

// Fonction pour remplir le champ de recherche avec les suggestions d'ingrédients
function populateIngredientSuggestions() {
    const ingredientSearch = document.getElementById('ingredientSearch');
    const ingredientSuggestions = document.getElementById('ingredientSuggestions');

    // Efface les suggestions existantes
    ingredientSuggestions.innerHTML = '';

    // Ajoute les suggestions à partir des données JSON
    Object.values(ingredientData.types).flat().forEach(ingredient => {
        const option = document.createElement('option');
        option.value = ingredient.nom;
        ingredientSuggestions.appendChild(option);
    });
}

// Chargement des ingrédients lorsque la page est prête
document.addEventListener('DOMContentLoaded', () => {
    loadIngredients().then(() => {
        populateIngredientSuggestions();
    });

    console.log('Le site est chargé et prêt !');
});

// Événement : Ajouter un ingrédient
document.getElementById('addIngredient').addEventListener('click', function() {
    const ingredientSearch = document.getElementById('ingredientSearch');
    const quantityInput = document.getElementById('quantity');
    const unitSelect = document.getElementById('unit');

    const ingredient = ingredientSearch.value.trim();
    const quantity = quantityInput.value.trim();
    const unit = unitSelect.value;

    if (ingredient && quantity && unit) {
        const formattedIngredient = `${ingredient} : ${quantity} ${unit}`;
        ingredientList.push(formattedIngredient);

        const ingredientListElement = document.getElementById('ingredientList');
        const listItem = document.createElement('li');
        listItem.textContent = formattedIngredient;
        ingredientListElement.appendChild(listItem);

        ingredientSearch.value = '';
        quantityInput.value = '';
    } else {
        alert("Veuillez remplir tous les champs pour ajouter un ingrédient !");
    }
});

// Réinitialisation de la liste des ingrédients

console.log('La liste des ingrédients est prête à être remplie !');