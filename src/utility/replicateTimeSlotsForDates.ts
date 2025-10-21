export const replicateTimeSlotsForDates = (
  originalTimeSlots: TimeSlot[], 
  newDates: string[]
): TimeSlot[] => {
  const replicatedSlots: TimeSlot[] = [];
  
  // Map each day of week to its time slots
  const daySlotMap = new Map<number, string[]>();

  originalTimeSlots.forEach(slot => {
    const date = new Date(slot.date);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

    if (!daySlotMap.has(dayOfWeek)) {
      daySlotMap.set(dayOfWeek, []);
    }

    // Merge slots for the same day (avoid duplicates)
    const existingSlots = daySlotMap.get(dayOfWeek)!;
    const uniqueSlots = [...new Set([...existingSlots, ...slot.slots])];
    daySlotMap.set(dayOfWeek, uniqueSlots);
  });

  // Create time slots for each new date based on its day of week
  newDates.forEach(dateStr => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();

    if (daySlotMap.has(dayOfWeek)) {
      replicatedSlots.push({
        date: dateStr,
        slots: [...daySlotMap.get(dayOfWeek)!],
      });
    } else {
      console.warn(`No slots found for ${dateStr} (${getDayName(dayOfWeek)})`);
    }
  });

  return replicatedSlots;
};

const getDayName = (dayOfWeek: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
};

type TimeSlot = {
  date: string;
  slots: string[];
};