const Client = require('../models/client.model.js');

exports.create = data => {
    const new_record = new Client(data);
    return new_record.save();
}
exports.findOne = (condition) => {
    return Client.findOne(condition);
}
exports.updateOne = (condition, set_values) => {
    return Client.findOneAndUpdate(condition, set_values, { new: true });
}