const PDFJS = require('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js');

/**
 * Parses a PDF buffer, supporting password protection.
 * @param {Buffer} dataBuffer - The raw PDF buffer.
 * @param {string} [password] - The password for the PDF (optional).
 * @returns {Promise<{text: string, numpages: number}>}
 */
async function parsePasswordPdf(dataBuffer, password = "", bankType) {
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

            let items = textContent.items;

            if (bankType === "SBI") {
                // Sort items based on Y (descending) then X (ascending) to preserve layout
                items.sort((a, b) => {
                    // transform[5] is the Y coordinate (0,0 is usually bottom-left)
                    const y1 = a.transform[5];
                    const y2 = b.transform[5];
                    const x1 = a.transform[4];
                    const x2 = b.transform[4];

                    // Determine if items are on the same line (within a small Y tolerance)
                    const yDiff = Math.abs(y1 - y2);
                    if (yDiff < 5) {
                        return x1 - x2; // Same line: sort by X (left to right)
                    }
                    return y2 - y1; // Different lines: sort by Y (top to bottom)
                });
            }

            // Join text items with space
            const pageText = items.map(item => item.str).join(' ');
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

module.exports = { parsePasswordPdf };
