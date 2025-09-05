const { required } = require("joi");
const { default: mongoose } = require("mongoose");
const monggose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMangoose = require("passport-local-mongoose");

const userSchema = new Schema ({
  email: {
    type: String,
    required: true,
  }
});

userSchema.plugin(passportLocalMangoose);

module.exports = mongoose.model("User", userSchema);