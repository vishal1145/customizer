var lib = process.cwd()
var Packs = require(lib + "/models/Packs")

module.exports = function () {

  this.getpacks = async function (data, options) {
    var findCondition = {};
    if (data.role !== "addmin") findCondition = {
      visible: true
    };
    return Packs.find({});
  }


  this.addPack = async function (data, options) {
    var pack = new Packs(data)
    let temp = await pack.save();
    return temp
  }

  this.addDataOnPacks = async function (data, options) {
    try {
      var packid = data.packid;
      let arr = [];
      if (data.metarials && data.metarials.length > 0) {
        arr = data.metarials
        let temp = await Packs.findOneAndUpdate({
          _id: packid
        }, {
          $push: {
            metarials: arr
          }
        }, {
          new: true
        })
        return temp
      } else if (data.colors && data.colors.length > 0) {
        arr = data.colors
        let temp = await Packs.findOneAndUpdate({
          _id: packid
        }, {
          $push: {
            colors: arr
          }
        }, {
          new: true
        })
        return temp
      } else if (data.patterns && data.patterns.length > 0) {
        arr = data.patterns
        let temp = await Packs.findOneAndUpdate({
          _id: packid
        }, {
          $push: {
            patterns: arr
          }
        }, {
          new: true
        })
        return temp
      }
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  this.editDataOnPacks = async function (data, options) {
    try {
      var packid = data.packid;
      var arrid = data.arrId
      if (data.metarials && data.metarials.length > 0) {
        let temp = await Packs.updateOne({
          _id: packid,
          metarials: {
            $elemMatch: {
              _id: arrid
            }
          }
        }, {
          $set: {
            "metarials.$": data.metarials[0]
          }
        });
        return temp
      } else if (data.colors && data.colors.length > 0) {
        let temp = await Packs.updateOne({
          _id: packid,
          colors: {
            $elemMatch: {
              _id: arrid
            }
          }
        }, {
          $set: {
            "colors.$": data.colors[0]
          }
        });
        return temp
      } else if (data.patterns && data.patterns.length > 0) {
        let temp = await Packs.updateOne({
          _id: packid,
          patterns: {
            $elemMatch: {
              _id: arrid
            }
          }
        }, {
          $set: {
            "patterns.$": data.patterns[0]
          }
        });
        return temp
      }
    } catch (e) {
      throw e
    }
  }

  this.deleteMaterial = async function (data, options) {
    try {
      var packid = data.packid;
      let arrid = data.arrId;
      if (data.type == "MATERIALS") {
        let temp = await Packs.findByIdAndUpdate({
          _id: packid
        }, {
          $pull: {
            metarials: {
              _id: arrid
            }
          }
        }, {
          new: true
        })
        return temp
      } else if (data.type == "COLORS") {
        let temp = await Packs.findOneAndUpdate({
          _id: packid
        }, {
          $pull: {
            colors: {
              _id: arrid
            }
          }
        }, {
          new: true
        })
        return temp
      } else if (data.type == "PATTERNS") {
        let temp = await Packs.findOneAndUpdate({
          _id: packid
        }, {
          $pull: {
            patterns: {
              _id: arrid
            }
          }
        }, {
          new: true
        })
        return temp
      }
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  this.setVisible = async function (data, options) {
    try {
      var packid = data.packid;
      let arrid = data.arrId;
      if (data.type == "MATERIALS") {
        let temp = await Packs.updateOne({
          _id: packid,
          metarials: {
            $elemMatch: {
              _id: arrid
            }
          }
        }, {
          $set: {
            "metarials.$.visible": data.visible
          }
        });
        return temp
      } else if (data.type == "COLORS") {
        let temp = await Packs.updateOne({
          _id: packid,
          metarials: {
            $elemMatch: {
              _id: arrid
            }
          }
        }, {
          $set: {
            "colors.$.visible": data.visible
          }
        });
        return temp
      } else if (data.type == "PATTERNS") {
        let temp = await Packs.updateOne({
          _id: packid,
          metarials: {
            $elemMatch: {
              _id: arrid
            }
          }
        }, {
          $set: {
            "patterns.$.visible": data.visible
          }
        });
        return temp
      }
    } catch (e) {
      console.log(e)
      throw e
    }
  }


  this.getdata = async function (data, options) {
    return await Packs.find({});
  }

  this.editPack = async function(data, option){
    let temp = await Packs.update({"_id" :data.packid}, {$set : {"name" : data.name}}, {new : true})
    return temp
  }

  this.deletePack = async function(data, options){
    let temp = await Packs.remove({"_id" : data.packid});
    return temp
  }

  this.setVisibleOfPack = async function(data, option){
    let temp = await Packs.update({"_id" :data.packid}, {$set : {"visible" : data.value}}, {new : true})
    return temp
  }

}
