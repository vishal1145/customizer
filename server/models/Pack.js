var mongoose = require('mongoose');


var PacksSchema = new mongoose.Schema({
    name : String,
    type:{
        type: String,
        enum: ['MATERIALS', 'COLORS', 'PATTERNS']
    },
    metarials: [{ 
        name: String,
        texture:String,
        order: Number,
        visible : { type: Boolean, default: false }
    }],
    colors: [{ 
        code: String,
        order: Number,
        visible : { type: Boolean, default: false }
    }],
    patterns: [{ 
        name: String,
        order: Number,
        visible : { type: Boolean, default: false }
    }] ,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    order: Number,
    visible : { type: Boolean, default: false }
});

mongoose.model('Pack', PacksSchema);

