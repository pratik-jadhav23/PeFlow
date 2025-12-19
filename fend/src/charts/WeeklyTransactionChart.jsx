import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const WeeklyTransactionChart = ({ transactions }) => {
    const processData = (txns) => {
        if (!txns || txns.length === 0) return [];

        const weeks = {};

        txns.forEach((txn, index) => {
            // 1. Parse Date: Supports dd-mm-yy and dd-mm-yyyy
            const dateMatch = txn.match(/(\d{1,2})-(\d{1,2})-(\d{2,4})/);
            if (!dateMatch) return;

            let [_, day, month, year] = dateMatch;
            if (year.length === 2) year = '20' + year; // Assume 20xx for 2-digit years

            const dateObj = new Date(`${year}-${month}-${day}`);
            if (isNaN(dateObj.getTime())) return;

            // 2. Parse Amount and Balance
            // Looks for two numbers at the end: Amount and Balance
            // Regex: Amount followed by Balance at the end of string
            const amountsMatch = txn.match(/(\d+\.\d{2})\s+(\d+\.\d{2})$/);
            if (!amountsMatch) return;

            const amount = parseFloat(amountsMatch[1]);
            const balance = parseFloat(amountsMatch[2]);

            // 3. Determine Type (CR/DR)
            // Heuristic: explicit CR/DR or deduce from balance change
            let type = 'DR'; // Default
            if (txn.includes(' CR ') || txn.includes('/CR/')) {
                type = 'CR';
            } else if (txn.includes(' DR ') || txn.includes('/DR/')) {
                type = 'DR';
            } else {
                // Deduction logic for missing tags (e.g., IMPS)
                // If we have a previous transaction, we can check balance difference
                // This relies on the array being time-sorted (index 0 is oldest?)
                // Let's assume input order is chronological or reverse-chronological?
                // Actually, let's look at the sample:
                // '01-11-25 ...'
                // '01-11-25 ...'
                // ...
                // '30-11-25 ...'
                // It seems chronological.

                // However, robust deduction on a single item without context is hard.
                // For the specific IMPS case in user data: "IMPS... 574.00 5134.96"
                // Previous line balance was 4560.96. 4560.96 + 574 = 5134.96. Increase = Credit.

                if (index > 0) {
                    // Need to parse previous balance again to be sure (inefficient but safe)
                    const prevTxn = txns[index - 1];
                    const prevAmounts = prevTxn.match(/(\d+\.\d{2})\s+(\d+\.\d{2})$/);
                    if (prevAmounts) {
                        const prevBalance = parseFloat(prevAmounts[2]);
                        if (Math.abs((prevBalance + amount) - balance) < 0.01) {
                            type = 'CR';
                        } else if (Math.abs((prevBalance - amount) - balance) < 0.01) {
                            type = 'DR';
                        }
                    }
                }
            }

            // 4. Group by Week
            // Get ISO Week number or just "Start of Week"
            // Let's use "Week of [Date]"
            const getSunday = (d) => {
                const date = new Date(d);
                const day = date.getDay();
                const diff = date.getDate() - day; // adjust when day is sunday
                return new Date(date.setDate(diff));
            };

            const weekStart = getSunday(dateObj);
            const weekKey = weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

            if (!weeks[weekKey]) {
                weeks[weekKey] = { name: weekKey, income: 0, expense: 0, fullDate: weekStart };
            }

            if (type === 'CR') {
                weeks[weekKey].income += amount;
            } else {
                weeks[weekKey].expense += amount;
            }
        });

        // Convert object to array and sort by date
        return Object.values(weeks).sort((a, b) => a.fullDate - b.fullDate);
    };

    const data = useMemo(() => processData(transactions), [transactions]);

    return (
        <div className="w-full h-80 p-4 bg-white rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Weekly Financial Report</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        cursor={{ fill: 'transparent' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar
                        name="Income"
                        dataKey="income"
                        fill="#10B981"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                    />
                    <Bar
                        name="Expense"
                        dataKey="expense"
                        fill="#EF4444"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default WeeklyTransactionChart;
