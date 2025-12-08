const express = require('express');
const { parseSecurePdf, upload } = require('../controllers/securePdfController');

const router = express.Router();

// POST route to upload and parse PDF
// Use 'file' key for the PDF
// Use 'password' key in form-data if the PDF is encrypted
router.post('/parse-secure', upload.single('file'), parseSecurePdf);

module.exports = router;
