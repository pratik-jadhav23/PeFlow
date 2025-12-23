//gemini
import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { parse, differenceInCalendarDays, addDays, format, isValid } from 'date-fns';

/**
 * Helper to parse custom date strings "DD-MM-YYYY" or "DD-MM-YY"
 */
const parseTransactionDate = (dateStr) => {
  // Try parsing 4-digit year format first
  let date = parse(dateStr, 'dd-MM-yyyy', new Date());
  
  // Fallback for 2-digit year if strictly necessary, 
  // though date-fns usually handles generic parsing well if configured.
  // Here we assume the input format provided in the prompt strictly.
  if (!isValid(date)) {
    date = parse(dateStr, 'dd-MM-yy', new Date());
  }
  return date;
};

const WeeklyTransactionChart = ({ transactions }) => {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // 1. Determine the Timeline Range
    const startDate = parseTransactionDate(transactions[0].date);
    const lastDate = parseTransactionDate(transactions[transactions.length - 1].date);
    
    // Calculate total days spanned to determine number of weeks needed
    const totalDays = differenceInCalendarDays(lastDate, startDate) + 1;
    const totalWeeks = Math.ceil(totalDays / 7);

    // 2. Initialize Buckets (ensures continuous weeks even if data is missing)
    const buckets = new Array(totalWeeks).fill(0).map((_, index) => {
      const weekStart = addDays(startDate, index * 7);
      const weekEnd = addDays(weekStart, 6);
      return {
        // Label for the X-Axis (e.g., "01 Nov - 07 Nov")
        name: `${format(weekStart, 'dd MMM')} - ${format(weekEnd, 'dd MMM')}`,
        weekIndex: index,
        credited: 0,
        debited: 0,
      };
    });

    // 3. Aggregate Data into Buckets
    transactions.forEach((t) => {
      const tDate = parseTransactionDate(t.date);
      if (!isValid(tDate)) return;

      // Calculate which week index this transaction belongs to
      const daysDiff = differenceInCalendarDays(tDate, startDate);
      const weekIndex = Math.floor(daysDiff / 7);

      if (buckets[weekIndex]) {
        buckets[weekIndex].credited += (Number(t.credited) || 0);
        buckets[weekIndex].debited += (Number(t.debited) || 0);
      }
    });

    return buckets;
  }, [transactions]);

  if (!transactions || transactions.length === 0) {
    return <div className="p-4 text-gray-500">No transaction data available.</div>;
  }

  return (
    <div className="w-full h-96 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Weekly Transaction Overview</h2>
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
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
            tick={{ fontSize: 12 }} 
            interval={0} // Force show all labels (adjust if too crowded)
          />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`₹${value.toLocaleString()}`, undefined]}
            contentStyle={{ backgroundColor: '#f9fafb', borderRadius: '8px' }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }}/>
          
          <Bar 
            dataKey="credited" 
            name="Credited" 
            fill="#10b981" // Emerald Green
            radius={[4, 4, 0, 0]} 
          />
          <Bar 
            dataKey="debited" 
            name="Debited" 
            fill="#ef4444" // Red
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyTransactionChart;










//-------------old code--------------------------------------
// import React, { useMemo } from 'react';
// import {
//     BarChart,
//     Bar,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     Tooltip,
//     Legend,
//     ResponsiveContainer,
// } from 'recharts';

// const WeeklyTransactionChart = ({ transactions }) => {
//     const processData = (txns) => {
//         if (!txns || txns.length === 0) return [];

//         const weeks = {};

//         txns.forEach((txn, index) => {
//             // 1. Parse Date: Supports dd-mm-yy and dd-mm-yyyy
//             const dateMatch = txn.match(/(\d{1,2})-(\d{1,2})-(\d{2,4})/);
//             if (!dateMatch) return;

//             let [_, day, month, year] = dateMatch;
//             if (year.length === 2) year = '20' + year; // Assume 20xx for 2-digit years

//             const dateObj = new Date(`${year}-${month}-${day}`);
//             if (isNaN(dateObj.getTime())) return;

//             // 2. Parse Amount and Balance
//             // Looks for two numbers at the end: Amount and Balance
//             // Regex: Amount followed by Balance at the end of string
//             const amountsMatch = txn.match(/(\d+\.\d{2})\s+(\d+\.\d{2})$/);
//             if (!amountsMatch) return;

//             const amount = parseFloat(amountsMatch[1]);
//             const balance = parseFloat(amountsMatch[2]);

//             // 3. Determine Type (CR/DR)
//             // Heuristic: explicit CR/DR or deduce from balance change
//             let type = 'DR'; // Default
//             if (txn.includes(' CR ') || txn.includes('/CR/')) {
//                 type = 'CR';
//             } else if (txn.includes(' DR ') || txn.includes('/DR/')) {
//                 type = 'DR';
//             } else {
//                 // Deduction logic for missing tags (e.g., IMPS)
//                 // If we have a previous transaction, we can check balance difference
//                 // This relies on the array being time-sorted (index 0 is oldest?)
//                 // Let's assume input order is chronological or reverse-chronological?
//                 // Actually, let's look at the sample:
//                 // '01-11-25 ...'
//                 // '01-11-25 ...'
//                 // ...
//                 // '30-11-25 ...'
//                 // It seems chronological.

//                 // However, robust deduction on a single item without context is hard.
//                 // For the specific IMPS case in user data: "IMPS... 574.00 5134.96"
//                 // Previous line balance was 4560.96. 4560.96 + 574 = 5134.96. Increase = Credit.

//                 if (index > 0) {
//                     // Need to parse previous balance again to be sure (inefficient but safe)
//                     const prevTxn = txns[index - 1];
//                     const prevAmounts = prevTxn.match(/(\d+\.\d{2})\s+(\d+\.\d{2})$/);
//                     if (prevAmounts) {
//                         const prevBalance = parseFloat(prevAmounts[2]);
//                         if (Math.abs((prevBalance + amount) - balance) < 0.01) {
//                             type = 'CR';
//                         } else if (Math.abs((prevBalance - amount) - balance) < 0.01) {
//                             type = 'DR';
//                         }
//                     }
//                 }
//             }

//             // 4. Group by Week
//             // Get ISO Week number or just "Start of Week"
//             // Let's use "Week of [Date]"
//             const getSunday = (d) => {
//                 const date = new Date(d);
//                 const day = date.getDay();
//                 const diff = date.getDate() - day; // adjust when day is sunday
//                 return new Date(date.setDate(diff));
//             };

//             const weekStart = getSunday(dateObj);
//             const weekKey = weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

//             if (!weeks[weekKey]) {
//                 weeks[weekKey] = { name: weekKey, income: 0, expense: 0, fullDate: weekStart };
//             }

//             if (type === 'CR') {
//                 weeks[weekKey].income += amount;
//             } else {
//                 weeks[weekKey].expense += amount;
//             }
//         });

//         // Convert object to array and sort by date
//         return Object.values(weeks).sort((a, b) => a.fullDate - b.fullDate);
//     };

//     const data = useMemo(() => processData(transactions), [transactions]);

//     return (
//         <div className="w-full h-80 p-4 bg-white rounded-xl shadow-md border border-gray-100">
//             <h3 className="text-lg font-semibold text-gray-700 mb-4">Weekly Financial Report</h3>
//             <ResponsiveContainer width="100%" height="100%">
//                 <BarChart
//                     data={data}
//                     margin={{
//                         top: 20,
//                         right: 30,
//                         left: 20,
//                         bottom: 5,
//                     }}
//                 >
//                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                     <XAxis
//                         dataKey="name"
//                         axisLine={false}
//                         tickLine={false}
//                         tick={{ fill: '#6B7280', fontSize: 12 }}
//                         dy={10}
//                     />
//                     <YAxis
//                         axisLine={false}
//                         tickLine={false}
//                         tick={{ fill: '#6B7280', fontSize: 12 }}
//                         tickFormatter={(value) => `₹${value}`}
//                     />
//                     <Tooltip
//                         contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
//                         cursor={{ fill: 'transparent' }}
//                     />
//                     <Legend wrapperStyle={{ paddingTop: '20px' }} />
//                     <Bar
//                         name="Income"
//                         dataKey="income"
//                         fill="#10B981"
//                         radius={[4, 4, 0, 0]}
//                         barSize={20}
//                     />
//                     <Bar
//                         name="Expense"
//                         dataKey="expense"
//                         fill="#EF4444"
//                         radius={[4, 4, 0, 0]}
//                         barSize={20}
//                     />
//                 </BarChart>
//             </ResponsiveContainer>
//         </div>
//     );
// };

// export default WeeklyTransactionChart;
