/*----- constants -----*/
//deck constants added from cardstarter repl
const suits = ['s', 'c', 'd', 'h'];
const ranks = ['02', '03', '04', '05', '06', '07', '08', '09', '10', 'J', 'Q', 'K', 'A'];
// Build a 'master' deck of 'card' objects used to create shuffled decks
const masterDeck = buildMasterDeck();

/*----- app's state (variables) -----*/
let turn, shuffledDeck, playerHand, playerHand2, dealerHand, split,
    betAmount, money, message;

/*----- cached element references -----*/
let dealerHandEl = document.getElementById('dealer-hand');
let playerHandEl = document.getElementById('player-hand');
let playerHand2El = document.getElementById('player-hand2');
let messageEl = document.getElementById('message');
let moneyEl = document.getElementById('money');
let betButtons = document.getElementById('bet-buttons');
let playButtons = document.getElementById('play-buttons');
let resetButtons = document.getElementById('reset-buttons');
let doubleDownEl = document.getElementById('double-down');
let splitEl = document.getElementById('split');
let dealerValueEl = document.getElementById('dealer-value');
let playerValueEl = document.getElementById('player-value');
let playerValue2El = document.getElementById('player-value2');


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
    split = false;
    render();
}

//main render function
function render() {
    moneyEl.innerHTML = `Money: $${money}<br>Current Bet: $${betAmount}`;
    messageEl.textContent = message;
    //hide borders for 2nd hand if it does not exist
    playerHand2.cards.length === 0 ? playerHand2El.style.borderStyle = 'hidden' : playerHand2El.style.borderStyle = 'solid'
    //render hands using helper function
    renderHand(playerHand.cards, playerHandEl);
    renderHand(dealerHand.cards, dealerHandEl);
    renderHand(playerHand2.cards, playerHand2El);
    //display values of hands, only if they exist
    //don't render double down button after first hit
    playerHand.cards.length || split > 2 ? doubleDownEl.style.display = 'none' : doubleDownEl.style.display = '';
    //show split button if player has 2 equal value cards, and the player hasn't already split
    (!split && playerHand.cards.length === 2 && playerHand.cards[0].value === playerHand.cards[1].value) ? splitEl.style.display = '' : splitEl.style.display = 'none';
    //disable hit button on player split hand, if hand is over 21
    (playerHand2.value > 21) ? document.getElementById('hit').disabled = true : document.getElementById('hit').disabled = false;
    //controls what is displayed based on turn, such as buttons, and hiding dealers second card on player turn
    switch (turn) {
        case 'bet':
            playButtons.style.display = 'none';
            betButtons.style.display = '';
            resetButtons.style.display = 'none';
            dealerValueEl.style.display = 'none';
            playerValueEl.style.display = 'none';
            playerValue2El.style.display = 'none';
            break;
        case 'player':
            playButtons.style.display = '';
            betButtons.style.display = 'none';
            resetButtons.style.display = 'none';
            //grab this item here rather than in declared variables because it does not exist until cards are dealt
            document.querySelector('#dealer-hand .card:last-child').classList.add('back-blue');
            dealerValueEl.style.display = '';
            dealerValueEl.textContent = `Dealer: ${dealerHand.value-dealerHand.cards[1].value}`;
            playerValueEl.style.display = '';
            playerValueEl.textContent = `Player: ${playerHand.value}`;
            playerValue2El.style.display = 'none';
            break;
        case 'player2':
            playButtons.style.display = '';
            betButtons.style.display = 'none';
            resetButtons.style.display = 'none';
            // document.querySelector('#dealer-hand .card:last-child').style.display = 'none';
            playerValue2El.style.display = '';
            playerValue2El.textContent = `Player 2nd Hand: ${playerHand2.value}`;
            break;
        case 'dealer':
            playButtons.style.display = 'none';
            betButtons.style.display = 'none';
            resetButtons.style.display = '';
            document.querySelector('#dealer-hand .card:last-child').classList.remove('back-blue');
            dealerValueEl.textContent = `Dealer: ${dealerHand.value}`;
            playerValueEl.textContent = `Player: ${playerHand.value}`;
            split ? playerValue2El.textContent = `Player 2nd Hand: ${playerHand2.value}`: null;
            break;
    }
}

//function to handle bet buttons, including Deal
function handleBetClick(evt) {
    let pressedButton = evt.target.id.replace('bet', '');
    if (pressedButton === 'deal' && betAmount > 0) {
        dealCard(playerHand);
        dealCard(playerHand);
        dealCard(dealerHand);
        dealCard(dealerHand);
        //in case 2 aces are dealt, we want to change one of their values to 1 for dealer
        if (dealerHand.value > 21) checkAce(dealerHand);
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
    if (evt.target.id === 'hit') {
        //if player hits on hand of 2 aces switch one to a value of 1 also allows hitting on 21 if at least one card is an ace
        if (playerHand.value > 21) checkAce(playerHand);
        //determine if the hand is split
        if (turn === 'player' && split === false && playerHand.value < 21) {
            dealCard(playerHand);
            //check aces first before running loss check
            if (playerHand.value > 21) checkAce(playerHand);
            //check to see if player loses the round on hit
            if (playerHand.value > 21) {
                turn = 'dealer'
                betAmount === money ? message = `Bust! You lost all your money!` : message = `Bust! You lose $${betAmount}`;
                money -= betAmount;
            }
        } else if (turn === 'player' && split === true) {
            dealCard(playerHand);
            //check aces first before running loss check
            if (playerHand.value > 21) checkAce(playerHand);
            //check to see if player loses the round on hit
            if (playerHand.value > 21) {
                turn = 'player2'
                message = `Bust! You lose $${betAmount} on your first hand, play the second!`;
                money -= betAmount;
            }
        } else if (turn === 'player2') {
            dealCard(playerHand2);
            //check aces first before running loss check
            if (playerHand2.value > 21) checkAce(playerHand2);
            if (playerHand2.value > 21) {
                turn = 'player2'
                betAmount === money ? message = `Bust! You lost all your money!` : message = `Bust! You lose $${betAmount} on your second hand`;
                money -= betAmount;
            }
        }
    } else if (evt.target.id === 'double-down' && playerHand.value < 21 && money >= 2 * betAmount) {
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
        //if player stands on hand of 2 aces switch one to a value of 1
        if (playerHand.value > 21) checkAce(playerHand);
        if (split && turn === 'player') {
            turn = 'player2'
            message = 'Playing second hand!';
        } else if (turn === 'player2' || !split) {
            //pass value of 1 for standard play
            dealerTurn(1);
        }
    } else if (evt.target.id === 'split' && money >= 2 * betAmount) {
        split = true;
        playerHand.value -= playerHand.cards[1].value;
        playerHand2.cards.push(playerHand.cards.pop());
        playerHand2.value += playerHand2.cards[0].value;
        dealCard(playerHand);
        dealCard(playerHand2);
        message = 'Playing first hand!';
    }
    render();
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
            playerHand2.cards = []
            playerHand2.value = 0;
            dealerHand.cards = [];
            dealerHand.value = 0;
            split = false;
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

//function to handle dealer turn, accepts scaling factor for double down
function dealerTurn(scale) {
    turn = `dealer`;
    if (!split) {
        //dealer must get cards til their hand value is at least 17
        while (dealerHand.value < 17) {
            dealCard(dealerHand);
            //set ace to value of one if it exists and dealers hand has exceeded 21
            if (dealerHand.value > 21) checkAce(dealerHand);
        }
        //check for dealer bust before continuing with comparison
        if (dealerHand.value <= 21) {
            compareHands(playerHand, scale);
        } else {
            message = `Dealer busts! You win $${betAmount * scale}`;
            money += betAmount * scale;
        }
        //only perform checks if at least one hand is available
    } else if(playerHand.value <= 21 || playerHand2.value <= 21){
        //dealer must get cards til their hand value is at least 17
        while (dealerHand.value < 17) {
            dealCard(dealerHand);
            //set ace to value of one if it exists and dealers hand has exceeded 21
            if (dealerHand.value > 21) checkAce(dealerHand);
        }
        //handle both hands if dealer busts and player has at least one hand
        if (dealerHand.value > 21) {
            if (playerHand.value <= 21 && playerHand2.value <= 21) {
                message = `Dealer busts, you win $${betAmount * 2}`;
                money += betAmount * 2;
            } else {
                message = `Dealer busts, you win $${betAmount}`;
                money += betAmount;
            }
        //only run comparisons against both hands if both hands havent bust
        } else if (playerHand.value <= 21 && playerHand2.value <= 21) {
            if (dealerHand.value > playerHand.value && dealerHand.value > playerHand2.value) {
                message = `Dealer hand beats both hands! You lose $${betAmount * 2}`;
                money -= betAmount * 2;
            } else if (dealerHand.value > playerHand.value && dealerHand.value < playerHand2.value) {
                message = `Dealer beats first hand, but loses to second. You break even!`;
            } else if (dealerHand.value < playerHand.value && dealerHand.value > playerHand2.value) {
                message = `Dealer beats second hand, but loses to first. You break even!`;
            } else if (dealerHand.value === playerHand.value && dealerHand.value === playerHand2.value) {
                message = `Dealer ties both hands!`;
            } else if (dealerHand.value === playerHand.value && dealerHand.value < playerHand2.value) {
                message = `Dealer ties first hand, loses to second! You win $${betAmount}`;
                money += betAmount;
            } else if (dealerHand.value < playerHand.value && dealerHand.value === playerHand2.value) {
                message = `Dealer ties second hand, loses to first! You win $${betAmount}`;
                money += betAmount;
            } else if (dealerHand.value > playerHand.value && dealerHand.value === playerHand2.value) {
                message = `Dealer beats first hand, ties second! You lose $${betAmount}`;
                money -= betAmount;
            } else if (dealerHand.value === playerHand.value && dealerHand.value > playerHand2.value) {
                message = `Dealer beats second hand, ties first! You lose $${betAmount}`;
                money -= betAmount;
            } else if (dealerHand.value < playerHand.value && dealerHand.value < playerHand2.value) {
                message = `Dealer loses to both hands! You win $${betAmount * 2}`;
                money += betAmount * 2;
            }
        //use compare hands function on only one hand, if the other has bust
        } else if (playerHand2.value > 21) {
            compareHands(playerHand, 1);
        } else {
            compareHands(playerHand2,1);
        }
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


//function to compare hands against each other at end of dealers turn, only works when a single hand is to be evaluated
function compareHands(pHand, scale) {
    if (pHand.value === dealerHand.value) {
        message = `Both hands are ${pHand.value}, it's a tie`;
    } else if (pHand.value > dealerHand.value) {
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