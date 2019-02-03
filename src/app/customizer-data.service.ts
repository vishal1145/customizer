import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

export interface AppearanceOption {
  name: string;
  displayImg?: string;
  displayColor?: string;
  interactionValue: string;
  _id?: string,
  pack_id?: string
}

export interface AppearanceOptionGroup {
  allowNone: boolean;
  defaultSelected?: number;
  options: AppearanceOption[];
}

export interface AppearanceSection {
  svgPath: string;
  name: string;
  globalReset: boolean;
  interactionType: string;
  affectedParameter?: string;
  optionGroups: AppearanceOptionGroup[];
}

export interface PostLoadAction {
  type: string;
  target: string;
}

export interface MaterialProperties {
  name: string;
  color?: string;
  texture?: string;
  metal?: boolean;
  roughness?: number;
  metallicRoughnessMap?: string;
  normalMap?: string;
}

export interface MaterialReplacement {
  newMaterialName: string;
  oldMaterialNames: string[];
}

export interface WeaponCustomization {
  modelFolder: string;
  modelFile: string;
  svgPath: string;
  name: string;
  interactionBlacklist?: string[];
  materials?: MaterialProperties[];
  replaceMaterials?: MaterialReplacement[];
  setupActions?: PostLoadAction[];
  customizations: AppearanceSection[];
}

export interface WeaponCustomizationData {
  environment?: string;
  commonMaterials?: MaterialProperties[];
  commonSections?: AppearanceSection[];
  weapons: WeaponCustomization[];
}

@Injectable({
  providedIn: 'root'
})
export class CustomizerDataService {
  constructor(public http: HttpClient) { }

  generateTextureOptions(count: number, filePattern: string, descriptionPattern: string): AppearanceOption[] {
    const options: AppearanceOption[] = [];

    for (let i = 1; i <= count; ++i) {
      const numStr = i < 10 ? ('0' + i) : i.toString();
      const uri = 'assets/img/patterns/' + filePattern.replace('#', numStr);

      options.push({
        name: descriptionPattern.replace('#', numStr),
        displayImg: uri,
        interactionValue: uri
      });
    }

    return options;
  }

  weaponsData1(): Observable<WeaponCustomizationData> {
    let textureOptions = this.generateTextureOptions(12, 'BW/bw_pattern_#.jpg', 'BW Pattern #');
    textureOptions = textureOptions.concat(this.generateTextureOptions(20, 'Colorful1/colorful1_pattern_#.jpg', 'Colorful1 Pattern #'));
    textureOptions = textureOptions.concat(this.generateTextureOptions(10, 'Colorful2/colorful2_pattern_#.jpg', 'Colorful2 Pattern #'));

    return of({
      environment: 'assets/textures/environments/parking.hdr',
      commonMaterials: [
        {
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
      commonSections: [
        {
          svgPath: 'assets/img/section-icons/materials.svg',
          name: 'Material',
          globalReset: true,
          interactionType: 'swapMaterial',
          optionGroups: [
            {
              allowNone: true,
              options: [
                {
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
            }
          ]
        },
        {
          svgPath: 'assets/img/section-icons/color.svg',
          name: 'Color',
          globalReset: true,
          interactionType: 'alterMaterial',
          affectedParameter: 'color',
          optionGroups: [
            {
              allowNone: true,
              options: [
                {
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
            }
          ]
        },
        {
          svgPath: 'assets/img/section-icons/textures.svg',
          name: 'Patterns',
          globalReset: true,
          interactionType: 'alterMaterial',
          affectedParameter: 'texture',
          optionGroups: [
            {
              allowNone: true,
              options: textureOptions
            }
          ]
        }
      ],
      weapons: [
        {
          name: 'M1 Garand',
          modelFolder: 'assets/models/m1garand/',
          modelFile: 'M1Combined.gltf',
          svgPath: 'assets/img/weapon-icons/m1_garand.svg',
          materials: [
            {
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
          replaceMaterials: [
            {
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
          setupActions: [
            {
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
          customizations: [
            {
              svgPath: 'assets/img/section-icons/grip.svg',
              name: 'Attachments',
              globalReset: true,
              interactionType: 'toggleMesh',
              optionGroups: [
                {
                  allowNone: true,
                  options: [
                    {
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
                  options: [
                    {
                      name: 'Bayonet',
                      displayImg: 'assets/img/m1garand-icons/Icon_Bayonet.png',
                      interactionValue: 'Bayonet'
                    }
                  ]
                },
                {
                  allowNone: true,
                  options: [
                    {
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
            }
          ]
        },
        {
          name: 'Assault Rifle',
          modelFolder: 'assets/models/assault-rifle/',
          modelFile: 'assault-rifle.gltf',
          svgPath: 'assets/img/weapon-icons/assault-rifle.svg',
          rotation: 180,
          materials: [
            {
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
          replaceMaterials: [
            {
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




          setupActions: [
            {
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
          customizations: [
            {
              svgPath: 'assets/img/section-icons/grip.svg',
              name: 'Attachments',
              globalReset: true,
              interactionType: 'toggleMesh',
              optionGroups: [
                {
                  allowNone: true,
                  options: [
                    {
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
                  options: [
                    {
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
                  options: [
                    {
                      name: 'flashlight',
                      displayImg: 'assets/img/assault-rifle/icon_flashlight.png',
                      interactionValue: 'flash_light'
                    }
                  ]
                },

                {
                  allowNone: true,
                  options: [
                    {
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
                  options: [
                    {
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
                  options: [
                    {
                      name: 'tactical_laser',
                      displayImg: 'assets/img/assault-rifle/icon_tactical_laser.png',
                      interactionValue: 'tactical_laser'
                    }
                  ]
                }
              ]
            }

          ]
        }

      ]
    });
  }

  weaponsData(): Observable<any> {
    const apiUrl = environment.apiBaseURL + 'api/manager';
    var toSend = {
      PRCID: 'packs',
      Method: 'getdata',
      Data: { role: 'addmin' }
    }
    return this.http.post<any>(apiUrl, toSend)
  }
}

