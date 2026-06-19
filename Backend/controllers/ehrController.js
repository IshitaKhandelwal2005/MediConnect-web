import userModel from '../models/userModel.js';
import appointmentModel from '../models/appointmentModel.js';
import { v2 as cloudinary } from 'cloudinary';

// Upload health record (Patient)
export const uploadHealthRecord = async (req, res) => {
    try {
        const { userId } = req.body;
        const file = req.file;

        if (!file) {
            return res.json({ success: false, message: "No file uploaded" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.healthRecords && user.healthRecords.length >= 20) {
            return res.json({ success: false, message: "Maximum limit of 20 health records reached" });
        }

        let fileType = '';
        if (file.mimetype === 'application/pdf') {
            fileType = 'pdf';
        } else if (file.mimetype.startsWith('image/')) {
            fileType = 'image';
        } else {
            return res.json({ success: false, message: "Only PDF and Image files are allowed" });
        }

        // Upload to Cloudinary under folder 'mediconnect/ehr/'
        const uploadRes = await cloudinary.uploader.upload(file.path, {
            resource_type: fileType === 'pdf' ? 'raw' : 'image',
            folder: 'mediconnect/ehr'
        });

        const newRecord = {
            name: req.body.name || file.originalname,
            fileUrl: uploadRes.secure_url,
            fileType,
            uploadedAt: new Date()
        };

        user.healthRecords.push(newRecord);
        await user.save();

        res.json({ success: true, message: "Health record uploaded successfully", record: newRecord });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete health record (Patient)
export const deleteHealthRecord = async (req, res) => {
    try {
        const { userId } = req.body;
        const { recordId } = req.params;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const record = user.healthRecords.find(r => r._id.toString() === recordId);
        if (!record) {
            return res.json({ success: false, message: "Record not found" });
        }

        // Clean up from Cloudinary if possible
        try {
            const fileUrl = record.fileUrl;
            if (fileUrl && fileUrl.includes('mediconnect')) {
                const urlParts = fileUrl.split('/');
                const mediconnectIndex = urlParts.findIndex(part => part.includes('mediconnect'));
                if (mediconnectIndex !== -1) {
                    const folderAndFile = urlParts.slice(mediconnectIndex).join('/');
                    const publicId = folderAndFile.split('.')[0]; // strip extension
                    const isPdf = record.fileType === 'pdf';
                    await cloudinary.uploader.destroy(publicId, {
                        resource_type: isPdf ? 'raw' : 'image'
                    });
                }
            }
        } catch (cloudinaryError) {
            console.log("Cloudinary destroy error:", cloudinaryError.message);
        }

        user.healthRecords = user.healthRecords.filter(r => r._id.toString() !== recordId);
        await user.save();

        res.json({ success: true, message: "Health record deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all health records (Patient)
export const getHealthRecords = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId).select('healthRecords');
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, healthRecords: user.healthRecords || [] });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get patient records for doctor, enforcing appointment slot time-window access control
export const getPatientRecordsForDoctor = async (req, res) => {
    try {
        const { docId } = req.body;
        const { userId } = req.params;

        const patient = await userModel.findById(userId).select('healthRecords');
        if (!patient) {
            return res.json({ success: false, message: "Patient not found" });
        }

        const now = new Date();
        const appointments = await appointmentModel.find({
            docId,
            userId,
            cancelled: false
        });

        let hasAccess = false;

        for (const appointment of appointments) {
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

            const appointmentStart = new Date(year, month - 1, day, hours, minutes);

            // Access is allowed 15 minutes before the slot starts, up to 60 minutes after the slot starts
            const accessStart = new Date(appointmentStart.getTime() - 15 * 60 * 1000);
            const accessEnd = new Date(appointmentStart.getTime() + 60 * 60 * 1000);

            if (now >= accessStart && now <= accessEnd) {
                hasAccess = true;
                break;
            }
        }

        if (!hasAccess) {
            return res.json({
                success: false,
                message: "Access restricted. You can only view patient health records at the time of the appointment (from 15 minutes prior to 60 minutes after the scheduled slot)."
            });
        }

        res.json({ success: true, healthRecords: patient.healthRecords || [] });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
