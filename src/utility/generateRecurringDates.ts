
export const generateRecurringDates = (selectedDates: string[], monthsAhead: number = 6): string[] => {
    const recurringDates: string[] = [];
    
    const datePatterns = selectedDates.map(dateStr => {
      const date = new Date(dateStr);
      return {
        dayOfWeek: date.getDay(), 
        originalDate: dateStr
      };
    });
  
   
  
  
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(today.getMonth() + monthsAhead);
  
  
    // Start from Sunday of current week
    let currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay());
  
  
    while (currentWeekStart <= endDate) {
    
      datePatterns.forEach(pattern => {
        const targetDate = new Date(currentWeekStart);
        targetDate.setDate(currentWeekStart.getDate() + pattern.dayOfWeek);
        
        if (targetDate > today && targetDate <= endDate) {
          const dateStr = targetDate.toISOString().split('T')[0];
          
        
          if (!recurringDates.includes(dateStr)) {
            recurringDates.push(dateStr);
          }
        }
      });
      
     
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }
  
    
    return recurringDates.sort();
  };
  
  