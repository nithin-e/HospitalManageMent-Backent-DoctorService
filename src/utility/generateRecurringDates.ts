export const generateRecurringDates = (selectedDates: string[], monthsAhead: number = 3): string[] => {
  const recurringDates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time for accurate comparison

  selectedDates.forEach(dateStr => {
    const originalDate = new Date(dateStr);
    originalDate.setHours(0, 0, 0, 0);
    
    // Start from the NEXT occurrence after the original date
    const currentDate = new Date(originalDate);
    currentDate.setDate(currentDate.getDate() + 7); // Start from next week
    
    const endDate = new Date(originalDate);
    endDate.setMonth(endDate.getMonth() + monthsAhead);

    // Generate recurring dates for the specified period
    while (currentDate <= endDate) {
      const formattedDate = currentDate.toISOString().split('T')[0];
      
      // Only add if it's not in the original selected dates and not a duplicate
      if (!selectedDates.includes(formattedDate) && !recurringDates.includes(formattedDate)) {
        recurringDates.push(formattedDate);
      }
      
      currentDate.setDate(currentDate.getDate() + 7); // Move to next week
    }
  });

  return recurringDates.sort();
};
