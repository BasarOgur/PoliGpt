const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// MySQL bağlantısı
const db = mysql.createConnection({
    host: '127.0.0.1', 
    user: 'basar', 
    password: 'basar123', 
    database: 'PoliChat' 
});

db.connect(err => {
    if (err) {
        console.error('MySQL bağlantı hatası:', err);
    } else {
        console.log('MySQL ile bağlantı başarılı');
    }
});


app.use(bodyParser.json());

// Geri bildirimleri ekleme
app.post('/feedback', (req, res) => {
    const { user_message, bot_response, feedback_type } = req.body;

    if (!user_message || !bot_response || !feedback_type) {
        return res.status(400).send('Bad Request');
    }

    const query = 'INSERT INTO feedback (user_message, bot_response, feedback_type) VALUES (?, ?, ?)';
    db.query(query, [user_message, bot_response, feedback_type], (err, result) => {
        if (err) throw err;
        res.status(201).send('Feedback submitted');
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
