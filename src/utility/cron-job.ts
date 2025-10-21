import AppointmentModel from "../entities/AppointmentModel";
import { Appointment } from "../types/Doctor.interface";

export async function checkAppointments(): Promise<Appointment[]> {
  try {
    const now = new Date();
    const todayDate = now.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // ✅ Fetch today's scheduled appointments (string-based)
    const appointments = await AppointmentModel.find({
      appointmentDate: todayDate,
      status: { $regex: /^scheduled$/i },
    }) as Appointment[];

    const startedAppointments: Appointment[] = [];

    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    for (const appt of appointments) {
      if (!appt.appointmentTime) continue;

      const [time, meridian] = appt.appointmentTime.split(' ');
      const [hourStr, minuteStr] = time.split(':');
      let hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      if (meridian?.toUpperCase() === 'PM' && hour < 12) hour += 12;
      if (meridian?.toUpperCase() === 'AM' && hour === 12) hour = 0;

      const apptMinutes = hour * 60 + minute;

      // ✅ Check if appointment time is within ±2 minutes of now
      if (Math.abs(apptMinutes - nowMinutes) <= 2) {
        startedAppointments.push(appt);
      }
    }

    return startedAppointments;
  } catch (error) {
    console.error('❌ Error in appointment logic:', error);
    return [];
  }
}
