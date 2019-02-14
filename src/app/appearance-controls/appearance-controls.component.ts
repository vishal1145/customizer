import { Component, HostListener , OnDestroy, ViewChild, NgZone } from '@angular/core';
import {
    AppearanceOption,
    AppearanceOptionGroup,
    AppearanceSection,
    CustomizerDataService,
    MaterialProperties,
    WeaponCustomization,
    WeaponCustomizationData
} from '../customizer-data.service';
import { ViewerService } from '../viewer.service';
import { Subscription } from 'rxjs';
import { UndoMgr } from './undo-manager';
import { APIService } from '../../providers/api-service';
import { FormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';
declare var $: any;
import { environment } from '../../environments/environment';
import { UserService } from '../user.service';
import { _ } from "underscore";

export interface DeepActiveAppearanceTracking {
    activeSection: AppearanceSection;
    resetActive: boolean;
    chosenGroupOption: Map<AppearanceOptionGroup, AppearanceOption>;
}

@Component({
    selector: 'app-appearance-controls',
    templateUrl: './appearance-controls.component.html',
    styleUrls: ['./appearance-controls.component.css'],
    providers: [APIService]
    //directives: [FORM_DIRECTIVES]
})
export class AppearanceControlsComponent implements OnDestroy {
    @ViewChild('optionsContainer')
    public optionsContainer;

    public allSections: AppearanceSection[] = [];
    public chosenWeapon: WeaponCustomization;
    public customizationData: WeaponCustomizationData;
    public hideWeaponChoices = true;
    public selectedItems: Map<WeaponCustomization, DeepActiveAppearanceTracking> =
        new Map<WeaponCustomization, DeepActiveAppearanceTracking>();

    private clickSubscription: Subscription;
    private initializeSubscription: Subscription;
    private viewerResetSubscription: Subscription;
    private lastClickedOption: Map<AppearanceSection, AppearanceOption> = new Map<AppearanceSection, AppearanceOption>();


    packArray = [];
    newPackArray = [];
    loggedUser = null;
    isAdmin = false;
    place_holder_image = "assets/img/image-placeholder-png-4.png";
    constructor(private customizerDataService: CustomizerDataService,
        private apiService: APIService, private _ngZone: NgZone,
        private viewerService: ViewerService, private userService: UserService) {
        this.loggedUser = this.userService.retrieveUser();
        this.isAdmin = this.userService.isAdmin();
        this.initializeSubscription = viewerService.initialized.subscribe(() => {
            this.viewerInitialized();
        });

        this.clickSubscription = this.viewerService.meshClicked.subscribe((meshName: string) => {
            this.meshClicked(meshName);
        });

        this.viewerResetSubscription = this.viewerService.reset.subscribe(() => {
            this.viewerReset();
        });
        this.getPacks();

        //document.addEventListener("click", function () {
        //  $('a').removeClass('active')
        //  console.log(this)
        //});
    }

    @HostListener('document:click', ['$event'])
    documentClick(event: MouseEvent) {
      if (this.outside) {
        $('a').removeClass('active');
        this.selectedItem = null;
      } else {
        this.outside = true
      }
    }

    name: any;
    colorCode: any = "#000";
    type: any = "MATERIALS";
    interactionValue: any = "new material";
    image: any = this.place_holder_image;
    isMetal: boolean = false;
    visible: boolean = false;
    roughness: any = 0.5;
    visibleInColor: boolean = false;
    colorCodeInColor: any = "#000";
    colorName: any;
    visibleInPattern: boolean = false;
    patternName: any;
    isEdit: boolean = true;
    packName: any
    packtype: any = "MATERIALS"
    packid: any;
    arrid: any;
    color: any = "#000"
    imagePath: any;
    patternImage: any = "";
    Packs: any = []
    deletedPack = []
    outside = true


    undoManagerLimit() {
        return UndoMgr.getInstance().getIndex() + 1;
    }

    activeTracking(): DeepActiveAppearanceTracking {
      if (this.chosenWeapon) {
        return this.selectedItems.get(this.chosenWeapon);
      }
    }

    activeSection(): AppearanceSection {
      if (this.activeTracking() && this.activeTracking().activeSection) {
        return this.activeTracking().activeSection;
      }
    }



    allitemSelected = true;
    sectionIndex = 0;
    changeSection(event: MouseEvent, section: AppearanceSection) {
        this.activeTracking().activeSection = section;
        console.log(section.name)
        if (section.name == "Material") {
            this.sectionIndex = 0; 
            this.type = "MATERIALS"
        } else if (section.name == "Color") {
            this.type = "COLORS"
            this.sectionIndex = 1;
        } else if (section.name == "Patterns") {
            this.type = "PATTERNS"
            this.sectionIndex = 2;
        }
        this.packtype = this.type;
        this.packArray = this.allpacks.filter((p) => p.type == this.packtype);
      
        this.selectedPack = null;
        this.selectedItem = null;
        this.allitemSelected = true;
        return this.stopEvent(event);
    }


    /**
     * @param {string} meshName
     */
    chooseWeapon(event: MouseEvent, weapon: WeaponCustomization) {

        UndoMgr.getInstance().clear();
        this.chosenWeapon = weapon;
        this.hideWeaponChoices = true;
        this.allSections = this.customizationData.commonSections.slice()
            .concat(this.chosenWeapon.customizations.slice());

        this.viewerService.viewer.changeWeapon(weapon.modelFolder, weapon.modelFile);

        return this.stopEvent(event);
    }

    clampScrollValue(scroll: number) {
        const ne: HTMLDivElement = this.optionsContainer.nativeElement;

        return Math.max(0, Math.min(scroll, ne.scrollWidth - ne.clientWidth));
    }


    /**
     *  @param {string} meshName
     */
    meshClicked(meshName: string) {
        if (meshName === 'assets/models/assault-rifle/assault-rifle.gltf.honey_badger.trigger') return;

        if (!this.chosenWeapon.interactionBlacklist || (this.chosenWeapon.interactionBlacklist.indexOf(meshName) === -1)) {
            const activeSection = this.activeSection();

            /* if (activeTracking.resetActive) {
               switch (activeSection.interactionType) {
                 case 'alterMaterial':
                   this.viewerService.viewer.resetMaterialProperty(meshName, activeSection.affectedParameter);
                   break;
                 case 'swapMaterial':
                   this.viewerService.viewer.resetMaterial(meshName);
                   break;
               }
             } else {
             */
            const lastClickedOption = this.lastClickedOption.has(activeSection) ? this.lastClickedOption.get(activeSection) : null;

            if (lastClickedOption) {
                switch (activeSection.interactionType) {
                    case 'alterMaterial':
                        UndoMgr.setMaterialProperty(this.viewerService.viewer, meshName,
                            activeSection.affectedParameter, lastClickedOption.interactionValue);
                        // this.viewerService.viewer.setMeshMaterialProperty(meshName, activeSection.affectedParameter,
                        //  lastClickedOption.interactionValue);
                        break;
                    case 'swapMaterial':
                        // this.viewerService.viewer.changeMeshMaterial(meshName, lastClickedOption.interactionValue);
                        UndoMgr.setMaterialTexture(this.viewerService.viewer, meshName, lastClickedOption.interactionValue);
                        break;
                }
            }
        }
        // }
    }

    ngOnDestroy() {
        this.initializeSubscription.unsubscribe();
        this.clickSubscription.unsubscribe();
        this.viewerResetSubscription.unsubscribe();
    }

    /**
     * @param {string} meshName
     */
    optionClicked(event: MouseEvent, optionGroup: AppearanceOptionGroup, option: AppearanceOption) {
        //here we need to set the selected item;
        //this.selectedItem = {};
        this.selectedItem = option;
        const currentlySelectedOption = this.selectedOption(optionGroup);
        const activeTracking = this.activeTracking();
        activeTracking.resetActive = false;

        const prevChosenGroupOption = activeTracking.chosenGroupOption;

        const lastClickedOption = this.lastClickedOption;

        // keep a handle to previous values
        const prevOption = lastClickedOption.get(this.activeSection());
        const prevGroupOption = prevChosenGroupOption.get(optionGroup);
        const section = this.activeSection();

        if (option === currentlySelectedOption) {

            if (optionGroup.allowNone) {

                const redoFunction = () => {
                    this.optionOff(option);
                    prevChosenGroupOption.set(optionGroup, null);
                    lastClickedOption.set(section, null);

                };
                if (section.interactionType == 'toggleMesh') {

                    UndoMgr.add({
                        undo: () => {
                            this.optionOn(option);
                            prevChosenGroupOption.set(optionGroup, prevGroupOption);
                            lastClickedOption.set(section, prevOption);
                        },
                        redo: redoFunction,
                    });
                } else {
                    redoFunction();
                }


            }
        } else {

            const redoFunction = () => {
                this.optionOff(currentlySelectedOption);
                prevChosenGroupOption.set(optionGroup, option);
                this.optionOn(option);
                lastClickedOption.set(section, option);
            };
            if (section.interactionType == 'toggleMesh') {

                UndoMgr.add({
                    undo: () => {
                        this.optionOff(option, section);
                        prevChosenGroupOption.set(optionGroup, prevGroupOption);
                        this.optionOn(currentlySelectedOption, section);
                        lastClickedOption.set(section, prevOption);

                    },
                    redo: redoFunction,
                });
            } else {
                redoFunction();
            }
        }

        return this.stopEvent(event);
    }

    optionOff(option: AppearanceOption, section?: AppearanceSection) {
        if (!option) {
            return;
        }

        section = section ? section : this.activeSection();

        switch (section.interactionType) {
            case 'toggleMesh':
                this.viewerService.viewer.hideMesh(option.interactionValue);
                break;
        }
    }

    optionOn(option: AppearanceOption, section?: AppearanceSection) {
        if (!option) {
            return;
        }
        section = section ? section : this.activeSection();
        switch (section.interactionType) {
            case 'toggleMesh':
                this.viewerService.viewer.showMesh(option.interactionValue);
                break;
        }
    }

    resetPressed(event) {
        // const tracking = this.activeTracking();

        // tracking.resetActive = !tracking.resetActive;
        UndoMgr.undo();
        return this.stopEvent(event);
    }

    redoPressed(event) {
        UndoMgr.redo();
        return this.stopEvent(event);
    }

    scrollOptionsLeft(event) {
        const ne: HTMLDivElement = this.optionsContainer.nativeElement;

        ne.scrollLeft = this.clampScrollValue(ne.scrollLeft - (ne.clientWidth - 64));

        return this.stopEvent(event);
    }

    scrollOptionsRight(event) {
        const ne: HTMLDivElement = this.optionsContainer.nativeElement;

        ne.scrollLeft = this.clampScrollValue(ne.scrollLeft + (ne.clientWidth - 64));

        return this.stopEvent(event);
    }

    selectedOption(optionGroup: AppearanceOptionGroup): AppearanceOption {
        return this.activeTracking().chosenGroupOption.get(optionGroup);
    }

    setupOptionTracking(commonSections: AppearanceSection[], weapon: WeaponCustomization) {
        const groupOptionTracking = new Map<AppearanceOptionGroup, AppearanceOption>();

        commonSections.slice()
            .concat(weapon.customizations.slice())
            .forEach(function (customization) {
                customization.optionGroups.forEach(function (optionGroup) {
                    let defaultSelected: AppearanceOption = null;

                    if (typeof optionGroup.defaultSelected === 'number') {
                        defaultSelected = optionGroup.options[optionGroup.defaultSelected];
                    } else if (!optionGroup.allowNone && (optionGroup.options.length > 0)) {
                        defaultSelected = optionGroup.options[0];
                    }

                    groupOptionTracking.set(optionGroup, defaultSelected);
                });
            });

        this.selectedItems.set(weapon, {
            activeSection: (commonSections.length !== 0) ? commonSections[0] : weapon.customizations[0],
            resetActive: false,
            chosenGroupOption: groupOptionTracking
        });
    }

    setupOptionTrackingByCommonSection(commonSections: AppearanceSection[], weapon: WeaponCustomization, resetIndex) {
        const groupOptionTracking = new Map<AppearanceOptionGroup, AppearanceOption>();

        commonSections.slice()
            .concat(weapon.customizations.slice())
            .forEach(function (customization) {
                customization.optionGroups.forEach(function (optionGroup) {
                    let defaultSelected: AppearanceOption = null;

                    if (typeof optionGroup.defaultSelected === 'number') {
                        defaultSelected = optionGroup.options[optionGroup.defaultSelected];
                    } else if (!optionGroup.allowNone && (optionGroup.options.length > 0)) {
                        defaultSelected = optionGroup.options[0];
                    }

                    groupOptionTracking.set(optionGroup, defaultSelected);
                });
            });

        this.selectedItems.set(weapon, {
            activeSection: (commonSections.length !== 0) ? commonSections[resetIndex] : weapon.customizations[0],
            resetActive: false,
            chosenGroupOption: groupOptionTracking
        });
    }

    stopEvent(event: MouseEvent) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        return false;
    }

    toggleChoices(event: MouseEvent) {
        this.hideWeaponChoices = !this.hideWeaponChoices;

        return this.stopEvent(event);
    }

    viewerInitialized() {
        const createMaterial = (matProps: MaterialProperties) => {
            this.viewerService.viewer.createMaterial(matProps);
        };

        this.customizerDataService.weaponsData().then((customizationData) => {

            this.customizationData = customizationData;

            if (!!customizationData.environment) {
                this.viewerService.viewer.setEnvironment(customizationData.environment);
            }

            if (!!customizationData.commonMaterials) {
                customizationData.commonMaterials.forEach(createMaterial);
            }

            customizationData.weapons.forEach((weapon, wIdx) => {
                this.setupOptionTracking(customizationData.commonSections || [], weapon);

                this.viewerService.viewer.load(weapon.modelFolder, weapon.modelFile, wIdx === 0, () => {
                    if (!!weapon.materials) {
                        weapon.materials.forEach(createMaterial);
                    }

                    this.weaponSetup(weapon);
                });
            });

            this.chooseWeapon(null, customizationData.weapons[0]);
        });
    }


    viewerUpdated(api_response) {
        const createMaterial = (matProps: MaterialProperties) => {
            this.viewerService.viewer.createMaterial(matProps);
        };

        //this.customizerDataService.weaponsData().subscribe((api_response) => {
        const customizationData = api_response;

        this.customizationData = customizationData;

        if (!!customizationData.environment) {
            this.viewerService.viewer.setEnvironment(customizationData.environment);
        }

        if (!!customizationData.commonMaterials) {
            customizationData.commonMaterials.forEach(createMaterial);
        }

        customizationData.weapons.forEach((weapon, wIdx) => {
            this.setupOptionTrackingByCommonSection(customizationData.commonSections || [], weapon,this.sectionIndex);
        });

        this.chooseWeapon(null, customizationData.weapons[0]);
    }

    viewerReset() {
        this.customizationData.weapons.forEach((weapon) => {
            this.setupOptionTracking(this.customizationData.commonSections || [], weapon);

            this.weaponSetup(weapon);
        });
    }

    weaponSetup(weapon: WeaponCustomization) {
        if (!!weapon.replaceMaterials) {
            weapon.replaceMaterials.forEach((replacement) => {
                this.viewerService.viewer.replaceMaterials(weapon.modelFolder, weapon.modelFile,
                    replacement.oldMaterialNames, replacement.newMaterialName);
            });
        }

        if (weapon['rotation']) {
            this.viewerService.viewer.setRotation(weapon.modelFolder, weapon.modelFile, weapon['rotation']);
        }

        if (!!weapon.setupActions) {
            weapon.setupActions.forEach((setupAction) => {
                switch (setupAction.type) {
                    case 'hideMesh':
                        this.viewerService.viewer.hideMesh(setupAction.target, weapon.modelFolder, weapon.modelFile);
                        break;
                    case 'showMesh':
                        weapon.customizations[0].optionGroups.forEach((optionGroup) => {
                            optionGroup.options.forEach((option) => {
                                if (setupAction.target === option.name) {
                                    this.optionOn(option);
                                    this.selectedItems.get(weapon).chosenGroupOption.set(optionGroup, option)
                                }
                            });
                        });
                        break;
                }
            });
        }
    }
    openAddPackModel() {
      this.outside = false
        this.packName = "";
        this.isEdit = false;
        this.showModal('addPack')
    }

    hideModal(id) {
      this.outside = false
        this.manageModel(id, false);
        this.isEdit = false
    }

    showModal(id) {
      this.outside = false
        this.manageModel(id, true);
    }

    manageModel(id, visible) {
      this.outside = false
        visible ? $('#' + id).show() : $('#' + id).hide()
    }

    allpacks = [];
    async getPacks() {
      var self = this;
        const input = await this.apiService.prepareNodeJSRequestObject("packs", "getpacks", null)
        const totalPacksArray: any = await this.apiService.execute(input, false)
        this.allpacks = totalPacksArray.apidata.Data;
        if (this.Packs.length >0) {
          for (let i = 0; i < this.Packs.length; i++) {
            this.allpacks.push(this.Packs[i])
          }
        }

        if (this.deletedPack.length > 0) {
          for (let i = 0; i < this.deletedPack.length; i++) {

            let j = _.findIndex(this.allpacks, function (t) { return t._id == self.deletedPack[i].packid})
              this.allpacks.splice(j, 1)
          }
        }

        this.packArray = this.allpacks.filter((p) => p.type == this.packtype);
        this.packArray.sort(this.customizerDataService.compare);
    }

    selectedPack = null;
    selectPack(pack) {
      this.outside = false
        this._ngZone.run(() => {
            if (pack) {
                this.selectedPack = pack;
                this.selectedItem = null;
                this.allitemSelected = false;
            } else {
                this.allitemSelected = true;
                this.selectedPack = null
            }
        });
    }


    async addPack() {
      this.outside = false
      let order = this.customizerDataService.getOrder(this.packArray)
        var obj: any = {
            name: this.packName,
            type: this.packtype,
            _id: new Date().getTime(),
            colors: [],
            patterns: [],
            metarials: [],
            visible: true,
            opname: "ADD",
            order : order
        }
        this.customizerDataService.dbData.push(obj);
        this.Packs.push(obj)
        this.getPacks();
        this.hideModal("addPack");
        this.packName = ""

    }


    openModel() {
      this.outside = false
        if (this.selectedPack === null) {
            alert("please select at pack before adding ");
            return;
        }
        this.isEdit = false
        if (this.type == "MATERIALS") {
            this.name = ''
            this.colorCode = "#000"
            this.color = "#000"
            this.interactionValue = ""
            this.roughness = 0.5
            this.image = this.place_holder_image;
            this.isMetal = true
            this.visible = true
            this.imagePath = null
            $('#image')
                .attr('src', this.place_holder_image)
                .width(150)
                .height(150);
            this.showModal('my-modal');
        }
        else if (this.type == "COLORS") {
            this.colorName = '';
            this.colorCodeInColor = "#000";
            this.color = "#000"
            this.visibleInColor = true;
            this.showModal('addColor');
        }
        else if (this.type == "PATTERNS") {
          this.patternName = '';
          this.imagePath = null
            this.visibleInPattern = true;
            this.patternImage = this.place_holder_image;
            this.showModal('patterns');

            $('#image1')
                .attr('src', this.place_holder_image)
                .width(150)
                .height(150);
        }
    }

    onAddAndUpdate() {
        const api_response = this.customizerDataService.weaponsDataLocal();
        this.viewerUpdated(api_response);
    }

    colorChanged(data) {
        console.log(data)
        this.colorCode = data
    }

    async fileEvent(data) {

        this.imagePath = await this.sendFile(data.target.files[0]);
        var reader = new FileReader();

        reader.onload = function (e) {
            var tfg: any = e.target;
            $('#image')
                .attr('src', tfg.result)
                .width(150)
                .height(150);

            $('#image1')
                .attr('src', tfg.result)
                .width(150)
                .height(150);
        };



        reader.readAsDataURL(data.target.files[0]);
    }

    sendFile(file) {

        return new Promise(function (resolve, reject) {

            const apiUrl = environment.apiBaseURL + 'profile';
            var self = this
            var formData = new FormData();
            var xhr = new XMLHttpRequest();

            formData.append("avatar", file, file.name);

            xhr.open("POST", apiUrl, true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(JSON.parse(xhr.responseText).path);
                    } else {
                        console.error(xhr.statusText);
                    }
                }
            };

            xhr.send(formData);
        })
    }


    async addMaterial() {
      this.outside = false
        var obj: any = {};
        var metarials = [];
        obj.packid = this.selectedPack._id;

        if (this.name == "" || !this.imagePath || this.imagePath == null) {
          alert("All field are mandatory ");
        } else {

          metarials = [{
            name: this.name,
            colors: this.colorCode,
            interactionValue: this.name,
            roughness: this.roughness,
            image: this.imagePath,
            metal: this.isMetal,
            visible: this.visible,
            opname: "ADD",
            _id: new Date().getTime()
          }]
          obj.metarials = metarials;
          this.customizerDataService.addDataOnPacks(obj);
          this.onAddAndUpdate();
          this.hideModal('my-modal');
          this.selectedItem = null
        }
    }

    colorModelChanged(data) {
        this.colorCodeInColor = data
    }

    async addColor() {
      var obj: any = {};
      var colors = [];
      obj.packid = this.selectedPack._id;

      if (this.colorName == "") {
        alert("All field are mandatory ");
      } else {
        colors = [{
          name: this.colorName,
          code: this.colorCodeInColor,
          visible: this.visibleInColor,
          opname: "ADD",
          _id: new Date().getTime()
        }]

        obj.colors = colors;
        this.customizerDataService.addDataOnPacks(obj);
        this.onAddAndUpdate();
        this.hideModal("addColor");
        this.selectedItem = null
      }
    }

    async addPatternse() {
      var obj: any = {};
      var patterns = [];
      obj.packid = this.selectedPack._id;
      if (this.patternName == "" || !this.imagePath || this.imagePath == null) {
        alert("All field are mandatory ");
      } else {

        patterns = [{
          name: this.patternName,
          visible: this.visibleInPattern,
          image: this.imagePath,
          opname: "ADD",
          _id: new Date().getTime()
        }]

        obj.patterns = patterns;
        this.customizerDataService.addDataOnPacks(obj);
        this.onAddAndUpdate();
        this.hideModal('patterns')
        this.selectedItem = null
      }
    }
    selectedItem = null;
    async editOption() {
      this.outside = false
        this.isEdit = true
        this.packid = this.selectedItem.pack_id;
        var type = this.packtype;
        var obj = this.selectedItem;
        this.arrid = obj._id
        this.imagePath = "";
        if (type == "MATERIALS") {
            this.name = obj.name
            this.colorCode = obj.displayColor
            this.interactionValue = obj.interactionValue
            this.roughness = obj.roughness
            this.image = obj.displayImg
            this.isMetal = obj.metal
            this.visible = obj.visible
            $('#my-modal').show()
        }
        else if (type == "COLORS") {
            this.colorName = obj.name;
            this.colorCodeInColor = obj.displayColor;
            this.color = obj.displayColor;
            this.visibleInColor = obj.visible;
            $('#addColor').show()
        }
        else if (type == "PATTERNS") {
            this.patternName = obj.name;
            this.visibleInPattern = obj.visible
            this.patternImage = obj.displayImg
            $('#patterns').show()
        }
    }

    async editMaterial() {
        var metarials: any = [
            {
                name: this.name,
                colors: this.colorCode,
                interactionValue: this.name,
                roughness: this.roughness,
                image: this.image,
                metal: this.isMetal,
                visible: this.visible,
                opname: "EDIT",
                _id: this.arrid
            }
        ]
        if (this.imagePath && this.imagePath != '') {
            metarials[0].image = this.imagePath
        }

        var obj: any = { packid: this.selectedItem.pack_id, metarials: metarials, arrId: this.arrid };
        this.customizerDataService.editDataOnPacks(obj);
        this.onAddAndUpdate();
        this.hideModal('my-modal');
        this.selectedItem = null
    }

    async editColor() {
        var colors: any = [{
            name: this.colorName,
            code: this.colorCodeInColor,
            visible: this.visibleInColor,
            opname: "EDIT",
            _id: this.arrid
        }]        
        var obj: any = { packid: this.selectedItem.pack_id, colors: colors, arrId: this.arrid };
        this.customizerDataService.editDataOnPacks(obj);

        this.onAddAndUpdate();
        this.hideModal('addColor');
        this.selectedItem = null
    }

    async editPatternse() {
        var patterns: any = [{
            name: this.patternName,
            visible: this.visibleInPattern,
            image: this.patternImage,
            opname: "EDIT",
            _id: this.arrid
        }]

        if (this.imagePath && this.imagePath != '') {
            patterns[0].image = this.imagePath
        }

        var obj: any = { packid: this.selectedItem.pack_id, patterns: patterns, arrId: this.arrid };
        this.customizerDataService.editDataOnPacks(obj);
        this.onAddAndUpdate();
        this.hideModal('patterns');
        this.selectedItem = null
    }

    openDeleteModel() {
        $('#deletModel').show()
    }



    async deleteData() {
        var obj: any = { packid: this.selectedItem.pack_id, type: this.type, arrId: this.selectedItem._id };
        this.customizerDataService.deleteDataOnPack(obj);
        this.onAddAndUpdate();
        this.hideModal("deletModel");
        this.selectedItem = null
    }

    async setVisible(value) {
        var obj: any = { packid: this.selectedItem.pack_id, type: this.type, value: value, arrId: this.selectedItem._id };
        this.customizerDataService.setVisibleOfPackData(obj);
        this.selectedItem.visible = value;
        this.onAddAndUpdate();
        this.selectedItem = null
    }

    async setVisibleofPack(pack: any, b) {
        var obj: any = {};
        obj.packid = pack._id
        obj.value = b
        const input = this.apiService.prepareNodeJSRequestObject("packs", "setVisibleOfPack", obj)
        await this.apiService.execute(input, false);
        this.getPacks();
    }

    openEditPack(pack) {
      this.outside = false
        this.isEdit = true;
        this.packid = pack._id
        this.packName = pack.name
        this.showModal('addPack');
    }

    async editPack() {
      this.outside = false
        var obj: any = {};
        obj.packid = this.packid
        obj.name = this.packName
        let k = _.findIndex(this.packArray, function (t) { return t._id == obj.packid })
        this.packArray[k].name = obj.name

        let j = _.findIndex(this.customizerDataService.dbData, function (t) { return t._id == obj.packid })
        this.customizerDataService.dbData[j].name = obj.name
        this.customizerDataService.dbData[j].opname = "EDIT"
        //this.getPacks();
        this.onAddAndUpdate();
        this.hideModal("addPack");
        this.isEdit = false;
    }

    async movePackLeft(data) {
      this.outside = false
      let order = data.order
      var self = this

      let k = _.findIndex(this.packArray, function (t) { return t._id == data._id })

      if (k > -1 && k != 0) {
        this.packArray[k].order = this.packArray[k - 1].order
        this.packArray[k - 1].order = order
        this.packArray.sort(this.customizerDataService.compare);
      }

      let j = _.findIndex(this.customizerDataService.dbData, function (t) { return t._id == data._id })
      let l = _.findIndex(this.customizerDataService.dbData, function (t) { return t._id == self.packArray[k]._id })

      if (j > -1 && j != 0) {
        this.customizerDataService.dbData[j].order = this.customizerDataService.dbData[l].order
        this.customizerDataService.dbData[l].order = order
        this.customizerDataService.dbData[l].opname = "EDIT"
        this.customizerDataService.dbData[j].opname = "EDIT"
        this.customizerDataService.dbData.sort(this.customizerDataService.compare);
      }
      this.onAddAndUpdate();
      this.hideModal("addPack");
      this.isEdit = false;
    }

    async movePackRight(data) {
      this.outside = false
      let order = data.order
      var self = this

      let k = _.findIndex(this.packArray, function (t) { return t._id == data._id })
      let max = this.customizerDataService.getOrder(this.packArray)

      if (k > -1 && order < max - 1) {
        this.packArray[k].order = this.packArray[k + 1].order
        this.packArray[k + 1].order = order
        this.packArray.sort(this.customizerDataService.compare);
      }

      let j = _.findIndex(this.customizerDataService.dbData, function (t) { return t._id == data._id })
      let l = _.findIndex(this.customizerDataService.dbData, function (t) { return t._id == self.packArray[k]._id })

      if (j > -1 && order < max - 1) {
        this.customizerDataService.dbData[j].order = this.customizerDataService.dbData[l].order
        this.customizerDataService.dbData[l].order = order
        this.customizerDataService.dbData[l].opname = "EDIT"
        this.customizerDataService.dbData[j].opname = "EDIT"
        this.customizerDataService.dbData.sort(this.customizerDataService.compare);
      }
      this.onAddAndUpdate();
      this.hideModal("addPack");
      this.isEdit = false;
    }

    openDeletePack(pack) {
      this.outside = false
        this.packid = pack._id
        this.showModal('deletPackModel');
    }

    async deletePack() {
      this.outside = false
        var obj: any = {};
        obj.packid = this.packid;
        let i = _.findIndex(this.customizerDataService.dbData, function (t) { return t._id == obj.packid })
        this.customizerDataService.dbData.splice(i, 1)
        this.deletedPack.push(obj)
        this.getPacks();
        this.onAddAndUpdate();
        this.hideModal("deletPackModel");
        this.isEdit = false;
    }

    async deployPackData() {
      this.outside = false
      var obj: any = { dbData: this.customizerDataService.dbData, deleted: this.customizerDataService.deleted, weapons: this.customizerDataService.dbWeapons, deletedPack: this.deletedPack }
        const input = this.apiService.prepareNodeJSRequestObject("packs", "deployPack", obj)
        await this.apiService.execute(input, false);
        this.onAddAndUpdate();
        window.location.reload();
    }

    setVisibleofWeapon(weapons, value) {
      this.outside = false
      var obj: any = { weapons: weapons, value: value }
      this.customizerDataService.setVisibleofWeapon(obj);
      this.onAddAndUpdate();
    }

    moveLeft(data) {
      this.outside = false
      var obj: any = { packid: data.pack_id, order: data.order, type: this.type, arrId: data._id };
      this.customizerDataService.moveLeft(obj);
      this.onAddAndUpdate();
      this.selectedItem = null
    }

    moveRight(data) {
      this.outside = false
      var obj: any = { packid: data.pack_id, order: data.order, type: this.type, arrId: data._id };
      this.customizerDataService.moveRight(obj);
      this.onAddAndUpdate();
      this.selectedItem = null
    }
  
    
}
