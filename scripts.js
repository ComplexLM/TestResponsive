// scripts.js

function loadComponent(id, file) {
    fetch(file)
        .then(response => response.text())
        .then(data => document.getElementById(id).innerHTML = data)
        .catch(error => console.error('Error loading component:', error));
}

loadComponent('header', 'header.html');
loadComponent('footer', 'footer.html');

document.addEventListener('DOMContentLoaded', () => {
    console.log('Le site est chargé et prêt !');
});

const ingredientList = [];

document.getElementById('addIngredient').addEventListener('click', function() {
    const ingredientInput = document.getElementById('ingredient');
    const quantityInput = document.getElementById('quantity');
    const unitSelect = document.getElementById('unit');

    const ingredient = ingredientInput.value.trim();
    const quantity = quantityInput.value.trim();
    const unit = unitSelect.value;

    if (ingredient && quantity && unit) {
        const formattedIngredient = `${quantity} ${unit}; ${ingredient}`;
        ingredientList.push(formattedIngredient);
        
        const ingredientListElement = document.getElementById('ingredientList');
        const listItem = document.createElement('li');
        listItem.textContent = formattedIngredient;
        ingredientListElement.appendChild(listItem);
        
        ingredientInput.value = '';
        quantityInput.value = '';
    }
});

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

    console.log('Recette générée:', JSON.stringify(recipe, null, 2));
});