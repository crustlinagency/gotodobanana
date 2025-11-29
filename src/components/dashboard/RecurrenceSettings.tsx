import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { getWeekDays, formatRecurrenceDescription } from "@/lib/recurrence-utils";

interface RecurrenceSettingsProps {
    isRecurring: boolean;
    onIsRecurringChange: (value: boolean) => void;
    pattern: string;
    onPatternChange: (value: string) => void;
    interval: number;
    onIntervalChange: (value: number) => void;
    days: string[];
    onDaysChange: (value: string[]) => void;
    endDate?: Date;
    onEndDateChange: (value: Date | undefined) => void;
}

export default function RecurrenceSettings({
    isRecurring,
    onIsRecurringChange,
    pattern,
    onPatternChange,
    interval,
    onIntervalChange,
    days,
    onDaysChange,
    endDate,
    onEndDateChange,
}: RecurrenceSettingsProps) {
    const weekDays = getWeekDays();

    const toggleDay = (day: string) => {
        if (days.includes(day)) {
            onDaysChange(days.filter(d => d !== day));
        } else {
            onDaysChange([...days, day]);
        }
    };

    const getPreviewText = () => {
        if (!isRecurring) return '';
        
        const config = {
            pattern: pattern as any,
            interval,
            days: pattern === 'weekly' ? days : undefined,
        };
        
        return formatRecurrenceDescription(config);
    };

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label htmlFor="recurring" className="text-base font-semibold">
                        Recurring Task
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Automatically create the next instance when completed
                    </p>
                </div>
                <Switch
                    id="recurring"
                    checked={isRecurring}
                    onCheckedChange={onIsRecurringChange}
                />
            </div>

            {isRecurring && (
                <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Repeat Pattern</Label>
                            <Select value={pattern} onValueChange={onPatternChange}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Every</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min="1"
                                    value={interval}
                                    onChange={(e) => onIntervalChange(parseInt(e.target.value) || 1)}
                                    className="w-20"
                                />
                                <span className="text-sm text-muted-foreground">
                                    {pattern === 'daily' && 'day(s)'}
                                    {pattern === 'weekly' && 'week(s)'}
                                    {pattern === 'monthly' && 'month(s)'}
                                    {pattern === 'yearly' && 'year(s)'}
                                    {pattern === 'custom' && 'day(s)'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {pattern === 'weekly' && (
                        <div>
                            <Label className="mb-2 block">Repeat On</Label>
                            <div className="flex flex-wrap gap-2">
                                {weekDays.map(day => (
                                    <Badge
                                        key={day}
                                        variant={days.includes(day) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => toggleDay(day)}
                                    >
                                        {day}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <Label>End Date (Optional)</Label>
                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, "PPP") : "No end date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={onEndDateChange}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {endDate && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEndDateChange(undefined)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {getPreviewText() && (
                        <div className="p-3 bg-banana-50 dark:bg-banana-950/20 rounded-lg">
                            <p className="text-sm">
                                <span className="font-medium">Repeats:</span> {getPreviewText()}
                                {endDate && ` until ${format(endDate, "MMM d, yyyy")}`}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}