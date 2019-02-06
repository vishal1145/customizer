var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var weapons = new Schema({
    name : String,
    metarials: [],
    replaceMaterials: [],
    setupActions: [] ,
    customizations : [],
    modelFolder: String,
    modelFile: String,
    svgPath: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    visible : { type: Boolean, default: true },
});

module.exports  = mongoose.model('weapons', weapons);

