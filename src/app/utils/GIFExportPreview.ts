import config from '../share-modal/config';
import {createDefaultParticleSystem, createGround, createLightTube, createSpotLight, IExportPreview} from './ExportCommon';


/**
 * setup a scene where the mesh will be rendered in preview mode
 *
 *
 * TODO @7frank extends RawExportPreview
 */

export class GIFExportPreview implements IExportPreview {

    private debug =   config.debug;
    private enabled = false;

    private spotLight: BABYLON.SpotLight;
    private particles: BABYLON.ParticleSystem;
    private platform: BABYLON.Mesh;
    private defaultClearColor: BABYLON.Color4;
    private defaultPlatformMaterial: BABYLON.StandardMaterial;
    private shadowMaps = new Map<BABYLON.IShadowLight, BABYLON.ShadowGenerator>();
    private children = new Array<BABYLON.AbstractMesh>();
    private ground: BABYLON.Mesh;
    private initialized = false;
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
        this.currentObject = mesh;

        this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);



        this.currObjectRotation = mesh.rotationQuaternion.clone();
       this.prevCamTarget = this.camera.target.clone();
       this.prevCamPos = this.camera.position.clone();

       console.log("enablePreview", this.currObjectRotation, this.prevCamTarget, this.prevCamPos)

        if (!this.debug) {
           // this.displayCanvas.style.visibility = 'hidden';
            this.setupPreviewCamera();
        }


        this.children.forEach((el => {
            el.visibility = 1;
            el.isPickable = false;
        }));

        this.particles.start();
        this.spotLight.setEnabled(true);
        this.platform.visibility = 1;

        this.spotLight.setDirectionToTarget(mesh.position);


        this.addShadow(this.spotLight, mesh, 16);


    }


    disablePreview() {
        this.enabled = false;


        // TODO test if reset works

        this.currentObject.rotationQuaternion = this.currObjectRotation
        this.camera.target =  this.prevCamTarget
        this.camera.position = this.prevCamPos

        console.log("disablePreview", this.currentObject, this.camera.target,  this.camera.position)

       // this.displayCanvas.style.visibility = 'visible';

        this.scene.clearColor = this.defaultClearColor;

        this.spotLight.setEnabled(false);
        this.platform.visibility = 0;
        this.particles.stop();


        this.children.forEach((el => el.visibility = 0));

        // re-enable controls
        this.camera.attachControl(this.displayCanvas);


        // remove shadow of the rendered target again
        this.shadowMaps.get(this.spotLight).removeShadowCaster(this.currentObject);

    }


    setupPreviewElements() {

        if (this.initialized) {
            return;
        }


        this.defaultPlatformMaterial = new BABYLON.StandardMaterial('redMat', this.scene);
        this.defaultPlatformMaterial.emissiveColor = new BABYLON.Color3(0, 0.6, 0.6);


        this.defaultClearColor = this.scene.clearColor;


        this.spotLight = createSpotLight(this.scene);


        this.ground = createGround(this.scene);
        this.children.push(this.ground);


        // add plattform

        const useGodrays = false;

        const res = this.createPlatform(useGodrays);
        this.platform = res.node;

        this.children.push(...res.node.getChildMeshes());


        if (useGodrays) {
            let t = 0;
            this.scene.onBeforeRenderObservable.add( () => {
               if (!this.enabled) return;

                t += 0.1;

                res.setLightIntensity(0.6);
                // res.setLightIntensity(Math.cos(t) * 0.2 + 0.6);
            });

        } else {


            const glow = new BABYLON.GlowLayer('glow', this.scene, {
                mainTextureFixedSize: 256,
                blurKernelSize: 64
            });

            let t = 0;
            this.scene.onBeforeRenderObservable.add( () => {
                if (!this.enabled) return;
                t += 0.1;
                glow.intensity = Math.cos(t) * 0.4 + 0.4;
                res.setLightIntensity(Math.cos(t) * 0.1 + 0.25);
            });

        }


        // create particles
        this.particles = createDefaultParticleSystem(this.scene, this.platform);
        this.particles.renderingGroupId = 0;


        this.initialized = true;

        // ---------------------------------

    }

    createPlatform(useGodrays = false): { node: BABYLON.Mesh, setLightIntensity: (val: number) => void } {
        const glowMat = this.defaultPlatformMaterial;


        const platform = BABYLON.MeshBuilder.CreateCylinder('plattform-inner', {tessellation: 6, height: 0.02, diameter: 0.8}, this.scene);

        platform.material = glowMat;
        this.addShadow(this.spotLight, platform, 16);


        const node = new BABYLON.Mesh('plattform', this.scene);
        platform.parent = node;

        node.position.y = -0.45;
        node.rotation.y = Math.PI / 2;


        // platform.rotation.x = Math.PI / 2;
        platform.rotation.y = Math.PI / 2;

        platform.scaling.y = 0.01;


        platform.position.y = 0.04;


        const torus = BABYLON.Mesh.CreateTorus('plattform-middle', 1, 0.05, 6, this.scene, false, BABYLON.Mesh.DEFAULTSIDE);
        const torus2 = BABYLON.Mesh.CreateTorus('plattform-outer', 1.2, 0.05, 6, this.scene, false, BABYLON.Mesh.DEFAULTSIDE);


        this.addShadow(this.spotLight, torus, 16);
        this.addShadow(this.spotLight, torus2, 16);


        torus.position.y = 0.03;


        torus.receiveShadows = true;
        torus2.receiveShadows = true;


        const transparentMat = new BABYLON.StandardMaterial('transparentMat', this.scene);
        transparentMat.diffuseColor = new BABYLON.Color3(0, 1, 1);
        transparentMat.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        transparentMat.alpha = 0.4;


        torus.material = glowMat;
        torus2.material = glowMat;

        torus.parent = node;
        torus2.parent = node;

        torus.scaling.y = 0.1;
        torus2.scaling.y = 0.1;


        let setLightIntensity;


        if (useGodrays) {


            const hole = BABYLON.MeshBuilder.CreateCylinder('plattform-inner', {tessellation: 6, height: 0.02, diameter: 0.8}, this.scene);
            hole.rotation.y = Math.PI / 2;
            hole.scaling.y = 0.01;
            hole.position.y = 0.04;

            const hmat = new BABYLON.StandardMaterial('hMat', this.scene);
            // hmat.diffuseColor = new BABYLON.Color4(1, 1, 1, 1);
            hmat.diffuseTexture = new BABYLON.Texture('http://upload.wikimedia.org/wikipedia/commons/e/eb/Blank.jpg', this.scene, true, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
            hmat.diffuseTexture.level = 1;
            hmat.diffuseTexture.hasAlpha = false;

            hole.material = hmat;

            const godrays = new BABYLON.VolumetricLightScatteringPostProcess('godrays', 1.0, this.camera, hole, 100, BABYLON.Texture.BILINEAR_SAMPLINGMODE, this.scene.getEngine(), false);


            godrays.mesh.position.y = -0.4;
            godrays.mesh.rotation.y = 0;

            godrays.useDiffuseColor = true;
            godrays.mesh.material['diffuseColor'] = new BABYLON.Color3(0, 1, 1);


            godrays.exposure = 0.3;
            godrays.decay = 0.98;
            godrays.weight = 0.2;
            godrays.density = 0.926;


            setLightIntensity = (val) => {
                godrays.density = val;
            };

        } else {

            const texture = new BABYLON.Texture('/assets/preview/light-beam-gradient.png', this.scene);
            texture.uScale = 1;
            texture.vScale = 1;

            const opTexture = new BABYLON.Texture('/assets/preview/beam-opacity.jpg', this.scene, false, true);
            opTexture.uScale = 1;
            opTexture.vScale = 1;


            const mLightMat = new BABYLON.StandardMaterial('texture4', this.scene);
            mLightMat.emissiveColor = new BABYLON.Color3(0, 1, 1);
            mLightMat.opacityTexture = opTexture;
            mLightMat.opacityTexture['wAng'] = Math.PI;
            mLightMat.opacityTexture.getAlphaFromRGB = true;


            const lightBeam = createLightTube([0.4, 0.5], 1, this.scene);

            this.children.push(lightBeam);

            lightBeam.position.y = .55;
            lightBeam.visibility = 0.1;
            lightBeam.parent = node;
            lightBeam.material = mLightMat;


            setLightIntensity = (val) => {
                lightBeam.visibility = val;
            };


            this.spotLight.excludedMeshes.push(lightBeam);
        }


        return {node, setLightIntensity};
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
