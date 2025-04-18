import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";
import { getStorage, ref as storageRef, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-storage.js";
import { firebaseConfig } from "../firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);
const recettesRef = ref(database, 'recettes');

// State variables
let allRecipes = [];
let filteredRecipes = [];
let currentPage = 1;
const recipesPerPage = 16;

// DOM elements
const recipeList = document.getElementById('recipeList');
const searchBar = document.getElementById('searchBar');
const filterDifficulty = document.getElementById('filterDifficulty');
const filterTime = document.getElementById('filterTime');
const filterType = document.getElementById('filterType');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

// Fetch recipes from Firebase
function fetchRecipes() {
    onValue(recettesRef, async (snapshot) => {
        const recipes = snapshot.val();
        if (recipes) {
            allRecipes = await Promise.all(Object.values(recipes).map(async (recipe) => {
                // Log pour vérifier les données des recettes
                console.log('Recette récupérée :', recipe);

                if (!recipe.url_images || recipe.url_images.length === 0 || recipe.url_images[0] === "" || recipe.url_images[0] === "./default-thumbnail.jpg" || recipe.url_images[0] === null) {
                    // Fetch image URLs from Firebase Storage
                    const imageRefs = recipe.imagePaths || []; // Assuming `imagePaths` contains storage paths
                    recipe.url_images = await Promise.all(imageRefs.map(async (path) => {
                        try {
                            return await getDownloadURL(storageRef(storage, path));
                        } catch (error) {
                            console.error(`Erreur lors de la récupération de l'image ${path}:`, error);
                            return '../default-thumbnail.jpg'; // Fallback image
                        }
                    }));
                }
                // Vérifiez que la propriété difficulty est bien définie
                recipe.difficulty = recipe.difficulty || 'not specified'; // Valeur par défaut si non définie
                return recipe;
            }));
            applyFilters();
        } else {
            console.log('Aucune recette trouvée.');
        }
    }, (error) => {
        console.error('Erreur lors de la récupération des recettes :', error);
    });
}

// Apply search and filters
function applyFilters() {
    const searchQuery = searchBar.value?.toLowerCase();
    const difficulty = filterDifficulty.value;
    const time = filterTime.value;
    const type = filterType.value;

    // Log pour déboguer les valeurs des filtres
    console.log('Valeur du filtre difficulty :', difficulty);

    filteredRecipes = allRecipes.filter(recipe => {
        const matchesSearch = recipe.nom && recipe.nom.toLowerCase().includes(searchQuery);
        const matchesDifficulty = !difficulty || recipe.difficulty.toLowerCase() === difficulty.toLowerCase(); // Comparaison insensible à la casse
        const matchesTime = !time || (time === "moins30" && recipe.temps <= 30) ||
            (time === "30-60" && recipe.temps > 30 && recipe.temps <= 60) ||
            (time === "plus60" && recipe.temps > 60);
        const matchesType = !type || recipe.type === type;

        // Log pour vérifier chaque recette filtrée
        console.log('Recette :', recipe.nom, '| Difficulty :', recipe.difficulty, '| Match :', matchesDifficulty);

        return matchesSearch && matchesDifficulty && matchesTime && matchesType;
    });

    currentPage = 1;
    renderRecipes();
}

// Render recipes for the current page
function renderRecipes() {
    recipeList.innerHTML = '';
    const startIndex = (currentPage - 1) * recipesPerPage;
    const endIndex = startIndex + recipesPerPage;
    const recipesToDisplay = filteredRecipes.slice(startIndex, endIndex);

    recipesToDisplay.forEach(recipe => {
        const listItem = document.createElement('li');
        listItem.classList.add('recipe-item');

        const thumbnail = document.createElement('img');
        thumbnail.src = recipe.url_images[0] && recipe.url_images[0] !== "" ? recipe.url_images[0] : './default-thumbnail.jpg';
        thumbnail.alt = recipe.nom;
        thumbnail.classList.add('recipe-thumbnail');

        const details = document.createElement('div');
        details.classList.add('recipe-details');

        const name = document.createElement('h3');
        name.textContent = recipe.nom;

        const difficulty = document.createElement('p');
        difficulty.textContent = recipe.difficulty ? `Difficulty: ${recipe.difficulty}` : 'Difficulty: not specified';
        difficulty.classList.add('recipe-difficulty');

        const prepTime = document.createElement('p');
        prepTime.textContent = recipe.temps ? `Prep Time: ${recipe.temps} mins` : 'Prep Time: not specified';
        prepTime.classList.add('recipe-prep-time');

        details.appendChild(name);
        details.appendChild(difficulty);
        details.appendChild(prepTime);

        listItem.appendChild(thumbnail);
        listItem.appendChild(details);
        recipeList.appendChild(listItem);
    });

    updatePagination();
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
    pageInfo.textContent = `Page ${currentPage}/${totalPages}`;
    prevPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === totalPages;
}

// Event listeners
searchBar.addEventListener('input', applyFilters);
filterDifficulty.addEventListener('change', applyFilters);
filterTime.addEventListener('change', applyFilters);
filterType.addEventListener('change', applyFilters);

prevPage.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderRecipes();
    }
});

nextPage.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderRecipes();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', fetchRecipes);
