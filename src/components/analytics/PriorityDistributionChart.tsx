import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface PriorityDistributionChartProps {
    data: Array<{ name: string; value: number }>;
}

const COLORS = {
    High: "#EF4444",
    Medium: "#F59E0B",
    Low: "#10B981",
};

export default function PriorityDistributionChart({ data }: PriorityDistributionChartProps) {
    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tasks by Priority</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                        }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
}