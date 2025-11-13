export const formatDateRange = (startDate: string, endDate: string) => {
    const parseDate = (dateStr: string) => {
        const datePart = dateStr.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const start = parseDate(startDate);
    const startMonth = start.getMonth();
    const startYear = start.getFullYear();
    const end = parseDate(endDate);
    const endMonth = end.getMonth();
    const endYear = end.getFullYear();

    if (startYear === endYear) {
        if (startMonth === endMonth) {
            // target: XX - XXFEB2025
            return fmtDate('dd', start) + ' - ' +
                fmtDate('ddmmm', end) + startYear;
        }
        // target: XXFEB - XXMAR2025
        return fmtDate('ddmmm', start) + ' - ' +
            fmtDate('ddmmm', end) + endYear;
    }
    // target: XXDEC2025 - XXJAN2026
    return fmtDate('ddmmm', start) + startYear +
        ' - ' + fmtDate('ddmmm', end) + endYear;
};

export const fmtDate = (format: string, date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    switch (format) {
        case 'dd':
            return `${day}`;
        case 'ddmmm':
            return `${day}${date.toLocaleDateString(
                'en-US', { month: 'short' }).toUpperCase()}`;
        default:
            return `${day}${date.toLocaleDateString(
                'en-US', { month: 'short' }).toUpperCase()}${date.getFullYear()}`;
    }


};

export const fmtCustomerName = (fullName: string | null, privacyMode: boolean): string => {
    if (!fullName || fullName.trim() === '') return '';
    
    const trimmed = fullName.trim();
    const parts = trimmed.split(/\s+/);
    
    if (!privacyMode) {
        return parts[parts.length - 1];
    }
    
    if (parts.length < 2) {
        return trimmed;
    }
    
    const firstPart = parts[0];
    const lastPart = parts[parts.length - 1];
    
    const isProperName = (str: string): boolean => {
        return str.length > 0 && str[0] === str[0].toUpperCase() && 
               str.slice(1) === str.slice(1).toLowerCase();
    };
    
    if (isProperName(firstPart) && isProperName(lastPart)) {
        return `${firstPart[0]}${lastPart[0]}`;
    }
    
    return trimmed;
};