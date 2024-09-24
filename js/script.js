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
    document.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && e.shiftKey) {
          addIngredientRow();
        }
    });
    copyPlaintextBtn.addEventListener('click', () => copyToClipboard('plaintext'));
    copyCSVBtn.addEventListener('click', () => copyToClipboard('csv'));

    recipeNameInput.addEventListener('input', updateIngredientList);
    recipeSourceInput.addEventListener('input', updateIngredientList);
    ingredientList.addEventListener('input', updateIngredientList);

    function addIngredientRow() {
        const newRow = document.createElement('div');
        newRow.className = 'ingredient-row';
        newRow.innerHTML = `
            <div class="ingredient-quantity">
                <input type="text" class="ingredient" placeholder="Ingredient" required>
                <div class="suggestion"></div>
                <input type="number" class="quantity" placeholder="Quantity" step="0.01" min="0" required>
            </div>
            <div class="measurement-notes">
                <select class="measurement">
                    <option value="">Select unit</option>
                    <option value="cup">cup</option>
                    <option value="tbsp">tbsp</option>
                    <option value="tsp">tsp</option>
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="oz">oz</option>
                </select>
                <input type="text" class="notes" placeholder="Notes (e.g., chopped)">
                <button type="button" class="remove-row">-</button>
            </div>   
        `;
        
        ingredientList.appendChild(newRow);
    
        // Set up autosuggest for the newly added ingredient input
        const ingredientInput = newRow.querySelector('.ingredient');
        setupAutosuggest(ingredientInput);
    
        // Set up the remove button event
        const removeBtn = newRow.querySelector('.remove-row');
        removeBtn.addEventListener('click', () => {
            ingredientList.removeChild(newRow);
            updateIngredientList();
        });
    
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
                suggestionElement.innerHTML = `<span class="suggestion-text">${inputValue}${currentSuggestion.slice(inputValue.length)}</span>`;
                suggestionElement.style.display = 'block';
                
                // Add click event listener to the suggestion
                suggestionElement.querySelector('.suggestion-text').addEventListener('click', () => {
                    input.value = currentSuggestion;
                    suggestionElement.innerHTML = '';
                    updateIngredientList();
                });
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

    setupAutosuggest(document.querySelector('.ingredient'));

    function updateIngredientList() {
        const ingredients = getIngredients();
        const recipeName = recipeNameInput.value;
        const recipeSource = recipeSourceInput.value;

        const plaintextList = formatPlaintext(ingredients, recipeName, recipeSource);
        formattedList.value = plaintextList;
    }

    // Update this so when only recipeName or recipeSource is inputted, the ingredients list would not auto populate
    function formatPlaintext(ingredients, recipeName, recipeSource) {
        let result = `Recipe Name: ${recipeName}\n`;

        console.log('ingredients.length: '+ ingredients.length);
        console.log('ingredients[0]: '+ ingredients[0].value);
        ingredients.forEach(ingredient => console.log('each ingredient: '+ ingredient));
        

        if (ingredients.length==1){
            // This is where only recipeName and/or recipeSource is inputted
            if (recipeSource) result += `Recipe Source: ${recipeSource}\n`;
        } else {
            result += '\nIngredients:\n';
            ingredients.forEach(item => {
                let line = '';
                if (item.quantity) line += `${item.quantity} `;
                if (item.measurement) line += `${item.measurement} - `;
                line += item.ingredient;
                if (item.notes) line += `, ${item.notes}`;
                result += `- ${line}\n`;
            });
        }
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