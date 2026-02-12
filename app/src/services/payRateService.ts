import type { PayRates } from "@/types";
import { getAPIPath } from "@/utils/backend";

const apiPath = getAPIPath();

export const payRateService = {
    async getCurrentRates(): Promise<PayRates> {
        const response = await fetch(`${apiPath}/pay-rates/current`);
        const result = await response.json();
        if (result.status === 'OK' && result.data) {
            return result.data;
        }
        throw new Error(result.message || 'Failed to fetch rates');
    },

    async createRate(rate: PayRates) {
        const response = await fetch(`${apiPath}/pay-rates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rate),
        });
        return response.json();
    },
};
