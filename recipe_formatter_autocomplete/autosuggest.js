const ingredientInput = document.getElementById('ingredient');
const suggestionsDiv = document.getElementById('suggestions');

const ingredients = ['Apple', 'Banana', 'Butter', 'Carrot', 'Dill', 'Egg', 'Flour', 'Garlic', 'Honey', 'Ice cream', 'Jalapeno'];
let activeSuggestionIndex = -1;

function showSuggestions(inputValue) {
    const matchingSuggestions = ingredients.filter(ing =>
        ing.toLowerCase().startsWith(inputValue.toLowerCase())
    );

    if (matchingSuggestions.length > 0 && inputValue.length > 0) {
        suggestionsDiv.innerHTML = matchingSuggestions
            .map((s, index) => `<div class="suggestion${index === 0 ? ' active' : ''}">${s}</div>`)
            .join('');
        suggestionsDiv.style.display = 'block';
        activeSuggestionIndex = 0;
    } else {
        suggestionsDiv.style.display = 'none';
        activeSuggestionIndex = -1;
    }
}

ingredientInput.addEventListener('input', function () {
    showSuggestions(this.value);
});

ingredientInput.addEventListener('keydown', function (e) {
    const suggestions = suggestionsDiv.querySelectorAll('.suggestion');

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeSuggestionIndex = (activeSuggestionIndex + 1) % suggestions.length;
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeSuggestionIndex = (activeSuggestionIndex - 1 + suggestions.length) % suggestions.length;
    } else if (e.key === 'Tab' || e.key === 'Enter') {
        if (activeSuggestionIndex !== -1) {
            e.preventDefault();
            this.value = suggestions[activeSuggestionIndex].textContent;
            suggestionsDiv.style.display = 'none';
        }
    } else if (e.key === 'Escape') {
        suggestionsDiv.style.display = 'none';
    }

    suggestions.forEach((s, index) => {
        s.classList.toggle('active', index === activeSuggestionIndex);
    });
});

// Hide suggestions when clicking outside
document.addEventListener('click', function (e) {
    if (e.target !== ingredientInput && e.target !== suggestionsDiv) {
        suggestionsDiv.style.display = 'none';
    }
});