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
    const contact = []
    let transactions
    let currentBalance
    let data = text.split(/(Opening Balance)/)
    let ind = data.indexOf("Opening Balance") + 1
    // let transactionStartDate = data[ind].trim().split(" ", 3)[1]
    // currentBalance = parseFloat(data[ind].trim().split(" ", 3)[0])
    // data = data[ind].split(/(Closing Balance)/)[0]
    // let closingBalance = parseFloat(data[data.indexOf("Closing Balance") + 1].trim().split(" ", 3)[0])
    // data = data[0]
    // const dynamicRegex = new RegExp(`(${transactionStartDate})`);
    // console.log("bankType = ", bankType);

    if (bankType === "AXIS") {
        // console.log("in AXIS");
        currentBalance = parseFloat(data[ind].trim().split(" ", 3)[0])
        data = data[ind].split(/(Closing Balance)/)[0]
        transactions = data.split(/(?=\d{2}-\d{2}-\d{4})/);
        transactions = transactions.map(item => item.trim()).splice(1)

        // console.log("transactions AXIS = ", transactions, "transactions length AXIS = ", transactions.length);
    }
    else if (bankType === "SBI") {
        // console.log("data = ", data, "ind = ", ind)
        data = data[ind].split(/(Your Closing Balance)/)[0]
        transactions = data.split(/(?=\d{2}-\d{2}-\d{2})/);
        currentBalance = parseFloat(transactions[1].trim().split(" ")[3])
        transactions = transactions.map(item => item.trim()).splice(2)
        // console.log("transactions SBI = ", transactions, "transactions length SBI = ", transactions.length);
    }

    console.log("final data = ", data);
    console.log("currentBalance = ", currentBalance);
    console.log("transactions = ", transactions);
    console.log("transactions.length = ", transactions.length);





    // transactions = data.split(/(?=\d{2}-\d{2}-\d{4})/);

    // Clean up the results (trim whitespace)
    // transactions = transactions.map(item => item.trim()).splice(1)

    // transactions = transactions.map(item => console.log("item = ", item));

    // Print the result
    // console.log("transactions.len = ", transactions.length);


    transactions = transactions.map((item, ind) => {
        // console.log("ind = ", ind, "item = ", item);


        let name, credited, debited
        let itemBal = parseFloat(item.split(" ").at(-1).split(",").join(""))

        if (itemBal > currentBalance) {

            if (item.slice(11).startsWith("UPI/")) {

                name = item.slice(11).split("/")[3]

                credited = parseFloat(item.slice(11).split("/").at(-1).trim().split(" ").at(0).split(",").join(""))
                if (contact.findIndex(item => item.name === name) !== -1) {

                    contact[contact.findIndex(item => item.name === name)].credited += credited
                    contact[contact.findIndex(item => item.name === name)].transactionsCount += 1

                }
                else {
                    contact.push({ name: name, debited: 0, credited: credited, transactionsCount: 1 })
                }

            }
            else {

                name = item.slice(11).split("/")[0]


                credited = parseFloat(item.slice(11).split("/").at(-1).trim().split(" ").at(-2).split(",").join(""))

            }

            currentBalance = itemBal

        }
        else {
            name = item.slice(11).split("/")[3]
            debited = parseFloat(item.slice(11).split("/").at(-1).trim().split(" ").at(-2).split(",").join(""))

            if (contact.findIndex(item => item.name === name) !== -1) {

                contact[contact.findIndex(item => item.name === name)].debited += debited
                contact[contact.findIndex(item => item.name === name)].transactionsCount += 1

            }
            else {
                contact.push({ name: name, debited: debited, credited: 0, transactionsCount: 1 })
            }
            currentBalance = itemBal
        }

    })

    return { contact, ["transactions"]: transactions.length }


    // largeData = {data}
    // console.dir(largeData,{depth: null, maxArrayLength: null});


}

const getTransactionPeriod = (text) => {
    let dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})\s+to\s+(\d{2}\/\d{2}\/\d{4})/);

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

function parseBankStatement(statementText) {
    let totalSpent = 0.0;
    let totalReceived = 0.0;

    // 1. Extract Opening Balance
    // Pattern looks for "Opening Balance" followed by a number
    const openingBalanceMatch = statementText.match(/Opening Balance\s+([\d,]+\.\d{2})/);
    let currentBalance = openingBalanceMatch ? parseFloat(openingBalanceMatch[1].replace(/,/g, '')) : 0.0;



    // 2. Extract Transactions
    // Regex breakdown:
    // (\d{2}-\d{2}-\d{4}) -> Date (Group 1)
    // .*?                 -> Any text (description)
    // ([\d,]+\.\d{2})     -> Transaction Amount (Group 2)
    // \s+
    // ([\d,]+\.\d{2})     -> Resulting Balance (Group 3)
    // 'g' flag to find all matches
    const transactionPattern = /(\d{2}-\d{2}-\d{4}).*?([\d,]+\.\d{2})\s+([\d,]+\.\d{2})/g;

    let match;
    while ((match = transactionPattern.exec(statementText)) !== null) {
        let amount = parseFloat(match[2].replace(/,/g, ''));
        let newBalance = parseFloat(match[3].replace(/,/g, ''));

        // Determine if it is Credit or Debit by comparing balance
        // Rounding to 2 decimal places to avoid floating point errors
        let diff = (newBalance - currentBalance).toFixed(2);

        if (parseFloat(diff) > 0) {
            totalReceived += amount;
        } else {
            totalSpent += amount;
        }

        // Update current balance for the next iteration
        currentBalance = newBalance;
    }

    // 3. Return Results
    return {
        totalSpent: totalSpent.toFixed(2),
        totalReceived: totalReceived.toFixed(2),
        netAmount: currentBalance.toFixed(2)
    };
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
        let { contact, transactions } = contactWise(text, bankType)

        if (bankType === 'AXIS') {
            const { formattedStart, formattedEnd, totalDays } = getTransactionPeriod(text);
            const { totalSpent, totalReceived, netAmount } = parseBankStatement(text);

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
                    contact: contact
                },
                stats: {
                    transactionPeriod: `${formattedStart} - ${formattedEnd}`,
                    totalDays: totalDays,
                    totalAmountSpent: totalSpent,
                    totalAmountRecieved: totalReceived,
                    netAmount: netAmount,
                    totalTransactions: transactions
                },
                numpages: data.numpages,
                text_preview: data.text.substring(0, 200) + "...", // Preview of extracted text
                full_text_length: data.text.length,
                text: data.text,
                // transactions: parseTransactions(data.text) // Call your parser here
            })
        }
        else {
            res.status(200).json({
                success: true,
                pdfType: "secure",
                bankType: req.body.bankType,
                groupings: {
                    contact: contact
                },
                numpages: data.numpages,
                text_preview: data.text.substring(0, 200) + "...", // Preview of extracted text
                full_text_length: data.text.length,
                text: data.text,
                // transactions: parseTransactions(data.text) // Call your parser here
            })

        }

        // const { formattedStart, formattedEnd, totalDays } = getTransactionPeriod(text);
        // const { totalSpent, totalReceived, netAmount } = parseBankStatement(text);


        // const {groupings} = parseBankStatement(text);


        // const groupings = groupingByContacts(text);





    } catch (err) {
        console.error('Error parsing PDF:', err.message);

        if (err.message.includes('Password')) {
            return res.status(401).json({ error: 'Invalid password or password required.' });
        }

        res.status(500).json({ error: 'Failed to process PDF', details: 'Error parsing PDF: ' + err.message });
    }
};

module.exports = { parseSecurePdf, upload };
