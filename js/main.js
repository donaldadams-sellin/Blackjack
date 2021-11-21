/*----- constants -----*/
//deck constants added from cardstarter repl
const suits = ['s', 'c', 'd', 'h'];
const ranks = ['02', '03', '04', '05', '06', '07', '08', '09', '10', 'J', 'Q', 'K', 'A'];
// Build a 'master' deck of 'card' objects used to create shuffled decks
const masterDeck = buildMasterDeck();

/*----- app's state (variables) -----*/
let turn, shuffledDeck, playerHand, dealerHand,
    winner, betAmount, money, message;

/*----- cached element references -----*/
let dealerHandEl = document.getElementById('dealer-hand');
let playerHandEl = document.getElementById('player-hand');
let messageEl = document.getElementById('message');
let moneyEl = document.getElementById('money');
let betAmountEl = document.getElementById('bet-amount');
let betButtons = document.getElementById('bet-buttons');
let playButtons = document.getElementById('play-buttons');
let resetButtons = document.getElementById('reset-buttons');


/*----- event listeners -----*/
betButtons.addEventListener('click', handleBetClick);
playButtons.addEventListener('click', handlePlayClick);
resetButtons.addEventListener('click', handleResetClick);

/*----- functions -----*/
init();
function init() {
    shuffledDeck = getNewShuffledDeck();
    playerHand = {
        cards: [],
        value: 0
    }
    dealerHand = {
        cards: [],
        value: 0
    }
    betAmount = 0;
    money = 500;
    message = 'Place your bet!';
    turn = 'bet';
    winner = null;
    render();
}

//main render function
function render() {
    moneyEl.textContent = `Money: $${money}`;
    messageEl.textContent = message;
    betAmountEl.textContent = `Current Bet: $${betAmount}`
    switch (turn) {
        case 'bet':
            playButtons.style.display = 'none';
            betButtons.style.display = '';
            resetButtons.style.display = 'none';
            break;
        case 'player':
            playButtons.style.display = '';
            betButtons.style.display = 'none';
            resetButtons.style.display = 'none';
            break;
        case 'dealer':
            playButtons.style.display = 'none';
            betButtons.style.display = 'none';
            resetButtons.style.display = '';
            break;
    }
    //render hands using helper function
    renderHand(playerHand.cards, playerHandEl);
    renderHand(dealerHand.cards, dealerHandEl);
}

//function to handle bet buttons, including Deal
function handleBetClick(evt) {
    console.log(evt.target);
    let pressedButton = evt.target.id.replace('bet', '');
    if (pressedButton === 'deal' && betAmount > 0) {
        dealCard(playerHand);
        dealCard(playerHand);
        dealCard(dealerHand);
        dealCard(dealerHand);
        turn = 'player'
        checkBlackjack();
        render();
    } else if (parseInt(pressedButton)) {
        betAmount + parseInt(pressedButton) <= money ? betAmount += parseInt(pressedButton) : null;
        render();
    }
}

//check for blackjack after initial deal
function checkBlackjack() {
    if (playerHand.value !== 21 && dealerHand.value !== 21) {
        return;
    } else if (playerHand.value === 21 && dealerHand.value === 21) {
        winner = 'tie';
        turn = 'dealer';
    } else if (playerHand.value === 21) {
        winner = 'player';
        turn = 'dealer';
        money += Math.floor(1.5 * betAmount);
    } else {
        winner = 'dealer';
        money -= betAmount;
    }

}

//deal card and add to value of hand
function dealCard(hand) {
    let card = shuffledDeck.pop()
    hand.cards.push(card);
    hand.value += card.value;
}
//function to handle play buttons
function handlePlayClick(evt) {
    if (evt.target.id === 'hit' && playerHand.value < 21){
        dealCard(playerHand);
        render();
    };
}

//function to handle reset and next hand buttons
function handleResetClick(evt) {
    //just run init if reset is clicked, only reset some variables for next hand
    if (evt.target.id === 'reset') {
        init();
    } else if (evt.target.id === 'next-hand') {
        message = 'Place your bet!';
        turn = 'bet';
        betAmount = 0;
        playerHand.cards = []
        playerHand.value = 0;
        dealerHand.cards = [];
        dealerHand.value = 0;
        render();
    }
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