const { parsePasswordPdf } = require('../utils/passwordPdf');
const multer = require('multer');

// Configure multer for file upload
const upload = multer();

/**
 * Controller to handle password-protected PDF parsing.
 * Expects 'file' in form-data and 'password' in body (optional).
 */
const parseSecurePdf = async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Get password from request body (if provided)
        const password = req.body.password || "PRAT2307";
        console.log(password);
         

        console.log(`Processing PDF. Password provided: ${password ? 'Yes' : 'No'}`);

        const data = await parsePasswordPdf(req.file.buffer, password);

        // Here you can add your transaction parsing logic similar to mainCon.js
        // For now, we return the raw text to confirm it opened.
        
        res.status(200).json({
            success: true,
            numpages: data.numpages,
            text_preview: data.text.substring(0, 200) + "...", // Preview of extracted text
            text: data.text,
            full_text_length: data.text.length
            // transactions: parseTransactions(data.text) // Call your parser here
        });

    } catch (err) {
        console.error('Error parsing PDF:', err.message);
        
        if (err.message.includes('Password')) {
             return res.status(401).json({ error: 'Invalid password or password required.' });
        }

        res.status(500).json({ error: 'Failed to process PDF', details: err.message });
    }
};

module.exports = { parseSecurePdf, upload };
