const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    id: {type: Number, unique: true},
    name: String,
    score: Number
}, {_id: false});

module.exports = mongoose.model('User', UserSchema)