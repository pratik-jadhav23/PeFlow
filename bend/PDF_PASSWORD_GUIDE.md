# How to Open Password-Protected PDFs

This guide explains how to enable password-protected PDF support in your `PeFlow` project using the existing `pdf-parse` dependency (specifically its internal `pdf.js` library).

## 1. Overview
We utilize generic `pdf.js` logic (bundled within `pdf-parse`) to pass a `password` option when loading the document. This avoids adding new heavyweight dependencies.

## 2. New Files Created
The following files have been generated for you:

1.  **`bend/utils/passwordPdf.js`**:
    *   This is the core utility. It requires the internal `pdf.js` build and exposes a function `parsePasswordPdf(buffer, password)`.
    *   It handles the `PasswordException` and extracts text from all pages.

2.  **`bend/controllers/securePdfController.js`**:
    *   Handles the HTTP request.
    *   Extracts `password` from `req.body` and `file` from `req.file`.
    *   Calls the utility and returns the text.

3.  **`bend/routes/securePdfRoute.js`**:
    *   Defines the POST route `/parse-secure`.

## 3. Integration Step (Final Glue)
To use this in your main application, you need to register the new router in your entry file (`bend/index.js`).

**Add these lines to `bend/index.js`:**

```javascript
// Import the new route
const securePdfRoute = require('./routes/securePdfRoute');

// Register it (e.g., under /api or root)
app.use('/api', securePdfRoute); 
```

## 4. How to Test
You can test this using Postman or a similar tool:

*   **URL**: `http://localhost:5000/parse-secure` (or `/api/parse-secure` if you added the prefix)
*   **Method**: `POST`
*   **Body (form-data)**:
    *   `file`: [Select your PDF file]
    *   `password`: [Enter the PDF password] (Optional, only if encrypted)

## 5. Summary of Changes
*   **No new `npm install` required**: We reused `pdf-parse`'s dependencies.
*   **Separate Files**: Logic is isolated in `utils` and `controllers` as requested.
