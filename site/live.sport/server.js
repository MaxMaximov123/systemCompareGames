const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());

const staticFilesPath = path.join(__dirname, 'dist');

app.use(express.static(staticFilesPath));

app.post('api/pairs', (req, res) => {
    console.log(999);
    const requestData = req.body;
    console.log(requestData);

    res.send(JSON.stringify(requestData));
  });



app.get('*', (req, res) => {
    res.sendFile(path.join(staticFilesPath, 'index.html'));
});

// Запустите сервер на указанном порту
const port = 3000;
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
