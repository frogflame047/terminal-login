// ==========================================
// REALITY GLITCH LYRIC ENGINE
// Track: JANE - THE LONG FACES (Shortened Cut)
// ==========================================

// 1. Inject the Glitch CSS into the page automatically
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

// 2. Lyric Timestamps (Shifted to start at 0:00)
const JANE_LYRICS = [
    { t: 0.0, text: "Won't the devil take you back for more" },
    { t: 3.5, text: "To open closed doors" },
    { t: 6.5, text: "And keep the good from the great" },
    { t: 10.0, text: "Evil in equal, seeking to kill and create" },
    { t: 14.0, text: "How grand? The milk and honey land" },
    { t: 17.5, text: "Is on her tongue again" },
    { t: 20.5, text: "Taste of the violence, trying to silence her head" },
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
    { t: 48.0, text: "Smiling with fright" },
    { t: 54.0, text: "And Jane" },
    { t: 55.5, text: "You're early" },
    { t: 57.0, text: "Your life's work is dirtied by the" },
    { t: 60.0, text: "Fools" },
    { t: 61.5, text: "Who adore you" },
    { t: 63.0, text: "Only to find, only to find you out" },
    { t: 68.0, text: "They saw you" },
    { t: 69.5, text: "Dressing in the backroom" },
    { t: 72.0, text: "Now they'll pay what they owe you" },
    { t: 75.0, text: "It's only small change, red on the green, green grass" }
];

let currentLyricIndex = 0;
let activeGlitches = [];
let glitchTimeout = null;

// Clean up glitches to return the DOM to its normal state
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
function triggerRealityGlitch(lyricText) {
    clearGlitches(); // wipe previous lyric
    if (glitchTimeout) clearTimeout(glitchTimeout);

    // Check which screen the user is currently looking at
    const terminalContainer = document.getElementById('terminal-container');
    const isMinigameActive = terminalContainer && getComputedStyle(terminalContainer).display !== 'none';

    if (isMinigameActive) {
        // --- HACKING GAME: Sequential Word Replacement ---
        let wordsOnBoard = Array.from(document.querySelectorAll('.word'));
        
        if (wordsOnBoard.length > 0) {
            let lyricWords = lyricText.split(' ');
            
            lyricWords.forEach((word, index) => {
                // Loop back to the start if there are more lyric words than board words
                let el = wordsOnBoard[index % wordsOnBoard.length];
                
                // Protect the original board word string so we don't accidentally save a glitch
                if (!el.hasAttribute('data-orig')) {
                    el.setAttribute('data-orig', el.innerHTML);
                }
                
                el.innerHTML = `<span class="lyric-glitch">${word}</span>`;
                
                // Track for cleanup
                if (!activeGlitches.some(obj => obj.el === el)) {
                    activeGlitches.push({ el: el });
                }
            });
        }
    } else {
        // --- CHARACTER APP & SCOREBOARD: Random Element Hijacking ---
        const safeSelectors = '#scoreboard-body td, #document-container p, #document-container th, #document-container td, .doc-section-title';
        let elements = Array.from(document.querySelectorAll(safeSelectors));

        // Grab up to 5 random text blocks to overwrite
        elements = elements.sort(() => 0.5 - Math.random()).slice(0, 5); 

        elements.forEach(el => {
            if (!el.hasAttribute('data-orig')) {
                el.setAttribute('data-orig', el.innerHTML);
            }
            el.innerHTML = `<span class="lyric-glitch">${lyricText}</span>`;
            activeGlitches.push({ el: el });
        });
    }

    // Auto-revert reality right before the next line normally kicks in
    glitchTimeout = setTimeout(() => {
        clearGlitches();
    }, 2500); 
}

// 4. Audio Synchronization Listener
document.addEventListener("DOMContentLoaded", () => {
    const musicEl = document.getElementById('bg-music');
    if (!musicEl) return;

    // Reset sync logic if a track starts playing
    musicEl.addEventListener('play', () => {
        currentLyricIndex = 0;
        clearGlitches();
    });

    musicEl.addEventListener('timeupdate', () => {
        const src = decodeURIComponent(musicEl.src).toUpperCase();
        
        // ONLY execute the glitch logic if the specific Jane track is active
        if (!src.includes('JANE') && !src.includes('THE LONG FACES')) return;

        // Check the current song timestamp against the script
        if (currentLyricIndex < JANE_LYRICS.length && musicEl.currentTime >= JANE_LYRICS[currentLyricIndex].t) {
            triggerRealityGlitch(JANE_LYRICS[currentLyricIndex].text);
            currentLyricIndex++;
        }
    });
});