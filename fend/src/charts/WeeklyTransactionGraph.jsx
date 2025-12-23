//chatgpt
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ---- Utility: parse multiple date formats safely ----
const parseDate = (dateStr) => {
  // Supports: "01-11-2025", "01-11-25"
  const [dd, mm, yy] = dateStr.split("-");
  const year = yy.length === 2 ? `20${yy}` : yy;
  return new Date(`${year}-${mm}-${dd}`);
};

// ---- Group transactions into weekly buckets ----
const groupByWeeks = (transactions) => {
  if (!transactions.length) return [];

  const startDate = parseDate(transactions[0].date);
  const endDate = parseDate(transactions[transactions.length - 1].date);

  const weeks = [];
  let currentWeekStart = new Date(startDate);

  while (currentWeekStart <= endDate) {
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

    const weeklyTxns = transactions.filter((tx) => {
      const txDate = parseDate(tx.date);
      return txDate >= currentWeekStart && txDate <= currentWeekEnd;
    });

    const credited = weeklyTxns.reduce(
      (sum, tx) => sum + (tx.credited || 0),
      0
    );
    const debited = weeklyTxns.reduce(
      (sum, tx) => sum + (tx.debited || 0),
      0
    );

    weeks.push({
      week: `${currentWeekStart.toLocaleDateString()} - ${currentWeekEnd.toLocaleDateString()}`,
      credited,
      debited,
    });

    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }

  return weeks;
};

// ---- Main Component ----
const WeeklyTransactionGraph = ({ transactions }) => {
  const weeklyData = useMemo(
    () => groupByWeeks(transactions),
    [transactions]
  );

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={weeklyData}>
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="credited" name="Credited" />
        <Bar dataKey="debited" name="Debited" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WeeklyTransactionGraph;
