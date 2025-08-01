const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
mongoose.connect(process.env.MONGO_URI);

app.set('view engine', 'ejs');
app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.get('/', (req, res) => res.render('index'));

app.post('/upload', upload.single('file'), (req, res) => {
    res.render('upload', { file: req.file });
});

app.get('/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    res.download(filePath);
});

app.listen(3000, () => console.log('Server running on port 3000'));
