// App.tsx
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import MainForm from '@/components/Form'
import AuthGuard from '@/components/AuthGuard'
import LoginForm from '@/components/LoginForm'
import { usePayPeriod } from '@/hooks/usePayPeriod'
import { useHistPeriod } from '@/hooks/useHistPeriod'
import { useEntryForm } from '@/hooks/useEntryForm'
import { useViewTotals } from '@/hooks/useViewTotals'
import { useEntryManager } from '@/hooks/useEntryManager'
import { useRemainingHours } from '@/hooks/useRemainingHours'

import type { ViewType } from '@/types'

function App() {
  const { payPeriod, calculateEntryValue, refreshPayPeriod, currentRates } = usePayPeriod();
  const { viewTotals, fetchViewTotals } = useViewTotals();
  const { remainingHours, refreshRemainingHours } = useRemainingHours();
  const [view, setView] = useState<ViewType>('period');
  const [currentViewDate, setCurrentViewDate] = useState<string>('');
  const { allPeriods, selectedPeriodID, setSelectedPeriodID } = useHistPeriod();
  const {
    entryData,
    handleFieldChange,
    handleFormChange,
    setFormData,
    resetEntryForm
  } = useEntryForm();
  const {
    isEditMode,
    entries,
    entriesLoading,
    fetchEntries,
    handleEditEntry: originalHandleEditEntry,
    handleSubmitEntry: originalHandleSubmitEntry,
    handleDeleteEntry: originalHandleDeleteEntry
  } = useEntryManager(view, entryData, setFormData, refreshPayPeriod, resetEntryForm);

  const handleEditEntry = originalHandleEditEntry;

  const handleSubmitEntry = async (event: React.FormEvent) => {
    await originalHandleSubmitEntry(event);
    refreshRemainingHours();
  };

  const handleDeleteEntry = async (id: string) => {
    await originalHandleDeleteEntry(id);
    refreshRemainingHours();
  };

  const handleViewChange = (newView: ViewType, date?: string) => {
    setView(newView)
    if (date) {
      setCurrentViewDate(date)
    } else if (newView === 'day') {
      setCurrentViewDate(new Date().toISOString().split('T')[0])
    } else {
      setCurrentViewDate('')
    }
    fetchEntries(newView, date);
    fetchViewTotals(newView, date);
  }

  const handlePeriodSelect = (periodID: number | null) => {
    setSelectedPeriodID(periodID);
    if (periodID) {
      const period = allPeriods.find(p => p.id === periodID);
      if (period) {
        setCurrentViewDate(period.start)
        fetchEntries('period', period.start);
        fetchViewTotals('period', period.start);
      }
    } else {
      setCurrentViewDate('')
      fetchEntries('period', '');
      fetchViewTotals('period', '');
    }
  }

  const selectedPeriod = allPeriods.find(p => p.id === selectedPeriodID);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <AuthGuard>
            <MainForm
              input={entryData}
              onFieldChange={handleFieldChange}
              onFormChange={handleFormChange}
              onSubmitEntry={handleSubmitEntry}
              entryValue={calculateEntryValue(entryData)}
              payPeriod={payPeriod}
              view={view}
              onViewChange={handleViewChange}
              allPeriods={allPeriods}
              selectedPeriodID={selectedPeriodID}
              selectedPeriod={selectedPeriod ?? undefined}
              setSelectedPeriodID={handlePeriodSelect}
              entries={entries}
              entriesLoading={entriesLoading}
              onEditEntry={handleEditEntry}
              onDeleteEntry={handleDeleteEntry}
              viewTotals={viewTotals ?? {
                flight_hours: 0,
                ground_hours: 0,
                sim_hours: 0,
                admin_hours: 0,
                all_hours: 0,
                gross: 0,
              }}
              isEditMode={isEditMode}
              currentViewDate={currentViewDate}
              remainingHours={remainingHours}
              onRefreshPeriod={refreshPayPeriod}
            />
          </AuthGuard>} />
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
