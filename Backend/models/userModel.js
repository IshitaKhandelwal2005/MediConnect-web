import mongoose from 'mongoose'

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgMjQwIj48cmVjdCB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI0YzRjRGNiIvPjxjaXJjbGUgY3g9IjEyMCIgY3k9IjkxIiByPSI1NiIgZmlsbD0iI0QxRDU5OSIvPjxwYXRoIGQ9Ik02MCAyMjBjMC00Mi40IDE3Ljc2LTc4IDYwLTc4czYwIDM1LjYgNjAgNzgiIGZpbGw9IiNEMUQ1OTkiLz48L3N2Zz4='

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    image: { type: String, default: defaultAvatar },
    address: { type: Object, default: { line1: '', line2: '' } },
    gender: { type: String, default: 'Not Selected' },
    dob: { type: String, default: 'Not Selected' },
    phone: { type: String, default: '0000000000' },
    healthRecords: {
        type: [{
            name: { type: String, required: true },
            fileUrl: { type: String, required: true },
            fileType: { type: String, required: true },
            uploadedAt: { type: Date, default: Date.now }
        }],
        default: []
    }
})

const userModel = mongoose.models.user || mongoose.model('user', userSchema)

export default userModel