// ==========================================
// REALITY GLITCH LYRIC ENGINE (FIREBASE EDITION)
// Track: JANE - THE LONG FACES (Shortened Cut)
// ==========================================

// --- DEFAULT FALLBACK TUNING ---
let TIMING_OFFSET = 1.2; 
let DURATION_MULTIPLIER = 1.0; 
let BLANK_SPACE_MS = 300; 

// 1. Inject the Glitch CSS
const lyricStyle = document.createElement('style');
lyricStyle.innerHTML = `
    .lyric-glitch {
        color: #dc143c !important;
        text-shadow: 2px 0px 0px #00f, -2px 0px 0px #1ae23b !important;
        animation: textJitter 0.15s infinite !important;
        font-weight: bold;
        background: rgba(0,0,0,0.8);
        padding: 0 5px;
        display: inline-block;
        pointer-events: none;
        z-index: 9999;
    }
    @keyframes textJitter {
        0%, 100% { transform: translate(0, 0) skewX(0deg); }
        25% { transform: translate(-2px, 1px) skewX(2deg); color: #fff; }
        50% { transform: translate(2px, -1px) skewX(-2deg); color: #1ae23b; }
        75% { transform: translate(-1px, 2px) skewX(1deg); color: #dc143c; }
    }
`;
document.head.appendChild(lyricStyle);

// 2. Default Lyric Timestamps
let JANE_LYRICS = [
    { t: 0.0, text: "Won't the devil take you back for more", mult: 1.6 },
    { t: 3.5, text: "To open closed doors", mult: 1.2 },
    { t: 6.5, text: "And keep the good from the great", mult: 1.3 },
    { t: 10.0, text: "Evil in equal, seeking to kill and create", mult: 2.3  },
    { t: 14.0, text: "How grand? The milk and honey land", mult: 3.0 },
    { t: 17.5, text: "Is on her tongue again", mult: 1.6 },
    { t: 20.5, text: "Taste of the violence, trying to silence her head", mult: 1.9 },
    { t: 27.0, text: "And Jane" },
    { t: 28.5, text: "You're early" },
    { t: 30.0, text: "Your life's work is dirtied by the" },
    { t: 33.0, text: "Fools" },
    { t: 34.5, text: "Who adore you" },
    { t: 36.0, text: "Biding your time, biding your time to strike" },
    { t: 41.0, text: "Surely" },
    { t: 42.5, text: "The poison makes a portrait of your" },
    { t: 45.0, text: "Face" },
    { t: 46.5, text: "In the mirror" },
    // EXAMPLE: There is a 6-second instrumental gap after this lyric.
    // By adding "hold: 3000", it stays on screen for exactly 3 seconds, 
    // then disappears, leaving the screen completely normal for the last 3 seconds of the instrumental.
    { t: 48.0, text: "Smiling with fright", hold: 3000 }, 
    { t: 54.0, text: "And Jane" },
    { t: 55.5, text: "You're early" },
    { t: 57.0, text: "Your life's work is dirtied by the" },
    { t: 60.0, text: "Fools" },
    { t: 61.5, text: "Who adore you" },
    { t: 63.0, text: "Only to find, only to find you out", blank: 1000 }, // Example: Custom 1-second delay before the next line
    { t: 68.0, text: "They saw you" },
    { t: 69.5, text: "Dressing in the backroom" },
    { t: 72.0, text: "Now they'll pay what they owe you" },
    { t: 75.0, text: "It's only small change, red on the green, green grass", hold: 4000 }
];

// --- FIREBASE LIVE SYNC ---
// Note: This relies on 'firebase' already being loaded in index.html
const lyricsRef = firebase.database().ref('lyricEngine/jane');

lyricsRef.on('value', (snapshot) => {
    if (snapshot.exists()) {
        // OVERWRITE local variables with Database values instantly
        const data = snapshot.val();
        TIMING_OFFSET = data.TIMING_OFFSET !== undefined ? data.TIMING_OFFSET : TIMING_OFFSET;
        DURATION_MULTIPLIER = data.DURATION_MULTIPLIER !== undefined ? data.DURATION_MULTIPLIER : DURATION_MULTIPLIER;
        BLANK_SPACE_MS = data.BLANK_SPACE_MS !== undefined ? data.BLANK_SPACE_MS : BLANK_SPACE_MS;
        if (data.JANE_LYRICS) JANE_LYRICS = data.JANE_LYRICS;
    } else {
        // First boot! Auto-populate Firebase with the defaults
        lyricsRef.set({
            TIMING_OFFSET,
            DURATION_MULTIPLIER,
            BLANK_SPACE_MS,
            JANE_LYRICS
        });
    }
});


let currentLyricIndex = -1;
let activeGlitches = [];
let glitchTimeout = null;

function clearGlitches() {
    activeGlitches.forEach(obj => {
        if (obj.el.hasAttribute('data-orig')) {
            obj.el.innerHTML = obj.el.getAttribute('data-orig');
            obj.el.removeAttribute('data-orig');
        }
    });
    activeGlitches = [];
}

// 3. The Hijack Function
function triggerRealityGlitch(lyricObj, index) {
    clearGlitches(); 
    if (glitchTimeout) clearTimeout(glitchTimeout);

    let lyricText = lyricObj.text;
    let displayTime;

    if (lyricObj.hold) {
        displayTime = lyricObj.hold;
    } else {
        let gapMs = 4000; 
        if (index + 1 < JANE_LYRICS.length) {
            gapMs = (JANE_LYRICS[index + 1].t - lyricObj.t) * 1000;
        }
        let currentMult = lyricObj.mult !== undefined ? lyricObj.mult : DURATION_MULTIPLIER;
        let currentBlank = lyricObj.blank !== undefined ? lyricObj.blank : BLANK_SPACE_MS;

        displayTime = (gapMs * currentMult) - currentBlank;
        if (displayTime < 200) displayTime = 200; 
    }

    const terminalContainer = document.getElementById('terminal-container');
    const isMinigameActive = terminalContainer && getComputedStyle(terminalContainer).display !== 'none';

    if (isMinigameActive) {
        let wordsOnBoard = Array.from(document.querySelectorAll('.word'));
        if (wordsOnBoard.length > 0) {
            let lyricWords = lyricText.split(' ');
            lyricWords.forEach((word, wordIndex) => {
                let el = wordsOnBoard[wordIndex % wordsOnBoard.length];
                if (!el.hasAttribute('data-orig')) { el.setAttribute('data-orig', el.innerHTML); }
                el.innerHTML = `<span class="lyric-glitch">${word}</span>`;
                if (!activeGlitches.some(obj => obj.el === el)) activeGlitches.push({ el: el });
            });
        }
    } else {
        const safeSelectors = '#scoreboard-body td, #document-container p, #document-container th, #document-container td, .doc-section-title';
        let elements = Array.from(document.querySelectorAll(safeSelectors));
        elements = elements.sort(() => 0.5 - Math.random()).slice(0, 5); 

        elements.forEach(el => {
            if (!el.hasAttribute('data-orig')) { el.setAttribute('data-orig', el.innerHTML); }
            el.innerHTML = `<span class="lyric-glitch">${lyricText}</span>`;
            activeGlitches.push({ el: el });
        });
    }

    glitchTimeout = setTimeout(() => { clearGlitches(); }, displayTime); 
}

// 4. Time-Aware Audio Synchronization 
document.addEventListener("DOMContentLoaded", () => {
    const musicEl = document.getElementById('bg-music');
    if (!musicEl) return;

    musicEl.addEventListener('play', () => { clearGlitches(); });

    musicEl.addEventListener('timeupdate', () => {
        const src = decodeURIComponent(musicEl.src).toUpperCase();
        if (!src.includes('JANE') && !src.includes('THE LONG FACES')) return;

        // SCRUB-SAFE MATH: Recalculate where we should be on every tick
        let targetIndex = -1;
        for (let i = 0; i < JANE_LYRICS.length; i++) {
            if (musicEl.currentTime >= (JANE_LYRICS[i].t + TIMING_OFFSET)) {
                targetIndex = i;
            } else {
                break; // Stop checking once we find the future lyrics
            }
        }

        // If we crossed into a new line (or scrubbed forward/backward), trigger it!
        if (targetIndex !== -1 && targetIndex !== currentLyricIndex) {
            currentLyricIndex = targetIndex;
            triggerRealityGlitch(JANE_LYRICS[currentLyricIndex], currentLyricIndex);
        }
    });
});
