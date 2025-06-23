import AppointmentSlot from "../../entities/storeAppointmentSlot_schema";
import AppointmentModel from '../../entities/AppointmentModel'
import { IStoreAppointmentSlots_Repo } from "../interFace/StoreAppointmentSlots_RepoInterFace";

const convertTo12HourFormat = (time24: string): string => {
  try {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const minute = minutes || '00';
    
    if (hour === 0) {
      return `12:${minute} AM`;
    } else if (hour < 12) {
      return `${hour}:${minute} AM`;
    } else if (hour === 12) {
      return `12:${minute} PM`;
    } else {
      return `${hour - 12}:${minute} PM`;
    }
  } catch (error) {
    console.error('Error converting time format:', error);
    return time24; // Return original if conversion fails
  }
};

function convertToDbDateFormat(dateString: string): string {
  try {
    // Convert "June 15, 2025" to "2025-06-15"
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Date conversion error:', error);
    return dateString; // Return original if conversion fails
  }
}

interface CancelData {
  time: string;
  date: string;
  email: string;
}

interface CancelResponse {
  success: boolean;
  message: string;
  error?: string;
}

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
          // Convert time from 24-hour format to 12-hour format
          const convertedTime = convertTo12HourFormat(time);
          
          appointmentSlots.push({
            doctorEmail: doctor_email,
            date: date,
            time: convertedTime, // Store the converted time
            originalTime: time, // Optionally keep original 24-hour format for reference
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
  };
 
  
  updateAppointmentSlots = async (appointmentData: any) => {
    try {
      const { doctor_email, removed_slot_ids, remaining_slots,new_time_slots } = appointmentData;
      
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
      

      
     
      // if (remaining_slots && remaining_slots.length > 0) {
      //   console.log('Updating remaining slots:', remaining_slots.length);
        
      //   for (const slot of remaining_slots) {
      //     const { id, date, time } = slot;
          
      //     // Update the slot with new date/time
      //     const updateResult = await AppointmentSlot.updateOne(
      //       { 
      //         _id: id, 
      //         doctorEmail: doctor_email,
      //         isBooked: false 
      //       },
      //       { 
      //         $set: { 
      //           date: date,
      //           time: time,
      //           updatedAt: new Date()
      //         } 
      //       }
      //     );
          
      //     if (updateResult.modifiedCount > 0) {
      //       updatedCount++;
      //       datesAffected.add(date);
      //       console.log(`Updated slot ${id} to ${date} ${time}`);
      //     } else {
      //       console.warn(`Failed to update slot ${id} (may be booked or not found)`);
      //     }
      //   }
        
      //   console.log(`Updated ${updatedCount} appointment slots`);
      // }
      

      

      if (new_time_slots && new_time_slots.length > 0) {
        console.log('Creating new slots:', new_time_slots.length);

        
        
        // Prepare new slot documents
        
         const newSlots = new_time_slots.map((slot: any) => ({
         
          doctorEmail: doctor_email,
          date: slot.date,
          time: slot.time,
          isBooked: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        
        try {

          console.log('<<<<<>>>>>>>>>newSlots<<<<<>>>>><>',newSlots);
          


          // Insert multiple documents at once
          const insertResult = await AppointmentSlot.insertMany(newSlots, {
            ordered: false 
          });
          


          updatedCount += insertResult.length;
          
          // Track affected dates
          for (const slot of newSlots) {
            datesAffected.add(slot.date);
          }
          
          console.log(`Created ${insertResult.length} new appointment slots`);
          
        } catch (error) {
            console.error('Error creating appointment slots:', error);
            throw error;
          
        }
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
         
      
          const doctorSlots = await AppointmentSlot.find({ doctorEmail: email.email });

          
      
       
      
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
          console.log('doctorSlots check for is it getting or not',doctorSlots);

          // Format slots with relevant information
          const formattedSlots = doctorSlots.map(slot => ({
            
            
            id: slot._id,
            date: slot.date,
            time: slot.time,
            is_booked: slot.isBooked,
            createdAt: slot.createdAt,
            updatedAt: slot.updatedAt,
            patientEmail:slot.patientEmail
          }));
      
          
         
      
          return {
            success: true,
            message: 'Doctor appointment slots retrieved successfully',
            slots_created: doctorSlots.length,
            dates: uniqueDates,
            slots: formattedSlots,
          };
        } catch (error) {
          console.error('Error fetching doctor slots:', error);
          throw error;
        }
      }

  // Repository layer: Processing reschedule data
  slot_Reschedule_Appointment = async (rescheduleData: any) => {
    try {
      console.log('Processing reschedule data:', rescheduleData);
      
      // Extract data
      const {
        patientEmail,
        doctorEmail,
        originalSlot,
        newSlot,
        action
      } = rescheduleData;
      
      console.log('Extracted data:');
      console.log('Patient Email:', patientEmail);
      console.log('Doctor Email:', doctorEmail);
      console.log('Original Slot:', originalSlot);
      console.log('New Slot:', newSlot);
      console.log('Action:', action);
      
      // Step 1: Find and delete the original slot from slots collection
      console.log('Step 1: Deleting original slot...');
      const deleteSlotResult = await AppointmentSlot.findByIdAndDelete(originalSlot.id);
      
      if (!deleteSlotResult) {
        throw new Error('Original slot not found or could not be deleted');
      }
      console.log('Original slot deleted successfully:', deleteSlotResult);
      
      // Step 2: Find user appointment using patient email and original slot time
      console.log('Step 2: Finding user appointment...');
      const userAppointment = await AppointmentModel.findOne({
        patientEmail: patientEmail,
        appointmentTime: originalSlot.time, // Match with original slot time
        appointmentDate: originalSlot.date // Also match date for accuracy
      });
      
      if (!userAppointment) {
        throw new Error('User appointment not found');
      }
      console.log('User appointment found:', userAppointment);
      
      // Step 3: Update the appointment with new slot time and add reschedule message
      console.log('Step 3: Updating appointment...');
      const updateResult = await AppointmentModel.findByIdAndUpdate(
        userAppointment._id,
        {
          $set: {
            appointmentTime: newSlot.time24, // Update to new slot time
            message: `Your appointment has been rescheduled from ${originalSlot.time} to ${newSlot.time12}`,
            updated_at: new Date()
          }
        },
        { 
          new: true, // Return updated document
          runValidators: true 
        }
      );
      
      if (!updateResult) {
        throw new Error('Failed to update user appointment');
      }
      
      console.log('Appointment updated successfully:', updateResult);
      
     
      // First check if a slot exists for this time
      let newSlotResult;
      const existingSlot = await AppointmentSlot.findOne({
        doctorEmail: doctorEmail,
        date: originalSlot.date, // Same date
        time: newSlot.time24 // New time
      });
      
      if (existingSlot) {
        // Update existing slot to mark as booked
        newSlotResult = await AppointmentSlot.findByIdAndUpdate(
          existingSlot._id,
          {
            $set: {
              isBooked: true,
              patientEmail: patientEmail,
              updatedAt: new Date()
            }
          },
          { new: true }
        );
      } else {
        // Create a new slot if it doesn't exist
        newSlotResult = await AppointmentSlot.create({
          doctorEmail: doctorEmail,
          date: originalSlot.date,
          time: newSlot.time24,
          isBooked: true,
          patientEmail: patientEmail,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      console.log('New slot processed successfully:', newSlotResult);
      
      return {
        success: true,
        message: 'Appointment rescheduled successfully',
        data: {
          updatedAppointment: updateResult,
           originalSlotDeleted: deleteSlotResult,
          newSlot: newSlotResult,
          newSlotTime: newSlot.time12
        }
      };
      
    } catch (error) {
      console.error('Error in handleAppointmentReschedule:', error);
      return {
        success: false,
        message: 'Failed to reschedule appointment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
    


  Canceling_AppointMent__UserSide = async (cancelData: CancelData): Promise<CancelResponse> => {
    try {
      const { time, date, email } = cancelData;
      
      // Validate input data
      if (!time || !date || !email) {
        return {
          success: false,
          message: 'Missing required fields: time, date, or email'
        };
      }
  
      console.log('ide okkke indo', time, date, email);
      
      // Convert date format from "June 15, 2025" to "2025-06-15"
      const formattedDate = convertToDbDateFormat(date);
      
      console.log('Formatted date for query:', formattedDate);
      
      // Step 1: Find the appointment to get doctor details
      // Use multiple search criteria for better matching
      const appointment = await AppointmentModel.findOne({
        doctorName: email, // This matches: 'Dr. sahl kurian'
        appointmentDate: formattedDate, // Now: '2025-06-15'
        appointmentTime: time, // This matches: '4:30 PM'
        status: 'scheduled' // Only find scheduled appointments
      });
  
      console.log('Query used:', {
        doctorName: email,
        appointmentDate: formattedDate,
        appointmentTime: time,
        status: 'scheduled'
      });
  
      if (!appointment) {
        console.log('Appointment not found with query parameters');
        
        // Debug: Let's see what appointments exist for this doctor
        const debugAppointments = await AppointmentModel.find({
          doctorName: email
        });
        console.log('All appointments for this doctor:', debugAppointments);
        
        return {
          success: false,
          message: 'Appointment not found or already cancelled'
        };
      }
  
      console.log('Found appointment:', appointment);
  
      // Step 2: Update appointment status to cancelled (soft delete approach)
      const deletedAppointment = await AppointmentModel.findByIdAndDelete(appointment._id);
  
      if (!deletedAppointment) {
        return {
          success: false,
          message: 'Failed to cancel appointment'
        };
      }
  
      // Step 3: Find and update the corresponding appointment slot to make it available
      const slotUpdate = await AppointmentSlot.findOneAndUpdate(
        {
          doctorEmail: appointment.doctorEmail,
          date: formattedDate, // Use formatted date here too
          time: time,
          isBooked: true
        },
        {
          isBooked: false,
          patientEmail: '', // Clear patient email
          updatedAt: new Date()
        },
        { new: true }
      );
  
      if (!slotUpdate) {
        // Log warning but don't fail the operation
        console.warn(`Appointment slot not found for doctor: ${appointment.doctorEmail}, date: ${formattedDate}, time: ${time}`);
        
        return {
          success: true,
          message: 'Appointment cancelled successfully, but slot availability could not be updated'
        };
      }
  
      return {
        success: true,
        message: 'Appointment cancelled successfully and slot is now available'
      };
  
    } catch (error) {
      console.error('Error in Canceling_AppointMent__UserSide:', error);
      return {
        success: false,
        message: 'Failed to cancel appointment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

      }

