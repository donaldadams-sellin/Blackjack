/*----- constants -----*/
//deck constants added from cardstarter repl
const suits = ['s', 'c', 'd', 'h'];
const ranks = ['02', '03', '04', '05', '06', '07', '08', '09', '10', 'J', 'Q', 'K', 'A'];
// Build a 'master' deck of 'card' objects used to create shuffled decks
const masterDeck = buildMasterDeck();

/*----- app's state (variables) -----*/
let turn, shuffledDeck, playerHand, playerHand2, dealerHand,
    betAmount, money, message;

/*----- cached element references -----*/
let dealerHandEl = document.getElementById('dealer-hand');
let playerHandEl = document.getElementById('player-hand');
let messageEl = document.getElementById('message');
let moneyEl = document.getElementById('money');
let betAmountEl = document.getElementById('bet-amount');
let betButtons = document.getElementById('bet-buttons');
let playButtons = document.getElementById('play-buttons');
let resetButtons = document.getElementById('reset-buttons');
let doubleDownEl = document.getElementById('double-down');
let splitEl = document.getElementById('split');


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
        value: 0,

    }
    //only used if hands are split
    playerHand2 = {
        cards: [],
        value: 0,

    }
    dealerHand = {
        cards: [],
        value: 0,
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
    //render hands using helper function
    renderHand(playerHand.cards, playerHandEl);
    renderHand(dealerHand.cards, dealerHandEl);
    //don't render double down button after first hit
    playerHand.cards.length > 2 ? doubleDownEl.style.display = 'none' : doubleDownEl.style.display = '';
    //show split button if player has 2 equal value cards
    (playerHand.cards.length === 2 && playerHand.cards[0].value === playerHand.cards[1].value) ? splitEl.style.display = '' : splitEl.style.display = 'none';
    //change which buttons are displayed based on turn
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
            document.querySelector('#dealer-hand .card:last-child').style.display = 'none';
            break;
        case 'dealer':
            playButtons.style.display = 'none';
            betButtons.style.display = 'none';
            resetButtons.style.display = '';
            document.querySelector('#dealer-hand .card:last-child').style.display = '';
            break;
    }
}

//function to handle bet buttons, including Deal
function handleBetClick(evt) {
    let pressedButton = evt.target.id.replace('bet', '');
    if (pressedButton === 'deal' && betAmount > 0) {
        dealCard(playerHand);
        dealCard(playerHand);
        //in case 2 aces are dealt, we want to change one of their values to 1
        if (playerHand.value > 21) checkAce(playerHand);
        dealCard(dealerHand);
        dealCard(dealerHand);
        if (playerHand.value > 21) checkAce(dealerHand);
        message = ''
        turn = 'player'
        checkBlackjack();
        render();
    } else if (parseInt(pressedButton)) {
        betAmount + parseInt(pressedButton) <= money ? betAmount += parseInt(pressedButton) : null;
        render();
    }
}

//function to handle play buttons
function handlePlayClick(evt) {
    if (evt.target.id === 'hit' && playerHand.value < 21) {
        dealCard(playerHand);
        //check aces first before running loss check
        if (playerHand.value > 21) checkAce(playerHand);
        //check to see if player loses the round on hit
        if (playerHand.value > 21) {
            turn = 'dealer'
            betAmount === money ? message = `Bust! You lost all your money!` : message = `Bust! You lose $${betAmount}`;
            money -= betAmount;
        }
    } else if (evt.target.id === 'double-down' && playerHand.value < 21) {
        dealCard(playerHand);
        //check aces first before running bust check
        if (playerHand.value > 21) checkAce(playerHand);
        //check to see if player loses the round on hit
        if (playerHand.value > 21) {
            turn = 'dealer'
            betAmount === money ? message = `Bust! You lost all your money!` : message = `Bust! You lose $${betAmount * 2}`;
            money -= betAmount * 2;
        } else {
           //pass value of 2 for double down
            dealerTurn(2);
        }
    } else if (evt.target.id === 'stand') {
        //pass value of 1 for standard play
        dealerTurn(1);
    } else if (evt.target.id === 'split'){
        
    }
    render();
}
//function to handle dealer turn, accepts scaling factor for double down
function dealerTurn(scale) {
    turn = `dealer`;
    //dealer must get cards til their hand value is at least 17
    while (dealerHand.value < 17) {
        dealCard(dealerHand);
        //set ace to value of one if it exists and dealers hand has exceeded 21
        if (dealerHand.value > 21) checkAce(dealerHand);
    }

    //check for dealer bust before continuing with comparison
    if (dealerHand.value <= 21) {
        compareHands(scale);
    } else {
        message = `Dealer busts! You win $${betAmount * scale}`;
        money += betAmount * scale;
    }
}

//function to handle reset and next hand buttons
function handleResetClick(evt) {
    //just run init if reset is clicked, only reset some variables for next hand
    if (evt.target.id === 'reset') {
        init();
    } else if (evt.target.id === 'next-hand') {
        if (money === 0) {
            return;
        } else {
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

}
//check for blackjack after initial deal
function checkBlackjack() {
    if (playerHand.value !== 21 && dealerHand.value !== 21) {
        return;
    } else if (playerHand.value === 21 && dealerHand.value === 21) {
        message = `You and the dealer had Blackjack`;
        turn = 'dealer';
    } else if (playerHand.value === 21) {
        message = `You got a Blackjack and win $${Math.floor(1.5 * betAmount)}`;
        turn = 'dealer';
        money += Math.floor(1.5 * betAmount);
    } else {
        betAmount === money ? message = `Dealer has Blackjack! You lost all your money!` : message = `Dealer has Blackjack! You lost $${betAmount}`;
        turn = 'dealer';
        money -= betAmount;
    }

}

//function to change Ace value to one if hand would go over 21 with an ace, in particular only changing one at a time
function checkAce(hand) {
    let idx = hand.cards.findIndex(function (card) {
        return card.value === 11;
    });
    if (idx !== -1) {
        hand.cards[idx].value = 1;
        hand.value -= 10;
    }
}

//deal card and add to value of hand
function dealCard(hand) {
    //make sure we dont run out of cards
    if (shuffledDeck.length === 0) shuffledDeck = getNewShuffledDeck();
    let card = shuffledDeck.pop()
    hand.cards.push(card);
    hand.value += card.value;
}


//function to compare hands against each other at end of dealers turn
function compareHands(scale) {
    if (playerHand.value === dealerHand.value) {
        message = `Both hands are ${playerHand.value}, it's a tie`;
    } else if (playerHand.value > dealerHand.value) {
        message = `You had the better hand! You win $${betAmount * scale}!`
        money += betAmount * scale;
    } else {
        betAmount === money ? message = `Dealer had the better hand! You lost all your money!` : message = `Dealer had the better hand!  You lose $${betAmount * scale}`;
        money -= betAmount * scale;
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