/*
    const root = 'https://orange-lionfish-48.localtunnel.me';
        //const root="http://localhost:3000"

        //const url = 'https://gist.githubusercontent.com/7frank/faa4393b6ea43a3403d8e1dc57f70060/raw/51d8cc4ace915b3d2d4c8bc286db935e67449dcb/facebook';
        //  const url = 'http://localhost:3000/api/share/1d7ddd31-585b-437b-910a-7ceda233e058';
        const url = root + '/api/share/1d7ddd31-585b-437b-910a-7ceda233e058';

* */


import {GIFConverterOptions} from '../utils/GIFExport';

export interface Config {
    share:
        {
            baseURL: string;
            shareRoute: string;
            gifUploadRoute: string;
            tarUploadRoute: string;
            imagesRoute: string;
        };
    gif: {
        height?: number;
        width?: number;
        options: GIFConverterOptions
    };
    debug?: boolean;
}

const isDebugMode = (<any>window).location.hash === '#debug';

export const defaults: Config = {
    share: {
        baseURL: window.location.origin,
        shareRoute: '/api/share/',
        gifUploadRoute: '/api/upload',
        tarUploadRoute: '/api/uploadTar',
        imagesRoute: '/images/'
    },
    gif: {
        height: 512,
        width: 512,
        options: {quality: 15, totalFrames: 120, framesPerSecond: 30}
    }
};


export const debug: Config = {
    share: {
        baseURL: window.location.origin,
        shareRoute: '/api/share/',
        gifUploadRoute: '/api/upload',
        tarUploadRoute: '/api/uploadTar',
        imagesRoute: '/images/'
    },
    gif: {
        height: 512,
        width: 512,
        options: {quality: 15, totalFrames: 2, framesPerSecond: 30}
    }
};

// TODO @7frank do we need mobile settings?
export const mobile: Config = {
    share: {
        baseURL: window.location.origin,
        shareRoute: '/api/share/',
        gifUploadRoute: '/api/upload',
        tarUploadRoute: '/api/uploadTar',
        imagesRoute: '/images/'
    },
    gif: {
        options: {quality: 15, totalFrames: 60, framesPerSecond: 30}
    }
};


// -------------------------


const config = isDebugMode ? debug : defaults;
config.debug = isDebugMode;

export default config;






