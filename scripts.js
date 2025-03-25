// scripts.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('Le site est chargé et prêt !');
});

document.getElementById('recipeForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const recipeName = document.getElementById('recipeName').value;
    const servings = document.getElementById('servings').value;
    const ingredients = document.getElementById('ingredients').value.split(',');
    const cookingMethod = document.getElementById('cookingMethod').value;
    const steps = document.getElementById('steps').value.split(';');

    const recipe = {
        id: 0, // Id peut être généré dynamiquement
        nom: recipeName,
        pour_x_personnes: servings,
        ingrédients: ingredients.map(ingredient => {
            return { ingredient: ingredient.trim(), qte_pour_x_personnes: servings };
        }),
        mode_cuisson: cookingMethod,
        nbr_etapes: steps.length,
        recette_etapes: steps.reduce((acc, step, index) => {
            acc[`etape${index + 1}`] = step.trim();
            return acc;
        }, {})
    };

    // Appel à une API ou une IA pour déchiffrer la recette
    try {
        const response = await fetch('https://api.example.com/parseRecipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recipe)
        });

        const data = await response.json();
        console.log('Recette déchiffrée:', data);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);
    }
});