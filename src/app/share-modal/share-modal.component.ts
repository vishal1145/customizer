import {AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap';
import {facebookShare} from '../utils/Facebook';
import {GIFConverterOptions, GIFProgressCallback, GIFResult, THREE2GIFConverter} from '../utils/GIFExport';
import {ViewerService} from '../viewer.service';
import {GIFExportPreview} from '../utils/GIFExportPreview';
import {GIFUpload, UploadResponseObject} from '../utils/GIFUpload';
import config from './config';

import {updateTwitterShareButton} from '../utils/Twitter';
import {TarExport} from '../utils/TarExport';

import {socket, socketStartListening} from '../utils/Socket';


import parseHTML from 'parsehtml';
import {RawExportPreview} from '../utils/RawExportPreview';
import {IExportPreview} from '../utils/ExportCommon';

function debugTwitter() {
    const twitterBTN = parseHTML(`
 <a id="twitter-gif-share2" class="twitter-share-button"
               href="#"
               data-size="large">
                <img class="m-1" style="height: 2em;position: relative;top: -2em;"
                     src="assets/img/share-ui/Share_TW.png" title="Continue with Twitter"/>
            </a>
`);

    updateTwitterShareButton(twitterBTN,
        'Nice gadget!',
        ['pewpewcustoms'],
        ['http://mighty-starfish-59.localtunnel.me/api/share/a8297608-b44a-4cbc-ba9e-8b1f662ab186/m4v']);

    document.body.appendChild(twitterBTN);
}

window['debugTwitter'] = debugTwitter;

socketStartListening();


@Component({
    selector: 'app-share-modal',
    templateUrl: './share-modal.component.html',
    styleUrls: ['./share-modal.component.css']
})
export class ShareModalComponent implements AfterViewInit, OnDestroy {

    @ViewChild('canvasContainer')
    canvasContainer: ElementRef<HTMLDivElement>;
    // --------------------
    private displayCanvas: HTMLCanvasElement;
    public scene: BABYLON.Scene;

    debug = config.debug;

    // ---------------------
    // general progress info

    progress = false;
    progressType = '';
    progressPercentage = 0;

    created = false;
    uploaded = false;
    // --------------------
    error = '';

    uploadResponse: UploadResponseObject = null;
    private preview: IExportPreview;
    private gifUpload: GIFUpload;
    private exporter: any;
    private previousCanvasContainer: HTMLElement | null;

    availablePreviews = {default: {name: 'default', ctor: GIFExportPreview}, raw: {name: 'raw', ctor: RawExportPreview}};
    previewInstances = {};
    private enableSharingButtons = false;

    constructor(private modalRef: BsModalRef, private viewerService: ViewerService, private zone: NgZone) {

        window['that'] = this;


        socket.on('convert-progress', (data) => {
            this.zone.run(() => {


                this.setProgress(data.percentage, 100, 'Converting ' + data.format);

                if (data.percentage >= 99)
                    this.created = true;

                console.log(this.progress, this.progressType, this.progressPercentage);


            // TODO @7frank work flow...
                if (!this.progress && this.progressType=="Converting jpg") {

                    // FIXME @7frank use this param to disable the overlay as soon as sockerio works through the nginx route on the server
                    this.enableSharingButtons=true

                }


            });

        });


    }

    // TODO @7frank add "format" parameter
    getShareURL(data: UploadResponseObject) {
        return config.share.baseURL + config.share.shareRoute + data.id + '/' + data.format;

    }

    getVideoURL(data: UploadResponseObject) {
        return config.share.baseURL + config.share.imagesRoute + data.id + '.' + data.format;

    }


    getTwitterShareURL(data: UploadResponseObject) {
        //TODO
        return config.share.baseURL + '/twitter/video/' + data.id + '.' + data.format;

    }


    shareWithFacebook() {
        if (!this.uploadResponse) {
            return;
        }
        const url = this.getShareURL(this.uploadResponse);
        facebookShare(url);
        //TODO what to do after facebook share
        //.then(() => this.close());

    }


    // TODO @7frank fix download with tar files
    download() {

        const link = <HTMLAnchorElement>document.createElement('a');


        link.href = this.getVideoURL(this.uploadResponse); // this.getGifEl().src;
        link.download = 'Download.' + this.uploadResponse.format;
        document.body.appendChild(link);
        link.click();
    }

    setProgress(current, maximum, action: string) {
        this.progressPercentage = Math.round(100 * current / maximum);
        this.progress = this.progressPercentage != 100;
        this.progressType = action;
    }

    close() {
        this.modalRef.hide();
        this.undoPreviewMode();

    }

    undoPreviewMode() {
        if (this.exporter) {

            this.exporter.cancel();
        }
        this.viewerService.viewer.resizeOnRender = true;
        this.viewerService.viewer.resizeAsNeeded(true);
        this.preview.disablePreview();


        this.previousCanvasContainer.appendChild(this.displayCanvas);


    }


    getPreviewMesh() {
        return this.viewerService.viewer.getActiveWeapon();

    }

    async createGIFromCanvas(progressCallback: GIFProgressCallback, overrideConfig?: GIFConverterOptions): Promise<GIFResult> {

        this.exporter = new THREE2GIFConverter(config.gif.width, config.gif.height, Object.assign(config.gif.options, overrideConfig));


        const start = window.performance.now();
        const result = await this.exporter.startRecording(this.displayCanvas, this.scene, this.getPreviewMesh(), progressCallback);
        const stop = window.performance.now();

        console.log('Creating Gif took:', (stop - start) / 1000, ' seconds');

        return result;
    }

    async createTarFromCanvas(progressCallback: GIFProgressCallback, overrideConfig?: GIFConverterOptions): Promise<GIFResult> {


        this.exporter = new TarExport(config.gif.width, config.gif.height, Object.assign(config.gif.options, overrideConfig));

        window['converter'] = this.exporter.converter;


        const start = window.performance.now();
        const result = await this.exporter.startRecording(this.displayCanvas, this.scene, this.getPreviewMesh(), progressCallback);


        const stop = window.performance.now();

        console.log('Creating Tar took:', (stop - start) / 1000, ' seconds');

        return result;
    }


    getGifEl(): HTMLImageElement {
        return <HTMLImageElement> document.querySelector('#gif-preview');
    }


    // TODO progress bar for image after video generation gets stuck at 5% and will not highlight a success state

    async initGIFExport(overrideConfig?: GIFConverterOptions, uploadImmediate: boolean = true) {


        this.uploaded = false;

        this.error = '';
        this.setProgress(0, 1, '');

        if (!this.gifUpload) {
            this.gifUpload = (new GIFUpload);
        }

        this.gifUpload.cancelLastUpload();

        let mType = 'tar';


        let result;
        try {

            if (mType === 'gif') {

                result = await this.createGIFromCanvas((val) => {
                    this.setProgress(val, 1, 'Generating GIF...');
                }, overrideConfig);


            } else if (mType === 'tar') {

                result = await this.createTarFromCanvas((val) => {

                    // FIXME progress is only triggered on convert not while capturing

                    this.setProgress(val, 1, 'Generating Tar');
                }, overrideConfig);


            }

        } catch (e) {
            console.warn(e);
            this.error = e.message;
            return;
        } finally {

            // this.undoPreviewMode();

        }


        if (mType == 'gif') {
            const el = this.getGifEl();
            el.src = result.url;
        }

        if (!uploadImmediate) {
            return;
        }

        const uploadRoute = (mType == 'gif') ? config.share.baseURL + config.share.gifUploadRoute : config.share.baseURL + config.share.tarUploadRoute;

        this.gifUpload.setRemote(uploadRoute);

        const gifPromise = this.gifUpload.uploadBlob(result.blob, undefined, (e) => {

            console.log(e.loaded, e.total);

            this.setProgress(e.loaded, e.total, 'Uploading ...');

        });


        gifPromise.catch((e) => {
            this.error = 'Failed to upload file. Server not resonding.';
        });
        const response = await gifPromise;


        if (!response.error) {

            this.setShareElements(response);

            this.updateDebugResponse(response);

            this.uploaded = true;
        } else {
            this.error = response.error;
        }

    }

    updateDebugResponse(response: UploadResponseObject) {

        if (!this.debug) {
            return;
        }

        // if video created load video

        // if image created load video

        const url = this.getShareURL(response);

        console.log('share URL: ', url);

    }


    setShareElements(data: UploadResponseObject) {
        this.uploadResponse = data;

        //updateTwitterShareButton(document.querySelector('#twitter-gif-share'), 'Nice gadget!', ['pewpewcustoms'], [this.getShareURL(data)]);
    }

    // FIXME @7frank remove all previews from the global scene otherwise re-opening dialog will create multiple instances of the individual objects
    ngOnDestroy(): void {
        this.close();


    }

    ngAfterViewInit(): void {


        this.displayCanvas = this.viewerService.viewer.renderCanvas.nativeElement;
        this.scene = this.viewerService.viewer.scene;

        this.previousCanvasContainer = this.displayCanvas.parentElement;
        this.canvasContainer.nativeElement.appendChild(this.displayCanvas);

        this.viewerService.viewer.resizeOnRender = false;
        // this.viewerService.viewer.resizeAsNeeded(true);


        this.scene.getEngine().setSize(512, 512);


        this.preparePreview(this.availablePreviews.default);


    }

    preparePreview(obj: { name: string, ctor: any }) {
        if (this.preview) {
            this.preview.disablePreview();
        }

        if (!this.previewInstances[obj.name]) {
            this.previewInstances[obj.name] = new obj.ctor(this.scene, this.displayCanvas, this.viewerService.viewer.camera);

        }

        // this.preview = new GIFExportPreview(this.scene, this.displayCanvas, this.viewerService.viewer.camera);
        this.preview = this.previewInstances[obj.name];

        this.preview.enablePreview(this.getPreviewMesh());


    }


    initTwitterShare() {

        const url = this.getTwitterShareURL(this.uploadResponse);
        console.log('initTwitterShare', url);
        window.open(url);
    }
}
