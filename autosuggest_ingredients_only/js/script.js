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
