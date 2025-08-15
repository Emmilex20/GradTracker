import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const EmailSchema = new Schema({
    subject: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    recipient: {
        type: String,
        required: true,
    },
    sentAt: {
        type: Date,
        default: Date.now,
    },
});

const ApplicationSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    schoolName: {
        type: String,
        required: true,
    },
    programName: {
        type: String,
        required: true,
    },
    deadline: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['Interested', 'Submitted', 'Accepted', 'Rejected'],
        default: 'Interested',
    },
    notes: {
        type: String,
    },
    funding: {
        type: String,
    },
    fundingAmount: {  // <-- New Field
        type: String,
    },
    greWaiver: {
        type: String,
    },
    ieltsWaiver: {
        type: String,
    },
    appFeeWaiver: {
        type: String,
    },
    requiredDocs: {
        type: [String],
    },
    appLink: {
        type: String,
    },
    emails: [EmailSchema],
    dateCreated: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('Application', ApplicationSchema);