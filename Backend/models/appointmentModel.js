import mongoose from 'mongoose';

const parseSlotDateTime = (slotDate, slotTime) => {
    if (!slotDate || !slotTime) return null;

    const dateParts = slotDate.split('_').map(Number);
    if (dateParts.length !== 3) return null;
    const [day, month, year] = dateParts;

    const timeMatch = slotTime.toLowerCase().match(/(\d+):(\d+)\s*(am|pm)/);
    if (!timeMatch) return null;

    let hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    const ampm = timeMatch[3];

    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    return new Date(year, month - 1, day, hours, minutes);
};

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    docId: { type: String, required: true, index: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    appointmentDateTime: { type: Date, index: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    prescription: { type: String, default: "" },
    reminder24hSent: { type: Boolean, default: false },
    reminder1hSent: { type: Boolean, default: false }
})

appointmentSchema.index({ cancelled: 1, isCompleted: 1 });

appointmentSchema.statics.autoCompleteAppointments = async function () {
    try {
        const now = new Date();
        await this.updateMany(
            { cancelled: false, isCompleted: false, appointmentDateTime: { $lt: now } },
            { $set: { isCompleted: true } }
        );
    } catch (error) {
        console.log("Error running autoCompleteAppointments:", error.message);
    }
};

const appointmentModel = mongoose.models?.appointment || mongoose.model('appointment', appointmentSchema)
export { parseSlotDateTime };
export default appointmentModel