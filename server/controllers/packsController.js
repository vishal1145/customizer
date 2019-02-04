var lib = process.cwd()
var Packs = require(lib + "/models/Packs")

module.exports = function () {

  this.getpacks = async function (data, options) {
    var findCondition = {};
    if (data.role !== "admin") findCondition = {
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
    // "Admin" then pick all the data otherwise pick which are visible 
    var role = data.Role
    var obj = {};
    var textureOptions = {};
    obj = {
      environment: 'assets/textures/environments/parking.hdr',
      commonMaterials: [{
          name: 'Silver',
          color: '#fcfaf5',
          metal: true,
          roughness: 0.32
        },
        {
          name: 'Plastic',
          color: '#ffffff',
          metal: false,
          roughness: 0.48
        }
      ],
      commonSections: [{
          svgPath: 'assets/img/section-icons/materials.svg',
          name: 'Material',
          globalReset: true,
          interactionType: 'swapMaterial',
          optionGroups: [{
            allowNone: true,
            options: [{
                name: 'Silver',
                displayImg: 'assets/img/material-icons/Silver_Icon_128.png',
                interactionValue: 'Silver'
              },
              {
                name: 'Plastic',
                displayImg: 'assets/img/material-icons/Plastic_Icon_128.png',
                interactionValue: 'Plastic'
              }
            ]
          }]
        },
        {
          svgPath: 'assets/img/section-icons/color.svg',
          name: 'Color',
          globalReset: true,
          interactionType: 'alterMaterial',
          affectedParameter: 'color',
          optionGroups: [{
            allowNone: true,
            options: [{
                name: 'Silver',
                displayColor: '#fcfaf5',
                interactionValue: '#fcfaf5'
              },
              {
                name: 'Gold',
                displayColor: '#ffe29b',
                interactionValue: '#ffe29b'
              },
              {
                name: 'White',
                displayColor: '#FFFFFF',
                interactionValue: '#FFFFFF'
              },
              {
                name: 'Pink',
                displayColor: '#EE82EE',
                interactionValue: '#EE82EE'
              },
              {
                name: 'Fuchsia',
                displayColor: '#800080',
                interactionValue: '#800080'
              },
              {
                name: 'Blue',
                displayColor: '#000080',
                interactionValue: '#000080'
              },
              {
                name: 'Teal',
                displayColor: '#7FFFD4',
                interactionValue: '#7FFFD4'
              },
              {
                name: 'Lime',
                displayColor: '#00FF00',
                interactionValue: '#00FF00'
              },
              {
                name: 'Green',
                displayColor: '#008000',
                interactionValue: '#008000'
              },
              {
                name: 'Yellow',
                displayColor: '#FFFF00',
                interactionValue: '#FFFF00'
              },
              {
                name: 'Orange',
                displayColor: '#FFA500',
                interactionValue: '#FFA500'
              },
              {
                name: 'Red',
                displayColor: '#FF0000',
                interactionValue: '#FF0000'
              }
            ]
          }]
        },
        {
          svgPath: 'assets/img/section-icons/textures.svg',
          name: 'Patterns',
          globalReset: true,
          interactionType: 'alterMaterial',
          affectedParameter: 'texture',
          optionGroups: [{
            allowNone: true,
            options: textureOptions
          }]
        }
      ],
      weapons: [{
          name: 'M1 Garand',
          modelFolder: 'assets/models/m1garand/',
          modelFile: 'M1Combined.gltf',
          svgPath: 'assets/img/weapon-icons/m1_garand.svg',
          materials: [{
              name: 'M1Bayonet',
              texture: 'assets/textures/m1garand/M1Garand_Bayonet_BaseColor.jpg',
              metallicRoughnessMap: 'assets/textures/m1garand/M1Garand_Bayonet_MetallicRoughness.jpg',
              normalMap: 'assets/textures/m1garand/M1Garand_Bayonet_Normal.jpg'
            },
            {
              name: 'M1ExperimentalScope',
              texture: 'assets/textures/m1garand/M1Garand_ExperimentalScope_BaseColor.jpg',
              metallicRoughnessMap: 'assets/textures/m1garand/M1Garand_ExperimentalScope_MetallicRoughness.jpg',
              normalMap: 'assets/textures/m1garand/M1Garand_ExperimentalScope_Normal.jpg'
            },
            {
              name: 'M1M84Scope',
              texture: 'assets/textures/m1garand/M1Garand_M84Scope_BaseColor.jpg',
              metallicRoughnessMap: 'assets/textures/m1garand/M1Garand_M84Scope_MetallicRoughness.jpg',
              normalMap: 'assets/textures/m1garand/M1Garand_M84Scope_Normal.jpg'
            },
            {
              name: 'M1MuzzleMods',
              texture: 'assets/textures/m1garand/M1Garand_MuzzleMods_BaseColor.jpg',
              metallicRoughnessMap: 'assets/textures/m1garand/M1Garand_MuzzleMods_MetallicRoughness.jpg',
              normalMap: 'assets/textures/m1garand/M1Garand_MuzzleMods_Normal.jpg'
            },
            {
              name: 'M1Body',
              color: '#70240b',
              texture: 'assets/textures/m1garand/body_Detail.jpg',
              roughness: 1.00,
              normalMap: 'assets/textures/m1garand/body_normal.jpg'
            },
            {
              name: 'M1TopBody',
              color: '#70240b',
              texture: 'assets/textures/m1garand/top_body_Detail.jpg',
              roughness: 1.00,
              normalMap: 'assets/textures/m1garand/top_body_normal.jpg'
            },
            {
              name: 'M1Barrel',
              color: '#c4c7c7',
              texture: 'assets/textures/m1garand/barrel_Detail.jpg',
              metal: true,
              roughness: 0.95,
              normalMap: 'assets/textures/m1garand/barrel_normal.jpg'
            },
            {
              name: 'M1Mechanical',
              color: '#484B51',
              texture: 'assets/textures/m1garand/receiver_Detail.jpg',
              metal: true,
              roughness: 0.95,
              normalMap: 'assets/textures/m1garand/receiver_normal.jpg'
            },
            {
              name: 'M1Parts',
              color: '#464A55',
              texture: 'assets/textures/m1garand/parts_Detail.jpg',
              metal: true,
              roughness: 0.95,
              normalMap: 'assets/textures/m1garand/partsn.jpg'
            }
          ],
          replaceMaterials: [{
              newMaterialName: 'M1Bayonet',
              oldMaterialNames: ['M1Garand_Bayonet']
            },
            {
              newMaterialName: 'M1ExperimentalScope',
              oldMaterialNames: ['M1Garand_ExperimentalSight']
            },
            {
              newMaterialName: 'M1M84Scope',
              oldMaterialNames: ['lambert5']
            },
            {
              newMaterialName: 'M1MuzzleMods',
              oldMaterialNames: ['M1Garand_Muzzle']
            },
            {
              newMaterialName: 'M1Body',
              oldMaterialNames: ['lambert6']
            },
            {
              newMaterialName: 'M1TopBody',
              oldMaterialNames: ['lambert10']
            },
            {
              newMaterialName: 'M1Barrel',
              oldMaterialNames: ['lambert9']
            },
            {
              newMaterialName: 'M1Mechanical',
              oldMaterialNames: ['lambert7']
            },
            {
              newMaterialName: 'M1Parts',
              oldMaterialNames: ['lambert8']
            }
          ],
          setupActions: [{
              type: 'hideMesh',
              target: 'Experimental_Sights'
            },
            {
              type: 'hideMesh',
              target: 'M84_Scope'
            },
            {
              type: 'hideMesh',
              target: 'Bayonet'
            },
            {
              type: 'hideMesh',
              target: 'Flash_Hider'
            },
            {
              type: 'hideMesh',
              target: 'Suppressor'
            }
          ],
          customizations: [{
            svgPath: 'assets/img/section-icons/grip.svg',
            name: 'Attachments',
            globalReset: true,
            interactionType: 'toggleMesh',
            optionGroups: [{
                allowNone: true,
                options: [{
                    name: 'Experimental Sight',
                    displayImg: 'assets/img/m1garand-icons/Icon_ExpSight.png',
                    interactionValue: 'Experimental_Sights'
                  },
                  {
                    name: 'M84 Scope',
                    displayImg: 'assets/img/m1garand-icons/Icon_M84Scope.png',
                    interactionValue: 'M84_Scope'
                  }
                ]
              },
              {
                allowNone: true,
                options: [{
                  name: 'Bayonet',
                  displayImg: 'assets/img/m1garand-icons/Icon_Bayonet.png',
                  interactionValue: 'Bayonet'
                }]
              },
              {
                allowNone: true,
                options: [{
                    name: 'Flash Hider',
                    displayImg: 'assets/img/m1garand-icons/Icon_FlashHider.png',
                    interactionValue: 'Flash_Hider'
                  },
                  {
                    name: 'Suppressor',
                    displayImg: 'assets/img/m1garand-icons/Icon_Suppressor.png',
                    interactionValue: 'Suppressor'
                  }
                ]
              }
            ]
          }]
        },
        {
          name: 'Assault Rifle',
          modelFolder: 'assets/models/assault-rifle/',
          modelFile: 'assault-rifle.gltf',
          svgPath: 'assets/img/weapon-icons/assault-rifle.svg',
          rotation: 180,
          materials: [{
              name: 'honey_badger_mat_new',
              texture: 'assets/models/assault-rifle/honey_badger_mat_baseColor.jpg',
              // metallicRoughnessMap: 'assets/models/assault-rifle/honey_badger_mat_baseColor.jpg',
              normalMap: 'assets/models/assault-rifle/honey_badger_mat_baseColor.jpg',

            },
            {
              name: 'silencer03_mat_new',
              texture: 'assets/models/assault-rifle/silencer03_mat_baseColor.jpg',
              // metallicRoughnessMap: 'assets/models/assault-rifle/silencer03_mat_emissive.jpg',
              normalMap: 'assets/models/assault-rifle/silencer03_mat_baseColor.jpg'
            },
            {
              name: 'silencer01_mat_new',
              texture: 'assets/models/assault-rifle/silencer01_mat_baseColor.jpg',
              // metallicRoughnessMap: 'assets/models/assault-rifle/silencer01_mat_emissive.jpg',
              normalMap: 'assets/models/assault-rifle/silencer01_mat_baseColor.jpg'
            },
            {
              name: 'silencer02_mat_new',
              texture: 'assets/models/assault-rifle/silencer02_mat_baseColor.jpg',
              // metallicRoughnessMap: 'assets/models/assault-rifle/silencer02_mat_emissive.jpg',
              normalMap: 'assets/models/assault-rifle/silencer02_mat_baseColor.jpg'
            },
            {
              name: 'grip02_mat_new',
              texture: 'assets/models/assault-rifle/grip02_mat_baseColor.jpg',
              // metallicRoughnessMap: 'assets/models/assault-rifle/grip02_mat_emissive.jpg',
              normalMap: 'assets/models/assault-rifle/grip02_mat_baseColor.jpg'
            },
            {
              name: 'reflect_sight_mat_new',
              texture: 'assets/models/assault-rifle/reflect_sight_mat_baseColor.jpg',
              // metallicRoughnessMap: 'assets/models/assault-rifle/reflect_sight_mat_emissive.jpg',
              normalMap: 'assets/models/assault-rifle/reflect_sight_mat_baseColor.jpg'
            },
            {
              name: 'red_dot_sight_mat_new',
              texture: 'assets/models/assault-rifle/red_dot_sight_mat_baseColor.jpg',
              // metallicRoughnessMap: 'assets/models/assault-rifle/red_dot_sight_mat_emissive.jpg',
              normalMap: 'assets/models/assault-rifle/red_dot_sight_mat_baseColor.jpg'
            },
            {
              name: 'holographic_sight_mat_new',
              texture: 'assets/models/assault-rifle/holographic_sight_mat_baseColor.jpg',
              // metallicRoughnessMap: 'assets/models/assault-rifle/holographic_sight_mat_emissive.jpg',
              normalMap: 'assets/models/assault-rifle/holographic_sight_mat_baseColor.jpg'
            },
            {
              name: 'grip01_mat_new',
              texture: 'assets/models/assault-rifle/grip01_mat_baseColor.jpg',
              // metallicRoughnessMap: 'assets/models/assault-rifle/grip01_mat_emissive.jpg',
              normalMap: 'assets/models/assault-rifle/grip01_mat_baseColor.jpg'
            },
            {
              name: 'grip03_mat_new',
              texture: 'assets/models/assault-rifle/grip03_mat_baseColor.jpg',
              // metallicRoughnessMap: 'assets/models/assault-rifle/grip03_mat_emissive.jpg',
              normalMap: 'assets/models/assault-rifle/grip03_mat_baseColor.jpg'
            },
            {
              name: 'tactical_laser_mat_new',
              texture: 'assets/models/assault-rifle/tactical_laser_mat_baseColor.jpg',
              // metallicRoughnessMap: 'assets/models/assault-rifle/tactical_laser_mat_emissive.jpg',
              normalMap: 'assets/models/assault-rifle/tactical_laser_mat_baseColor.jpg'
            },
            {
              name: 'acog_mat_new',
              texture: 'assets/models/assault-rifle/acog_mat_baseColor.jpg',
              // metallicRoughnessMap: 'assets/models/assault-rifle/acog_mat_emissive.jpg',
              normalMap: 'assets/models/assault-rifle/acog_mat_baseColor.jpg'
            },
            {
              name: 'flash_light_mat_new',
              texture: 'assets/models/assault-rifle/flash_light_mat_baseColor.jpg',
              // metallicRoughnessMap: 'assets/models/assault-rifle/flash_light_mat_emissive.jpg',
              normalMap: 'assets/models/assault-rifle/flash_light_mat_baseColor.jpg'
            },
            {
              name: 'scope_mat_new',
              texture: 'assets/models/assault-rifle/scope_mat_baseColor.jpg',
              // metallicRoughnessMap: 'assets/models/assault-rifle/scope_mat_emissive.jpg',
              normalMap: 'assets/models/assault-rifle/scope_mat_baseColor.jpg'
            },
          ],
          replaceMaterials: [{
              newMaterialName: 'acog_mat_new',
              oldMaterialNames: ['acog_mat']
            },
            {
              newMaterialName: 'flash_light_mat_new',
              oldMaterialNames: ['flash_light_mat']
            },
            {
              newMaterialName: 'grip01_mat_new',
              oldMaterialNames: ['grip01_mat']
            },
            {
              newMaterialName: 'grip02_mat_new',
              oldMaterialNames: ['grip02_mat']
            },
            {
              newMaterialName: 'grip03_mat_new',
              oldMaterialNames: ['grip03_mat']
            },
            {
              newMaterialName: 'honey_badger_mat_new',
              oldMaterialNames: ['honey_badger_mat']
            },
            {
              newMaterialName: 'holographic_sight_mat_new',
              oldMaterialNames: ['holographic_sight_mat']
            },
            {
              newMaterialName: 'red_dot_sight_mat_new',
              oldMaterialNames: ['red_dot_sight_mat']
            },
            {
              newMaterialName: 'reflect_sight_mat_new',
              oldMaterialNames: ['reflect_sight_mat']
            },
            {
              newMaterialName: 'scope_mat_new',
              oldMaterialNames: ['scope_mat']
            },
            {
              newMaterialName: 'silencer01_mat_new',
              oldMaterialNames: ['silencer01_mat']
            },
            {
              newMaterialName: 'silencer02_mat_new',
              oldMaterialNames: ['silencer02_mat']
            },

            {
              newMaterialName: 'silencer03_mat_new',
              oldMaterialNames: ['silencer03_mat']
            },

            {
              newMaterialName: 'tactical_laser_mat_new',
              oldMaterialNames: ['tactical_laser_mat']
            },
          ],




          setupActions: [{
              type: 'showMesh',
              target: 'magazine'
            },
            {
              type: 'hideMesh',
              target: 'acog'
            },
            {
              type: 'hideMesh',
              target: 'double_magazine'
            },
            {
              type: 'hideMesh',
              target: 'extended_magazine'
            },
            {
              type: 'hideMesh',
              target: 'flash_light'
            },
            {
              type: 'hideMesh',
              target: 'grip01'
            },
            {
              type: 'hideMesh',
              target: 'grip02'
            },
            {
              type: 'hideMesh',
              target: 'grip03'
            },
            {
              type: 'hideMesh',
              target: 'holographic_sight'
            },
            {
              type: 'hideMesh',
              target: 'red_dot_sight'
            },
            {
              type: 'hideMesh',
              target: 'silencer01'
            },
            {
              type: 'hideMesh',
              target: 'silencer02'
            },
            {
              type: 'hideMesh',
              target: 'silencer03'
            },
            {
              type: 'hideMesh',
              target: 'tactical_laser'
            },
            {
              type: 'hideMesh',
              target: 'scope'
            },
            {
              type: 'hideMesh',
              target: 'reflect_sight'
            }
          ],
          customizations: [{
              svgPath: 'assets/img/section-icons/grip.svg',
              name: 'Attachments',
              globalReset: true,
              interactionType: 'toggleMesh',
              optionGroups: [{
                  allowNone: true,
                  options: [{
                      name: 'acog',
                      displayImg: 'assets/img/assault-rifle/icon_acog.png',
                      interactionValue: 'acog'
                    },
                    {
                      name: 'holographic sight',
                      displayImg: 'assets/img/assault-rifle/icon_holographic_sight.png',
                      interactionValue: 'holographic_sight'
                    },
                    {
                      name: 'red_dot_sight',
                      displayImg: 'assets/img/assault-rifle/icon_red_dot_sight.png',
                      interactionValue: 'red_dot_sight'
                    },
                    {
                      name: 'reflect_sight',
                      displayImg: 'assets/img/assault-rifle/icon_reflex_sight.png',
                      interactionValue: 'reflect_sight'
                    },
                    {
                      name: 'scope',
                      displayImg: 'assets/img/assault-rifle/icon_scope.png',
                      interactionValue: 'scope'
                    }
                  ]
                },
                {
                  allowNone: true,
                  options: [{
                      name: 'magazine',
                      displayImg: 'assets/img/assault-rifle/icon_magazine.png',
                      interactionValue: 'magazine'
                    },
                    {
                      name: 'extended_magazine',
                      displayImg: 'assets/img/assault-rifle/icon_extended_magazine.png',
                      interactionValue: 'extended_magazine'
                    },
                    {
                      name: 'double_magazine',
                      displayImg: 'assets/img/assault-rifle/icon_double_magazine.png',
                      interactionValue: 'double_magazine'
                    }
                  ]
                },

                {
                  allowNone: true,
                  options: [{
                    name: 'flashlight',
                    displayImg: 'assets/img/assault-rifle/icon_flashlight.png',
                    interactionValue: 'flash_light'
                  }]
                },

                {
                  allowNone: true,
                  options: [{
                      name: 'grip01',
                      displayImg: 'assets/img/assault-rifle/icon_grip01.png',
                      interactionValue: 'grip01'
                    },
                    {
                      name: 'grip02',
                      displayImg: 'assets/img/assault-rifle/icon_grip02.png',
                      interactionValue: 'grip02'
                    },
                    {
                      name: 'grip03',
                      displayImg: 'assets/img/assault-rifle/icon_grip03.png',
                      interactionValue: 'grip03'
                    }
                  ]
                },
                {
                  allowNone: true,
                  options: [{
                      name: 'silencer01',
                      displayImg: 'assets/img/assault-rifle/icon_sliencer01.png',
                      interactionValue: 'silencer01'
                    },
                    {
                      name: 'silencer02',
                      displayImg: 'assets/img/assault-rifle/icon_sliencer02.png',
                      interactionValue: 'silencer02'
                    },
                    {
                      name: 'silencer03',
                      displayImg: 'assets/img/assault-rifle/icon_sliencer03.png',
                      interactionValue: 'silencer03'
                    }
                  ]
                },
                {
                  allowNone: true,
                  options: [{
                    name: 'tactical_laser',
                    displayImg: 'assets/img/assault-rifle/icon_tactical_laser.png',
                    interactionValue: 'tactical_laser'
                  }]
                }
              ]
            }

          ]
        }

      ]
    };

    let temp = await Packs.find({});
    if (temp.length > 0) {

      obj.commonSections[0].optionGroups[0].options = [];
      obj.commonSections[1].optionGroups[0].options = [];
      obj.commonSections[2].optionGroups[0].options = [];
      obj.commonMaterials = [];

      for (let i = 0; i < temp.length; i++) {
        if (temp[i].metarials.length > 0) {
          for (let j = 0; j < temp[i].metarials.length; j++) {
            let option = {}

            option.name = temp[i].metarials[j].name
            option.displayImg = temp[i].metarials[j].image
            option.interactionValue = temp[i].metarials[j].name
            option.pack_id = temp[i]._id;
            option._id = temp[i].metarials[j]._id;

            if (role == "Admin") {
              obj.commonSections[0].optionGroups[0].options.push(option)
            } else if (temp[i].metarials[j].visible) {
              obj.commonSections[0].optionGroups[0].options.push(option)
            }

            let commonMaterials = {}
            commonMaterials.name = temp[i].metarials[j].name
            commonMaterials.color = temp[i].metarials[j].colors
            commonMaterials.metal = temp[i].metarials[j].metal
            commonMaterials.roughness = temp[i].metarials[j].roughness

            obj.commonMaterials.push(commonMaterials)
          }
        }
        if (temp[i].colors.length > 0) {
          for (let j = 0; j < temp[i].colors.length; j++) {
            let option = {}

            option.name = temp[i].colors[j].name
            option.displayColor = temp[i].colors[j].code
            option.interactionValue = temp[i].colors[j].code
            option.pack_id = temp[i]._id;
            option._id = temp[i].colors[j]._id;

            if (role == "Admin") {
              obj.commonSections[1].optionGroups[0].options.push(option)
            } else if (temp[i].colors[j].visible) {
              obj.commonSections[1].optionGroups[0].options.push(option)
            }
          }
        }
        if (temp[i].patterns.length > 0) {
          for (let j = 0; j < temp[i].patterns.length; j++) {
            let option = {}

            option.name = temp[i].patterns[j].name
            option.displayImg = temp[i].patterns[j].image
            option.interactionValue = temp[i].patterns[j].name
            option.pack_id = temp[i]._id;
            option._id = temp[i].patterns[j]._id;

            if (role == "Admin") {
              obj.commonSections[2].optionGroups[0].options.push(option)
            } else if (temp[i].patterns[j].visible) {
              obj.commonSections[2].optionGroups[0].options.push(option)
            }
          }
        }
      }
      return obj
    }
  }

}
