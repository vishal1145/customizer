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

  this.editPack = async function (data, option) {
    let temp = await Packs.update({ "_id": data.packid }, { $set: { "name": data.name } }, { new: true })
    return temp
  }

  this.deletePack = async function (data, options) {
    let temp = await Packs.remove({ "_id": data.packid });
    return temp
  }

  this.setVisibleOfPack = async function (data, option) {
    let temp = await Packs.update({ "_id": data.packid }, { $set: { "visible": data.value } }, { new: true })
    return temp
  }



  this.deployPack = async function (data, options) {
    console.log(data)
    let dbData = data.dbData
    let deleted = data.deleted
    if (dbData.length > 0) {
      for (let i = 0; i < dbData.length; i++) {
        if (dbData[i].metarials) {
          for (let j = 0; j < dbData[i].metarials.length; j++) {
            let arr = []
            if (dbData[i].metarials[j].opname && dbData[i].metarials[j].opname == "ADD") {
              arr = dbData[i].metarials[j]
              delete arr._id
              let temp = await Packs.findOneAndUpdate({ _id: dbData[i]._id }, {
                $push: {
                  metarials: arr
                }
              }, { new: true })
            }

            if(dbData[i].metarials[j].opname && dbData[i].metarials[j].opname == "EDIT"){
              arr = dbData[i].metarials[j]
              let temp = await Packs.updateOne({
                _id: dbData[i]._id,
                metarials: {
                  $elemMatch: {
                    _id: arr._id
                  }
                }
              }, {
                  $set: {
                    "metarials.$": arr
                  }
                });
            }

          }
        }
        else if (dbData[i].colors) {
          for (let j = 0; j < dbData[i].colors.length; j++) {
            let arr = []
            if (dbData[i].colors[j].opname && dbData[i].colors[j].opname == "ADD") {
              arr = dbData[i].colors[j]
              delete arr._id
              let temp = await Packs.findOneAndUpdate({ _id: dbData[i]._id }, {
                $push: {
                  colors: arr
                }
              }, { new: true })
            }

            if(dbData[i].colors[j].opname && dbData[i].colors[j].opname == "EDIT"){
              arr = dbData[i].colors[j]
              let temp = await Packs.updateOne({
                _id: dbData[i]._id,
                colors: {
                  $elemMatch: {
                    _id: arr._id
                  }
                }
              }, {
                  $set: {
                    "colors.$": arr
                  }
                });
            }
          }
        }
        else if (dbData[i].patterns) {
          for (let j = 0; j < dbData[i].patterns.length; j++) {
            let arr = []
            if (dbData[i].patterns[j].opname && dbData[i].patterns[j].opname == "ADD") {
              arr = dbData[i].patterns[j]
              delete arr._id
              let temp = await Packs.findOneAndUpdate({ _id: dbData[i]._id }, {
                $push: {
                  patterns: arr
                }
              }, { new: true })
            }

            if(dbData[i].patterns[j].opname && dbData[i].patterns[j].opname == "EDIT"){
              arr = dbData[i].patterns[j]
              let temp = await Packs.updateOne({
                _id: dbData[i]._id,
                patterns: {
                  $elemMatch: {
                    _id: arr._id
                  }
                }
              }, {
                  $set: {
                    "patterns.$": arr
                  }
                });
            }

          }
        }
      }
    }

    if (deleted.length > 0) {
      for (let i = 0; i < deleted.length; i++) {
        let packid = deleted[i].packid;
        let arrid = deleted[i].arrId;
        let type = deleted[i].type
        if (type == "MATERIALS") {
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
        } else if (type == "COLORS") {
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
        } else if (type == "PATTERNS") {
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
        }
      }
    }
    return
  }

}
