function searchByDishName() {
    const dishNameInput = document.getElementById('dishNameInput').value;

    if (dishNameInput.trim() === '') {
        alert('Please enter a dish name');
        return;
    }

    const apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${dishNameInput}`;

    axios.get(apiUrl)
        .then(response => {
            const meal = response.data.meals ? response.data.meals[0] : null;

            if (meal) {
                displayMealDetails(meal);
            } else {
                alert('Dish not found');
            }
        })
        .catch(error => console.error('Error fetching data:', error))
        .finally(() => resetFormInputs());
}

function searchByIngredient() {
    const ingredientInput = document.getElementById('ingredientInput').value;

    if (ingredientInput.trim() === '') {
        alert('Please enter a main ingredient');
        return;
    }

    const apiUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredientInput}`;

    axios.get(apiUrl)
        .then(response => {
            const meals = response.data.meals;

            if (meals) {
                displayDishList(meals);
            } else {
                alert('No dishes found with the specified ingredient');
            }
        })
        .catch(error => console.error('Error fetching data:', error))
        .finally(() => resetFormInputs());
}

function resetFormInputs() {
    document.getElementById('dishNameInput').value = '';
    document.getElementById('ingredientInput').value = '';
}

function displayDishList(meals) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = '';

    meals.slice(0, 12).forEach(meal => {
        const dishCard = createDishCard(meal);
        resultContainer.appendChild(dishCard);
    });
}

function createDishCard(meal, isFavoritePage = false) {
    const dishCard = document.createElement('div');
    dishCard.classList.add('recipe-result');
    dishCard.innerHTML = `
        <h2>${meal.strMeal}</h2>
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" onclick="getMealDetails('${meal.strMeal}')">
        <button onclick="${isFavoritePage ? `removeFavorite('${meal.strMeal}', this)` : `toggleFavorite('${meal.strMeal}', this)`}">
            ${isFavoritePage ? 'Dislike' : (isFavorite(meal.strMeal) ? 'Unlike' : 'Like')}
        </button>
    `;
    return dishCard;
}

function toggleFavorite(dishName, button) {
    let favorites = getFavoritesFromStorage() || [];

    if (isFavorite(dishName)) {
        favorites = favorites.filter(favorite => favorite !== dishName);
        button.innerText = 'Like';
    } else {
        favorites.push(dishName);
        button.innerText = 'Unlike';
    }

    saveFavoritesToStorage(favorites);
}

function removeFavorite(dishName, button) {
    const favorites = getFavoritesFromStorage() || [];

    if (isFavorite(dishName)) {
        const updatedFavorites = favorites.filter(favorite => favorite !== dishName);
        saveFavoritesToStorage(updatedFavorites);

        const resultContainer = document.getElementById('resultContainer');
        const dishCard = button.closest('.recipe-result');
        resultContainer.removeChild(dishCard);
    }
}

function isFavorite(dishName) {
    const favorites = getFavoritesFromStorage() || [];
    return favorites.includes(dishName);
}

function saveFavoritesToStorage(favorites) {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function getFavoritesFromStorage() {
    return JSON.parse(localStorage.getItem('favorites'));
}

function viewFavoriteDishes() {
    const favorites = getFavoritesFromStorage() || [];

    if (favorites.length === 0) {
        alert('No favorite dishes found.');
        return;
    }

    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = '';

    favorites.forEach(favorite => {
        const apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${favorite}`;

        axios.get(apiUrl)
            .then(response => {
                const meal = response.data.meals ? response.data.meals[0] : null;

                if (meal) {
                    resultContainer.appendChild(createDishCard(meal, true));
                }
            })
            .catch(error => console.error('Error fetching data:', error));
    });
}

function getMealDetails(dishName) {
    const apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${dishName}`;

    axios.get(apiUrl)
        .then(response => {
            const meal = response.data.meals ? response.data.meals[0] : null;

            if (meal) {
                displayMealDetails(meal);
            } else {
                alert('Dish details not found');
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

function displayMealDetails(meal) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = `
        <div class="dish-result">
            <h2>${meal.strMeal}</h2>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" onclick="getMealDetails('${meal.strMeal}')">
            <p><strong>Area of Origin:</strong> ${meal.strArea}</p>
            <p><strong>Ingredients:</strong> ${getIngredients(meal)}</p>
            <p><strong>Recipe:</strong> ${meal.strInstructions}</p>
        </div>
    `;
}

function getIngredients(meal) {
    let ingredients = '';
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && measure) {
            ingredients += `${ingredient} - ${measure}, `;
        } else if (ingredient) {
            ingredients += `${ingredient}, `;
        }
    }
    return ingredients.slice(0, -2); 
}


function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const localuser = JSON.parse(localStorage.getItem('user'))

    if (email == localuser.email && password == localuser.password) {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('recipeContainer').style.display = 'block';
    } else {
        alert('Invalid credentials');
    }
}

function signup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    const user = { name, email, password };
    localStorage.setItem('user', JSON.stringify(user));

    alert('Signup successful! Please login.');
}

function logout() {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('recipeContainer').style.display = 'none';
    resetFormInputs();
}

function checkLoggedIn() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('recipeContainer').style.display = 'block';
    } else {
        document.getElementById('authContainer').style.display = 'flex';
        document.getElementById('recipeContainer').style.display = 'none';
    }
}

checkLoggedIn();
