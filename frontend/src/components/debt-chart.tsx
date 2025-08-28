import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { CreditCard, Loan } from "@shared/schema";
import { formatCurrency } from "@/lib/financial-calculations";
import { PieChart as PieChartIcon } from "lucide-react";

interface DebtChartProps {
  creditCards: CreditCard[];
  loans: Loan[];
}

const COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#F97316"];

export function DebtChart({ creditCards, loans }: DebtChartProps) {
  const data = [
    ...creditCards.map((card, index) => ({
      name: card.cardName,
      value: typeof card.balance === 'string' ? parseFloat(card.balance) : card.balance,
      color: COLORS[index % COLORS.length],
      type: "Credit Card",
    })),
    ...loans.map((loan, index) => ({
      name: loan.loanName,
      value: typeof loan.currentBalance === 'string' ? parseFloat(loan.currentBalance) : loan.currentBalance,
      color: COLORS[(creditCards.length + index) % COLORS.length],
      type: loan.loanType,
    })),
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-neutral-200 rounded-lg shadow-lg">
          <p className="font-medium text-neutral-900">{data.name}</p>
          <p className="text-sm font-medium text-primary">
            {formatCurrency(data.value)}
          </p>
          <p className="text-xs text-neutral-400">{data.name}</p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-neutral-500" data-testid="chart-empty-state">
        <div className="text-center">
          <PieChartIcon size={48} className="mx-auto mb-2 text-neutral-300" />
          <p>No debt accounts to display</p>
          <p className="text-sm">Add a credit card or loan to see your debt distribution</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64" data-testid="debt-chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => (
              <span className="text-sm text-neutral-700">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
