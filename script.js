const testWrapper = document.querySelector(".test-wrapper");
const testArea = document.querySelector("#test-area");
const originTextElement = document.querySelector("#origin-text p");
const resetButton = document.querySelector("#reset");
const theTimer = document.querySelector(".timer");
const topScoresList = document.querySelector("#top-scores");
const wpmDisplay = document.querySelector("#wpm");
const errorDisplay = document.querySelector("#error-count");
const helpToggle = document.querySelector("#help-toggle");
const introContent = document.querySelector("#intro-content");

let originText = originTextElement.innerHTML;

// Array of random paragraphs to practice typing
const textArray = [
    "Typing fast and accurately is a valuable skill in today's digital world.",
    "The quick brown fox jumps over the lazy dog. This sentence contains every letter in the English alphabet.",
    "JavaScript is the programming language of the Web. You can use it to add complex features to web pages and make them interactive.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. Keep practicing to improve.",
    "In software development, debugging is twice as hard as writing the code in the first place. Write clean code!"
];

// Variables to keep track of the time and the interval timer for my test
let timer = [0, 0, 0];
let interval;
let timerRunning = false;
let testCompleted = false;

// Variables to keep track of the performance metrics
let errors = 0;
let isTypo = false; // I'll use this so I don't count an error twice if they type multiple wrong characters in a row

// Add leading zero to numbers 9 or below (purely for aesthetics):
function leadingZero(time) {
    if (time <= 9) {
        return "0" + time;
    }
    return time;
}

// Run a standard minute/second/hundredths timer:
function runTimer() {
    let currentTime = leadingZero(timer[0]) + ":" + leadingZero(timer[1]) + ":" + leadingZero(timer[2]);
    theTimer.innerHTML = currentTime;
    
    // Calculate live WPM
    let totalSeconds = (timer[0] * 60) + timer[1] + (timer[2] / 100);
    // Formula: (Total Characters / 5) / (Total Seconds / 60)
    if (totalSeconds > 0) {
        let wpm = Math.round((testArea.value.length / 5) / (totalSeconds / 60));
        wpmDisplay.innerHTML = "WPM: " + wpm;
    }
    
    // Increment the timer values
    timer[2]++;
    if (timer[2] == 100) {
        timer[1]++;
        timer[2] = 0;
    }
    if (timer[1] == 60) {
        timer[0]++;
        timer[1] = 0;
    }
}

// Match the text entered with the provided text on the page:
function spellCheck() {
    let textEntered = testArea.value;
    let originTextMatch = originText.substring(0, textEntered.length);
    
    // I need to check if what I typed completely matches the origin text to stop the timer
    if (textEntered === originText && !testCompleted) {
        testCompleted = true;
        clearInterval(interval);
        // Turn border green when finished correctly
        testWrapper.style.borderColor = "green";
        
        // Wait a small tick so the final WPM and Errors process onto the screen before saving
        setTimeout(() => {
            saveScore(theTimer.innerHTML);
        }, 10);
    } else if (!testCompleted) {
        if (textEntered === originTextMatch) {
            // Turn border blue when typing correctly so far
            testWrapper.style.borderColor = "blue";
            isTypo = false; // They got back on track
        } else {
            // Turn border red when a mistake is made
            testWrapper.style.borderColor = "red";
            
            // Only increment the error count if they weren't already making a mistake
            if (!isTypo) {
                errors++;
                errorDisplay.innerHTML = "Errors: " + errors;
                isTypo = true;
            }
        }
    }
}

// Function to handle saving and displaying the top 3 scores using localStorage
function saveScore(scoreTime) {
    // Get existing scores or initialize empty array
    let scores = JSON.parse(localStorage.getItem("typingScores")) || [];
    
    // Grab WPM and Error values
    let currentWPM = wpmDisplay.innerText.replace("WPM: ", "");
    let currentErrors = errorDisplay.innerText.replace("Errors: ", "");
    
    let newScoreObject = {
        time: scoreTime,
        wpm: currentWPM,
        errors: currentErrors
    };
    
    // Push the new score and sort them. 
    scores.push(newScoreObject);
    
    scores.sort((a, b) => {
        // Fallback checks just in case old string format data is in local storage during migration
        let timeA = typeof a === 'string' ? a : a.time;
        let timeB = typeof b === 'string' ? b : b.time;
        if (timeA < timeB) return -1;
        if (timeA > timeB) return 1;
        return 0;
    });
    
    // Keep only the top 3 fastest times
    scores = scores.slice(0, 3);
    
    // Save back to local storage
    localStorage.setItem("typingScores", JSON.stringify(scores));
    
    displayScores();
}

function displayScores() {
    let scores = JSON.parse(localStorage.getItem("typingScores")) || [];
    
    // Clear the current list
    topScoresList.innerHTML = "";
    
    // Populate the list with the saved scores (or default if less than 3)
    for (let i = 0; i < 3; i++) {
        let li = document.createElement("li");
        
        if (scores[i]) {
            let scoreData = scores[i];
            // Format for older string saves vs new object saves
            let timeVal = typeof scoreData === 'string' ? scoreData : scoreData.time;
            let wpmVal = typeof scoreData === 'string' ? "--" : scoreData.wpm;
            let errVal = typeof scoreData === 'string' ? "--" : scoreData.errors;
            
            li.innerHTML = `<span class="score-time">Time: ${timeVal}</span>
                            <span class="score-wpm" style="margin: 0 15px;">WPM: ${wpmVal}</span>
                            <span class="score-err">Errors: ${errVal}</span>`;
            li.className = "filled-score";
        } else {
            li.innerText = "--:--:--";
            li.className = "empty-score";
        }
        
        topScoresList.appendChild(li);
    }
}

// Start the timer:
function start() {
    let textLength = testArea.value.length;
    
    // I want to start the timer on the very first keystroke
    if (textLength === 0 && !timerRunning) {
        timerRunning = true;
        interval = setInterval(runTimer, 10);
    }
}

// Reset everything:
function reset() {
    // Clear out the interval, timer values, and boolean flag
    clearInterval(interval);
    interval = null;
    timer = [0, 0, 0];
    timerRunning = false;
    testCompleted = false;
    
    // Resetting performance tracking
    errors = 0;
    isTypo = false;
    wpmDisplay.innerHTML = "WPM: 0";
    errorDisplay.innerHTML = "Errors: 0";
    
    // Resetting the UI elements back to default
    testArea.value = "";
    theTimer.innerHTML = "00:00:00";
    testWrapper.style.borderColor = "grey";
    
    // Pick a new random paragraph for the next test
    let randomIndex = Math.floor(Math.random() * textArray.length);
    originText = textArray[randomIndex];
    originTextElement.innerHTML = originText;
}

// Toggle the Help instructions visibility
function toggleHelp() {
    if (introContent.style.display === "none" || introContent.style.display === "") {
        introContent.style.display = "block";
    } else {
        introContent.style.display = "none";
    }
}

// Event listeners for keyboard input and the reset button:
testArea.addEventListener("keypress", start, false);
testArea.addEventListener("keyup", spellCheck, false);
resetButton.addEventListener("click", reset, false);
helpToggle.addEventListener("click", toggleHelp, false);

// Display scores when the page first loads
displayScores();

