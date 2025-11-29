/**
 * Utility functions for calculating recurring task dates
 */

export interface RecurrenceConfig {
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    interval: number;
    days?: string[];
    endDate?: string;
}

/**
 * Calculate the next occurrence date based on recurrence pattern
 */
export function calculateNextOccurrence(
    currentDate: Date,
    config: RecurrenceConfig
): Date | null {
    const { pattern, interval, days, endDate } = config;
    
    // Check if we've passed the end date
    if (endDate && new Date(currentDate) >= new Date(endDate)) {
        return null;
    }

    const nextDate = new Date(currentDate);

    switch (pattern) {
        case 'daily':
            nextDate.setDate(nextDate.getDate() + interval);
            break;

        case 'weekly':
            if (days && days.length > 0) {
                // Find next matching day of week
                const currentDay = nextDate.getDay();
                const dayMap: { [key: string]: number } = {
                    'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3,
                    'Thu': 4, 'Fri': 5, 'Sat': 6
                };
                
                const targetDays = days.map(d => dayMap[d]).sort((a, b) => a - b);
                let foundNext = false;
                
                // Look for next day in current week
                for (const targetDay of targetDays) {
                    if (targetDay > currentDay) {
                        const daysToAdd = targetDay - currentDay;
                        nextDate.setDate(nextDate.getDate() + daysToAdd);
                        foundNext = true;
                        break;
                    }
                }
                
                // If no day found in current week, go to first day of next week(s)
                if (!foundNext) {
                    const daysUntilNextWeek = (7 - currentDay) + targetDays[0];
                    const weeksToAdd = interval - 1;
                    nextDate.setDate(nextDate.getDate() + daysUntilNextWeek + (weeksToAdd * 7));
                }
            } else {
                // No specific days, just add weeks
                nextDate.setDate(nextDate.getDate() + (7 * interval));
            }
            break;

        case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + interval);
            break;

        case 'yearly':
            nextDate.setFullYear(nextDate.getFullYear() + interval);
            break;

        case 'custom':
            nextDate.setDate(nextDate.getDate() + interval);
            break;

        default:
            return null;
    }

    // Check if next date exceeds end date
    if (endDate && nextDate >= new Date(endDate)) {
        return null;
    }

    return nextDate;
}

/**
 * Format recurrence description for display
 */
export function formatRecurrenceDescription(config: RecurrenceConfig): string {
    const { pattern, interval, days } = config;

    switch (pattern) {
        case 'daily':
            return interval === 1 ? 'Daily' : `Every ${interval} days`;
        
        case 'weekly':
            if (days && days.length > 0) {
                const dayStr = days.join(', ');
                return interval === 1 
                    ? `Weekly on ${dayStr}` 
                    : `Every ${interval} weeks on ${dayStr}`;
            }
            return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
        
        case 'monthly':
            return interval === 1 ? 'Monthly' : `Every ${interval} months`;
        
        case 'yearly':
            return interval === 1 ? 'Yearly' : `Every ${interval} years`;
        
        case 'custom':
            return `Every ${interval} days`;
        
        default:
            return 'Custom recurrence';
    }
}

/**
 * Get available days of the week for selection
 */
export function getWeekDays(): string[] {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}