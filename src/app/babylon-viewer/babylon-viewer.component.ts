/// <reference path="../../babylon.d.ts"/>
import {AfterContentInit, Component, OnDestroy, ViewChild} from '@angular/core';
import {ViewerService} from '../viewer.service';
import {MaterialProperties} from '../customizer-data.service';
import {NotifierService} from '../notifier.service';
import {Subscription} from 'rxjs';
import {forEach} from '@angular/router/src/utils/collection';
import {GIFExportPreview} from '../utils/GIFExportPreview';

@Component({
    selector: 'app-babylon-viewer',
    templateUrl: './babylon-viewer.component.html',
    styleUrls: ['./babylon-viewer.component.css']
})
export class BabylonViewerComponent implements AfterContentInit, OnDestroy {
    @ViewChild('renderTarget')
    renderCanvas;

    public initialized = false;

    private displayCanvas: HTMLCanvasElement;
    public engine: BABYLON.Engine;
    public scene: BABYLON.Scene;
    camera: BABYLON.ArcRotateCamera;
    private directionalLight: BABYLON.DirectionalLight;

    private knownWidth = 0;
    private knownHeight = 0;
    private aspectRatio = 0;
    private loadingCount = 0;

    private activeRoot: BABYLON.Mesh = null;
    private allAssetContainers: Map<string, BABYLON.AssetContainer> = new Map<string, BABYLON.AssetContainer>();
    private allRootMeshes: Map<string, BABYLON.Mesh> = new Map<string, BABYLON.Mesh>();
    private environment: BABYLON.BaseTexture = null;
    private sourceMaterials: Map<string, BABYLON.Material> = new Map<string, BABYLON.Material>();
    private sourceRoots: Map<string, BABYLON.Mesh> = new Map<string, BABYLON.Mesh>();
    private meshStartingMaterial: Map<number, string> = new Map<number, string>();
    private textures: Map<string, BABYLON.Texture> = new Map<string, BABYLON.Texture>();

    private resetSubscription: Subscription;
    private objectUnderCursor: BABYLON.AbstractMesh;
    private previousObjectUnderCursor: BABYLON.AbstractMesh;
    resizeOnRender = true;


    constructor(private viewerService: ViewerService, notifierService: NotifierService) {
        viewerService.viewer = this;
        this.resetSubscription = notifierService.observable('reset').subscribe(() => {
            const keys: string[] = [];

            this.allRootMeshes.forEach(function (v, k) {
                keys.push(k);
            });

            keys.forEach((key) => {
                const currentMesh = this.allRootMeshes.get(key);
                const sourceRoot = this.sourceRoots.get(key);
                const enabled = currentMesh.isEnabled();

                this.scene.removeMesh(currentMesh, true);

                const clone = sourceRoot.clone(key);
                clone.setEnabled(enabled);

                if (enabled) {
                    this.activeRoot = clone;
                }

                this.allRootMeshes.set(key, clone);
            });

            this.viewerService.notifyReset();
        });

        // TODO @7frank remove debug code
        window["that"]=this
        window['debugPreview'] = () => {


            const preview = new GIFExportPreview(this.scene, this.displayCanvas, this.viewerService.viewer.camera);

            preview.enablePreview(this.getActiveWeapon());
            window["preview"]=preview;
        };



    }

    changeMeshMaterial(meshName: string, materialName: string) {
        if (!this.sourceMaterials.has(materialName)) {
            return;
        }

        const newMat = <BABYLON.PBRMaterial>this.sourceMaterials.get(materialName).clone(materialName);
        const mesh = this.getMesh(meshName);
        const oldMat = <BABYLON.PBRMaterial>mesh.material;

        newMat.sideOrientation = oldMat.sideOrientation;
        newMat.albedoColor = oldMat.albedoColor;
        newMat.albedoTexture = oldMat.albedoTexture;

        mesh.material = newMat;
    }

    getActiveWeapon() {
        return this.activeRoot;
    }

    changeWeapon(modelRoot: string, modelPath: string) {
        const combinedName = modelRoot + modelPath;

        if (this.activeRoot) {
            this.activeRoot.setEnabled(false);
            this.activeRoot = null;
        }

        this.activeRoot = this.allRootMeshes.get(combinedName);
        if (this.activeRoot) {
            this.activeRoot.setEnabled(true);
        }
    }

    createMaterial(properties: MaterialProperties) {
        const mat = new BABYLON.PBRMaterial(properties.name, this.scene);

        mat.reflectionTexture = this.environment;

        mat.useRoughnessFromMetallicTextureAlpha = false;
        mat.useRoughnessFromMetallicTextureGreen = true;
        mat.useMetallnessFromMetallicTextureBlue = true;
        mat.useAmbientOcclusionFromMetallicTextureRed = true;
        mat.useAmbientInGrayScale = true;

        if (!!properties.color) {
            mat.albedoColor = BABYLON.Color3.FromHexString(properties.color);
        }

        if (!!properties.texture) {
            mat.albedoTexture = this.texture(properties.texture);
        }

        if (!!properties.metallicRoughnessMap) {
            mat.metallic = 1.0;
            mat.roughness = 1.0;

            mat.metallicTexture = this.texture(properties.metallicRoughnessMap);
        } else {
            mat.metallic = properties.metal ? 1.0 : 0.0;
            mat.roughness = properties.roughness;
        }

        if (!!properties.normalMap) {
            mat.bumpTexture = this.texture(properties.normalMap);
        }

        this.sourceMaterials.set(properties.name, mat);
    }

    getMesh(name: string, modelFolder?: string, modelFile?: string): BABYLON.Mesh {
        const root = (!!modelFolder || !!modelFile) ? this.allRootMeshes.get(modelFolder + modelFile) : this.activeRoot;
        const splitName = name.split('.').reverse();

        return <BABYLON.Mesh>root.getChildMeshes(false, (node: BABYLON.Node) => {
            const namePieces = node.name.split('.').reverse();

            if (namePieces.length < splitName.length) {
                return;
            }

            return splitName.every(function (piece, idx) {
                return piece === namePieces[idx];
            });
        })[0];
    }

    hideMesh(meshName: string, modelFolder?: string, modelFile?: string) {
        this.getMesh(meshName, modelFolder, modelFile).setEnabled(false);
    }

    load(modelRoot: string, modelPath: string, visible: boolean = false, onSuccess: () => void = null) {
        const combinedName = modelRoot + modelPath;

        const extractMaterial = (mesh: BABYLON.AbstractMesh) => {
            if (!!mesh.material) {
                const matName = mesh.material.name;
                const sourceMat = mesh.material.clone(matName + '_source');

                (<BABYLON.PBRMaterial>sourceMat).reflectionTexture = this.environment;

                this.sourceMaterials.set(mesh.material.name, sourceMat);

                mesh.material = sourceMat.clone(matName);

                this.meshStartingMaterial.set(mesh.uniqueId, matName);
            }
        };

        ++this.loadingCount;
        this.engine.displayLoadingUI();

        BABYLON.SceneLoader.LoadAssetContainer(modelRoot, modelPath, this.scene,
            (assets: BABYLON.Nullable<BABYLON.AssetContainer>) => {
                this.allAssetContainers.set(combinedName, assets);

                const rootMesh = assets.meshes.filter(function (mesh: BABYLON.Mesh) {
                    return !mesh.parent;
                })[0] as BABYLON.Mesh;

                assets.meshes.forEach((mesh) => {
                    extractMaterial(mesh);

                    mesh.getChildMeshes(false).forEach(extractMaterial);
                });


                rootMesh.setEnabled(false);
                assets.addAllToScene();

                this.sourceRoots.set(combinedName, rootMesh);

                const meshCopy = rootMesh.clone(combinedName);

                this.allRootMeshes.set(combinedName, meshCopy);

                meshCopy.setEnabled(visible);

                if (visible) {
                    this.activeRoot = meshCopy;
                }

                if (!!onSuccess) {
                    onSuccess();
                }

                if (--this.loadingCount === 0) {
                    this.engine.hideLoadingUI();
                }
            });
    }

    ngAfterContentInit() {
        this.displayCanvas = this.renderCanvas.nativeElement;

        // Note: Using preserveDrawingBuffer decreases frame rate and should only be used to render the gif feature.
        //    But must be enabled to generate GIFs.
        //    A better approach would be to render separate scenes and use separate engines for the GIF preview.
        //    But as of now this was not possible.
        this.engine = new BABYLON.Engine(this.displayCanvas, true, {preserveDrawingBuffer: true});

        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(241 / 255, 242 / 255, 237 / 255, 1);
        this.scene.onPointerObservable.add((eventData, eventState) => {
            this.pointerObserved(eventData, eventState);
        });



        /*this.directionalLight = new BABYLON.DirectionalLight('mainLight', new BABYLON.Vector3(0.5, 1, 0.5), this.scene);
        this.directionalLight.diffuse.set(0.6, 0.6, 0.6);
        this.directionalLight.specular.set(0.6, 0.6, 0.6);*/

        this.setupCamera();

        this.engine.runRenderLoop(() => {
            this.render();
           // this.updateHoverControls();

        });

        this.initialized = true;

        this.viewerService.notifyInitialized();
    }

    ngOnDestroy() {
        this.resetSubscription.unsubscribe();
    }

    pointerObserved(eventData: BABYLON.PointerInfo, eventState: BABYLON.EventState) {
        if (eventData.type === 1) {
            if (eventData.pickInfo.hit) {
                this.viewerService.notifyClick(eventData.pickInfo.pickedMesh.name);
            }
        }
    }

    pointerMeshEnter(mesh: BABYLON.AbstractMesh) {

        const children = mesh.parent.getChildren();


        children.forEach((c: BABYLON.AbstractMesh) => {

            c.visibility = 0.1;

        });
        mesh.visibility = 1;

    }

    render() {

        if (this.resizeOnRender) {
            this.resizeAsNeeded();
        }
        /*const camAlpha = this.camera.alpha + Math.PI / 48;
        const camBeta = Math.PI / 2 - this.camera.beta + Math.PI / 48;
        const cosBeta = Math.cos(camBeta);

        this.directionalLight.direction.set(cosBeta * Math.cos(camAlpha), Math.sin(camBeta), cosBeta * Math.sin(camAlpha));*/

        this.scene.render();
    }

    setRotation(modelRoot: string, modelPath: string, rotation: number) {
        const model = this.allRootMeshes.get(modelRoot + modelPath);
        model.rotation.y = Math.PI / 180 * rotation;
    }

    replaceMaterials(modelRoot: string, modelPath: string, oldMaterialNames: string[], newMaterialName: string) {
        const newMat = this.sourceMaterials.get(newMaterialName);
        const sourceRoot = this.sourceRoots.get(modelRoot + modelPath);
        const rootModel = this.allRootMeshes.get(modelRoot + modelPath);

        if (!newMat || !rootModel) {
            return;
        }

        const replaceOldMat = (mesh: BABYLON.AbstractMesh) => {
            if (mesh.material && (oldMaterialNames.indexOf(mesh.material.name) !== -1)) {
                const matClone = newMat.clone(newMaterialName);

                matClone.sideOrientation = mesh.material.sideOrientation;

                mesh.material = matClone;

                this.meshStartingMaterial.set(mesh.uniqueId, newMaterialName);
            }
        };

        replaceOldMat(sourceRoot);
        replaceOldMat(rootModel);

        sourceRoot.getChildMeshes(false).forEach(replaceOldMat);
        rootModel.getChildMeshes(false).forEach(replaceOldMat);
    }

    resetMaterial(meshName: string) {
        this.resetMeshMaterial(this.getMesh(meshName));
    }

    resetMaterialProperty(meshName: string, propertyName: string) {
        const mesh = this.getMesh(meshName);

        if (!this.meshStartingMaterial.has(mesh.uniqueId)) {
            return;
        }

        const matName = this.meshStartingMaterial.get(mesh.uniqueId);
        const sourceMat = <BABYLON.PBRMaterial>this.sourceMaterials.get(matName);
        const meshMat = <BABYLON.PBRMaterial>mesh.material;

        switch (propertyName) {
            case 'color':
                meshMat.albedoColor = sourceMat.albedoColor;
                break;
            case 'texture':
                meshMat.albedoTexture = sourceMat.albedoTexture;
                break;
        }
    }

    resetMeshMaterial(mesh: BABYLON.AbstractMesh) {
        if (!this.meshStartingMaterial.has(mesh.uniqueId)) {
            return;
        }

        const matName = this.meshStartingMaterial.get(mesh.uniqueId);
        const matClone = this.sourceMaterials.get(matName).clone(matName);

        matClone.sideOrientation = mesh.material.sideOrientation;

        mesh.material = matClone;
    }

    resizeAsNeeded(force?: boolean) {
        const measuredWidth = this.displayCanvas.parentElement.clientWidth;
        const measuredHeight = this.displayCanvas.parentElement.clientHeight;

        if (!force)
        if (  (measuredWidth === this.knownWidth) && (measuredHeight === this.knownHeight)) {
            return;
        }


        this.knownWidth = measuredWidth;
        this.knownHeight = measuredHeight;
        this.aspectRatio = measuredWidth / measuredHeight;


        // this.engine.resize();

        this.engine.setSize(measuredWidth, measuredHeight);

    }

    setEnvironment(textureBaseName: string) {
        let envTex = null;

        if (textureBaseName.indexOf('.dds') !== -1) {
            envTex = BABYLON.CubeTexture.CreateFromPrefilteredData(textureBaseName, this.scene);
        } else if (textureBaseName.indexOf('hdr') !== -1) {
            envTex = new BABYLON.HDRCubeTexture(textureBaseName, this.scene, 512);
        } else {
            envTex = new BABYLON.CubeTexture(textureBaseName, this.scene);
        }

        this.sourceMaterials.forEach(function (mat: BABYLON.PBRMaterial) {
            mat.reflectionTexture = envTex;
        });

        const setEnv = function (mesh: BABYLON.Mesh) {
            if (!!mesh.material) {
                (<BABYLON.PBRMaterial>mesh.material).reflectionTexture = envTex;
            }
        };

        this.allRootMeshes.forEach(function (mesh) {
            setEnv(mesh);

            mesh.getChildMeshes(false).forEach(setEnv);
        });

        this.environment = envTex;
    }

    setMeshMaterialProperty(meshName: string, propertyName: string, propertyValue: any) {
        const material = <BABYLON.PBRMaterial>this.getMesh(meshName).material;

        switch (propertyName) {
            case 'color':
                material.albedoColor = BABYLON.Color3.FromHexString(propertyValue);
                break;
            case 'texture':
                material.albedoTexture = (propertyValue instanceof BABYLON.Texture) ? propertyValue : this.texture(propertyValue);
                break;
        }
    }

    setupCamera() {
        this.camera = new BABYLON.ArcRotateCamera('mainCam', 0, Math.PI / 2, 2,
            new BABYLON.Vector3(0, 0, 0), this.scene, true);
        this.camera.useFramingBehavior = true;
        this.camera.wheelPrecision = 500;
        this.camera.pinchPrecision = 200;
        this.camera.minZ = 0.01;
        this.camera.lowerRadiusLimit = 0.01;
        this.camera.upperRadiusLimit = 5;
        this.camera.attachControl(this.displayCanvas);
    }

    showMesh(meshName: string, modelFolder?: string, modelFile?: string) {
        this.getMesh(meshName, modelFolder, modelFile).setEnabled(true);
    }

    texture(url: string): BABYLON.Texture {
        if (this.textures.has(url)) {
            return this.textures.get(url);
        }

        const tex = new BABYLON.Texture(url, this.scene, false, false);

        this.textures.set(url, tex);

        return tex;
    }

    // TODO @7frank highlight the active mesh
    private updateHoverControls() {
        const el = this.scene.pick(this.scene.pointerX, this.scene.pointerY, null, true);

        if (el.pickedMesh != null) {

            if (this.objectUnderCursor != el.pickedMesh) {
                this.previousObjectUnderCursor = this.objectUnderCursor;
                this.objectUnderCursor = el.pickedMesh;

                this.pointerMeshEnter(this.objectUnderCursor);
            }
        }
    }
}
