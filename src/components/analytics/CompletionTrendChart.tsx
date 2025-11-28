import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CompletionTrendChartProps {
    data: Array<{ date: string; completed: number }>;
}

export default function CompletionTrendChart({ data }: CompletionTrendChartProps) {
    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Completion Trend (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                        dataKey="date" 
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
                    <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#FFD93D"
                        strokeWidth={3}
                        dot={{ fill: "#FFD93D", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
}