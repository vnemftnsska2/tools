let words = [];

async function loadWords() {
    try {
        const response = await window.fs.readFile('../public/hackers_words.xlsx');
        const workbook = XLSX.read(response, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        words = XLSX.utils.sheet_to_json(firstSheet);

        // Day 필터 옵션 설정
        const days = [...new Set(words.map(word => word.Day))].sort((a, b) => a - b);
        const dayFilter = document.getElementById('dayFilter');
        days.forEach(day => {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = `Day ${day}`;
            dayFilter.appendChild(option);
        });

        renderWords(words);
    } catch (error) {
        console.error('Error loading words:', error);
    }
}

function renderWords(wordsToShow) {
    const grid = document.getElementById('wordsGrid');
    const template = document.getElementById('wordCardTemplate');
    grid.innerHTML = '';

    wordsToShow.forEach(word => {
        const card = template.content.cloneNode(true);

        const title = card.querySelector('h3');
        title.textContent = word.Word;

        const pronunciation = card.querySelector('p:first-of-type');
        pronunciation.textContent = word.Pronunciation;

        const meaning = card.querySelector('p:last-of-type');
        meaning.textContent = word.Meaning;

        const playButton = card.querySelector('.play-audio');
        playButton.onclick = () => speak(word.Word);

        grid.appendChild(card);
    });
}

function filterWords() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedDay = document.getElementById('dayFilter').value;

    let filtered = words;

    if (searchTerm) {
        filtered = filtered.filter(word =>
            word.Word.toLowerCase().includes(searchTerm) ||
            word.Meaning.toLowerCase().includes(searchTerm)
        );
    }

    if (selectedDay) {
        filtered = filtered.filter(word => word.Day == selectedDay);
    }

    renderWords(filtered);
}

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
}

// 이벤트 리스너
document.getElementById('searchInput').addEventListener('input', filterWords);
document.getElementById('dayFilter').addEventListener('change', filterWords);

// 초기 로드
loadWords();