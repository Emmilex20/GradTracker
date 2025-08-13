import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String
    },
    mentorId: {
        type: Schema.Types.ObjectId,
        ref: 'Mentor', // This creates a reference to the Mentor model
        default: null,
    },
    isConnectedToMentor: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('User', UserSchema);