import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import File from './models/File.js';

const router = express.Router();
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ error: "Token missing" });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.userId = decoded.userId;
    next();
  });
}

router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  const newFile = new File({
    filename: req.file.filename,
    originalName: req.file.originalname,
    uploader: req.userId,
    downloads: 0,
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days expiry
  });
  await newFile.save();
  res.json({ link: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` });
});

export default router;
