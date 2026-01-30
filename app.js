// Define a 78-card tarot deck with names and major/minor type
const tarotDeck = [
    {name: 'The Fool', type: 'Major Arcana'},
    {name: 'The Magician', type: 'Major Arcana'},
    {name: 'The High Priestess', type: 'Major Arcana'},
    {name: 'The Empress', type: 'Major Arcana'},
    {name: 'The Emperor', type: 'Major Arcana'},
    {name: 'The Hierophant', type: 'Major Arcana'},
    {name: 'The Lovers', type: 'Major Arcana'},
    {name: 'The Chariot', type: 'Major Arcana'},
    {name: 'Strength', type: 'Major Arcana'},
    {name: 'The Hermit', type: 'Major Arcana'},
    {name: 'Wheel of Fortune', type: 'Major Arcana'},
    {name: 'Justice', type: 'Major Arcana'},
    {name: 'The Hanged Man', type: 'Major Arcana'},
    {name: 'Death', type: 'Major Arcana'},
    {name: 'Temperance', type: 'Major Arcana'},
    {name: 'The Devil', type: 'Major Arcana'},
    {name: 'The Tower', type: 'Major Arcana'},
    {name: 'The Star', type: 'Major Arcana'},
    {name: 'The Moon', type: 'Major Arcana'},
    {name: 'The Sun', type: 'Major Arcana'},
    {name: 'Judgment', type: 'Major Arcana'},
    {name: 'The World', type: 'Major Arcana'},
    // ... Placeholder for minor arcana cards
    {name: 'Ace of Cups', type: 'Minor Arcana'},
    {name: 'Two of Cups', type: 'Minor Arcana'},
    {name: 'Three of Cups', type: 'Minor Arcana'},
    {name: 'Four of Cups', type: 'Minor Arcana'}
    // Add other minor cards as needed
];

const selectedCards = [];
let requestLock = false;
let cooldown = 3000;

document.getElementById('card-list').innerHTML = tarotDeck.map(card => `<div>${card.name} (${card.type})</div>`).join('');

// Search filter
document.getElementById('search').addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const filteredCards = tarotDeck.filter(card => card.name.toLowerCase().includes(query));
    document.getElementById('card-list').innerHTML = filteredCards.map(card => `<div>${card.name} (${card.type})</div>`).join('');
});

// Card selection toggle
document.getElementById('card-list').addEventListener('click', function(event) {
    const cardName = event.target.innerText.split(' (')[0];
    if (selectedCards.includes(cardName)) {
        selectedCards.splice(selectedCards.indexOf(cardName), 1);
    } else {
        selectedCards.push(cardName);
    }
});

// Handle question and topic fields
const topicField = document.getElementById('topic');
const questionField = document.getElementById('question');

// AI toggle and API key storage
document.getElementById('toggle-ai').addEventListener('change', function() {
    if (this.checked) {
        const apiKey = document.getElementById('api-key').value;
        sessionStorage.setItem('apiKey', apiKey);
    }
});

// Call Gemini API
async function callGemini() {
    if (!requestLock) {
        requestLock = true; // Lock request
        const apiKey = sessionStorage.getItem('apiKey');
        const prompt = `Topic: ${topicField.value}, Question: ${questionField.value}, Cards: ${JSON.stringify(selectedCards)}`;
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                body: JSON.stringify({ prompt }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            console.log(data);
            // Handle response data accordingly
            requestLock = false; // Unlock request after processing
        } catch (error) {
            if (error.message.includes('429')) {
                await new Promise(resolve => setTimeout(resolve, cooldown));
                cooldown = Math.min(cooldown * 2, 60000); // Exponential backoff logic
                callGemini(); // Retry API call
            } else {
                console.error('API call failed:', error);
                requestLock = false; // Ensure the lock is released on error
            }
        }
    } else {
        console.log('Request in progress, please wait.');
    }
}

// Basic offline interpretation fallback
if (!sessionStorage.getItem('apiKey')) {
    console.warn('AI is disabled. Offline interpretation may apply.');
}