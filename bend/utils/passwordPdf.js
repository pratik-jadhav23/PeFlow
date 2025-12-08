const PDFJS = require('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js');

/**
 * Parses a PDF buffer, supporting password protection.
 * @param {Buffer} dataBuffer - The raw PDF buffer.
 * @param {string} [password] - The password for the PDF (optional).
 * @returns {Promise<{text: string, numpages: number}>}
 */
async function parsePasswordPdf(dataBuffer, password = "") {
    // Disable worker for Node environment to avoid needing DOM
    PDFJS.disableWorker = true;

    try {
        // Load the document with password
        const loadingTask = PDFJS.getDocument({
            data: dataBuffer,
            password: password 
        });

        const doc = await loadingTask;
        const numPages = doc.numPages;
        let fullText = "";

        // Iterate over all pages and extract text
        for (let i = 1; i <= numPages; i++) {
            const page = await doc.getPage(i);
            const textContent = await page.getTextContent();
            
            // Join text items with space
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + "\n";
        }

        return {
            text: fullText,
            numpages: numPages
        };

    } catch (error) {
        // Enhance error message for common issues
        if (error.name === 'PasswordException' || error.message.includes('Password')) {
             throw new Error("Password required or incorrect password.");
        }
        throw error;
    }
}

module.exports = {parsePasswordPdf};
