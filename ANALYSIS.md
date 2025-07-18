# Audit de testabilité

## Classification des fichiers


| Fichier / Classe              | Type de test recommandé | Outils utilisables           | Justification                                                | Priorité |
|------------------------------|--------------------------|------------------------------|--------------------------------------------------------------|----------|
| `TodoController.js`          | Test unitaire            | Jest                         | Tester les fonctions CRUD du contrôleur                      | 1        |
| `models/Todo.js`             | Test unitaire            | Jest                         | Tester les méthodes et la logique du modèle Todo             | 2        |
| `components/AddTodoForm.js`  | Test fonctionnel         | Jest, React Testing Library  | Tester le rendu et le comportement du formulaire d’ajout     | 1        |
| `models/TodoList.js`         | Test fonctionnel         | Jest                         | Vérifier la logique de gestion de la liste                   | 2        |
| `App.js`                     | Test d’intégration       | Jest, React Testing Library  | Vérifier le rendu global et les interactions de l’application| 1        |
| `todoApi.js`                 | Test d’intégration       | Jest, Supertest                   | Vérifier les appels API et les interactions réseau           | 2        |
| `components/TodoItem.js`     | Test fonctionnel         | Jest, React Testing Library  | Tester le rendu et les interactions d’un item Todo           | 2        |
| `utils/validation.js`        | Test unitaire            | Jest                         | Vérifier la validité des fonctions de validation             | 3        |




## Stratégie de test adoptée

# Priorité 1 (Tests immédiats)
Justification : Ces fichiers sont prioritaires car ils contiennent la logique métier principale de l'application. Les fonctions CRUD sont essentielles pour le fonctionnement de base de l'application.
Impact sur l'application : Les erreurs dans ces fichiers peuvent entraîner des dysfonctionnements majeurs, affectant directement l'expérience utilisateur et la fiabilité de l'application.

# Priorité 2 (Tests importants)
Fichiers avec dépendances modérées : Ces fichiers nécessitent des tests pour s'assurer que les interactions entre les différents modules fonctionnent comme prévu.
Nécessitent des mocks/stubs : Les tests pour ces fichiers peuvent nécessiter des mocks pour simuler les dépendances externes, comme les appels à une base de données.

# Priorité 3 (Tests complexes)
Tests d'intégration : Ces tests vérifient que les différents modules de l'application fonctionnent ensemble correctement.
Workflows complets : Ces tests simulent des scénarios utilisateur complets pour s'assurer que l'application se comporte comme attendu dans des conditions réelles.


## Difficultés identifiées

# Défis techniques rencontrés :

Gestion des dépendances : Assurer que toutes les dépendances sont correctement mockées pour les tests unitaires.
Tests d'intégration : Configurer un environnement de test qui simule fidèlement l'environnement de production.
Tests fonctionnels : S'assurer que les tests fonctionnels couvrent tous les cas d'utilisation et interactions utilisateur.
Solutions proposées :

Utilisation de bibliothèques de mocking : Utiliser des bibliothèques comme Jest pour mocker les dépendances externes.
Configuration d'environnements de test : Utiliser des outils comme Docker pour créer des environnements de test reproductibles.
Automatisation des tests : Intégrer les tests dans un pipeline CI/CD pour s'assurer qu'ils sont exécutés régulièrement et que les résultats sont surveillés.
