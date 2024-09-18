document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('ingredientForm');
    const ingredientList = document.getElementById('ingredientList');
    const addIngredientBtn = document.getElementById('addIngredient');
    const generateListBtn = document.getElementById('generateList');
    const formattedList = document.getElementById('formattedList');
    const copyPlaintextBtn = document.getElementById('copyPlaintext');
    const copyCSVBtn = document.getElementById('copyCSV');

    addIngredientBtn.addEventListener('click', addIngredientRow);
    form.addEventListener('submit', generateIngredientList);
    copyPlaintextBtn.addEventListener('click', () => copyToClipboard('plaintext'));
    copyCSVBtn.addEventListener('click', () => copyToClipboard('csv'));

    function addIngredientRow() {
        const newRow = document.createElement('div');
        newRow.className = 'ingredient-row';
        newRow.innerHTML = `
            <input type="text" class="ingredient" placeholder="Ingredient" required>
            <input type="number" class="quantity" placeholder="Quantity" step="0.01" min="0" required>
            <select class="measurement">
                <option value="">Select unit</option>
                <option value="cup">cup</option>
                <option value="tbsp">tbsp</option>
                <option value="tsp">tsp</option>
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="oz">oz</option>
                <option value="lb">lb</option>
            </select>
            <input type="text" class="notes" placeholder="Notes (e.g., chopped)">
            <button type="button" class="remove-row">-</button>
        `;
        ingredientList.appendChild(newRow);

        const removeBtn = newRow.querySelector('.remove-row');
        removeBtn.addEventListener('click', () => {
            ingredientList.removeChild(newRow);
        });
    }

    function generateIngredientList(e) {
        e.preventDefault();
        const ingredients = getIngredients();
        const recipeName = document.getElementById('recipeName').value;
        const recipeSource = document.getElementById('recipeSource').value;

        const plaintextList = formatPlaintext(ingredients, recipeName, recipeSource);
        formattedList.value = plaintextList;
    }

    function formatPlaintext(ingredients, recipeName, recipeSource) {
        let result = `Recipe: ${recipeName}\n`;
        if (recipeSource) result += `Source: ${recipeSource}\n`;
        result += '\nIngredients:\n';

        ingredients.forEach(item => {
            let line = '';
            if (item.quantity) line += `${item.quantity} `;
            if (item.measurement) line += `${item.measurement} `;
            line += item.ingredient;
            if (item.notes) line += `, ${item.notes}`;
            result += `- ${line}\n`;
        });

        return result;
    }

    function formatCSV(ingredients, recipeName, recipeSource) {
        let result = 'Recipe Name,Source\n';
        result += `"${recipeName}","${recipeSource}"\n\n`;
        result += 'Ingredient,Quantity,Measurement,Notes\n';
        ingredients.forEach(item => {
            result += `"${item.ingredient}","${item.quantity}","${item.measurement}","${item.notes}"\n`;
        });
        return result;
    }

    function copyToClipboard(format) {
        const recipeName = document.getElementById('recipeName').value;
        const recipeSource = document.getElementById('recipeSource').value;
        const ingredients = getIngredients();
        
        const text = format === 'csv' 
            ? formatCSV(ingredients, recipeName, recipeSource) 
            : formattedList.value;
        
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }

    function getIngredients() {
        const ingredients = [];
        const rows = ingredientList.querySelectorAll('.ingredient-row');
        rows.forEach(row => {
            ingredients.push({
                ingredient: row.querySelector('.ingredient').value,
                quantity: row.querySelector('.quantity').value,
                measurement: row.querySelector('.measurement').value,
                notes: row.querySelector('.notes').value
            });
        });
        return ingredients;
    }
});


// This is for the ingredients autocomplete:
const input = document.getElementById('autoInput');
const suggestionElement = document.getElementById('suggestion');

const fruits = [
    'apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew', 'imbe', 'jackfruit',
    'kiwi', 'lemon', 'mango', 'nectarine', 
    'orange', 'olive', 'oakberry', 'opuntia', 'otaheite apple', 'oregon grape',
    'papaya', 'quince', 'raspberry', 'strawberry', 'tangerine', 'ugli fruit', 'vanilla bean', 'watermelon', 'xigua', 'yuzu', 'zucchini'
];
let currentSuggestion = '';

input.addEventListener('input', updateSuggestion);
input.addEventListener('keydown', handleKeyDown);

function updateSuggestion() {
    const inputValue = input.value.toLowerCase();
    currentSuggestion = fruits.find(fruit => 
        fruit.toLowerCase().startsWith(inputValue) && fruit.toLowerCase() !== inputValue
    ) || '';

    if (currentSuggestion && inputValue) {
        suggestionElement.innerHTML = inputValue + '<span>' + currentSuggestion.slice(inputValue.length) + '</span>';
    } else {
        suggestionElement.innerHTML = '';
    }
}

function handleKeyDown(e) {
    if (e.key === 'Tab' && currentSuggestion) {
        e.preventDefault();
        input.value = currentSuggestion;
        updateSuggestion();
    }
}