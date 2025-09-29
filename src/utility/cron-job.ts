import { Document } from 'mongoose';
import AppointmentModel from '../entities/AppointmentModel';

interface Appointment extends Document {
  appointmentDate: string;   
  appointmentTime: string;   
  status: string;            
  message?: string;
  
}

export async function checkAppointments(): Promise<Appointment[]> {
  try {
    const now = new Date();
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    const todayDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

    const appointments = (await AppointmentModel.find({
      appointmentDate: todayDate,
      status: 'scheduled',
    })) as Appointment[];

    const startedAppointments: Appointment[] = [];

    for (const appt of appointments) {
      const [time, meridian] = appt.appointmentTime.split(' '); 
      const [hourStr, minute] = time.split(':');

      let hour = parseInt(hourStr, 10);
      if (meridian === 'PM' && hour < 12) hour += 12;
      if (meridian === 'AM' && hour === 12) hour = 0;

      const apptHoursStr = hour.toString().padStart(2, '0');
      const apptMinutesStr = minute.padStart(2, '0');

      if (apptHoursStr === currentHours && apptMinutesStr === currentMinutes) {
        
        startedAppointments.push(appt);
      }
    }

    return startedAppointments;
  } catch (error) {
    console.error('Error in appointment logic:', error);
    return [];
  }
}
