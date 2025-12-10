const { parsePasswordPdf } = require('../utils/passwordPdf');
const multer = require('multer');

// Configure multer for file upload
const upload = multer();

/**
 * Controller to handle password-protected PDF parsing.
 * Expects 'file' in form-data and 'password' in body (optional).
 */

const contactWise = (text) => {
    const contact = []
    let data = text.split(/(Opening Balance)/)
    let ind = data.indexOf("Opening Balance") + 1
    let transactionStartDate = data[ind].trim().split(" ", 3)[1]
    let currentBalance = parseFloat(data[ind].trim().split(" ", 3)[0])

    data = data[ind]
    data = data.split(/(Closing Balance)/)
    let closingBalance = parseFloat(data[data.indexOf("Closing Balance") + 1].trim().split(" ", 3)[0])
    data = data[0]
    // const dynamicRegex = new RegExp(`(${transactionStartDate})`);

    let transactions = data.split(/(?=\d{2}-\d{2}-\d{4})/);

    // Clean up the results (trim whitespace)
    transactions = transactions.map(item => item.trim()).splice(1)
    // console.log(transactions);

    // Print the result
    // console.log(transactions);
    transactions = transactions.map(item => {
        // console.log(currentBalance,item.split(" ").at(-1))
        let name, credited, debited
        let itemBal = parseFloat(item.split(" ").at(-1).split(",").join(""))
        // console.log(typeof currentBalance,typeof itemBal);
        if (itemBal > currentBalance) {
            // console.log("deposited",item);
            if (item.slice(11).startsWith("UPI/")) {
                // console.log("name = ",item.slice(11).split("/")[3]);
                name = item.slice(11).split("/")[3]
                // console.log("credited = ",parseFloat(item.slice(11).split("/").at(-1).trim().split(" ").at(0).split(",").join("")));
                credited = parseFloat(item.slice(11).split("/").at(-1).trim().split(" ").at(0).split(",").join(""))
                if (contact.findIndex(item => item.name === name) !== -1) {
                    // console.log("found");
                    contact[contact.findIndex(item => item.name === name)].credited += credited
                    contact[contact.findIndex(item => item.name === name)].transactionsCount += 1

                }
                else {
                    contact.push({ name: name, debited: 0, credited: credited, transactionsCount: 1 })
                }

            }
            else {
                // console.log("name = ",item.slice(11).split("/")[0]);
                name = item.slice(11).split("/")[0]

                //  console.log("credited = ",parseFloat(item.slice(11).split("/").at(-1).trim().split(" ").at(-2).split(",").join("")));
                credited = parseFloat(item.slice(11).split("/").at(-1).trim().split(" ").at(-2).split(",").join(""))

            }

            currentBalance = itemBal

        }
        else {
            name = item.slice(11).split("/")[3]
            debited = parseFloat(item.slice(11).split("/").at(-1).trim().split(" ").at(-2).split(",").join(""))
            // console.log("withdraw", debited);
            if (contact.findIndex(item => item.name === name) !== -1) {
                // console.log("found");
                contact[contact.findIndex(item => item.name === name)].debited += debited
                contact[contact.findIndex(item => item.name === name)].transactionsCount += 1

            }
            else {
                contact.push({ name: name, debited: debited, credited: 0, transactionsCount: 1 })
            }
            currentBalance = itemBal
        }

    })
    console.log(contact);
    return { contact, ["transactions"]: transactions.length }

    // console.log(data);
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
        // console.log("no err");

        let formattedStart = startDate.toLocaleDateString('en-US', options);
        let formattedEnd = endDate.toLocaleDateString('en-US', options);



        // console.log(`${formattedStart} - ${formattedEnd}`);

        // 3. Count total days (Inclusive)
        // Calculate difference in milliseconds, convert to days, add 1 for inclusive count
        let timeDiff = endDate.getTime() - startDate.getTime();
        let totalDays = (timeDiff / (1000 * 3600 * 24)) + 1;

        // console.log("Total Days: " + Math.round(totalDays));
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

    console.log("Opening Balance:", currentBalance);

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

function parseBankTransactions(text) {
    const lines = text.split(/\r?\n/);
    const dateLineRe = /^\s*(\d{2}-\d{2}-\d{4})\s+(.+)$/; // captures date and rest
    const moneyRe = /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g;

    // Utility: parse money string "13,850.00" -> 13850
    const parseMoney = s => parseFloat(s.replace(/,/g, ''));

    // Normalize name helper
    function normalizeNameFromDesc(desc) {
        desc = desc.trim();

        // UPI style: "UPI/P2M/136068309500/GYAN  RANJAN  /Paymen/YES BANK..."
        if (/^UPI\//i.test(desc)) {
            const parts = desc.split('/');
            if (parts.length >= 4) {
                return parts[3].replace(/\s{2,}/g, ' ').trim().replace(/[^\w\s.-]/g, '');
            }
        }

        // If there's a pattern like "NAME PR/Salary" or "NAME - ..." capture leading uppercase-ish chunk
        // Capture characters until " PR/" or " /" or " - " or numbers appear
        let m = desc.match(/^([A-Z0-9 &.-]+?)(?=\s+PR\/|\s+\/|\s+-|\s+\d|$)/i);
        if (m && m[1]) {
            return m[1].replace(/\s{2,}/g, ' ').trim();
        }

        // fallback: take first 3 words (cleaned)
        const fallback = desc.split(/\s+/).slice(0, 3).join(' ');
        return fallback.replace(/[^\w\s.-]/g, '').trim();
    }

    // get opening balance if present in text lines like "Opening Balance 14.94"
    let openingBalance = null;
    for (const l of lines) {
        const obMatch = l.match(/Opening\s+Balance\s+(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/i);
        if (obMatch) {
            openingBalance = parseMoney(obMatch[1]);
            break;
        }
    }

    const map = new Map(); // name -> {credited, debited, transactionCount}
    let lastBalance = openingBalance; // used to infer credit/debit
    // We'll parse lines in the order given (assumed chronological in statement)
    for (const rawLine of lines) {
        const line = rawLine.trim();
        const dl = line.match(dateLineRe);
        if (!dl) continue; // not a transaction line

        const date = dl[1];
        const rest = dl[2];

        // collect money-like tokens from rest
        const moneyTokens = [];
        let m;
        while ((m = moneyRe.exec(rest)) !== null) {
            moneyTokens.push(m[1]);
        }

        if (moneyTokens.length === 0) continue; // no numeric amounts found, skip

        // Heuristic: last money token is usually 'balance'
        const balanceToken = moneyTokens[moneyTokens.length - 1];
        const balance = parseMoney(balanceToken);

        // txn amount candidate: the token just before the last (if exists)
        let txnAmountToken = moneyTokens.length >= 2 ? moneyTokens[moneyTokens.length - 2] : null;
        let txnAmount = txnAmountToken ? parseMoney(txnAmountToken) : null;

        // If txnAmount missing, we can't do much; skip
        if (txnAmount === null) {
            // possible special case: some lines might have only one monetary column (balance),
            // so we attempt to infer from balance change if lastBalance exists
            if (lastBalance !== null) {
                const diff = Math.round((balance - lastBalance) * 100) / 100;
                txnAmount = Math.abs(diff);
            } else {
                continue;
            }
        }

        // Determine credit vs debit:
        let isCredit = null; // true => credit, false => debit
        if (lastBalance !== null) {
            // Prefer balance-diff rule
            const diff = Math.round((balance - lastBalance) * 100) / 100;
            // If diff near txnAmount (allow small floating error), use it
            if (Math.abs(Math.abs(diff) - txnAmount) < 0.01) {
                isCredit = diff > 0;
            } else {
                // If not matching, fallback to keyword heuristics:
                // UPI/P2A is usually credit, P2M usually debit (common pattern)
                if (/UPI\/P2A/i.test(rest)) isCredit = true;
                else if (/UPI\/P2M/i.test(rest)) isCredit = false;
                else if (/PR\/|Salary|CREDIT/i.test(rest)) isCredit = true;
                else if (/Paymen|PAYMENT|UPI\/P2M|Debit|WITHDRAW/i.test(rest)) isCredit = false;
                else {
                    // final fallback: if balance increased, treat as credit
                    isCredit = diff > 0;
                }
            }
        } else {
            // no lastBalance available; use heuristics from description
            if (/UPI\/P2A/i.test(rest)) isCredit = true;
            else if (/UPI\/P2M/i.test(rest)) isCredit = false;
            else if (/PR\/|Salary|CREDIT/i.test(rest)) isCredit = true;
            else isCredit = false; // conservative default
        }

        // Extract name
        const name = normalizeNameFromDesc(rest).toUpperCase();

        // accumulate
        const key = name || 'UNKNOWN';
        if (!map.has(key)) map.set(key, { name: key, credited: 0, debited: 0, transactionCount: 0 });
        const entry = map.get(key);
        if (isCredit) {
            entry.credited = Math.round((entry.credited + txnAmount) * 100) / 100;
        } else {
            entry.debited = Math.round((entry.debited + txnAmount) * 100) / 100;
        }
        entry.transactionCount += 1;

        // update lastBalance for next iteration
        lastBalance = balance;
    }

    // convert map to array and sort by total activity desc
    const result = Array.from(map.values())
        .sort((a, b) => (b.credited + b.debited) - (a.credited + a.debited));

    return result;
}

// function groupingByContacts(text) {
//     // 1. Extract Opening Balance
//     // We need this to determine if subsequent transactions are Credits or Debits
//     const openingBalanceMatch = text.match(/Opening Balance\s+([\d,]+\.\d{2})/);
//     let currentBalance = openingBalanceMatch ? parseFloat(openingBalanceMatch[1].replace(/,/g, '')) : 0.00;

//     // 2. Split text into lines and initialize storage
//     const lines = text.split('\n');
//     const groupedData = {};

//     // Regex to identify transaction lines: 
//     // Starts with Date (DD-MM-YYYY) -> Description -> Amount -> Balance
//     const txnRegex = /^(\d{2}-\d{2}-\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})$/;

//     lines.forEach(line => {
//         const match = line.trim().match(txnRegex);
//         if (!match) return;

//         // 3. Extract Raw Data
//         const rawDescription = match[2];
//         const amount = parseFloat(match[3].replace(/,/g, ''));
//         const lineBalance = parseFloat(match[4].replace(/,/g, ''));

//         // 4. Determine Transaction Type (Credit vs Debit) using Math
//         // If (CurrentBalance + Amount = NewBalance) -> Credit
//         // If (CurrentBalance - Amount = NewBalance) -> Debit
//         let type = 'unknown';
//         if (Math.abs((currentBalance + amount) - lineBalance) < 0.1) {
//             type = 'credit';
//         } else if (Math.abs((currentBalance - amount) - lineBalance) < 0.1) {
//             type = 'debit';
//         }

//         // Update running balance for the next iteration
//         currentBalance = lineBalance;

//         // 5. Clean the Name
//         let name = rawDescription;

//         if (rawDescription.includes('UPI/')) {
//             // Logic for UPI: UPI/P2M/ID/NAME/... -> Take the 4th part (index 3)
//             const parts = rawDescription.split('/');
//             if (parts.length >= 4) {
//                 name = parts[3];
//             }
//         } else {
//             // Logic for Others (Salary, NEFT, etc.): Take part before first '/'
//             // Example: "VECTOR INDIA PR/Salary" -> "VECTOR INDIA PR"
//             name = rawDescription.split('/')[0];

//             // Specific cleanup for "VECTOR INDIA PR" -> "VECTOR INDIA"
//             // Removes trailing " PR" if it exists, as per your request
//             name = name.replace(/\sPR$/, '');
//         }

//         // Final trim to remove extra spaces
//         name = name.trim();

//         // 6. Aggregate Data
//         if (!groupedData[name]) {
//             groupedData[name] = {
//                 name: name,
//                 credited: 0,
//                 debited: 0,
//                 transactionCount: 0
//             };
//         }

//         if (type === 'credit') {
//             groupedData[name].credited += amount;
//         } else if (type === 'debit') {
//             groupedData[name].debited += amount;
//         }
//         groupedData[name].transactionCount++;
//     });

//     // 7. Return as Array and format numbers
//     return Object.values(groupedData).map(item => ({
//         name: item.name,
//         credited: parseFloat(item.credited.toFixed(2)),
//         debited: parseFloat(item.debited.toFixed(2)),
//         transactionCount: item.transactionCount
//     }));
// }

// --- Example Usage ---
// Assuming 'statementText' is your long string variable
// const result = parseBankStatement(statementText);
// console.log(result);




const parseSecurePdf = async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Get password from request body (if provided)
        // console.log(req.body);
        const password = req.body.pdfPassword || "";
        console.log(password);


        console.log(`Processing PDF. Password provided: ${password ? 'Yes' : 'No'}`);

        const data = await parsePasswordPdf(req.file.buffer, password);

        // Here you can add your transaction parsing logic similar to mainCon.js
        // For now, we return the raw text to confirm it opened.

        const text = data.text

        const { formattedStart, formattedEnd, totalDays } = getTransactionPeriod(text);
        const { totalSpent, totalReceived, netAmount } = parseBankStatement(text);
        // const {groupings} = parseBankStatement(text);
        // console.log(groupings);

        // const groupings = groupingByContacts(text);
        // console.log(groupings);

        res.status(200).json({
            success: true,
            numpages: data.numpages,
            groupings: {
                contact: contactWise(text).contact
            },
            stats: {
                transactionPeriod: `${formattedStart} - ${formattedEnd}`,
                totalDays: totalDays,
                totalAmountSpent: totalSpent,
                totalAmountRecieved: totalReceived,
                netAmount: netAmount,
                totalTransactions: contactWise(text).transactions
            },
            transactions: contactWise(text).transactions,
            text_preview: data.text.substring(0, 200) + "...", // Preview of extracted text
            text: data.text,
            full_text_length: data.text.length,
            // transactions: parseTransactions(data.text) // Call your parser here
        });

    } catch (err) {
        console.error('Error parsing PDF:', err.message);

        if (err.message.includes('Password')) {
            return res.status(401).json({ error: 'Invalid password or password required.' });
        }

        res.status(500).json({ error: 'Failed to process PDF', details: 'Error parsing PDF: ' + err.message });
    }
};

module.exports = { parseSecurePdf, upload };
