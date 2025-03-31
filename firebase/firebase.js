// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getDatabase, ref, push, update, onValue } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";
import { firebaseConfig } from "../firebaseConfig.js";

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Initialisation de la base de données
const database = getDatabase(app);

// Fonction pour obtenir une référence à la base de données
export function getDatabaseRef(path) {
    return ref(database, path); // Utilise maintenant `database` correctement initialisé
}

const dataContainer = document.getElementById("data-container");
const dataInput = document.getElementById("data-input");
const addButton = document.getElementById("add-button");
const updateKey = document.getElementById("update-key");
const updateValue = document.getElementById("update-value");
const updateButton = document.getElementById("update-button");

// GET (Récupérer des données)
onValue(getDatabaseRef("données"), (snapshot) => {
  dataContainer.innerHTML = "";
  const data = snapshot.val();
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      dataContainer.innerHTML += `<p>${key}: ${value}</p>`;
    });
  } else {
    dataContainer.innerHTML = "<p>Aucune donnée.</p>";
  }
}, (error) => {
  console.error("Erreur lors de la récupération des données :", error);
  dataContainer.innerHTML = "<p>Erreur lors de la récupération des données.</p>";
});

// POST (Ajouter des données)
addButton.addEventListener("click", () => {
  const newData = dataInput.value;
  if (newData) {
    push(getDatabaseRef("données"), newData)
      .then(() => {
        dataInput.value = "";
        alert("Donnée ajoutée avec succès !");
      })
      .catch((error) => {
        console.error("Erreur lors de l'ajout des données :", error);
        alert("Erreur lors de l'ajout des données.");
      });
  }
});

// PUT (Mettre à jour des données)
updateButton.addEventListener("click", () => {
  const keyToUpdate = updateKey.value;
  const newValue = updateValue.value;
  if (keyToUpdate && newValue) {
    const updates = {};
    updates[keyToUpdate] = newValue;
    update(getDatabaseRef("données"), updates)
      .then(() => {
        updateKey.value = "";
        updateValue.value = "";
        alert("Donnée mise à jour avec succès !");
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour des données :", error);
        alert("Erreur lors de la mise à jour des données.");
      });
  }
});