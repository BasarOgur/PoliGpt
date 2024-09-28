const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const app = express();
const port = 3000;
const PORT = 3001;
const cors = require('cors');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Statik dosyaları sunma
app.use(express.static(path.join(__dirname, 'public')));

// Kök dizin için route tanımlama
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index_deneme_amacli.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// MySQL bağlantısı
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'basar',
    password: 'basar123',
    database: 'PoliChat'
});

connection.connect(err => {
    if (err) {
        console.error('MySQL bağlantı hatası:', err);
        return;
    }
    console.log('MySQL ile bağlantı başarılı');
});

// Body-parser middleware
app.use(bodyParser.json());

// Geri bildirim verilerini alma
app.post('/feedback', (req, res) => {
    const { user_message, bot_response, feedback_type } = req.body;

    if (!user_message || !bot_response || !feedback_type) {
        return res.status(400).json({ error: 'Eksik veri' });
    }

    const query = 'INSERT INTO feedback (user_message, bot_response, feedback_type) VALUES (?, ?, ?)';
    connection.query(query, [user_message, bot_response, feedback_type], (err, results) => {
        if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).json({ error: 'Veritabanı hatası' });
        }
        res.status(200).json({ message: 'Geri bildirim alındı' });
    });
});

// Sunucuyu başlat
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
