const mongoose = require('mongoose');

const SessionSchema = mongoose.Schema({
    sessionId: String,
    userId: String,
    chat: [String],
    sentimentScore: Number
});

module.exports = mongoose.model('Session', SessionSchema);