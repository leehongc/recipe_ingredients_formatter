document.addEventListener('DOMContentLoaded', () => {
    const ingredientList = document.getElementById('ingredientList');
    const addIngredientBtn = document.getElementById('addIngredient');
    const formattedList = document.getElementById('formattedList');
    const copyPlaintextBtn = document.getElementById('copyPlaintext');
    const copyCSVBtn = document.getElementById('copyCSV');
    const recipeNameInput = document.getElementById('recipeName');
    const recipeSourceInput = document.getElementById('recipeSource');

    const firstRemoveBtn = ingredientList.querySelector('.ingredient-row .remove-row');
    firstRemoveBtn.addEventListener('click', () => {
        if (ingredientList.querySelectorAll('.ingredient-row').length > 1) {
            ingredientList.removeChild(firstRemoveBtn.closest('.ingredient-row'));
            updateIngredientList();
        } else {
            alert('At least one ingredient row must be present.');
        }
    });

    addIngredientBtn.addEventListener('click', () => {
        // This is to ensure that we have access to the last ingredient so we can check if it's blank later
        const lastIngredientInput = ingredientList.querySelector('.ingredient-row:last-child .ingredient');
        const lastIngredientName = lastIngredientInput ? lastIngredientInput.value : '';
        addIngredientRow(lastIngredientName);

    });    document.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && e.shiftKey) {
          addIngredientRow();
        }
    });
    copyPlaintextBtn.addEventListener('click', () => copyToClipboard('plaintext'));
    copyCSVBtn.addEventListener('click', () => copyToClipboard('csv'));

    recipeNameInput.addEventListener('input', updateIngredientList);
    recipeSourceInput.addEventListener('input', updateIngredientList);
    ingredientList.addEventListener('input', updateIngredientList);

    function addIngredientRow(lastIngredientName) {
        // For issue #16, need to add an eventlistener for ingredientList, similar to how ingredientName was implemented here
        // and need to make sure ingredientList.lenth is > 1
        if (lastIngredientName.length > 0){
            // This is to ensure that ingredient for the last item is not blank
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
        
            // Set up the remove button event for all rows except for first row
            const removeBtn = newRow.querySelector('.remove-row');
            removeBtn.addEventListener('click', () => {
                console.log('Remove button clicked');
                if (ingredientList.querySelectorAll('.ingredient-row').length > 1) {
                    ingredientList.removeChild(newRow);
                    updateIngredientList();
                } else {
                    alert('At least one ingredient row must be present.');
                }
            });
        
            updateIngredientList();
        } else {
            // The last ingredient is blank
            alert('Make sure to add an ingredient.');
        }
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
        if (recipeSource) result += `Recipe Source: ${recipeSource}\n`;

        if (ingredients[0]['ingredient'].length > 0){
            result += '\nIngredients:\n';
            ingredients.forEach(item => {
                let line = '';
                if (item.quantity) line += `${item.quantity} `;
                if (item.measurement) line += `${item.measurement} of `;
                line += item.ingredient;
                if (item.notes) line += `, ${item.notes}`;
                result += `\n- ${line}`;
            });
        }
        console.log('result: '+ result);
        return result;
    }

    function formatCSV(ingredients, recipeName, recipeSource) {
        let result = 'Recipe Name,Source';
        result += `\n"${recipeName}","${recipeSource}"\n`;2
        result += '\nIngredient,Quantity,Measurement,Notes';
        ingredients.forEach(item => {
            result += `\n"${item.ingredient}","${item.quantity}","${item.measurement}","${item.notes}"`;
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

    function updateRemoveRowText(mediaQuery) {
        const removeRowButtons = document.querySelectorAll('.remove-row');
        
        removeRowButtons.forEach(button => {
            if (mediaQuery.matches) {
                button.innerHTML = 'Remove Ingredient <i class="fa-solid fa-trash"></i>';
            } else {
                button.innerHTML = '<i class="fa-solid fa-trash"></i>';
            }
        });
    }
    
    // Create a MediaQueryList object
    const mediaQuery = window.matchMedia("(max-width: 600px)");
    // Call the function at run-time
    updateRemoveRowText(mediaQuery);
    // Attach listener for state changes
    mediaQuery.addEventListener('change', updateRemoveRowText);

});