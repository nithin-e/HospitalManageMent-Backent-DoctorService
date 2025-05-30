import AppointmentSlot from "../../entities/storeAppointmentSlot_schema";
import { IStoreAppointmentSlots_Repo } from "../interFace/StoreAppointmentSlots_RepoInterFace";



 export default class FetchNotificationRepo implements IStoreAppointmentSlots_Repo {
    
  store__Appointment_Slots = async (appointmentData: any) => {
    try {
      const { action } = appointmentData;
      
      if (action === 'update') {
        return await this.updateAppointmentSlots(appointmentData);
      } else {
        return await this.createAppointmentSlots(appointmentData);
      }
    } catch (error) {
      console.error('Error in appointment slots repository:', error);
      throw error;
    }
  }
  
  // Create new appointment slots
  createAppointmentSlots = async (appointmentData: any) => {
    try {
      const { doctor_email, date_range, selected_dates, time_slots } = appointmentData;
      
      console.log('Creating appointment slots for doctor:', doctor_email);
      
      // Array to hold all appointment slots to be created
      const appointmentSlots = [];
      
      // Process each time slot
      for (const timeSlot of time_slots) {
        const { date, slots } = timeSlot;
        
        // For each time in the slots array, create an appointment slot
        for (const time of slots) {
          appointmentSlots.push({
            doctorEmail: doctor_email,
            date: date,
            time: time,
            isBooked: false,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
  
      let insertedCount = 0;
      
      try {
        // Try to insert all documents with ordered: false to continue after errors
        const result = await AppointmentSlot.insertMany(appointmentSlots, { ordered: false });
        insertedCount = result.length;
        console.log('Successfully inserted appointment slots:', insertedCount);
        
      } catch (err: any) {
        // Handle the case where some documents might already exist
        if (err.code === 11000) {
          console.log('Some appointment slots already exist, skipping duplicates');
          if (err.result && err.result.insertedCount !== undefined) {
            insertedCount = err.result.insertedCount;
            console.log(`Inserted ${insertedCount} out of ${appointmentSlots.length} slots`);
          } else {
            // Manual count of successfully inserted documents
            const existingSlots = await AppointmentSlot.find({
              doctorEmail: doctor_email,
              date: { $in: selected_dates }
            });
            insertedCount = Math.max(0, appointmentSlots.length - existingSlots.length);
          }
        } else {
          throw err;
        }
      }
      
      return {
        success: true,
        message: 'Appointment slots created successfully',
        slots_created: insertedCount,
        dates: selected_dates,
        slots_removed: 0,
        slots_updated: 0
      };
    } catch (error) {
      console.error('Error in createAppointmentSlots:', error);
      throw error;
    }
  }
  
 
  
  updateAppointmentSlots = async (appointmentData: any) => {
    try {
      const { doctor_email, removed_slot_ids, remaining_slots } = appointmentData;
      
      console.log('Updating appointment slots for doctor:', doctor_email);
      
      let removedCount = 0;
      let updatedCount = 0;
      let datesAffected = new Set<string>();
      
      // Remove slots that are marked for deletion
      if (removed_slot_ids && removed_slot_ids.length > 0) {
        console.log('Removing slot IDs:', removed_slot_ids);
        
        // Only remove slots that are not booked and belong to the doctor
        const deleteResult = await AppointmentSlot.deleteMany({
          _id: { $in: removed_slot_ids },
          doctorEmail: doctor_email,
          isBooked: false // Safety: Only delete unbooked slots
        });
        
        removedCount = deleteResult.deletedCount || 0;
        console.log(`Removed ${removedCount} appointment slots`);
        
        if (removedCount < removed_slot_ids.length) {
          console.warn(`Only ${removedCount} out of ${removed_slot_ids.length} slots were removed (some may be booked or not found)`);
        }
      }
      
      // Update remaining slots (if needed)
      if (remaining_slots && remaining_slots.length > 0) {
        console.log('Updating remaining slots:', remaining_slots.length);
        
        for (const slot of remaining_slots) {
          const { id, date, time } = slot;
          
          // Update the slot with new date/time
          const updateResult = await AppointmentSlot.updateOne(
            { 
              _id: id, 
              doctorEmail: doctor_email,
              isBooked: false // Safety: Only update unbooked slots
            },
            { 
              $set: { 
                date: date,
                time: time,
                updatedAt: new Date()
              } 
            }
          );
          
          if (updateResult.modifiedCount > 0) {
            updatedCount++;
            datesAffected.add(date);
            console.log(`Updated slot ${id} to ${date} ${time}`);
          } else {
            console.warn(`Failed to update slot ${id} (may be booked or not found)`);
          }
        }
        
        console.log(`Updated ${updatedCount} appointment slots`);
      }
      
      // Get all unique dates for the doctor after the update
      const allSlots = await AppointmentSlot.find(
        { doctorEmail: doctor_email },
        { date: 1, _id: 0 }
      ).distinct('date');
      
      return {
        success: true,
        message: `Appointment slots updated successfully. Removed: ${removedCount}, Updated: ${updatedCount}`,
        slots_created: 0,
        slots_removed: removedCount,
        slots_updated: updatedCount,
        dates: allSlots.sort() // Return sorted dates
      };
    } catch (error) {
      console.error('Error in updateAppointmentSlots:', error);
      throw error;
    }
  }







      fetch_Doctor__Slots = async (email: any) => {
        try {
          console.log('check the email im repo', email);
      
          const doctorSlots = await AppointmentSlot.find({ doctorEmail: email.email });
      
          console.log('understand the responce in repoo', doctorSlots);
      
          if (!doctorSlots || doctorSlots.length === 0) {
            return {
              success: false,
              message: 'No appointment slots found for this doctor',
              slots_created: 0,
              dates: [],
              slots: []
            };
          }
      
          // Extract unique dates from the slots
          const uniqueDates = [...new Set(doctorSlots.map(slot => slot.date))];
          
          // Format slots with relevant information
          const formattedSlots = doctorSlots.map(slot => ({
            id: slot._id,
            date: slot.date,
            time: slot.time,
            isBooked: slot.isBooked,
            createdAt: slot.createdAt,
            updatedAt: slot.updatedAt
          }));
      
          // Optional: Group slots by date for better organization
          const slotsByDate = doctorSlots.reduce((acc: { [key: string]: any[] }, slot) => {
            if (!acc[slot.date]) {
              acc[slot.date] = [];
            }
            acc[slot.date].push({
              id: slot._id,
              time: slot.time,
              isBooked: slot.isBooked
            });
            return acc;
          }, {});
      
          return {
            success: true,
            message: 'Doctor appointment slots retrieved successfully',
            slots_created: doctorSlots.length,
            dates: uniqueDates,
            slots: formattedSlots,
            // slotsByDate: slotsByDate // Organized by date for easier frontend handling
          };
        } catch (error) {
          console.error('Error fetching doctor slots:', error);
          throw error;
        }
      }


      }

