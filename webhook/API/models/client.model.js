const mongoose = require('mongoose');

const ClientSchema = mongoose.Schema({
    sessionId: String,
    parameters: {}
});

module.exports = mongoose.model('Client', ClientSchema);