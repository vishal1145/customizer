var mongoose = require('mongoose');


var UserSchema = new mongoose.Schema({
    name : String,
    email: { type: String, lowercase: true},
    password: String,
    image:String,
    role : String  ,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

mongoose.model('User', UserSchema);

