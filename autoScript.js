document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const fileInput = document.getElementById('fileInput').files[0];
    const urlInput = document.getElementById('urlInput').value;

    let formData = new FormData();
    if (fileInput) {
        formData.append('file', fileInput);
    } else if (urlInput) {
        formData.append('url', urlInput);
    }

    try {
        const response = await fetch('https://api.example.com/parseRecipe', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        console.log('Recette déchiffrée:', data);

        // Préremplir le formulaire avec les données reçues
        document.getElementById('recipeName').value = data.nom;
        document.getElementById('servings').value = data.pour_x_personnes;
        document.getElementById('ingredients').value = data.ingrédients.map(ing => `${ing.ingredient}, ${ing.qte_pour_x_personnes}`).join(', ');
        document.getElementById('cookingMethod').value = data.mode_cuisson;
        document.getElementById('steps').value = Object.values(data.recette_etapes).join('; ');

        document.getElementById('preFilledForm').style.display = 'block';
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);
    }
});