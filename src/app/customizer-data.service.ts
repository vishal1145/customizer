import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { _ } from "underscore";
import { UserService } from './user.service';

export interface AppearanceOption {
  name: string;
  displayImg?: string;
  displayColor?: string;
  interactionValue: string;
  _id?: string,
  pack_id?: string,
  roughness?: string,
  visible?: boolean,
  metal?: boolean,
  order?: number
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
  constructor(public http: HttpClient, private userService: UserService) { }

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

  dbData: any = null;
  dbWeapons: any = null;
  async weaponsData() {
    const apiUrl = environment.apiBaseURL + 'api/manager';
    let role = null;
    if (this.userService.isAdmin()) {
      role = 'admin'
    }
    var toSend = {
      PRCID: 'packs',
      Method: 'getdata',
      Data: { role: role }
    }
    const api_response = await this.http.post<any>(apiUrl, toSend).toPromise();
    this.dbData = api_response.Data.packs;
    this.dbWeapons = api_response.Data.weapons;
    return this.prepareData(); //this.dbData;
  }


   compare(a, b) {
  if (a.order > b.order) return 1;
  if (b.order > a.order) return -1;
  return 0;
}

  prepareData() {
    var isAdmin = true;
    var obj: any = {
      environment: 'assets/textures/environments/parking.hdr',
      commonMaterials: [],
      commonSections: [{
        svgPath: 'assets/img/section-icons/materials.svg',
        name: 'Material',
        globalReset: true,
        interactionType: 'swapMaterial',
        optionGroups: [{
          allowNone: true,
          options: []
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
          options: []
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
          options: []
        }]
      }
      ],
      weapons: []
    };
    obj.weapons = this.dbWeapons;
    var temp = this.dbData;
    obj.commonSections[0].optionGroups[0].options = [];
    obj.commonSections[1].optionGroups[0].options = [];
    obj.commonSections[2].optionGroups[0].options = [];
    obj.commonMaterials = [];

    if (temp.length > 0) {
      obj.commonSections[0].optionGroups[0].options = [];
      obj.commonSections[1].optionGroups[0].options = [];
      obj.commonSections[2].optionGroups[0].options = [];
      obj.commonMaterials = [];

      for (let i = 0; i < temp.length; i++) {
        if (temp[i].metarials.length > 0) {

          for (let j = 0; j < temp[i].metarials.length; j++) {
            let option: any = {}

            option.name = temp[i].metarials[j].name
            option.displayImg = temp[i].metarials[j].image
            option.interactionValue = temp[i].metarials[j].name
            option.pack_id = temp[i]._id;
            option._id = temp[i].metarials[j]._id;
            option.roughness = temp[i].metarials[j].roughness;
            option.visible = temp[i].metarials[j].visible;
            option.metal = temp[i].metarials[j].metal;
            option.displayColor = temp[i].metarials[j].colors;
            option.order = temp[i].metarials[j].order;

            if (isAdmin) {
              obj.commonSections[0].optionGroups[0].options.push(option)
            } else if (temp[i].metarials[j].visible) {
              obj.commonSections[0].optionGroups[0].options.push(option)
            }


            let commonMaterials: any = {}
            commonMaterials.name = temp[i].metarials[j].name
            commonMaterials.color = temp[i].metarials[j].colors
            commonMaterials.metal = temp[i].metarials[j].metal
            commonMaterials.roughness = temp[i].metarials[j].roughness

            obj.commonMaterials.push(commonMaterials)
          }

          obj.commonSections[0].optionGroups[0].options.sort(this.compare);

        }
        if (temp[i].colors.length > 0) {
          for (let j = 0; j < temp[i].colors.length; j++) {
            let option: any = {}

            option.name = temp[i].colors[j].name
            option.displayColor = temp[i].colors[j].code
            option.interactionValue = temp[i].colors[j].code
            option.pack_id = temp[i]._id;
            option._id = temp[i].colors[j]._id;
            option.visible = temp[i].colors[j].visible;
            option.order = temp[i].colors[j].order;

            if (isAdmin) {
              obj.commonSections[1].optionGroups[0].options.push(option)
            } else if (temp[i].colors[j].visible) {
              obj.commonSections[1].optionGroups[0].options.push(option)
            }
          }

          obj.commonSections[1].optionGroups[0].options.sort(this.compare);
        }
        if (temp[i].patterns.length > 0) {
          for (let j = 0; j < temp[i].patterns.length; j++) {
            let option: any = {}

            option.name = temp[i].patterns[j].name
            option.displayImg = temp[i].patterns[j].image
            option.interactionValue = temp[i].patterns[j].name
            option.pack_id = temp[i]._id;
            option._id = temp[i].patterns[j]._id;
            option.visible = temp[i].patterns[j].visible;
            option.order = temp[i].patterns[j].order;

            if (isAdmin) {
              obj.commonSections[2].optionGroups[0].options.push(option)
            } else if (temp[i].patterns[j].visible) {
              obj.commonSections[2].optionGroups[0].options.push(option)
            }
          }

          obj.commonSections[2].optionGroups[0].options.sort(this.compare);
        }
      }

    }
    return obj;
   }

  getOrder(arr) {
    var order = 0;
    if (arr.length > 0) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].order > order)
          order = arr[i].order;
      }
    }
    return order + 1;
  }

  addDataOnPacks(obj) {
    //obj.OPER
    if (obj.metarials) {
      obj.metarials[0]._id = new Date().getTime(); //auto generate unique id ;
      console.log(this.dbData)
      let i = _.findIndex(this.dbData, function (t) { return t._id == obj.packid })
      if (i > -1) {
        if (this.dbData[i].opname) {
          delete obj.metarials[0].opname;
        }
        let order = this.getOrder(this.dbData[i].metarials);
        obj.metarials[0].order = order

        this.dbData[i].metarials.push(obj.metarials[0]);
      }
    }
    else if (obj.colors){
      console.log(this.dbData)
      let i = _.findIndex(this.dbData, function (t) { return t._id == obj.packid })
      if (i > -1) {
        if (this.dbData[i].opname) {
          delete obj.colors[0].opname;
        }

        let order = this.getOrder(this.dbData[i].colors);
        obj.colors[0].order = order

        this.dbData[i].colors.push(obj.colors[0])
      }
    }
    else if (obj.patterns){
      console.log(this.dbData)
      let i = _.findIndex(this.dbData, function (t) { return t._id == obj.packid })
      if (i > -1) {
        if (this.dbData[i].opname) {
          delete obj.patterns[0].opname;
        }

        let order = this.getOrder(this.dbData[i].patterns);
        obj.patterns[0].order = order

        this.dbData[i].patterns.push(obj.patterns[0])
      }
    }
    localStorage.setItem("Packs", JSON.stringify(this.dbData))
  }

  editDataOnPacks(obj) {
    console.log(obj)
    
    if (obj.metarials) {
      let i = _.findIndex(this.dbData, function (t) { return t._id == obj.packid })
      if (i > -1) {
        let j = _.findIndex(this.dbData[i].metarials, function (t) { return t._id == obj.arrId })
        if (j > -1) {
          if (this.dbData[i].metarials[j].opname && this.dbData[i].metarials[j].opname == "ADD") {
            obj.metarials[0].opname = "ADD"
            this.dbData[i].metarials[j] = obj.metarials[0]
          } else {
            this.dbData[i].metarials[j] = obj.metarials[0]
          }
        }
      }
    }
    else if (obj.colors) {
      let i = _.findIndex(this.dbData, function (t) { return t._id == obj.packid })
      if (i > -1) {
        let j = _.findIndex(this.dbData[i].colors, function (t) { return t._id == obj.arrId })
        if (j > -1) {
          if (this.dbData[i].colors[j].opname && this.dbData[i].colors[j].opname == "ADD") {
            obj.colors[0].opname = "ADD"
            this.dbData[i].colors[j] = obj.colors[0]
          } else {
            this.dbData[i].colors[j] = obj.colors[0]
          }
        }
      }
    }
    else if (obj.patterns) {
      let i = _.findIndex(this.dbData, function (t) { return t._id == obj.packid })
      if (i > -1) {
        let j = _.findIndex(this.dbData[i].patterns, function (t) { return t._id == obj.arrId })
        if (j > -1) {
          if (this.dbData[i].patterns[j].opname && this.dbData[i].patterns[j].opname == "ADD") {
            obj.patterns[0].opname = "ADD"
            this.dbData[i].patterns[j] = obj.patterns[0]
          } else {
            this.dbData[i].patterns[j] = obj.patterns[0]
          }
        }
      }
    }
    localStorage.setItem("Packs", JSON.stringify(this.dbData))
  }

  deleted = [];
  deleteDataOnPack(data) {

    this.deleted.push(data)


    if (data.type == "MATERIALS") {
      let i = _.findIndex(this.dbData, function (t) { return t._id == data.packid })
      if (i > -1) {
        let j = _.findIndex(this.dbData[i].metarials, function (t) { return t._id == data.arrId })
        if (j > -1) {
          this.dbData[i].metarials.splice(j, 1)
        }
      }
    }
    else if (data.type == "COLORS") {
      let i = _.findIndex(this.dbData, function (t) { return t._id == data.packid })
      if (i > -1) {
        let j = _.findIndex(this.dbData[i].colors, function (t) { return t._id == data.arrId })
        if (j > -1) {
          this.dbData[i].colors.splice(j, 1)
        }
      }
    }
    else if (data.type == "PATTERNS") {
      let i = _.findIndex(this.dbData, function (t) { return t._id == data.packid })
      if (i > -1) {
        let j = _.findIndex(this.dbData[i].patterns, function (t) { return t._id == data.arrId })
        if (j > -1) {
          this.dbData[i].patterns.splice(j, 1)
        }
      }
    }
    localStorage.setItem("Packs", JSON.stringify(this.dbData))
  }

  setVisibleOfPackData(data) {
    if (data.type == "MATERIALS") {
      let i = _.findIndex(this.dbData, function (t) { return t._id == data.packid })
      if (i > -1) {
        let j = _.findIndex(this.dbData[i].metarials, function (t) { return t._id == data.arrId })
        if (j > -1) {
          this.dbData[i].metarials[j].visible = data.value
          if (this.dbData[i].metarials[j].opname && this.dbData[i].metarials[j].opname == "ADD") {
          } else {
            this.dbData[i].metarials[j].opname = 'EDIT'
          }
        }
      }
    }
    else if (data.type == "COLORS") {
      let i = _.findIndex(this.dbData, function (t) { return t._id == data.packid })
      if (i > -1) {
        let j = _.findIndex(this.dbData[i].colors, function (t) { return t._id == data.arrId })
        if (j > -1) {
          this.dbData[i].colors[j].visible = data.value
          if (this.dbData[i].colors[j].opname && this.dbData[i].colors[j].opname == "ADD") {
          } else {
            this.dbData[i].colors[j].opname = 'EDIT'
          }
        }
      }
    }
    else if (data.type == "PATTERNS") {
      let i = _.findIndex(this.dbData, function (t) { return t._id == data.packid })
      if (i > -1) {
        let j = _.findIndex(this.dbData[i].patterns, function (t) { return t._id == data.arrId })
        if (j > -1) {
          this.dbData[i].patterns[j].visible = data.value
          if (this.dbData[i].patterns[j].opname && this.dbData[i].patterns[j].opname == "ADD") {
          } else {
            this.dbData[i].patterns[j].opname = 'EDIT'
          }
        }
      }
    }
    localStorage.setItem("Packs", JSON.stringify(this.dbData))
  }

  setVisibleofWeapon(obj) {
    let i = _.findIndex(this.dbWeapons, function (t) { return t._id == obj.weapons._id })
    if (i > -1) {
      this.dbWeapons[i].visible = obj.value
      this.dbWeapons[i].opname = "EDIT"
    }
  }

  moveLeft(data) {

    if (data.type == "MATERIALS") {
      let i = _.findIndex(this.dbData, function (t) { return t._id == data.packid })
      if (i > -1) {
        this.dbData[i].metarials.sort(this.compare);
        let j = _.findIndex(this.dbData[i].metarials, function (t) { return t._id == data.arrId })
        if (j > -1 && data.order > 1) {
          this.dbData[i].metarials[j].order = this.dbData[i].metarials[j - 1].order
          this.dbData[i].metarials[j].opname = 'EDIT'
          this.dbData[i].metarials[j - 1].order = data.order
          this.dbData[i].metarials[j-1].opname = 'EDIT'
        }
      }
    }
    else if (data.type == "COLORS") {
      let i = _.findIndex(this.dbData, function (t) { return t._id == data.packid })
      if (i > -1) {
        this.dbData[i].colors.sort(this.compare);
        let j = _.findIndex(this.dbData[i].colors, function (t) { return t._id == data.arrId })
        if (j > -1 && data.order > 1) {
          this.dbData[i].colors[j].order = this.dbData[i].colors[j - 1].order
          this.dbData[i].colors[j].opname = 'EDIT'
          this.dbData[i].colors[j - 1].order = data.order
          this.dbData[i].colors[j - 1].opname = 'EDIT'
        }
      }
    }
    else if (data.type == "PATTERNS") {
      let i = _.findIndex(this.dbData, function (t) { return t._id == data.packid })
      if (i > -1) {
        this.dbData[i].patterns.sort(this.compare);
        let j = _.findIndex(this.dbData[i].patterns, function (t) { return t._id == data.arrId })
        if (j > -1 && data.order > 1) {
          this.dbData[i].patterns[j].order = this.dbData[i].patterns[j - 1].order
          this.dbData[i].patterns[j].opname = 'EDIT'
          this.dbData[i].patterns[j - 1].order = data.order
          this.dbData[i].patterns[j - 1].opname = 'EDIT'
        }
      }
    }
    localStorage.setItem("Packs", JSON.stringify(this.dbData))
  }


  moveRight(data) {

    if (data.type == "MATERIALS") {
      let i = _.findIndex(this.dbData, function (t) { return t._id == data.packid })
      if (i > -1) {
        this.dbData[i].metarials.sort(this.compare);
        let j = _.findIndex(this.dbData[i].metarials, function (t) { return t._id == data.arrId })
        let max = this.getOrder(this.dbData[i].metarials)
        if (j > -1 && data.order < max-1) {
          this.dbData[i].metarials[j].order = this.dbData[i].metarials[j + 1].order
          this.dbData[i].metarials[j].opname = 'EDIT'
          this.dbData[i].metarials[j + 1].order = data.order
          this.dbData[i].metarials[j + 1].opname = 'EDIT'
        }
      }
    }
    else if (data.type == "COLORS") {
      let i = _.findIndex(this.dbData, function (t) { return t._id == data.packid })
      if (i > -1) {
        this.dbData[i].colors.sort(this.compare);
        let j = _.findIndex(this.dbData[i].colors, function (t) { return t._id == data.arrId })
        let max = this.getOrder(this.dbData[i].colors)
        if (j > -1 && data.order < max - 1) {
          this.dbData[i].colors[j].order = this.dbData[i].colors[j + 1].order
          this.dbData[i].colors[j].opname = 'EDIT'
          this.dbData[i].colors[j + 1].order = data.order
          this.dbData[i].colors[j + 1].opname = 'EDIT'
        }
      }
    }
    else if (data.type == "PATTERNS") {
      let i = _.findIndex(this.dbData, function (t) { return t._id == data.packid })
      if (i > -1) {
        this.dbData[i].patterns.sort(this.compare);
        let j = _.findIndex(this.dbData[i].patterns, function (t) { return t._id == data.arrId })
        let max = this.getOrder(this.dbData[i].patterns)
        if (j > -1 && data.order < max - 1) {
          this.dbData[i].patterns[j].order = this.dbData[i].patterns[j + 1].order
          this.dbData[i].patterns[j].opname = 'EDIT'
          this.dbData[i].patterns[j + 1].order = data.order
          this.dbData[i].patterns[j + 1].opname = 'EDIT'
        }
      }
    }
    localStorage.setItem("Packs", JSON.stringify(this.dbData))
  }

  weaponsDataLocal() {
    return this.prepareData();
  }
}
