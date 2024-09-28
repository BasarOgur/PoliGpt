const form = document.getElementById('chat-form');
const mytextInput = document.getElementById('mytext');
const responseTextarea = document.getElementById('response');
const polisanQuestionBtn = document.getElementById('polisan-question-btn');
const feedbackContainer = document.getElementById('feedback-container');
const chatHistoryContainer = document.getElementById('chat-history');
const API_KEY = 'sk-None-Elyb90xWwE4f5Wqwt2DmT3BlbkFJ6tN5Hp2ImbTzZA9egLk2'; // Kendi geçerli API anahtarınızı buraya ekleyin

let messages = JSON.parse(localStorage.getItem('sohbetGeçmişi')) || [];

// Sohbet geçmişini güncelleme fonksiyonu
const updateChatHistory = () => {
    chatHistoryContainer.innerHTML = '';

    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', message.role);

        // Mesajın başına uygun etiketi ekle
        if (message.role === 'user') {
            messageElement.innerHTML = `<strong>Kullanıcı:</strong> ${message.content}`;
        } else if (message.role === 'assistant') {
            messageElement.innerHTML = `<strong>PoliChat:</strong> ${message.content}`;
        }

        chatHistoryContainer.appendChild(messageElement);
    });

    // Scroll to the bottom
    chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
};

const showFeedbackMessage = (message) => {
    // Mesajı ekranda göstermek için bir eleman oluşturun
    const feedbackMessage = document.createElement('div');
    feedbackMessage.textContent = message;
    feedbackMessage.style.padding = '10px';
    feedbackMessage.style.marginTop = '10px';
    feedbackMessage.style.border = '1px solid #ddd';
    feedbackMessage.style.backgroundColor = '#f8f9fa';
    feedbackMessage.style.borderRadius = '5px';

    // Mesajı geri bildirim container'ına ekleyin
    feedbackContainer.appendChild(feedbackMessage);

    // Mesajı 3 saniye sonra kaldırın
    setTimeout(() => {
        feedbackContainer.removeChild(feedbackMessage);
    }, 3000);
};


// Geri bildirim butonlarını oluşturma fonksiyonu
const createFeedbackButtons = () => {
    const thumbsUp = document.createElement('button');
    thumbsUp.textContent = '👍';
    thumbsUp.setAttribute('aria-label', 'Yanıtı beğen');
    thumbsUp.addEventListener('click', () => {
        showFeedbackMessage('Teşekkürler! Yanıtı beğendiniz.');
        sendFeedback(mytextInput.value, responseTextarea.value, 'positive');
        
    });

    const thumbsDown = document.createElement('button');
    thumbsDown.textContent = '👎';
    thumbsDown.setAttribute('aria-label', 'Yanıtı beğenmedin');
    thumbsDown.addEventListener('click', () => {
        showFeedbackMessage('Üzgünüz! Yanıtı beğenmediniz.');
        sendFeedback(mytextInput.value, responseTextarea.value, 'negative');
        
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
// Arama formunu gönderme işlemi
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mytext = mytextInput.value.trim();

    if (mytext) {
        messages.push({ role: 'user', content: mytext });
        try {
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
    const fixedMessage = `Polisan hakkında bilgi için: https://www.polisanholding.com/ \n\n2000 yılında kurulan Polisan Holding A.Ş., sermayesine ve yönetimine katıldığı şirketler arasında koordinasyonu sağlamak, sevk ve idare edilmelerini temin etmek, planlama, pazarlama, mali işler, finansman ve fon yönetimi, hukuk, insan kaynakları, bilgi işlem alanlarında gelişmiş tekniklerle çalışmalarını sağlamak amacıyla kurulmuş olup faaliyetlerini bu yönde sürdürmektedir.`;

    // Sabit mesajı textarea'ya ayarla
    responseTextarea.value = fixedMessage;

    // Kullanıcı ve bot arasındaki sohbet geçmişine yeni mesaj ekle
    messages.push({ role: 'user', content: query });
    messages.push({ role: 'assistant', content: fixedMessage });

    // Sohbet geçmişini güncelle
    updateChatHistory();
    localStorage.setItem('sohbetGeçmişi', JSON.stringify(messages)); // Sohbet geçmişini tarayıcı depolamasına ekle
});


// Erişilebilirlik için klavye kısayolları
// Command + Enter tuşuna birlikte basılır ise arama yapılır. Ara butonuna basmaya gerek kalmaz.(Mac için geliştirildi.)
// Alt + Enter tuşuna birlikte basılır ise arama yapılır. Ara butonuna basmaya gerek kalmaz.(Windows için geliştirildi.)
// Klavye kısayolları için olay dinleyicisi ekleyin
document.addEventListener('keydown', (e) => {
    // Mac için Command + Enter ve Windows için Alt + Enter kombinasyonlarını kontrol edin
    if ((e.metaKey && e.key === 'Enter') || (e.altKey && e.key === 'Enter')) {
        e.preventDefault(); // Varsayılan davranışı engelle
        form.dispatchEvent(new Event('submit')); // Formu gönder
    }
});

const sendFeedback = async (userMessage, botResponse, feedbackType) => {
    try {
        const response = await fetch('http://localhost:3000/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_message: userMessage,
                bot_response: botResponse,
                feedback_type: feedbackType
            }),
        });

        if (!response.ok) {
            throw new Error('Geri bildirim gönderilemedi');
        }
        alert('Geri bildirim gönderildi');
    } catch (error) {
        console.error('Geri bildirim gönderim hatası:', error);
    }
};

