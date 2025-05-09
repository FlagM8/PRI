document.addEventListener('DOMContentLoaded', function () {
    const wordsContainer = document.getElementById('problematic-words');
    if (wordsContainer) {
        const wordItems = Array.from(wordsContainer.querySelectorAll('li'));

        if (wordItems.length === 0) {
            console.warn('No problematic words found.');
            return;
        }

        // Render problematic words
        wordItems.forEach(item => {
            const word = item.querySelector('.word').textContent;
            const count = item.querySelector('.count').textContent;

            console.log(`Problematic Word: ${word}, Errors: ${count}`);
        });
    }
});
