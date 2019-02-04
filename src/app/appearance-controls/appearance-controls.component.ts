import { Component, OnDestroy, ViewChild, NgZone} from '@angular/core';
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
    constructor(private customizerDataService: CustomizerDataService,
      private apiService: APIService, private _ngZone: NgZone,
        private viewerService: ViewerService) {
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
    }

    name: any;
    colorCode: any = "#000";
    type: any = "MATERIALS";
    interactionValue: any = "new material";
    image: any = "http://185.82.218.228:3001/assets/img/image-placeholder-png-4.png";
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
    patternImage: any = "http://185.82.218.228:3001/assets/img/image-placeholder-png-4.png";

    undoManagerLimit() {
        return UndoMgr.getInstance().getIndex() + 1;
    }

    activeTracking(): DeepActiveAppearanceTracking {
      return this.selectedItems.get(this.chosenWeapon);
    }

    activeSection(): AppearanceSection {
        return this.activeTracking().activeSection;
    }

    

    allitemSelected = true;
    changeSection(event: MouseEvent, section: AppearanceSection) {
        this.activeTracking().activeSection = section;
        console.log(section.name)
        if (section.name == "Material") {
            this.type = "MATERIALS"
        } else if (section.name == "Color") {
            this.type = "COLORS"
        } else if (section.name == "Patterns") {
            this.type = "PATTERNS"
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

        this.customizerDataService.weaponsData().subscribe((api_response) => {
            const customizationData = api_response.Data;
            //this.customizerDataService.weaponsData1().subscribe((customizationData) => {

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
        const customizationData = api_response.Data;
        //this.customizerDataService.weaponsData1().subscribe((customizationData) => {

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
        //});
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

    hideModal(id) {
        this.manageModel(id, false);
    }

    showModal(id) {
        this.manageModel(id, true);
    }

    manageModel(id, visible) {
        visible ? $('#' + id).show() : $('#' + id).hide()
    }

    allpacks = [];
    async getPacks() {
        const input = await this.apiService.prepareNodeJSRequestObject("packs", "getpacks", null)
        const totalPacksArray: any = await this.apiService.execute(input, false)
        this.allpacks = totalPacksArray.apidata.Data;
        this.packArray = this.allpacks.filter((p) => p.type == this.packtype);
        console.log(this.packArray);
    }

    selectedPack = null;
    selectPack(pack) {
      this._ngZone.run(() => {
        if (pack) {
          this.selectedPack = pack;
          this.selectedItem = null;
          this.allitemSelected = false;
        } else {
          this.allitemSelected = true;
        }
      });
    }

    // selectPack(pack) {
    //     this.selectedPack = pack;
    // }

    async addPack() {
        var obj: any = {
            name: this.packName,
            type: this.packtype
        }
        const input = this.apiService.prepareNodeJSRequestObject("packs", "addPack", obj)
        await this.apiService.execute(input, false);
        this.getPacks();
        //this.onAddAndUpdate();
        this.hideModal("addPack");

    }


    openModel() {
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
            this.image = 'http://185.82.218.228:3001/assets/img/image-placeholder-png-4.png'
            this.isMetal = true
            this.visible = true
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
            this.visibleInPattern = true;
            this.patternImage = "http://185.82.218.228:3001/assets/img/image-placeholder-png-4.png"
            this.showModal('patterns');
        }
    }

    onAddAndUpdate() {
        this.customizerDataService.weaponsData().subscribe((api_response) => {
            this.viewerUpdated(api_response);
        });
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

          return new Promise(function (resolve, reject)  {
      
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
        var obj: any = {};
        var metarials = [];
        obj.packid = this.selectedPack._id;
        metarials = [{
            name: this.name,
            colors: this.colorCode,
            interactionValue: this.interactionValue,
            roughness: this.roughness,
            image: this.imagePath,
            metal: this.isMetal,
            visible: this.visible
        }]
        obj.metarials = metarials;
        const input = await this.apiService.prepareNodeJSRequestObject(
            "packs",
            "addDataOnPacks",
            obj
        )
        await this.apiService.execute(input, false)
        this.onAddAndUpdate();
        this.hideModal('my-modal');
    }

    colorModelChanged(data) {
      this.colorCodeInColor = data
    }

    async addColor() {
        var obj: any = {};
        var colors = [];
        obj.packid = this.selectedPack._id;
        colors = [{
            name: this.colorName,
            code: this.colorCodeInColor,
            visible: this.visibleInColor
        }]

        obj.colors = colors;
        const input = await this.apiService.prepareNodeJSRequestObject(
            "packs",
            "addDataOnPacks",
            obj
        )
        await this.apiService.execute(input, false)
        this.onAddAndUpdate();
        this.hideModal("addColor");
    }

    async addPatternse() {
        var obj: any = {};
        var patterns = [];
        obj.packid = this.selectedPack._id;
        patterns = [{
            name: this.patternName,
            visible: this.visibleInPattern,
            image: this.imagePath
        }]

        obj.patterns = patterns;
        const input = await this.apiService.prepareNodeJSRequestObject(
            "packs",
            "addDataOnPacks",
            obj
        )
        await this.apiService.execute(input, false);
        this.onAddAndUpdate();
        this.hideModal('patterns')
    }

    selectedItem = null;
    async editOption() {
        this.isEdit = true
        this.packid = this.selectedItem.pack_id;
        var type = this.packtype;
        var obj = this.selectedItem;
        this.arrid = obj._id
        this.imagePath = "";
        if (type == "MATERIALS") {
            this.name = obj.name
            this.colorCode = obj.colors
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
                interactionValue: this.interactionValue,
                roughness: this.roughness,
                image: this.image,
                metal: this.isMetal,
                visible: this.visible
            }
      ]
        if (this.imagePath && this.imagePath != '') {
          metarials[0].image = this.imagePath
        }
        const input = await this.apiService.prepareNodeJSRequestObject(
            "packs",
            "editDataOnPacks",
            { packid: this.selectedItem.pack_id, metarials: metarials, arrId: this.arrid }
        )
        await this.apiService.execute(input, false)
        this.onAddAndUpdate();
        this.hideModal('my-modal');
    }

    async editColor() {
        var colors: any = [{
            name: this.colorName,
            code: this.colorCodeInColor,
            visible: this.visibleInColor
        }]
        const input = await this.apiService.prepareNodeJSRequestObject(
            "packs",
            "editDataOnPacks",
            { packid: this.selectedItem.pack_id, colors: colors, arrId: this.arrid }
        )
        await this.apiService.execute(input, false)
        this.onAddAndUpdate();
        this.hideModal('addColor');
    }

    async editPatternse() {
        var patterns: any = [{
            name: this.patternName,
            visible: this.visibleInPattern,
            image: this.patternImage
      }]

        if (this.imagePath && this.imagePath != '') {
          patterns[0].image = this.imagePath
        }

        const input = await this.apiService.prepareNodeJSRequestObject(
            "packs",
            "editDataOnPacks",
            { packid: this.selectedItem.pack_id, patterns: patterns, arrId: this.arrid }
        )
        await this.apiService.execute(input, false)
        this.onAddAndUpdate();
        this.hideModal('patterns');
    }

    openDeleteModel() {
        $('#deletModel').show()
    }



    async deleteData() {
        debugger;
        const input = await this.apiService.prepareNodeJSRequestObject(
            "packs",
            "deleteMaterial",
            { packid: this.selectedItem.pack_id, type: this.type, arrId: this.selectedItem._id }
        )
        var res = await this.apiService.execute(input, false)
        this.onAddAndUpdate();
        this.hideModal("deletModel");
    }

    async setVisible(packid, arrid, value) {
        value = false
        const input = await this.apiService.prepareNodeJSRequestObject(
            "packs",
            "setVisible",
            { packid: this.selectedItem.pack_id, type: this.type, arrId: this.selectedItem._id }
        )
        await this.apiService.execute(input, false)
    }
}
