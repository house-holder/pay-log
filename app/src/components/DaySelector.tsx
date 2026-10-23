import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface DaySelectorProps {
    selectedDate: string;
    onDateChange: (date: string) => void;
    className?: string; // overrides the default trigger size
}

export default function DaySelector({ selectedDate, onDateChange, className }: DaySelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dateObj = new Date(selectedDate + 'T00:00:00')

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            const dateString = format(date, 'yyyy-MM-dd')
            onDateChange(dateString)
            setIsOpen(false)
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn("ml-0.5 h-[30px] w-[120px] justify-start text-left font-normal opacity-75", className)}
                >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {format(dateObj, 'MMM dd')}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                    mode="single"
                    selected={dateObj}
                    onSelect={handleDateSelect}
                />
            </PopoverContent>
        </Popover>
    )
}
