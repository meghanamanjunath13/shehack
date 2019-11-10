const mongoose = require('mongoose');

const locationSchema = mongoose.Schema({
    lat: String,
    long: String,
    name: String
});
const itemSchema = mongoose.Schema({
    size: String,
    times: Number,
    name: String
});
const orderSchema = mongoose.Schema({
    createdBy: {
        type: String,
        default: ''
    },
    orderItems: [itemSchema],
    status: String,
    deliveryAgent: String,
    fromLocation: locationSchema,
    toLocation: locationSchema,
    alternateNo: String,
    eta: String
});

const UserSchema = mongoose.Schema({
    emailId: String,
    name: String,
    phNo: String,
    isAgent: Boolean,
    pastOrders: [orderSchema],
    ongoingOrders: [orderSchema],
    location: [locationSchema],
    currentLocation: locationSchema
});

module.exports = mongoose.model('User', UserSchema);