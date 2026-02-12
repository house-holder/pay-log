import { useState, useEffect } from 'react'
import { payRateService } from '@/services/payRateService'
import type { PayRates } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface PayRateUpdaterProps {
    isOpen: boolean
    onClose: () => void
    onRatesUpdated: () => void
}

export default function PayRateUpdater({ isOpen, onClose, onRatesUpdated }: PayRateUpdaterProps) {
    const [effectiveDate, setEffectiveDate] = useState('')
    const [cfiRate, setCfiRate] = useState('')
    const [adminRate, setAdminRate] = useState('')
    const [currentRates, setCurrentRates] = useState<PayRates | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setError(null)
            setCfiRate('')
            setAdminRate('')
            setEffectiveDate(new Date().toISOString().split('T')[0])
            payRateService.getCurrentRates()
                .then(setCurrentRates)
                .catch(() => setError('Failed to load current rates'))
        }
    }, [isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!cfiRate && !adminRate) {
            setError('Enter at least one rate value')
            return
        }

        setIsLoading(true)
        try {
            const rate: PayRates = {
                effective_date: effectiveDate,
                cfi_rate: cfiRate ? parseFloat(cfiRate) : (currentRates?.cfi_rate ?? 0),
                admin_rate: adminRate ? parseFloat(adminRate) : (currentRates?.admin_rate ?? 0),
            }

            const result = await payRateService.createRate(rate)
            if (result.status === 'OK') {
                onRatesUpdated()
                onClose()
            } else {
                setError(result.message || 'Failed to create rate')
            }
        } catch {
            setError('Failed to update rates')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Manage Pay Rates</DialogTitle>
                    <DialogDescription>
                        Leave a field blank to keep the current value.
                    </DialogDescription>
                </DialogHeader>

                {currentRates && (
                    <div className="rounded-md bg-muted p-3 text-sm">
                        <p className="text-muted-foreground">
                            Current: ${currentRates.cfi_rate.toFixed(2)}/hr CFI,
                            ${currentRates.admin_rate.toFixed(2)}/hr Admin
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="effectiveDate">Effective Date</Label>
                        <Input
                            id="effectiveDate"
                            type="date"
                            value={effectiveDate}
                            onChange={(e) => setEffectiveDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cfiRate">CFI Rate ($/hr)</Label>
                        <Input
                            id="cfiRate"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder={currentRates?.cfi_rate?.toString() ?? ''}
                            value={cfiRate}
                            onChange={(e) => setCfiRate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="adminRate">Admin Rate ($/hr)</Label>
                        <Input
                            id="adminRate"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder={currentRates?.admin_rate?.toString() ?? ''}
                            value={adminRate}
                            onChange={(e) => setAdminRate(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-destructive">{error}</div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
