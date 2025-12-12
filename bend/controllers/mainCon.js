const multer = require("multer")
const pdf = require('pdf-parse');

let upload = multer()

function parseTransactionBlock(block) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const date = lines[0] || '';
    const time = lines[1] || '';
    const merged = lines.slice(2).join(' ');

    // This pattern matches everything properly in one go
    const match = merged.match(
        /^(DEBIT|CREDIT)₹([\d,\.]+)\s*([A-Za-z]+(?:\s+[A-Za-z]+)?)\s*(.*?)\s*Transaction ID/
    );

    return {
        date,
        time,
        type: match?.[1] || '',
        amount: match?.[2]?.replace(/,/g, '') || '',
        action: match?.[3] || '',
        name: match?.[4]?.trim() || ''
    };
}

let groupAmount = (transactions) => {
    let debitAmount = transactions.reduce((acc, tx) => {
        const amt = parseFloat(tx.amount);
        if (tx.type === 'DEBIT') acc.debit += amt;
        else if (tx.type === 'CREDIT') acc.credit += amt;
        return acc;
    }, { debit: 0, credit: 0 })

    return debitAmount
}

let nameWise = (transactions) => {
    const accountSummary = transactions.reduce((acc, tx) => {
        const { name, type, amount } = tx;
        const amt = Number(amount);

        if (!acc[name]) {
            acc[name] = { credited: 0, debited: 0, transactionsCount: 0 };
        }

        if (type === 'CREDIT') {
            acc[name].credited += amt
            acc[name].transactionsCount += 1
        };
        if (type === 'DEBIT') {
            acc[name].debited += amt
            acc[name].transactionsCount += 1
        };

        return acc;
    }, {});

    const summaryList = Object.entries(accountSummary).map(([name, amounts]) => ({
        name,
        ...amounts
    }));

    return summaryList;
}

let dateWise = (transactions) => {
    const dateSummary = transactions.reduce((acc, tx) => {
        const { date, type, amount } = tx;
        const amt = Number(amount);

        if (!acc[date]) {
            acc[date] = { credited: 0, debited: 0 };
        }

        if (type === 'CREDIT') acc[date].credited += amt;
        if (type === 'DEBIT') acc[date].debited += amt;

        return acc;
    }, {});

    const dateArray = Object.entries(dateSummary)
        .map(([date, values]) => ({ date, ...values }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    return dateArray;
}

let monthWise = (transactions) => {
    const monthlySummary = transactions.reduce((acc, tx) => {
        const { date, type, amount } = tx;
        const amt = Number(amount);

        // Extract month and year → "Apr 2025"
        const [month, , year] = date.split(' ');
        const monthKey = `${month} ${year}`;

        if (!acc[monthKey]) {
            acc[monthKey] = { credited: 0, debited: 0 };
        }

        if (type === 'CREDIT') acc[monthKey].credited += amt;
        if (type === 'DEBIT') acc[monthKey].debited += amt;

        return acc;
    }, {});

    const monthlyArray = Object.entries(monthlySummary)
        .map(([month, totals]) => ({ month, ...totals }));

    return monthlyArray
}

const getStats = transactions => {
    const type = groupAmount(transactions);
    const dates = transactions.map(tx => new Date(tx.date)).filter(d => !isNaN(d)).sort((a, b) => a - b);
    const period = dates.length ? `${dates[0].toDateString()} to ${dates.at(-1).toDateString()}` : '';

    return {
        transactionPeriod: period,
        totalTransactions: transactions.length,
        totalAmountSpent: type.debit,
        totalAmountRecieved: type.credit,
        netAmount: type.credit - type.debit
    };
};

let parse = async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let data = await pdf(req.file.buffer)

        let text = data.text

        const pattern = /[A-Z][a-z]{2} \d{1,2}, \d{4}[\s\S]*?(?:Paid by|Credited to)\s+\w+/g;

        const matches = [...text.matchAll(pattern)];

        const transactions = matches.map(m => parseTransactionBlock(m[0]));

        if (transactions.length === 0) {
            return res.status(422).json({ message: 'No transactions found. Please upload a valid PDF.' });
        }

        const type = groupAmount(transactions)

        // console.log(transactions)

        res.status(200).json({
            success: true,
            pdfType: "normal",
            transactions,
            stats: {
                transactionPeriod: `${transactions.at(-1).date} - ${transactions.at(0).date}`,
                totalTransactions: transactions.length,
                totalAmountSpent: type.debit,
                totalAmountRecieved: type.credit,
                netAmount: type.credit - type.debit,
            },
            groupings: {
                // type: groupAmount(transactions) || 0,
                contact: nameWise(transactions) || 0,
                date: dateWise(transactions) || "",
                month: monthWise(transactions) || ""
            }
        })
    }
    catch (err) {
        console.log('error in parse controller', err.message)
        res.status(500).json({ message: 'Internal server error' })
    }
}

module.exports = { parse, upload }