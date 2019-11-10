'use strict';
const config = require('../config/config');
var fs = require('fs');
var moment = require('moment');
const http = require('http');
var request = require('request');
const configData = require('../config/config.js');
const user = require('../controllers/user.controller');
const session = require('../Controllers/session.controller');
const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyCTKxJ0MyINLmh9uyweAy9iqMHhhRf39io'
});
var Sentiment = require('sentiment');
const {
    WebhookClient,
    Card,
    Suggestion
} = require('dialogflow-fulfillment');

module.exports = function (app) {
    app.get('/', function (req, res) {
        res.send('Response OK');
    });

    app.post('/updateOrderstatus', function (req, res) {
        var request = req.body;
        console.log(request);
        user.findOne({ emailId: request.userId }).then(userData => {
            console.log(userData)
            userData.ongoingOrders[0].status = request.orderStatus;
            user.updateOne({ emailId: request.userId }, userData).then(data => {
                res.send("Updated")
            })

        });
    });

    app.post('/completeOrder', function (req, res) {
        var request = req.body;
        console.log(request);
        user.findOne({ emailId: request.userId }).then(userData => {
            console.log(userData)
            userData.ongoingOrders[0].status = request.orderStatus;
            userData.pastOrders.push(Object.assign(userData.ongoingOrders[0]));
            userData.ongoingOrders = [];
            user.updateOne({ emailId: request.userId }, userData).then(data => {
                res.send("Updated")
            })

        });
    });

    app.post('/createUser', function (req, res) {
        var request = req.body;
        console.log(request);
        user.create(request).then(userData => {
            console.log(userData)
            res.send("created")
        });
    });
    app.get('/getChat/:emailid', function (req, res) {
        console.log(req.params)
        session.findOne({ userId: req.params.emailid }).then(data => {
            res.send(data.chat)
        })
    });


    app.post('/webhook/', function (req, res) {
        var request = req.body;
        console.log(request.queryResult.parameters.email);
        session.findOne({ sessionId: request.session }).then(sessionData => {
            if (!sessionData) {
                session.create({
                    userId: request.queryResult.parameters.email,
                    sessionId: request.session
                }).then(newSession => {
                    // console.log('session created successfully');
                    user.findOne({ emailId: request.queryResult.parameters.email }).then(userData => {
                        if (request.queryResult.intent.displayName === 'userInfo') {
                            res.send(getText('Hello ' + userData.name + ', How may I help you?'));
                        }
                    })
                })
            } else {
                sessionData.chat.push(request.queryResult.queryText);
                var sentiment = new Sentiment();
                var result = sentiment.analyze(request.queryResult.queryText);
                sessionData.sentimentScore = sessionData.sentimentScore ? sessionData.sentimentScore + result.score : result.score;
                session.updateOne({ sessionId: request.session }, sessionData).then(data => {
                    console.log("session updated");
                });
                user.findOne({ emailId: sessionData.userId }).then(userData => {
                    if (request.queryResult.intent.displayName === 'userInfo') {
                        res.send(getText('Hello ' + userData.name + ', How may I help you?'));
                    } else if (request.queryResult.intent.displayName === 'alternateNumber') {
                        userData.ongoingOrders[0].alternateNo = request.queryResult.parameters['phone-number'];
                        user.updateOne({ emailId: userData.emailId }, userData).then(data => {
                            res.send(getText('Your alternate Number has been registered. We will be calling you on ' + userData.ongoingOrders[0].alternateNo + ' instead of ' + userData.phNo + ' for this order'))
                        })
                    } else if (request.queryResult.intent.displayName === 'orderStatus' || request.queryResult.intent.displayName === 'orderDuration') {
                        if (userData.ongoingOrders.length === 1) {
                            var orderitems = ' ';
                            var deliveryStatus = ' ';
                            console.log(userData.ongoingOrders[0].eta)
                            for (let i = 0; i < userData.ongoingOrders[0].orderItems.length; i++) {
                                orderitems += userData.ongoingOrders[0].orderItems[i].times + ' ' + userData.ongoingOrders[0].orderItems[i].size + ' ' + userData.ongoingOrders[0].orderItems[i].name + ' ';
                            }
                            if (userData.ongoingOrders[0].status === 'pending') {
                                deliveryStatus = 'Your order is pending with the restaurant. You will be notified once we assign a delivery agent picks up your order for delivery.'
                            } else if (userData.ongoingOrders[0].status === 'outForDelivery') {
                                deliveryStatus = 'Our delivery Agent ' + userData.ongoingOrders[0].deliveryAgent + ' has picked up your order and will be delivering it ' + (userData.ongoingOrders[0].eta ? 'in next ' + userData.ongoingOrders[0].eta : 'shortly');
                            }
                            res.send(getText('Sure, I can help you with that.\n I see that you have placed an order for ' + orderitems + 'from ' + userData.ongoingOrders[0].fromLocation.name + '. ' + deliveryStatus));
                        } else {
                            res.send(getText('I see that you have no active orders. Please place Your order now.'));
                        }
                    } else if (request.queryResult.intent.displayName === 'placeOrder - no') {
                        res.send(getText('Your order was not placed.'))
                    } else if (request.queryResult.intent.displayName === 'placeOrder') {
                        let order = {
                            createdBy: userData.emailId,
                            orderItems: [{
                                size: request.queryResult.parameters.size ? request.queryResult.parameters.size : 'Regular',
                                name: request.queryResult.parameters.foodItems,
                                times: request.queryResult.parameters.number ? request.queryResult.parameters.number : 1,
                            }],
                            fromLocation: {
                                lat: '',
                                long: '',
                                name: request.queryResult.parameters.nameOfRestaurant
                            },
                            toLocation: userData.currentLocation,
                            deliveryAgent: 'Umesh Yadav',
                            status: 'pending',
                            eta: '40 minutes'
                        };
                        userData.ongoingOrders = [order];
                        var orderDetails = ' ';
                        for (let i = 0; i < userData.ongoingOrders[0].orderItems.length; i++) {
                            orderDetails += userData.ongoingOrders[0].orderItems[i].times + ' ' + userData.ongoingOrders[0].orderItems[i].size + ' ' + userData.ongoingOrders[0].orderItems[i].name + ' ' + 'from ' + userData.ongoingOrders[0].fromLocation.name;
                        }
                        // res.send(getText('Order Details : \n ' + orderDetails + ' Can I go ahead and place the order?'));
                        user.updateOne({ emailId: userData.emailId }, userData).then(data => {
                            console.log("successfully placed an order");
                            res.send(getText('Your order is placed successfully\n You have placed an order for ' + orderDetails));
                        })
                    } else if (request.queryResult.intent.displayName === 'placeOrder - yes') {
                        let order = {
                            createdBy: userData.emailId,
                            orderItems: [{
                                size: request.queryResult.parameters.size ? request.queryResult.parameters.size : 'Regular',
                                name: request.queryResult.parameters.foodItems,
                                times: request.queryResult.parameters.number ? request.queryResult.parameters.number : 1,
                            }],
                            fromLocation: {
                                lat: '',
                                long: '',
                                name: request.queryResult.parameters.nameOfRestaurant
                            },
                            toLocation: userData.currentLocation,
                            deliveryAgent: 'Umesh Yadav',
                            status: 'pending',
                            eta: '40 minutes'
                        };
                        userData.ongoingOrders = [order];
                        var orderDetails = ' ';
                        for (let i = 0; i < userData.ongoingOrders[0].orderItems.length; i++) {
                            orderDetails += userData.ongoingOrders[0].orderItems[i].times + ' ' + userData.ongoingOrders[0].orderItems[i].size + ' ' + userData.ongoingOrders[0].orderItems[i].name + ' ' + 'from ' + userData.ongoingOrders[0].fromLocation.name;
                        }

                        user.updateOne({ emailId: userData.emailId }, userData).then(data => {
                            console.log("successfully placed an order");
                            res.send(getText('Your order is placed successfully\n You have placed an order for ' + orderDetails));
                        })
                    } else if (request.queryResult.intent.displayName === 'wrongOrder' || request.queryResult.intent.displayName === 'cancelOrder') {
                        if (userData.ongoingOrders.length === 1) {
                            var orderitems = ' ';
                            console.log(userData.ongoingOrders[0].eta)
                            for (let i = 0; i < userData.ongoingOrders[0].orderItems.length; i++) {
                                orderitems += userData.ongoingOrders[0].orderItems[i].times + ' ' + userData.ongoingOrders[0].orderItems[i].size + ' ' + userData.ongoingOrders[0].orderItems[i].name + ' ';
                            }
                            res.send(getText('I see that you have placed an order for ' + orderitems + 'from ' + userData.ongoingOrders[0].fromLocation.name + '. ' + '\n To help you with your order I will transfer this chat to concerned department.'));
                        } else {
                            res.send(getText('I see that you have no active orders. Please place Your order now.'));
                        }
                    }
                });

            }

        });
    });
}

function getText(text) {
    return {
        'fulfillmentText': text,
        'fulfillmentMessages': [
            {
                'text': {
                    'text': [
                        text
                    ]
                }
            }
        ]
    };
}