/*----- constants -----*/
//deck constants added from cardstarter repl
const suits = ['s', 'c', 'd', 'h'];
const ranks = ['02', '03', '04', '05', '06', '07', '08', '09', '10', 'J', 'Q', 'K', 'A'];
// Build a 'master' deck of 'card' objects used to create shuffled decks
const masterDeck = buildMasterDeck();

/*----- app's state (variables) -----*/
let shuffledDeck, playerHand, dealerHand, playerValue, dealerValue, betAmount, money, message;

/*----- cached element references -----*/
let dealerHandEl = document.getElementById('dealer-hand');
let playerHandEl = document.getElementById('player-hand');
let messageEl = document.getElementById('message');
let moneyEl = document.getElementById('money');
let betAmountEl = document.getElementById('bet-amount');


/*----- event listeners -----*/



/*----- functions -----*/
init();
function init() {
    shuffledDeck = getNewShuffledDeck();
    playerHand = []
    playerValue = 0;
    dealerHand = []
    dealerValue = 0;
    betAmount = 0;
    money = 500;
    message = 'Place your bet!';
    render();
}
//main render function

function render(){
    moneyEl.textContent = `Money: $${money}`;
    messageEl.textContent = message;
    betAmountEl.textContent = `Current Bet: $${betAmount}`
    renderHand(playerHand,playerHandEl);
    renderHand(dealerHand, dealerHandEl);
}




//deck building function taken from cardstarter repl
function buildMasterDeck() {
    const deck = [];
    // Use nested forEach to generate card objects
    suits.forEach(function (suit) {
        ranks.forEach(function (rank) {
            deck.push({
                // The 'face' property maps to the library's CSS classes for cards
                face: `${suit}${rank}`,
                // Setting the 'value' property for game of blackjack, not war
                value: Number(rank) || (rank === 'A' ? 11 : 10)
            });
        });
    });
    return deck;
}
//deck shuffling function added from cardstarter repl
function getNewShuffledDeck() {
    // Create a copy of the masterDeck (leave masterDeck untouched!)
    const tempDeck = [...masterDeck];
    const newShuffledDeck = [];
    while (tempDeck.length) {
        // Get a random index for a card still in the tempDeck
        const rndIdx = Math.floor(Math.random() * tempDeck.length);
        // Note the [0] after splice - this is because splice always returns an array and we just want the card object in that array
        newShuffledDeck.push(tempDeck.splice(rndIdx, 1)[0]);
    }
    return newShuffledDeck;
}

//full deck rendering function from cardstarter repl, will build hand rendering function based on it
//modified rendering function, based off of cardstarter repl
function renderHand(hand, handEl) {
    handEl.innerHTML = '';
    // Let's build the cards as a string of HTML
    let cardsHtml = '';
    hand.forEach(function (card) {
        cardsHtml += `<div class="card ${card.face}"></div>`;
    });
    handEl.innerHTML = cardsHtml;
}