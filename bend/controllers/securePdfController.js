const { text } = require('express');
const { parsePasswordPdf } = require('../utils/passwordPdf');
const multer = require('multer');

// Configure multer for file upload
const upload = multer();

/**
 * Controller to handle password-protected PDF parsing.
 * Expects 'file' in form-data and 'password' in body (optional).
 */

const monthWise = (text) => {

}

const contactWise = (text, bankType) => {
    try {
        const contact = []
        let transactions
        let currentBalance
        let openingBalance
        let closingBalance = 0.0
        let totalSpent = 0.0;
        let totalReceived = 0.0;

        let data = text.split(/(Opening Balance)/)
        let ind = data.indexOf("Opening Balance") + 1

        if (bankType === "AXIS") {
            // const regex = /\d{2}-\d{2}-\d{4}.*?\.\d{2}/g;
            currentBalance = parseFloat(data[ind].trim().split(" ", 3)[0])
            closingBalance = parseFloat(text.split(/(Closing Balance)/)[text.split(/(Closing Balance)/).indexOf("Closing Balance") + 1].trim().split("\n")[0].trim())
            data = data[ind].split(/(Closing Balance)/)[0]
            transactions = data.split(/(?=\d{2}-\d{2}-\d{4})/);

            let elToDel
            transactions = transactions.map((item, ind) => {
                // console.log(ind)
                if (item.includes("SB:") && item.includes(":Int.")) {
                    // console.log("true")
                    elToDel = ind
                    return item + transactions[ind + 1].replaceAll(",", "").trim()
                }
                return item.replaceAll(",", "").trim()
            }).splice(1)
            transactions = transactions.filter((item, ind) => ind != elToDel)

            // console.log("before splice(1) transactions = ", transactions);
            // transactions = transactions.map(item => item.replaceAll(",", "").trim()).splice(1)
            console.log("in axis ", ind);
        }
        else if (bankType === "SBI") {
            closingBalance = parseFloat(data[ind].split(/(Your Closing Balance on)/)[data[ind].split(/(Your Closing Balance on)/).indexOf("Your Closing Balance on") + 1].trim().split(" ")[1].trim())
            // console.log("closing balance = ", closingBalance)
            data = data[ind].split(/(Your Closing Balance)/)[0]
            transactions = data.split(/(?=\d{2}-\d{2}-\d{2})/);
            currentBalance = parseFloat(transactions[1].trim().split(" ")[3])
            transactions = transactions.map(item => item.trim()).splice(2)
            transactions = transactions.map((transaction) => {
                if (transaction.includes(" Visit https://sbi.co.in ")) {
                    let tempTransaction = transaction.slice(0, transaction.indexOf(" Visit https://sbi.co.in "))
                    return tempTransaction.slice(0, 9) + tempTransaction.slice(9).replaceAll("- ", "").trim()
                }
                else if (transaction.includes(" Balance Summary Rs")) {
                    return ""
                }
                else {
                    return transaction.slice(0, 9) + transaction.slice(9).replaceAll("- ", "").trim()
                }
            })
            transactions = transactions.filter((transaction) => transaction !== "")
        }
        openingBalance = currentBalance
        // console.log("Data - ", data);

        console.log("transactions = ", transactions);


        let creditedCount = 0
        let debitedCount = 0
        transactions = transactions.map((transaction, ind) => {
            let name, credited, debited
            // console.log("transaction = ", transaction);

            let transactionBal = parseFloat(transaction.split(" ").at(-1).split(",").join(""))
            let transactionDateLength = transaction.split(" ").at(0).length
            let obj = {}

            // console.log("in transactions.map : ", transactionBal, currentBalance);


            if (transactionBal > currentBalance) {
                //credited
                // console.log(" in if: ", transaction.slice(transactionDateLength));
                if (transaction.slice(transactionDateLength).trim().startsWith("UPI/")) {
                    name = transaction.slice(transactionDateLength).split("/")[3].trim()
                }
                else {

                    name = transaction.slice(transactionDateLength).trim().split("/")[0].trim()
                }
                credited = parseFloat(transaction.split(" ").at(-2))
                let findIndex = contact.findIndex(item => item.name === name)
                if (findIndex !== -1) {
                    contact[findIndex].credited += credited
                    contact[findIndex].transactionsCount += 1
                }
                else {
                    contact.push({ name: name, debited: 0, credited: credited, transactionsCount: 1 })
                }
                totalReceived += credited
                creditedCount += 1
                currentBalance = transactionBal
                obj = { date: transaction.split(" ").at(0), name, credited, debited: 0 }


            }
            else {
                //debited
                // console.log("in debited : ", transactionBal, currentBalance);
                name = transaction.slice(transactionDateLength).split("/")[3].trim()
                debited = parseFloat(transaction.split(" ").at(-2))
                // console.log("name = ", name, "debited = ", debited, "transactionBal = ", transactionBal, "currentBalance = ", currentBalance)
                let findIndex = contact.findIndex(item => item.name === name)
                if (findIndex !== -1) {
                    contact[findIndex].debited += debited
                    contact[findIndex].transactionsCount += 1

                }
                else {
                    contact.push({ name: name, debited: debited, credited: 0, transactionsCount: 1 })
                }
                totalSpent += debited
                debitedCount += 1
                currentBalance = transactionBal
                obj = { date: transaction.split(" ").at(0), name, credited: 0, debited }

            }

            return obj

        })

        let totalTransactionsCount = contact.reduce((acc, item) => acc + item.transactionsCount, 0)

        return { contact, transactionsLength: transactions.length, totalTransactionsCount, totalSpent, totalReceived, openingBalance, closingBalance, transactions }
    } catch (error) {
        console.log("Error in contact wise: ", error.message);


    }


}

const getTransactionPeriod = (text, bankType) => {
    if (bankType === 'AXIS') {
        let dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})\s+to\s+(\d{2}\/\d{2}\/\d{4})/);
        // console.log("dateMatch = ", dateMatch)

        if (dateMatch) {

            let startDateParts = dateMatch[1].split('/'); // ["01", "08", "2025"]
            let endDateParts = dateMatch[2].split('/');   // ["31", "08", "2025"]

            // Create Date objects (Note: Month is 0-indexed in JS, so subtract 1)
            let startDate = new Date(startDateParts[2], startDateParts[1] - 1, startDateParts[0]);
            let endDate = new Date(endDateParts[2], endDateParts[1] - 1, endDateParts[0]);

            // 2. Format the output as "Sep 12, 2025 - Dec 12, 2025"
            let options = { year: 'numeric', month: 'short', day: '2-digit' };


            let formattedStart = startDate.toLocaleDateString('en-US', options);
            let formattedEnd = endDate.toLocaleDateString('en-US', options);





            // 3. Count total days (Inclusive)
            // Calculate difference in milliseconds, convert to days, add 1 for inclusive count
            let timeDiff = endDate.getTime() - startDate.getTime();
            let totalDays = (timeDiff / (1000 * 3600 * 24)) + 1;


            return { formattedStart, formattedEnd, totalDays };
        }

    }
    else if (bankType === 'SBI') {
        // Regex patterns to capture dates in DD-MM-YY format
        const startRegex = /Your Opening Balance on (\d{2}-\d{2}-\d{2})/;
        const endRegex = /Your Closing Balance on (\d{2}-\d{2}-\d{2})/;

        const startMatch = text.match(startRegex);
        const endMatch = text.match(endRegex);

        if (!startMatch || !endMatch) {
            return "Dates not found in text.";
        }

        const startStr = startMatch[1]; // "01-11-25"
        const endStr = endMatch[1];   // "30-11-25"

        // Helper to parse DD-MM-YY to a JS Date Object
        const parseDate = (dateStr) => {
            const [day, month, year] = dateStr.split('-').map(Number);
            // JS Months are 0-indexed (Jan = 0, Nov = 10)
            return new Date(2000 + year, month - 1, day);
        };

        const startDateObj = parseDate(startStr);
        const endDateObj = parseDate(endStr);

        // Format for display: Nov, 01 2025
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const formattedStart = `${months[startDateObj.getMonth()]}, ${String(startDateObj.getDate()).padStart(2, '0')} ${startDateObj.getFullYear()}`;
        const formattedEnd = `${months[endDateObj.getMonth()]}, ${String(endDateObj.getDate()).padStart(2, '0')} ${endDateObj.getFullYear()}`;

        // Calculate difference in days
        // 1000ms * 60s * 60m * 24h
        const diffInTime = endDateObj.getTime() - startDateObj.getTime();
        const totalDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));

        return {
            formattedStart,
            formattedEnd,
            totalDays: totalDays // Returns 29 (difference) or you can use (totalDays + 1) for inclusive count
        };
    }


}






const parseSecurePdf = async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Get password from request body (if provided)
        console.log(req.body);
        const password = req.body.pdfPassword || "";
        const bankType = req.body.bankType || "AXIS";
        // const smartSort = true;
        console.log("bankType = ", bankType)





        const data = await parsePasswordPdf(req.file.buffer, password, bankType);

        // Here you can add your transaction parsing logic similar to mainCon.js
        // For now, we return the raw text to confirm it opened.

        const text = data.text
        let { contact, transactionsLength, totalTransactionsCount, totalSpent, totalReceived, openingBalance, closingBalance, transactions } = contactWise(text, bankType)
        let netAmount = totalReceived - totalSpent

        const { formattedStart, formattedEnd, totalDays } = getTransactionPeriod(text, bankType);
        res.status(200).json({
            success: true,
            pdfType: "secure",
            bankType: req.body.bankType,
            groupings: {
                month: [{
                    month: formattedStart.split(" ")[0] + " " + formattedStart.split(" ").at(-1),
                    credited: totalReceived,
                    debited: totalSpent

                }],
                contact: contact,
                totalTransactionsCount: totalTransactionsCount
            },
            stats: {
                transactionPeriod: `${formattedStart} - ${formattedEnd}`,
                totalDays: totalDays,
                totalAmountSpent: totalSpent,
                totalAmountRecieved: totalReceived,
                netAmount: netAmount,
                totalTransactions: transactionsLength,
                openingBalance: openingBalance,
                openingBalanceDate: formattedStart,
                closingBalance: closingBalance,
                closingBalanceDate: formattedEnd
            },
            transactions: transactions,
            transactionsLength: transactionsLength,
            numpages: data.numpages,
            text_preview: data.text.substring(0, 200) + "...", // Preview of extracted text
            full_text_length: data.text.length,
            text: data.text,
        })

    } catch (err) {
        console.error('Error parsing PDF:', err.message);

        if (err.message.includes('Password')) {
            return res.status(401).json({ message: 'Invalid password or password required.' });
        }

        res.status(500).json({ message: 'Failed to process PDF', details: 'Error parsing PDF: ' + err.message });
    }
};

module.exports = { parseSecurePdf, upload };
