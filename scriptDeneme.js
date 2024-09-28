const form = document.getElementById('chat-form');
const mytextInput = document.getElementById('mytext');
const responseTextarea = document.getElementById('response');
const polisanQuestionBtn = document.getElementById('polisan-question-btn');

const API_KEY = 'YOUR-API-KEY-ADD-HERE'; // ChatGPT API anahtarınız
const BACKEND_API_URL = 'http://127.0.0.1:5000/search'; // Flask API URL'nizi buraya ekleyin
const CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions'; // ChatGPT API URL'nizi buraya ekleyin

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mytext = mytextInput.value.trim();

    if (mytext) {
        if (mytext.toLowerCase().includes('polisan')) {
            try {
                const response = await fetch(`${BACKEND_API_URL}?query=${encodeURIComponent(mytext)}`);
                if (response.ok) {
                    const data = await response.json();
                    responseTextarea.value = JSON.stringify(data, null, 2); // Gelen veriyi formatla
                } else {
                    responseTextarea.value = `Error: ${response.status} ${response.statusText}`;
                }
            } catch (error) {
                console.error('Fetch Hatası:', error);
                responseTextarea.value = 'Error: Unable to process your request.';
            }
        } else {
            // OpenAI API çağrısı buraya gelebilir
        }
    }
});

polisanQuestionBtn.addEventListener('click', async () => {
    const query = "Polisan hakkında bilgi"; // Burada sorguyu belirleyin
    try {
        const response = await fetch(CHATGPT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: query }],
                temperature: 1.0,
                top_p: 0.7,
                n: 1,
                stream: false,
                presence_penalty: 0,
                frequency_penalty: 0,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            responseTextarea.value = data.choices[0].message.content; // Gelen yanıtı yazdır
        } else {
            responseTextarea.value = `Error: ${response.status} ${response.statusText}`;
        }
    } catch (error) {
        console.error('Fetch Hatası:', error);
        responseTextarea.value = 'Error: Unable to process your request.';
    }
});
