document.addEventListener('DOMContentLoaded', () => {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const quoteInput = document.getElementById('quoteInput');
    const startBtn = document.getElementById('startBtn');
    const submitBtn = document.getElementById('submitBtn');
    const resetBtn = document.getElementById('resetBtn');
    const result = document.getElementById('result');
    const timerDisplay = document.getElementById('timer');
    const wpmDisplay = document.getElementById('wpm');
    const loading = document.getElementById('loading');
    const bestWpm = document.getElementById('bestWpm').querySelector('span');
    const attempts = document.getElementById('attempts').querySelector('span');

    let startTime, timerInterval, quoteLength, isTestActive = false;
    let stats = { bestWpm: 0, attempts: 0 };

    // Load stats from localStorage
    function loadStats() {
        const savedStats = JSON.parse(localStorage.getItem('typingStats') || '{}');
        stats.bestWpm = savedStats.bestWpm || 0;
        stats.attempts = savedStats.attempts || 0;
        updateStatsDisplay();
    }

    // Save stats to localStorage
    function saveStats() {
        localStorage.setItem('typingStats', JSON.stringify(stats));
        updateStatsDisplay();
    }

    // Update stats display
    function updateStatsDisplay() {
        bestWpm.textContent = stats.bestWpm;
        attempts.textContent = stats.attempts;
    }

    // Fetch a random quote
    async function fetchQuote() {
        loading.classList.remove('hidden');
        quoteInput.disabled = true;
        try {
            const response = await fetch('https://apis.ccbp.in/random-quote');
            const data = await response.json();
            quoteDisplay.textContent = data.content;
            quoteLength = data.content.split(' ').length;
            quoteInput.value = '';
            result.textContent = '';
            submitBtn.disabled = true;
            startBtn.disabled = false;
        } catch (error) {
            quoteDisplay.textContent = 'Error fetching quote.';
        } finally {
            loading.classList.add('hidden');
            quoteInput.disabled = false;
        }
    }

    // Start the test
    function startTest() {
        if (isTestActive) return;
        isTestActive = true;
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 100);
        quoteInput.focus();
        startBtn.disabled = true;
        submitBtn.disabled = false;
    }

    // Update timer and WPM
    function updateTimer() {
        const elapsedTime = (Date.now() - startTime) / 1000; // in seconds
        timerDisplay.textContent = `Time: ${elapsedTime.toFixed(1)}s`;
        
        const wordsTyped = quoteInput.value.trim().split(/\s+/).length;
        const wpm = Math.round((wordsTyped / (elapsedTime / 60)) || 0);
        wpmDisplay.textContent = `WPM: ${wpm}`;
    }

    // Handle submission
    function handleSubmit() {
        if (!isTestActive) return;
        clearInterval(timerInterval);
        isTestActive = false;

        const userInput = quoteInput.value.trim();
        const elapsedTime = (Date.now() - startTime) / 1000 / 60; // in minutes
        const wpm = Math.round(quoteLength / elapsedTime);

        if (userInput === quoteDisplay.textContent) {
            result.textContent = `Success! You typed at ${wpm} WPM.`;
            result.className = 'success';
            stats.attempts++;
            stats.bestWpm = Math.max(stats.bestWpm, wpm);
            saveStats();
        } else {
            result.textContent = 'Error! Your input does not match the quote.';
            result.className = 'error';
            stats.attempts++;
            saveStats();
        }
    }

    // Reset the test
    function resetTest() {
        clearInterval(timerInterval);
        isTestActive = false;
        fetchQuote();
        timerDisplay.textContent = 'Time: 0s';
        wpmDisplay.textContent = 'WPM: 0';
        startBtn.disabled = false;
        submitBtn.disabled = true;
    }

    // Event listeners
    startBtn.addEventListener('click', startTest);
    submitBtn.addEventListener('click', handleSubmit);
    resetBtn.addEventListener('click', resetTest);
    quoteInput.addEventListener('input', () => {
        if (!isTestActive) startTest();
    });

    // Initial setup
    loadStats();
    fetchQuote();
});