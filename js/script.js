document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('ingredientForm');
    const ingredientList = document.getElementById('ingredientList');
    const addIngredientBtn = document.getElementById('addIngredient');
    const formattedList = document.getElementById('formattedList');
    const copyPlaintextBtn = document.getElementById('copyPlaintext');
    const copyCSVBtn = document.getElementById('copyCSV');
    const recipeNameInput = document.getElementById('recipeName');
    const recipeSourceInput = document.getElementById('recipeSource');

    addIngredientBtn.addEventListener('click', addIngredientRow);
    copyPlaintextBtn.addEventListener('click', () => copyToClipboard('plaintext'));
    copyCSVBtn.addEventListener('click', () => copyToClipboard('csv'));

    // Add event listeners for real-time updates
    recipeNameInput.addEventListener('input', updateIngredientList);
    recipeSourceInput.addEventListener('input', updateIngredientList);
    ingredientList.addEventListener('input', updateIngredientList);

        function addIngredientRow() {
        const newRow = document.createElement('div');
        newRow.className = 'ingredient-row';
        newRow.innerHTML = `
            <div class="autosuggest-container">
                <input type="text" class="ingredient" placeholder="Ingredient" required>
                <div class="suggestion"></div>
            </div>
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
            updateIngredientList();
        });

        // Set up autosuggest for the new ingredient input
        setupAutosuggest(newRow.querySelector('.ingredient'));

        // Trigger update after adding new row
        updateIngredientList();
    }

    function setupAutosuggest(input) {
        const suggestionElement = input.parentElement.querySelector('.suggestion');
        let currentSuggestion = '';

        input.addEventListener('input', updateSuggestion);
        input.addEventListener('keydown', handleKeyDown);
        input.addEventListener('blur', () => {
            setTimeout(() => {
                suggestionElement.innerHTML = '';
            }, 200);
        });

        function updateSuggestion() {
            const inputValue = input.value.toLowerCase();
            currentSuggestion = ingredientsExternalList.find(ingredient => 
                ingredient.toLowerCase().startsWith(inputValue) && ingredient.toLowerCase() !== inputValue
            ) || '';

            if (currentSuggestion && inputValue) {
                suggestionElement.innerHTML = inputValue + '<span>' + currentSuggestion.slice(inputValue.length) + '</span>';
                suggestionElement.style.display = 'block';
            } else {
                suggestionElement.innerHTML = '';
                suggestionElement.style.display = 'none';
            }
        }

        function handleKeyDown(e) {
            if (e.key === 'Tab' && currentSuggestion) {
                e.preventDefault();
                input.value = currentSuggestion;
                updateSuggestion();
                updateIngredientList();
            }
        }
    }

    // Set up autosuggest for initial ingredient input
    setupAutosuggest(document.querySelector('.ingredient'));

    // This updates the output for the ingredients list
    function updateIngredientList() {
        const ingredients = getIngredients();
        const recipeName = recipeNameInput.value;
        const recipeSource = recipeSourceInput.value;

        const plaintextList = formatPlaintext(ingredients, recipeName, recipeSource);
        formattedList.value = plaintextList;
    }

    // Recipe name and ingredients is automatically added when only source is added
    // Recipe Ingredients is automatically added when recipe name is added

    // Perhaps the only thing to change for now is to make sure to only add ingredients when ingredients are added

    function formatPlaintext(ingredients, recipeName, recipeSource) {
        let result = `Recipe Name: ${recipeName}\n`;
        if (recipeSource) result += `Recipe Source: ${recipeSource}\n`;
        result += '\nIngredients:\n';

        ingredients.forEach(item => {
            let line = '';
            if (item.quantity) line += `${item.quantity} `;
            if (item.measurement) line += `${item.measurement} - `;
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
        const recipeName = recipeNameInput.value;
        const recipeSource = recipeSourceInput.value;
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