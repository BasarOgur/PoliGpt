const form = document.getElementById('chat-form');
const mytextInput = document.getElementById('mytext');
const responseTextarea = document.getElementById('response');
const polisanQuestionBtn = document.getElementById('polisan-question-btn');
const feedbackContainer = document.getElementById('feedback-container');
const chatHistoryContainer = document.getElementById('chat-history');
const API_KEY = 'YOUR-API-KEY-ADD-HERE'; // Kendi geçerli API anahtarınızı buraya ekleyin

let messages = JSON.parse(localStorage.getItem('sohbetGeçmişi')) || [];


const updateChatHistory = () => {
    chatHistoryContainer.innerHTML = '';

    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', message.role);

        
        if (message.role === 'user') {
            messageElement.innerHTML = `<strong>Kullanıcı:</strong> ${message.content}`;
        } else if (message.role === 'assistant') {
            messageElement.innerHTML = `<strong>PoliChat:</strong> ${message.content}`;
        }

        chatHistoryContainer.appendChild(messageElement);
    });

    
    chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
};

// Geri bildirim butonlarını oluşturma fonksiyonu
const createFeedbackButtons = () => {
    const thumbsUp = document.createElement('button');
    thumbsUp.textContent = '👍';
    thumbsUp.setAttribute('aria-label', 'Yanıtı beğen');
    thumbsUp.addEventListener('click', () => {
        alert('Teşekkürler! Yanıtı beğendiniz.');
    });

    const thumbsDown = document.createElement('button');
    thumbsDown.textContent = '👎';
    thumbsDown.setAttribute('aria-label', 'Yanıtı beğenmedin');
    thumbsDown.addEventListener('click', () => {
        alert('Üzgünüz! Yanıtı beğenmediniz.');
    });

    feedbackContainer.appendChild(thumbsUp);
    feedbackContainer.appendChild(thumbsDown);
};

// API isteği yapma fonksiyonu
const fetchResponse = async (messages) => {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages,
                temperature: 1.0,
                top_p: 0.7,
                n: 1,
                stream: false,
                presence_penalty: 0,
                frequency_penalty: 0,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch Hatası:', error);
        throw error;
    }
};

// Yerel depolamayı temizleme fonksiyonu
const clearLocalStorage = () => {
    // Burada belirli bir süre sonra veya belirli koşullarda temizleme yapabilirsiniz
    // Örneğin: messages.length > 1000; veya başka bir kriter
    localStorage.removeItem('sohbetGeçmişi');
};

// Fonksiyonları çağır
createFeedbackButtons();
updateChatHistory();

// Sayfa yüklendiğinde sohbet geçmişini güncelle
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mytext = mytextInput.value.trim();

    if (mytext) {
        messages.push({ role: 'user', content: mytext });
        try {
            // Yükleniyor göstergesi ekleme
            responseTextarea.value = 'Yükleniyor...';

            const data = await fetchResponse(messages);
            let botMessage = data.choices[0].message.content;

            const linkPattern = /(https?:\/\/[^\s]+)/g;
            botMessage = botMessage.replace(linkPattern, (url) => `"${url}"`);

            messages.push({ role: 'assistant', content: botMessage });
            responseTextarea.value = botMessage;

            updateChatHistory(); // Sohbet geçmişini güncelle
            localStorage.setItem('sohbetGeçmişi', JSON.stringify(messages)); // Sohbet geçmişini tarayıcı depolamasına ekle

            // Yerel depolamayı temizleme
            // clearLocalStorage(); // İhtiyaca göre bu satırı yorumdan çıkarabilirsiniz
        } catch (error) {
            responseTextarea.value = 'Hata: İsteğiniz işlenirken bir sorun oluştu.';
        }
    }
});

// Polisan hakkında soru butonuna tıklama işlemi
polisanQuestionBtn.addEventListener('click', () => {
    const query = "Polisan hakkında bilgi"; // Sabit mesaj
    responseTextarea.innerHTML = `Polisan hakkında bilgi için: https://www.polisanholding.com/ \n\n2000 yılında kurulan Polisan Holding A.Ş., sermayesine ve yönetimine katıldığı şirketler arasında koordinasyonu sağlamak, sevk ve idare edilmelerini temin etmek, planlama, pazarlama, mali işler, finansman ve fon yönetimi, hukuk, insan kaynakları, bilgi işlem alanlarında gelişmiş tekniklerle çalışmalarını sağlamak amacıyla kurulmuş olup faaliyetlerini bu yönde sürdürmektedir.`;

    // Kullanıcı ve bot arasındaki sohbet geçmişine yeni mesaj ekle
    messages.push({ role: 'user', content: query });
    messages.push({ role: 'assistant', content: responseTextarea.innerHTML });

    updateChatHistory(); // Sohbet geçmişini güncelle
    localStorage.setItem('sohbetGeçmişi', JSON.stringify(messages)); // Sohbet geçmişini tarayıcı depolamasına ekle
});

// Erişilebilirlik için klavye kısayolları
document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 's') { // Alt + S ile formu gönder
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
    }
});
