import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Entry } from "@/types";
import { fmtCustomerName } from "@/utils/frontend";

interface EntriesTableProps {
    entries: Entry[];
    isLoading: boolean;
    onDeleteEntry: (id: string) => void;
    onEditEntry: (id: string) => void;
    privacyMode: boolean;
}

export default function EntriesTable({ entries, isLoading, onDeleteEntry, onEditEntry, privacyMode }: EntriesTableProps) {
    const fmtTime = (timeStr: string) => {
        timeStr = timeStr.replace(':', '');
        if (!timeStr) return '';
        return timeStr.substring(0, 5);
    };

    const fmtHours = (hours: number | null) => {
        if (hours === null || hours === undefined) return '';
        return hours.toFixed(1);
    };

    const fmtDate = (dateStr: string) => {
        if (!dateStr) return '';
        const datePart = dateStr.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        const date = new Date(year, month - 1, day);

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };


    if (isLoading) {
        return (
            <Card className="w-full mb-0">
                <CardContent className="p-0">
                    <div className="text-center text-muted-foreground">
                        Loading entries...
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (entries.length === 0) {
        return (
            <Card className="w-full mb-4">
                <CardContent className="p-0">
                    <div className="text-center text-muted-foreground">
                        No entries found in selected range.
                    </div>
                </CardContent>
            </Card>
        );
    }

    const hasFlightHours = entries.some(entry => entry.flight_hours !== null && entry.flight_hours !== undefined && entry.flight_hours > 0);
    const hasGroundHours = entries.some(entry => entry.ground_hours !== null && entry.ground_hours !== undefined && entry.ground_hours > 0);
    const hasSimHours = entries.some(entry => entry.sim_hours !== null && entry.sim_hours !== undefined && entry.sim_hours > 0);
    const hasAdminHours = entries.some(entry => entry.admin_hours !== null && entry.admin_hours !== undefined && entry.admin_hours > 0);

    return (
        <Card className="w-100% mb-0">
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs max-w-[650px]">
                        <thead>
                            <tr className="border-b">
                                <th className="text-right table-cell-width-3"></th>
                                <th className="text-left p-0 sm:table-cell">Time</th>
                                {hasFlightHours && <th className="text-left p-0">F</th>}
                                {hasGroundHours && <th className="text-left p-0">G</th>}
                                {hasSimHours && <th className="text-left p-0 md:table-cell">S</th>}
                                {hasAdminHours && <th className="text-left p-0 md:table-cell">A</th>}
                                <th className="text-center p-1 sm:table-cell">Customer</th>
                                <th className="text-left p-1 hidden lg:table-cell">Notes</th>
                                <th className="text-right table-cell-width-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry) => (
                                <tr key={entry.id} className="border-b hover:bg-muted/30">
                                    <td className="xs:table-cell xs:text-right table-cell-width-3">
                                        <Button
                                            style={{ width: '8px', height: '20px' }}
                                            onClick={() => onDeleteEntry(entry.id)}>
                                            ✖
                                        </Button>
                                    </td>
                                    <td className="p-0">
                                        <div className="text-xs">
                                            <div>{fmtDate(entry.date)}</div>
                                            <div className="text-xs text-gray-500">{fmtTime(entry.time)}</div>
                                        </div>
                                    </td>
                                    {hasFlightHours && <td className="p-1">{fmtHours(entry.flight_hours)}</td>}
                                    {hasGroundHours && <td className="p-1">{fmtHours(entry.ground_hours)}</td>}
                                    {hasSimHours && <td className="p-1 md:table-cell">{fmtHours(entry.sim_hours)}</td>}
                                    {hasAdminHours && <td className="p-1 md:table-cell">{fmtHours(entry.admin_hours)}</td>}
                                    <td className="p-1 sm:table-cell text-center">{fmtCustomerName(entry.customer, privacyMode)}</td>
                                    <td className="p-1 hidden lg:table-cell max-w-xs truncate">{entry.notes || ''}</td>
                                    <td className="xs:table-cell xs:text-right table-cell-width-3">
                                        <Button
                                            style={{ width: '8px', height: '20px' }}
                                            onClick={() => onEditEntry(entry.id)}>
                                            ✏
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}