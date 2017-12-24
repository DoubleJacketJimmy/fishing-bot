const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    _id: Number,
    name: String,
    score: Number,
    recordPike: {type: Number, default: 0},
    recordBass: {type: Number, default: 0}
}, {_id: false});

module.exports = mongoose.model('User', UserSchema)