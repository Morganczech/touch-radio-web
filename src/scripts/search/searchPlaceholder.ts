export function initSearchPlaceholder() {
    const searchInput = document.getElementById(
        "search-input",
    ) as HTMLInputElement;

    if (searchInput) {
        const examples = [
            "Search stations (e.g. jazz 128 us mp3)",
            "Try 'rock de 192'",
            "Try 'classical fr'",
            "Try 'news gb'",
            "Try 'pop us 320'",
        ];

        // State
        let currentExampleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeTimer: any = null;
        let isUserTyping = false;

        // Configuration
        const TYPING_SPEED = 50; // ms per char
        const DELETING_SPEED = 30; // ms per char
        const PAUSE_END = 2000; // ms wait after finishing phrase
        const PAUSE_START = 500; // ms wait before starting new phrase

        const typeStep = () => {
            // Stop if user is interacting
            if (
                isUserTyping ||
                document.activeElement === searchInput ||
                searchInput.value.length > 0
            ) {
                return;
            }

            const currentPhrase = examples[currentExampleIndex];

            if (isDeleting) {
                charIndex--;
                searchInput.setAttribute(
                    "placeholder",
                    currentPhrase.substring(0, charIndex),
                );
                if (charIndex === 0) {
                    isDeleting = false;
                    currentExampleIndex =
                        (currentExampleIndex + 1) % examples.length;
                    typeTimer = setTimeout(typeStep, PAUSE_START);
                } else {
                    typeTimer = setTimeout(typeStep, DELETING_SPEED);
                }
            } else {
                charIndex++;
                searchInput.setAttribute(
                    "placeholder",
                    currentPhrase.substring(0, charIndex),
                );
                if (charIndex === currentPhrase.length) {
                    isDeleting = true;
                    typeTimer = setTimeout(typeStep, PAUSE_END);
                } else {
                    typeTimer = setTimeout(typeStep, TYPING_SPEED);
                }
            }
        };

        const startTyping = () => {
            if (typeTimer) clearTimeout(typeTimer);
            isUserTyping = false;
            // Only start if input is empty
            if (!searchInput.value) {
                typeStep();
            }
        };

        const stopTyping = () => {
            if (typeTimer) clearTimeout(typeTimer);
            typeTimer = null;
            isUserTyping = true;
        };

        // Start initially
        typeTimer = setTimeout(typeStep, 1000);

        // Handle interaction
        searchInput.addEventListener("focus", stopTyping);
        searchInput.addEventListener("blur", () => {
            isUserTyping = false;
            if (!searchInput.value) {
                startTyping();
            }
        });
        searchInput.addEventListener("input", () => {
            stopTyping();
        });
    }
}
