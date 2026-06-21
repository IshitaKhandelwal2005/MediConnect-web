import cron from 'node-cron';
import appointmentModel from '../models/appointmentModel.js';
import { sendReminderEmail } from '../utils/emailService.js';

export const startReminderJob = () => {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        try {
            const now = new Date();
            // Automatically complete past appointments
            await appointmentModel.autoCompleteAppointments();
            
            // We only need to check appointments where at least one reminder is not sent
            const appointments = await appointmentModel.find({
                cancelled: false,
                isCompleted: false,
                $or: [{ reminder24hSent: false }, { reminder1hSent: false }]
            });

            for (const appointment of appointments) {
                try {
                    const { slotDate, slotTime, userData, docData } = appointment;
                    if (!slotDate || !slotTime) continue;

                    const dateParts = slotDate.split('_').map(Number);
                    if (dateParts.length !== 3) continue;
                    const [day, month, year] = dateParts;

                    const timeMatch = slotTime.toLowerCase().match(/(\d+):(\d+)\s*(am|pm)/);
                    if (!timeMatch) continue;

                    let hours = Number(timeMatch[1]);
                    const minutes = Number(timeMatch[2]);
                    const ampm = timeMatch[3];

                    if (ampm === 'pm' && hours < 12) hours += 12;
                    if (ampm === 'am' && hours === 12) hours = 0;

                    const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);

                    // Skip if appointment is in the past (it will be completed by autoCompleteAppointments)
                    if (appointmentDateTime <= now) continue;

                    const timeDiffMs = appointmentDateTime.getTime() - now.getTime();
                    const hoursDiff = timeDiffMs / (1000 * 60 * 60);

                    // Check for 24h reminder (if within 24.1 hours to allow some buffer, but not sent yet)
                    if (hoursDiff <= 24 && !appointment.reminder24hSent) {
                        await sendReminderEmail(
                            userData.email,
                            userData.name,
                            docData.name,
                            slotDate,
                            slotTime,
                            '24h'
                        );
                        await appointmentModel.findByIdAndUpdate(appointment._id, { reminder24hSent: true });
                    }

                    // Check for 1h reminder
                    if (hoursDiff <= 1 && !appointment.reminder1hSent) {
                        await sendReminderEmail(
                            userData.email,
                            userData.name,
                            docData.name,
                            slotDate,
                            slotTime,
                            '1h'
                        );
                        await appointmentModel.findByIdAndUpdate(appointment._id, { reminder1hSent: true });
                    }

                } catch (innerErr) {
                    console.log("Error processing appointment reminder:", innerErr);
                }
            }
        } catch (error) {
            console.log("Error running appointment reminders job:", error);
        }
    });
    console.log("Appointment reminder job started");
};
