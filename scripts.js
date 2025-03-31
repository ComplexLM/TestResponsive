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



