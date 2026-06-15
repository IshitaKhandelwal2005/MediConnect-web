import mongoose from 'mongoose';

const appointmentSchema =new mongoose.Schema({
    userId:{type:String,required:true},
    docId:{type:String,required:true},
    slotDate:{type:String,required:true},
    slotTime:{type:String,required:true},
    userData:{type:Object,required:true},
    docData:{type:Object,required:true},
    amount:{type:Number,required:true},
    date:{type:Number,required:true},
    cancelled:{type:Boolean,default:false},
    payment:{type:Boolean,default:false},
    isCompleted:{type:Boolean,default:false}
})

appointmentSchema.statics.autoCompleteAppointments = async function() {
    try {
        const now = new Date();
        const appointments = await this.find({ cancelled: false, isCompleted: false });
        
        for (const appointment of appointments) {
            try {
                const { slotDate, slotTime } = appointment;
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
                
                if (appointmentDateTime < now) {
                    await this.findByIdAndUpdate(appointment._id, { isCompleted: true });
                }
            } catch (err) {
                console.log("Error in auto-complete check:", err.message);
            }
        }
    } catch (error) {
        console.log("Error running autoCompleteAppointments:", error.message);
    }
};

const appointmentModel = mongoose.models?.appointment || mongoose.model('appointment',appointmentSchema)
export default appointmentModel