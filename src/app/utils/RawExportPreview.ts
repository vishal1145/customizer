import config from '../share-modal/config';
import {createDefaultParticleSystem, createGround, createLightTube, createSpotLight, IExportPreview} from './ExportCommon';


/**
 * setup a scene where the mesh will be rendered in preview mode
 */

export class RawExportPreview implements IExportPreview {

    private debug = config.debug;
    private enabled = false;
    private defaultClearColor: BABYLON.Color4;

    private shadowMaps = new Map<BABYLON.IShadowLight, BABYLON.ShadowGenerator>();
    private children = new Array<BABYLON.AbstractMesh>();


    private currentObject: BABYLON.Mesh;

    private prevCamPos: BABYLON.Vector3;
    private prevCamTarget: BABYLON.Vector3;
    private currObjectRotation: BABYLON.Quaternion;


    // FIXME reset camera to default or previous after export


    constructor(private scene: BABYLON.Scene, private displayCanvas: HTMLCanvasElement, private camera: BABYLON.ArcRotateCamera) {

        this.setupPreviewElements();

    }

    enablePreview(mesh: BABYLON.Mesh) {
        this.enabled = true;

        this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);


        this.currentObject = mesh;

        this.currObjectRotation = mesh.rotationQuaternion.clone();
        this.prevCamTarget = this.camera.target.clone();
        this.prevCamPos = this.camera.position.clone();


        if (!this.debug) {
            // this.displayCanvas.style.visibility = 'hidden';
            this.setupPreviewCamera();
        }


        this.children.forEach((el => {
            el.visibility = 1;
            el.isPickable = false;
        }));


    }


    disablePreview() {
        this.enabled = false;


        // TODO test if reset works

        this.currentObject.rotationQuaternion = this.currObjectRotation;
        this.camera.target = this.prevCamTarget;
        this.camera.position = this.prevCamPos;


        this.scene.clearColor = this.defaultClearColor;

        this.children.forEach((el => el.visibility = 0));

        // re-enable controls
        this.camera.attachControl(this.displayCanvas);

    }


    setupPreviewElements() {


        this.defaultClearColor = this.scene.clearColor;

        // add plattform

        const useGodrays = false;



    }

    addShadow(light: BABYLON.IShadowLight, mesh: BABYLON.Mesh, blurKernel: number = 32) {
        // Shadows
        let shadowGenerator = this.shadowMaps.get(light);
        if (!shadowGenerator) {

            shadowGenerator = new BABYLON.ShadowGenerator(2048, light);

            shadowGenerator.useBlurExponentialShadowMap = true;
            shadowGenerator.useKernelBlur = true;
            shadowGenerator.blurKernel = blurKernel;

            //  shadowGenerator.usePoissonSampling = true;
            //  shadowGenerator.bias = .0001;

            this.shadowMaps.set(light, shadowGenerator);
        }


        // shadowGenerator.getShadowMap().renderList.push(mesh);
        shadowGenerator.getShadowMap().refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONEVERYFRAME;
        shadowGenerator.addShadowCaster(mesh);


    }


    setupPreviewCamera() {

        this.camera.detachControl(this.displayCanvas);
        this.camera.setPosition(new BABYLON.Vector3(-2, 1, 0).multiplyByFloats(0.7, 0.7, 0.7));
        this.camera.setTarget(new BABYLON.Vector3(0, -.22, 0));
        this.camera.useFramingBehavior = true;
        this.camera.wheelPrecision = 500;
        this.camera.pinchPrecision = 200;
        this.camera.minZ = 0.01;
        this.camera.lowerRadiusLimit = 0.01;
        this.camera.upperRadiusLimit = 5;
    }


}
