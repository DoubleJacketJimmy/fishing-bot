const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let TourSchema = new Schema({
    userID: Number,
    catch: Number,
    date: Date
});

module.exports = mongoose.model('Tour', TourSchema)