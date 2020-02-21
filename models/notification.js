let mongoose = require('mongoose');
let NotificationSchema = mongoose.Schema({
    thread_id: {
        type: String,
        required: true
    },
    thread_name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    receiver: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    }
});

let notification = module.exports = mongoose.model('notification', NotificationSchema);