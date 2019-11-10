const Session = require('../models/session.model.js');

exports.create = data => {
    const new_record = new Session(data);
    return new_record.save();
}
exports.findOne = (condition) => {
    return Session.findOne(condition);
}
exports.updateOne = (condition, set_values) => {
    return Session.findOneAndUpdate(condition, set_values, { new: true });
}