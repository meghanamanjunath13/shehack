const User = require('../models/user.model');
exports.create = data => {
    const new_record = new User(data);
    return new_record.save();
}
exports.findOne = (condition) => {
    return User.findOne(condition);
}
exports.updateOne = (condition, set_values) => {
    return User.findOneAndUpdate(condition, set_values, { new: false });
}