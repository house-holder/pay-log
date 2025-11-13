import { useState, useEffect, useCallback } from 'react';
import { getAPIPath } from '@/utils/backend';
import { useAuth } from '@/contexts/AuthContext';
import type { Entry } from '@/types';

export const useRemainingHours = () => {
    const [remainingHours, setRemainingHours] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const apiPath = getAPIPath();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const calculateRemainingHours = useCallback(async () => {
        if (authLoading) {
            return;
        }
        if (!isAuthenticated) {
            return;
        }

        setIsLoading(true);
        try {
            const now = new Date();
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            const todayStr = now.toISOString().split('T')[0];

            const response = await fetch(`${apiPath}/get-entries?view=day&date=${yesterdayStr}`, {
                credentials: 'include'
            });

            let allEntries: Entry[] = [];

            if (response.status === 200) {
                const result = await response.json();
                if (result.status === 'OK' && result.data) {
                    allEntries = result.data;
                }
            }

            const todayResponse = await fetch(`${apiPath}/get-entries?view=day&date=${todayStr}`, {
                credentials: 'include'
            });

            if (todayResponse.status === 200) {
                const result = await todayResponse.json();
                if (result.status === 'OK' && result.data) {
                    const todayEntries = result.data;
                    allEntries = [...allEntries, ...todayEntries];
                }
            }

            const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            let flightHours = 0;
            allEntries.forEach(entry => {
                const entryDate = entry.date.split('T')[0];
                const entryTime = entry.time;
                
                const [year, month, day] = entryDate.split('-').map(Number);
                const [hours, minutes] = entryTime.split(':').map(Number);
                const entryDateTime = new Date(year, month - 1, day, hours, minutes, 0);

                if (entryDateTime >= twentyFourHoursAgo && entryDateTime <= now) {
                    if (entry.type === 'flight' && entry.flight_hours) {
                        flightHours += entry.flight_hours;
                    }
                }
            });

            const remaining = 8.0 - flightHours;
            setRemainingHours(Math.max(0, remaining));
        } catch (error) {
            console.error('Error calculating remaining hours:', error);
            setRemainingHours(null);
        } finally {
            setIsLoading(false);
        }
    }, [authLoading, isAuthenticated, apiPath]);

    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            calculateRemainingHours();
            const interval = setInterval(calculateRemainingHours, 60000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, authLoading, calculateRemainingHours]);

    return { remainingHours, isLoading, refreshRemainingHours: calculateRemainingHours };
};

