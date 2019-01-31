var lib = process.cwd()
var Packs = require(lib + "/models/Packs")

module.exports = function () {

    this.addMaterial = async function (data, options) {
        var pack = new Packs(data)
        let temp = await pack.save();
        return temp
    }

    this.getMaterial = async function(data, options){
        let data = await Packs.find({});
        return data
    }

}