const mongoose = require('mongoose');
const { Schema } = mongoose;
const { RequiredString } = require('../util/mongoose-helpers');

const schema = new Schema({
    name: RequiredString,
    dob: Date.parse(),
    pob: RequiredString
});

module.exports = mongoose.model('Actor', schema);