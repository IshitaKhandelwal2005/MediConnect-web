import cron from 'node-cron';
import appointmentModel from '../models/appointmentModel.js';
import { sendReminderEmail } from '../utils/emailService.js';

export const startReminderJob = () => {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        try {
            const now = new Date();
            const reminder24Start = new Date(now.getTime() + (24 * 60 - 5) * 60 * 1000);
            const reminder24End = new Date(now.getTime() + (24 * 60 + 5) * 60 * 1000);
            const reminder1Start = new Date(now.getTime() + 55 * 60 * 1000);
            const reminder1End = new Date(now.getTime() + 65 * 60 * 1000);
            // Automatically complete past appointments
            await appointmentModel.autoCompleteAppointments();
            
            const appointments = await appointmentModel.find({
                cancelled: false,
                isCompleted: false,
                appointmentDateTime: { $lte: reminder24End },
                $or: [
                    { reminder24hSent: false, appointmentDateTime: { $gte: reminder24Start, $lte: reminder24End } },
                    { reminder1hSent: false, appointmentDateTime: { $gte: reminder1Start, $lte: reminder1End } }
                ]
            }).lean();

            for (const appointment of appointments) {
                try {
                    const { slotDate, slotTime, userData, docData, appointmentDateTime } = appointment;
                    if (!appointmentDateTime) continue;

                    const timeDiffMs = new Date(appointmentDateTime).getTime() - now.getTime();
                    const hoursDiff = timeDiffMs / (1000 * 60 * 60);

                    if (!appointment.reminder24hSent && hoursDiff <= 24 && hoursDiff > 23.9) {
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

                    if (!appointment.reminder1hSent && hoursDiff <= 1 && hoursDiff > 0.9) {
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
