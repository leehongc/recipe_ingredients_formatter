// Add Ingredient Line
document.getElementById('addIngredient').addEventListener('click', function() {
    const ingredientLine = document.createElement('div');
    ingredientLine.classList.add('ingredient-line');
    ingredientLine.innerHTML = `
        <input type="text" name="ingredient" placeholder="Ingredient" required>
        <input type="number" name="quantity" placeholder="Quantity" required>
        <input type="text" name="measurement" placeholder="Measurement">
        <input type="text" name="notes" placeholder="Notes">
    `;
    document.getElementById('ingredients').appendChild(ingredientLine);
});

// Handle Form Submission
document.getElementById('ingredientForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    let output = '';
    const dishName = document.getElementById('dishName').value;
    const source = document.getElementById('source').value;

    // Add dish name and source to output
    output += `Dish: ${dishName}\nSource: ${source}\n\nIngredients:\n`;

    // Loop through all ingredient lines and format the output
    const ingredientLines = document.querySelectorAll('.ingredient-line');
    ingredientLines.forEach(line => {
        const ingredient = line.querySelector('input[name="ingredient"]').value;
        const quantity = line.querySelector('input[name="quantity"]').value;
        const measurement = line.querySelector('input[name="measurement"]').value;
        const notes = line.querySelector('input[name="notes"]').value;

        // Format each ingredient line
        output += `${quantity} ${measurement} ${ingredient}`;
        if (notes) output += ` (${notes})`;
        output += '\n';
    });

    // Display the formatted output in the output box
    document.getElementById('output').textContent = output;
});

// Copy Output to Clipboard
document.getElementById('copyButton').addEventListener('click', function() {
    const outputText = document.getElementById('output').textContent;
    if (outputText) {
        navigator.clipboard.writeText(outputText).then(function() {
            alert('Copied to clipboard!');
        }).catch(function(error) {
            alert('Failed to copy text: ' + error);
        });
    }
});