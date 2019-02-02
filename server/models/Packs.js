var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Packs = new Schema({
    name : String,
    type:{
        type: String,
        enum: ['MATERIALS', 'COLORS', 'PATTERNS']
    },
    metarials: [{ 
        name: String,
        texture:String,
        order: Number,
        visible : { type: Boolean, default: false },
        interactionValue : String,
        roughness : Number,
        metal : { type: Boolean, default: false },
        colors : String,
        image : String
    }],
    colors: [{ 
        code: String,
        order: Number,
        name : String,
        visible : { type: Boolean, default: false }
    }],
    patterns: [{ 
        name: String,
        order: Number,
        visible : { type: Boolean, default: false },
        image : String
    }] ,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    order: Number,
    visible : { type: Boolean, default: true },
});

module.exports  = mongoose.model('Packs', Packs);

