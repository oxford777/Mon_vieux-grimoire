const mongoose = require('mongoose');
const uniqueValidatorPackage = require('mongoose-unique-validator');
const uniqueValidator = uniqueValidatorPackage.default || uniqueValidatorPackage;

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);