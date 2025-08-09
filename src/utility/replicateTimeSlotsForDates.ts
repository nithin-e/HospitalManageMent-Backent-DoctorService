type TimeSlot = {
    date: string;
    slots: string[];
  };
 
export const replicateTimeSlotsForDates = (originalTimeSlots: any[], newDates: string[]) => {
    // const replicatedSlots: TimeSlot[] = [];
    const replicatedSlots: any = [];
    
   
    const daySlotMap = new Map();
    
    
    originalTimeSlots.forEach(slot => {
      const date = new Date(slot.date);
      const dayOfWeek = date.getDay(); 
      
    //   console.log(`Mapping day ${dayOfWeek} (${slot.date}) to slots:`, slot.slots);
      daySlotMap.set(dayOfWeek, slot.slots);
    });
  
    // console.log('Day-to-slots mapping created:', Array.from(daySlotMap.entries()));
  

    newDates.forEach(dateStr => {
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay();
      
      if (daySlotMap.has(dayOfWeek)) {
        replicatedSlots.push({
          date: dateStr,
          slots: [...daySlotMap.get(dayOfWeek)]
        });
        
        // console.log(`Replicated slots for ${dateStr} (day ${dayOfWeek}):`, daySlotMap.get(dayOfWeek));
      } else {
        console.log(`No slots found for ${dateStr} (day ${dayOfWeek})`);
      }
    });
  
    // console.log('Total replicated slots created:', replicatedSlots.length);
    return replicatedSlots;
  };
  
  