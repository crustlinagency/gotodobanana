import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface StatusDistributionChartProps {
    data: Array<{ name: string; count: number }>;
}

export default function StatusDistributionChart({ data }: StatusDistributionChartProps) {
    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tasks by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                        dataKey="name" 
                        className="text-sm"
                        tick={{ fill: "currentColor" }}
                    />
                    <YAxis 
                        className="text-sm"
                        tick={{ fill: "currentColor" }}
                    />
                    <Tooltip 
                        contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                        }}
                    />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
}