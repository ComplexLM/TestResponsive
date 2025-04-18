import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getDatabase, ref as databaseRef, push, update, onValue } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-storage.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { firebaseConfig } from "../firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


function getDatabaseRef(path) {
    return databaseRef(database, path);
}
console.log("Firebase initialisé avec succès !");
console.log("Référence de la base de données :", database);

// Initialize Firebase Storage
const storage = getStorage(app);
console.log("Firebase Storage initialisé avec succès !");
console.log("Référence de Firebase Storage :", storage);

// Constants pour le stockage des images FRONTEND
const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('image');
const previewContainer = document.getElementById('previewImages');
let selectedFiles = [];

// Fonction pour afficher les aperçus avec suppression et drag & drop
function updatePreviews() {
    previewContainer.innerHTML = '';
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('image-wrapper');
            wrapper.setAttribute('draggable', true);
            wrapper.setAttribute('data-index', index);
            wrapper.style.position = 'relative';
            wrapper.style.width = '100px';

            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.height = '100px';
            img.style.width = '100px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '8px';

            const removeBtn = document.createElement('button');
            removeBtn.textContent = '✕';
            removeBtn.style.position = 'absolute';
            removeBtn.style.top = '0';
            removeBtn.style.right = '0';
            removeBtn.style.background = 'red';
            removeBtn.style.color = 'white';
            removeBtn.style.border = 'none';
            removeBtn.style.borderRadius = '50%';
            removeBtn.style.cursor = 'pointer';
            removeBtn.style.width = '20px';
            removeBtn.style.height = '20px';

            removeBtn.addEventListener('click', () => {
                selectedFiles.splice(index, 1);
                updatePreviews();
            });

            wrapper.appendChild(img);
            wrapper.appendChild(removeBtn);
            previewContainer.appendChild(wrapper);

            // Drag & Drop entre images
            wrapper.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', index);
                wrapper.style.opacity = '0.5';
            });

            wrapper.addEventListener('dragend', () => {
                wrapper.style.opacity = '1';
            });

            wrapper.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            wrapper.addEventListener('drop', (e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                const toIndex = index;

                const [moved] = selectedFiles.splice(fromIndex, 1);
                selectedFiles.splice(toIndex, 0, moved);
                updatePreviews();
            });
        };
        reader.readAsDataURL(file);
    });
}

// Gestion du champ file input
fileInput.addEventListener('change', function(e) {
    Array.from(e.target.files).forEach(file => {
        if (file.type.startsWith('image/')) {
            selectedFiles.push(file);
        }
    });
    updatePreviews();
});

// Gestion du drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, e => {
        e.preventDefault();
        dropArea.style.backgroundColor = eventName === 'dragleave' || eventName === 'drop' ? '#fff' : '#f0f0f0';
    });
});

dropArea.addEventListener('drop', e => {
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            selectedFiles.push(file);
        }
    });
    updatePreviews();
});

// Click = ouvrir le file input
dropArea.addEventListener('click', () => {
    const fileInput = dropArea.querySelector('input[type="file"]');
    fileInput.click();
});

// Initialize the ingredient list
const ingredientList = [];

// Événement : Soumettre le formulaire de recette
document.getElementById('recipeForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Champs requis
    const recipeName = document.getElementById('recipeName').value;
    const servings = document.getElementById('servings').value;
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value;
    const difficulty = document.getElementById('difficulty').value;
    const cuisine = document.getElementById('cuisine').value;
    const videoLink = document.getElementById('videoLink').value;
    const cookingMethod = document.getElementById('cookingMethod').value;
    const steps = document.getElementById('steps').value.split(';').map(step => step.trim());

    if (!window.ingredientList || ingredientList.length === 0) {
        alert("Veuillez ajouter au moins un ingrédient !");
        return;
    }

    if (!recipeName || !servings || !description || !category || !difficulty || !cuisine || steps.length === 0 || ingredientList.length === 0) {
        alert("Merci de remplir tous les champs requis !");
        return;
    }
    
    // Upload des images
    const files = selectedFiles;


    //const storage = getStorage(app);
    const imageUrls = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageReference = storageRef(storage, `imagesEecettes/${recipeName}_${Date.now()}_${file.name}`);
        try {
            await uploadBytes(storageReference, file);
            const url = await getDownloadURL(storageReference);
            imageUrls.push(url);
        } catch (err) {
            console.error(`Erreur upload image ${file.name} :`, err);
            alert(`Erreur lors de l'upload de l'image : ${file.name}`);
        }
    }

    // Création du JSON de recette
    const recipe = {
        nom: recipeName,
        url_images: imageUrls.length > 0 
        ? imageUrls 
        : ['./default.jpg'], // Toujours un tableau, même avec une valeur par défaut
        description,
        category,
        difficulty,
        cuisine,
        video_link: videoLink,
        portions: servings,
        images: imageUrls,
        ingredients: ingredientList.map(item => {
            const [name, quantityUnit] = item.split(' : ');
            const [quantity, unit] = quantityUnit.split(' ');
            return { name, quantity: parseFloat(quantity), unit };
        }),
        steps: steps.map((step, index) => ({
            description: step,
            order: index + 1
        })),
        mode_cuisson: cookingMethod
    };

    // Affichage de la recette générée dans la console
    console.log('Recette générée :', JSON.stringify(recipe, null, 2));

    // Envoi à Firebase Database
    const recettesRef = getDatabaseRef('recettes');
    try {
        await push(recettesRef, recipe);
        alert('Recette ajoutée avec succès !');
        document.getElementById('recipeForm').reset();
        document.getElementById('ingredientList').innerHTML = '';
        ingredientList.length = 0;
        document.getElementById('previewImages').innerHTML = ''; // Réinitialiser les aperçus
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la recette à Firebase :', error);
        alert('Erreur lors de l\'ajout de la recette.');
    }
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