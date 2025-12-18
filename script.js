document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('loginButton');
  const loggedInUserDisplay = document.getElementById('loggedInUserDisplay');
  const loginPanel = document.getElementById('loginPanel');
  const closeLoginBtn = loginPanel.querySelector('.close-btn');
  const loginForm = document.getElementById('loginForm');
  const eventsButton = document.getElementById('eventsButton');

  const myDropdown = document.getElementById('myDropdown');
  const sportsContent = document.getElementById('sportsContent');
  const gamesContent = document.getElementById('gamesContent');
  const openBetsButton = document.getElementById('openBetsButton');
  const betsListSection = document.getElementById('betsListSection');
  const betsList = document.getElementById('betsList');
  const placeBetForm = document.getElementById('placeBetForm');
  const teamInput = document.getElementById('teamInput');
  const amountInput = document.getElementById('amountInput');

  // --- Slot Machine ---
  const chipsDisplay = document.getElementById('chipsDisplay');
  const setChipsInput = document.getElementById('setChipsInput');
  const setChipsButton = document.getElementById('setChipsButton');
  const slots = document.querySelectorAll('#slots .slot');
  const spinButton = document.getElementById('spinButton');
  const resultMessage = document.getElementById('resultMessage');

  // Admin panel elements
  const adminPanel = document.getElementById('adminPanel');
  const adminUserSelect = document.getElementById('adminUserSelect');
  const chipAmountInput = document.getElementById('chipAmountInput');
  const updateChipsButton = document.getElementById('updateChipsButton');
  const adminMsg = document.getElementById('adminMsg');

  const symbols = ['🍒', '🍋', '🔔', '💎', '🎲', '7'];
  let chips = 0;

  // Initial chips per user
  const initialChipsPerUser = {
    braxton: 10,
    brynley: 20,
    aaron: 15,
    riggin: 25,
    warren: 30,
    liam: 5,
    asher: 40
  };

  // Load betsData from localStorage or initialize empty
  let betsData = {};
  const savedBetsData = localStorage.getItem('betsData');
  if (savedBetsData) {
    try {
      betsData = JSON.parse(savedBetsData);
    } catch {
      betsData = {};
    }
  }

  const users = {
    braxton: 'betting',
    brynley: 'forsaken777',
    aaron: 'bigbaddie',
    riggin: 'hogrider67',
    warren: 'goonmaster67',
    liam: 'ultimategonner69',
    asher: 'nerd1234'
  };

  // User session functions
  function getLoggedInUser() {
    return localStorage.getItem('loggedInUser') || null;
  }

  function setLoggedInUser(username) {
    if (username) {
      localStorage.setItem('loggedInUser', username);
    } else {
      localStorage.removeItem('loggedInUser');
    }
  }

  // Bets saving
  function saveBetsData() {
    localStorage.setItem('betsData', JSON.stringify(betsData));
  }

  // Chips saver/loader per user
  function loadChips() {
    const user = getLoggedInUser();
    if (!user) {
      chips = 0;
    } else {
      const stored = localStorage.getItem(`chips_${user}`);
      if (stored !== null) {
        chips = parseInt(stored, 10);
      } else {
        chips = initialChipsPerUser[user] || 0;
        saveChips();
      }
    }
  }

  function saveChips() {
    const user = getLoggedInUser();
    if (user) {
      localStorage.setItem(`chips_${user}`, chips.toString());
    }
  }

  // Update chips UI and button state
  function updateChipsDisplay() {
    chipsDisplay.textContent = `Chips: ${chips}`;
    spinButton.disabled = chips <= 0;
    spinButton.style.backgroundColor = chips <= 0 ? '#666' : 'red';
    resultMessage.textContent = '';
    if (setChipsInput) setChipsInput.value = chips;
  }

  // Slot machine spin
  function spinSlots() {
    if (chips <= 0) {
      resultMessage.textContent = 'Not enough chips to spin.';
      return;
    }
    chips--;
    saveChips();
    updateChipsDisplay();

    let spinCount = 12;
    const spinInterval = setInterval(() => {
      slots.forEach(slot => {
        slot.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      });
      spinCount--;
      if (spinCount <= 0) {
        clearInterval(spinInterval);
        checkWin();
      }
    }, 80);
  }

  function checkWin() {
    const results = [...slots].map(slot => slot.textContent);

    // Check 3 in a row
    if (results[0] === results[1] && results[1] === results[2]) {
      const winnings = 5;
      chips += winnings;
      resultMessage.textContent = `🎉 Jackpot! You won ${winnings} chips!`;
    }
    // Check 2 in a row (either first two or last two match)
    else if (results[0] === results[1] || results[1] === results[2]) {
      const winnings = 2;
      chips += winnings;
      resultMessage.textContent = `You matched two in a row! You won ${winnings} chips!`;
    } else {
      resultMessage.textContent = 'Try again!';
    }
    saveChips();
    updateChipsDisplay();
  }

  spinButton.addEventListener('click', spinSlots);

  // Show/hide sections according to dropdown and login 
  function showPlaceBetForm(show) {
    if (show) placeBetForm.classList.remove('hidden');
    else placeBetForm.classList.add('hidden');
  }

  function showContentBasedOnSelection() {
    const selected = myDropdown.value;
    const user = getLoggedInUser();

    if (selected === 'sports' && user) {
      sportsContent.classList.remove('hidden');
      gamesContent.classList.add('hidden');
      showPlaceBetForm(true);
    } else if (selected === 'games' && user) {
      sportsContent.classList.add('hidden');
      gamesContent.classList.remove('hidden');
      showPlaceBetForm(false);
      betsListSection.classList.add('hidden');

      loadChips();
      updateChipsDisplay();

      resetBlackjackOnGames();
    } else {
      sportsContent.classList.add('hidden');
      gamesContent.classList.add('hidden');
      betsListSection.classList.add('hidden');
      showPlaceBetForm(false);
    }
  }

  myDropdown.addEventListener('change', showContentBasedOnSelection);

  function updateLoginUI() {
    const user = getLoggedInUser();
    if (user) {
      loginButton.classList.add('hidden');
      loggedInUserDisplay.textContent = user + ' (Logout)';
      loggedInUserDisplay.classList.remove('hidden');
      showContentBasedOnSelection();
    } else {
      loginButton.classList.remove('hidden');
      loggedInUserDisplay.classList.add('hidden');
      loggedInUserDisplay.textContent = '';
      sportsContent.classList.add('hidden');
      gamesContent.classList.add('hidden');
      betsListSection.classList.add('hidden');
      showPlaceBetForm(false);
    }
  }

  placeBetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = getLoggedInUser();
    if (!user) {
      alert('Please log in to place bets.');
      return;
    }
    const team = teamInput.value.trim();
    const amount = parseFloat(amountInput.value);
    if (!team) {
      alert('Please enter a team.');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }
    if (!betsData[user]) betsData[user] = [];
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    betsData[user].push({ team, amount, timestamp });
    saveBetsData();

    alert(`Bet placed: $${amount} on ${team}`);
    placeBetForm.reset();

    betsListSection.classList.remove('hidden');
    renderBets();
  });

  loginButton.addEventListener('click', () => {
    loginPanel.classList.add('open');
    loginPanel.setAttribute('aria-hidden', 'false');
  });
  closeLoginBtn.addEventListener('click', () => {
    loginPanel.classList.remove('open');
    loginPanel.setAttribute('aria-hidden', 'true');
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = loginForm.username.value.trim();
    const password = loginForm.password.value;

    if (users[username] && users[username] === password) {
      setLoggedInUser(username);
      updateAllUI();
      alert('Welcome, ' + username + '!');

      loginPanel.classList.remove('open');
      loginPanel.setAttribute('aria-hidden', 'true');
      loginForm.reset();

      showContentBasedOnSelection();

      loadChips();
      updateChipsDisplay();
    } else {
      alert('Invalid username or password.');
    }
  });

  loggedInUserDisplay.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
      setLoggedInUser(null);
      updateAllUI();
      alert('Logged out.');

      chips = 0;
      saveChips();
      updateChipsDisplay();
    }
  });

  openBetsButton.addEventListener('click', () => {
    const user = getLoggedInUser();
    if (!user) {
      alert('You must be logged in to see bets.');
      return;
    }
    betsListSection.classList.remove('hidden');
    renderBets();
  });

  function renderBets() {
    betsList.innerHTML = '';

    const allBets = [];
    for (const username in betsData) {
      const userBets = betsData[username];
      userBets.forEach(bet => {
        allBets.push({
          user: username,
          team: bet.team,
          amount: bet.amount,
          timestamp: bet.timestamp
        });
      });
    }

    if (allBets.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No bets placed yet.';
      betsList.appendChild(li);
      return;
    }

    allBets.forEach(bet => {
      const li = document.createElement('li');
      li.textContent = `${bet.user} bet $${bet.amount} on ${bet.team} at ${bet.timestamp}`;
      betsList.appendChild(li);
    });
  }

  // --- Admin Panel ---
  function updateAdminPanelVisibility() {
    if (getLoggedInUser() === 'braxton') {
      adminPanel.classList.remove('hidden');
    } else {
      adminPanel.classList.add('hidden');
      adminMsg.textContent = '';
      chipAmountInput.value = '';
      adminUserSelect.value = '';
    }
  }

  function updateUserChips(username, amount) {
    if (!users.hasOwnProperty(username)) {
      return false;
    }
    let currentChips = 0;
    const stored = localStorage.getItem(`chips_${username}`);
    if (stored !== null) {
      currentChips = parseInt(stored, 10);
    } else {
      currentChips = initialChipsPerUser[username] || 0;
    }
    let updated = currentChips + amount;
    if (updated < 0) updated = 0;

    localStorage.setItem(`chips_${username}`, updated.toString());

    if (getLoggedInUser() === username) {
      chips = updated;
      saveChips();
      updateChipsDisplay();
    }
    return true;
  }

  updateChipsButton.addEventListener('click', () => {
    adminMsg.textContent = '';
    const targetUser = adminUserSelect.value;
    const amountVal = parseInt(chipAmountInput.value, 10);

    if (!targetUser) {
      adminMsg.style.color = 'red';
      adminMsg.textContent = 'Please select a user.';
      return;
    }
    if (isNaN(amountVal)) {
      adminMsg.style.color = 'red';
      adminMsg.textContent = 'Please enter a valid integer amount.';
      return;
    }
    const success = updateUserChips(targetUser, amountVal);
    if (success) {
      adminMsg.style.color = 'lightgreen';
      adminMsg.textContent = `Successfully updated ${targetUser}'s chips by ${amountVal}.`;
      chipAmountInput.value = '';
    } else {
      adminMsg.style.color = 'red';
      adminMsg.textContent = 'Failed to update chips. User not found.';
    }
  });

  // Upcoming Events button
  eventsButton.addEventListener('click', () => {
    alert('No new events');
  });

  // --- Blackjack Game ---

  const blackjackBetInput = document.getElementById('blackjackBet');
  const dealButton = document.getElementById('dealButton');
  const blackjackStatus = document.getElementById('blackjackStatus');
  const playerCardsDiv = document.getElementById('playerCards');
  const dealerCardsDiv = document.getElementById('dealerCards');
  const hitButton = document.getElementById('hitButton');
  const standButton = document.getElementById('standButton');

  let deck = [];
  let playerHand = [];
  let dealerHand = [];
  let currentBet = 0;
  let blackjackInProgress = false;

  function createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const newDeck = [];
    suits.forEach(suit => {
      ranks.forEach(rank => {
        newDeck.push({ rank, suit });
      });
    });
    return newDeck.sort(() => Math.random() - 0.5);
  }

  function cardValue(card) {
    if (card.rank === 'A') return 11;
    if (['K', 'Q', 'J'].includes(card.rank)) return 10;
    return parseInt(card.rank);
  }

  function handValue(hand) {
    let value = 0;
    let aces = 0;
    hand.forEach(card => {
      value += cardValue(card);
      if (card.rank === 'A') aces++;
    });
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }
    return value;
  }

  function displayCards() {
    playerCardsDiv.textContent = 'Player: ' + playerHand.map(c => c.rank + c.suit).join(' ');
    dealerCardsDiv.textContent = 'Dealer: ' + (blackjackInProgress ? (dealerHand[0].rank + dealerHand[0].suit + ' ??') : dealerHand.map(c => c.rank + c.suit).join(' '));
  }

  function resetBlackjack() {
    deck = [];
    playerHand = [];
    dealerHand = [];
    currentBet = 0;
    blackjackStatus.textContent = '';
    playerCardsDiv.textContent = '';
    dealerCardsDiv.textContent = '';
    hitButton.classList.add('hidden');
    standButton.classList.add('hidden');
    blackjackInProgress = false;
  }

  function endRound(won) {
    blackjackInProgress = false;
    hitButton.classList.add('hidden');
    standButton.classList.add('hidden');
    if (won) {
      chips += currentBet * 3;  // triple payout
      blackjackStatus.textContent = `You win! You earned ${currentBet * 3} chips!`;
    } else {
      blackjackStatus.textContent = `You lost ${currentBet} chips. Try again!`;
    }
    saveChips();
    updateChipsDisplay();
    displayCards();
  }

  function dealerPlay() {
    while (handValue(dealerHand) < 17) {
      dealerHand.push(deck.pop());
    }
  }

  dealButton.addEventListener('click', () => {
    if (blackjackInProgress) return alert('Finish the current round first.');

    const bet = parseInt(blackjackBetInput.value, 10);
    if (isNaN(bet) || bet < 1) {
      alert('Enter a valid positive bet.');
      return;
    }
    if (bet > chips) {
      alert('Not enough chips for this bet.');
      return;
    }
    currentBet = bet;
    chips -= bet;
    saveChips();
    updateChipsDisplay();

    // create fresh deck on each deal
    deck = createDeck();

    playerHand = [];
    dealerHand = [];

    // Deal initial cards
    playerHand.push(deck.pop());
    dealerHand.push(deck.pop());
    playerHand.push(deck.pop());
    dealerHand.push(deck.pop());

    blackjackInProgress = true;
    displayCards();
    blackjackStatus.textContent = 'Game in progress. Choose Hit or Stand.';

    hitButton.classList.remove('hidden');
    standButton.classList.remove('hidden');
  });

  hitButton.addEventListener('click', () => {
    if (!blackjackInProgress) return;

    playerHand.push(deck.pop());
    displayCards();

    const pVal = handValue(playerHand);
    if (pVal > 21) {
      endRound(false);
    }
  });

  standButton.addEventListener('click', () => {
    if (!blackjackInProgress) return;

    dealerPlay();
    displayCards();

    const pVal = handValue(playerHand);
    const dVal = handValue(dealerHand);

    if (dVal > 21 || pVal > dVal) {
      endRound(true);
    } else {
      endRound(false);
    }
  });

  function resetBlackjackOnGames() {
    if (myDropdown.value === 'games' && getLoggedInUser()) {
      resetBlackjack();
      blackjackStatus.textContent = '';
      blackjackBetInput.value = '';
    }
  }

  function updateAllUI() {
    updateLoginUI();
    updateAdminPanelVisibility();
  }

  updateAllUI();

  if (getLoggedInUser() && myDropdown.value === 'games') {
    loadChips();
    updateChipsDisplay();
  }
});
