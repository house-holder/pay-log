import { Button } from "@/components/ui/button"
import type { Entry, EntryType } from "@/types"

interface FormTypeProps {
    formData: Entry;
    onFormChange: (type: EntryType) => void;
}

export default function FormSelector({ formData, onFormChange }: FormTypeProps) {
    return (
        <div className="grid grid-cols-5 gap-1 mb-1" id="form-selector">
            {(['flight', 'ground', 'sim', 'admin', 'misc'] as EntryType[]).map(type => (
                <Button
                    key={type}
                    type="button"
                    variant={formData.type === type ? "default" : "outline"}
                    className={`h-11 px-1 ${formData.type === type ? "opacity-75" : "opacity-50"}`}
                    onClick={() => onFormChange(type)}
                >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
            ))}
        </div>
    )
}