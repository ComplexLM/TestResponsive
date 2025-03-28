// Fonction pour charger les composants HTML
function loadComponent(id, file) {
    fetch(file)
        .then(response => response.text())
        .then(data => document.getElementById(id).innerHTML = data)
        .catch(error => console.error('Erreur lors du chargement du composant:', error));
}

// Chargement des composants 'header' et 'footer'
loadComponent('header', 'header.html');
loadComponent('footer', 'footer.html');

// Fonction pour charger le fichier JSON contenant les ingrédients possibles
let ingredientData = {};

async function loadIngredients() {
    try {
        const response = await fetch('ingredients.json'); // Chemin vers le fichier JSON
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        ingredientData = await response.json();
        console.log('Données des ingrédients chargées :', ingredientData);
    } catch (error) {
        console.error('Erreur lors du chargement des ingrédients :', error);
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

// Liste pour stocker les ingrédients ajoutés
const ingredientList = [];

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

// Événement : Soumettre le formulaire de recette
document.getElementById('recipeForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const recipeName = document.getElementById('recipeName').value;
    const servings = document.getElementById('servings').value;
    const cookingMethod = document.getElementById('cookingMethod').value;
    const steps = document.getElementById('steps').value.split(';').map(step => step.trim());

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

    console.log('Recette générée :', JSON.stringify(recipe, null, 2));
    alert('La recette a été créée ! Vérifiez la console pour voir les détails.');
});