import 'ccapture.js/src/tar';
import * as CCapture from 'ccapture.js/src/CCapture.js';
import {GIFConverterOptions, GIFProgressCallback, GIFResult} from './GIFExport';


export class TarExport {

    // gif: GIF;
    private converter: CCapture;

    options: GIFConverterOptions;
    debug: true;
    private sigCancel: boolean;


    constructor(private width: number = 512, private height: number = 512, options?: GIFConverterOptions) {

        const defaults: GIFConverterOptions = {quality: 8, framesPerSecond: 30, totalFrames: 60};
        this.options = Object.assign(defaults, options);


        this.createConverter();

    }

    createConverter() {
      /*  this.gif = new GIF({
            repeat: 0,
            workers: 2,
            quality: this.options.quality,
            //workerScript:"libs/gif.js/gif.worker.js"
            workerScript: workerURL
        });*/


        // Create a capturer that exports PNG images in a TAR file
          this.converter = new CCapture({
              format: 'png',
              // framerate: 60,
              verbose: false,
             // timeLimit: 2
          });




    }

    addFrame(canvasElement) {
        // this.gif.addFrame(canvasElement, {copy: true, delay: 1000 / this.options.framesPerSecond});

          this.converter.capture(canvasElement);

    }


    cancel() {
        this.sigCancel = true;
        // this.converter.stop();
    }


    async grabFrames(scene: BABYLON.Scene, canvasElement: HTMLCanvasElement, mesh: BABYLON.Mesh, progessCB: GIFProgressCallback | undefined) {


        // --------------------------



        const amount = this.options.totalFrames;
        return new Promise((resolve, reject) => {


            let imgNm = 0;

            let setSize, stopCapture, captureNextFrame;

            setSize = () => {
                scene.getEngine().setSize(this.width, this.height);
            };

            stopCapture = () => {

                scene.unregisterBeforeRender(setSize);
                scene.unregisterAfterRender(captureNextFrame);

            };

            captureNextFrame = () => {

                // make sure to reject if cancel flag is set
                if (this.sigCancel) {
                    stopCapture();
                    reject(new Error('canceled manually'));
                }

                if (imgNm++ < amount + 1) {


                    progessCB(imgNm / amount,"capturing")

                    //if (imgNm !== 1) {
                        this.addFrame(canvasElement);
                    //}
                    // Add a constant rotation per frame.

                    const axis = new BABYLON.Vector3(-1, 1, 0);
                    const angle = Math.PI / 4;
                    const quaternionBase: BABYLON.Quaternion = BABYLON.Quaternion.RotationAxis(axis, angle);


                    const axis2 = new BABYLON.Vector3(0, 1, 0);
                    const angle2 = imgNm * 2 * Math.PI / amount;

                    const quaternionRotation = BABYLON.Quaternion.RotationAxis(axis2, angle2);

                    mesh.rotationQuaternion = quaternionRotation.multiply(quaternionBase);


                } else {
                    stopCapture();
                    resolve();
                }
            };


            scene.registerBeforeRender(setSize);
            scene.registerAfterRender(captureNextFrame);


        });


    }


    async startRecording(canvasElement: HTMLCanvasElement, scene, mesh: BABYLON.Mesh, progessCB?: GIFProgressCallback): Promise<GIFResult> {
        // const gif = this.gif;

        this.converter.start();

        await this.grabFrames(scene, canvasElement, mesh, progessCB);



        this.converter.on('progress', progessCB);

        return new Promise<GIFResult>((resolve, reject) => {

            this.converter.on('progress', () => {

                 if (this.sigCancel) {
                     this.converter.stop();
                     reject(new Error('canceled manually'));
                 }

             });

            //resolve({url: '', blob: new Blob()});
            this.converter.save(function (blob) {
                const url = URL.createObjectURL(blob);
                console.log("tar blob",url)

                resolve({url, blob});
            });




            /* gif.on('finished', function (blob) {
                 const url = URL.createObjectURL(blob);
                 resolve({url, blob});
             });
             gif.render();*/

        });


    }

}
