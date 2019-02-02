import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//import 'rxjs/add/operator/map';
import { environment } from '../environments/environment';

//import { Observable } from 'rxjs/observable';
//import 'rxjs/add/operator/map'

declare let AWS: any;
declare var swal: any;
declare var $: any;

/*
  Generated class for the APIService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 4 DI.
*/
@Injectable()
export class APIService {

    data: any;
    constructor(public http: HttpClient) {
        // console.log('Hello ITHoursService Provider');
        //    this.load();
    }

    getAPIBaseURL() {
        console.log("env value is " + environment.apiBaseURL);
        return environment.apiBaseURL;
    }

    getUrl(append: string) {
        return this.getAPIBaseURL() + append;
    }

    getCRUDSharedUrl() {
        return this.getUrl("api/crud");
    }
    getSharedUrl() {
        return this.getUrl("api/manager");
    }
    getPostUrl() {
        return this.getUrl("api/crud/ADD");
    }

    getHeaders() {
        let headers = new Headers();
        headers.append('UserId', '12345');
        headers.append('DeviceId', '12345');
        return headers;
    }


    //ShowErrorAlert() {
    //    $("#error").fadeTo(2000, 500).slideUp(500, function () {
    //        $("#error").slideUp(500);
    //    });
    //}

    //ShowSuccessAlert() {
    //    $("#sucess").fadeTo(2000, 500).slideUp(500, function () {
    //        $("#sucess").slideUp(500);
    //    });
    //}
    prepareNodeJSRequestObject(prcId: string, opId: string, data: any) {
        var toSend: any = {
            PRCID: prcId,
            Method: opId
        };
        if (data)
            toSend.Data = data;
        else
            toSend.Data = {};

        return toSend;
    }


    //async execute1(inputData: any, showload: boolean = true) {
    //  const apiresponse = await this.http
    //    .post(this.getSharedUrl(), inputData)
    //    .toPromise();

    //  if (apiresponse) return { isapisuccess: true, apidata: apiresponse.json() };
    //  else return { isapisuccess: false, apidata: null };
    //}


    executeSubscribe(inputData: any, showload: boolean = true) {
        return this.http.post(this.getSharedUrl(), inputData)
    }


    async execute(inputData: any, showload: boolean = true) {
        // don't have the data yet
        return new Promise(resolve => {
            // We're using Angular HTTP provider to request the data,
            // then on the response, it'll map the JSON data to a parsed JS object.
            // Next, we process the data and resolve the promise with the new data.
            this.http.post(this.getSharedUrl(), inputData)
                // // .map(res => res.json())
                .subscribe(
                    data => {
                        resolve({ isapisuccess: true, apidata: data });
                    },
                    error => {
                        resolve({ isapisuccess: true, apidata: null })
                    }
                );
        });
    }


    async  executeByURL(url: any, inputData: any) {
        var final_url = this.getAPIBaseURL() + url;
        const apiresponse = await this.http.post(final_url, inputData).toPromise();
        if (apiresponse)
            return { isapisuccess: true, apidata: apiresponse }
        else
            return { isapisuccess: false, apidata: null }

    }


    async  executeByPost(inputData: any, showload: boolean = true) {
        var sharedCRUD = this.getCRUDSharedUrl() + "/ADD"
        const apiresponse = await this.http.post(sharedCRUD, inputData).toPromise();
        if (apiresponse)
            return { isapisuccess: true, apidata: apiresponse }
        else
            return { isapisuccess: false, apidata: null }

    }
    async  executeByUpdate(inputData: any, showload: boolean = true) {
        var sharedCRUD = this.getCRUDSharedUrl() + "/UPDATE"
        const apiresponse = await this.http.post(sharedCRUD, inputData).toPromise();
        if (apiresponse)
            return { isapisuccess: true, apidata: apiresponse }
        else
            return { isapisuccess: false, apidata: null }

    }
    async executeByGet(inputData: any, showload: boolean = true) {
        var sharedCRUD = this.getCRUDSharedUrl() + "/GET";
        const apiresponse = await this.http.post(sharedCRUD, inputData).toPromise();
        if (apiresponse)
            return { isapisuccess: true, apidata: apiresponse }
        else
            return { isapisuccess: false, apidata: null }
    }

    setObject(key: string, obj: any) {
        window.localStorage.setItem(key, JSON.stringify(obj));
    }

    getObject(key: string) {
        return JSON.parse(window.localStorage.getItem(key));
    }

    SplitToArray(data: any) {
        var FirstCats = [];
        var SecondCats = [];
        var len = data.length;
        var counter;
        if (len % 2 == 1)
            counter = (len + 1) / 2;
        else
            counter = len / 2;

        for (var i = 0; i < counter; i++) {
            FirstCats.push(data[i]);
            //console.log(data[i].ItemId);
        }
        for (var j = counter; j < data.length; j++) {
            SecondCats.push(data[j]);
        }
        var imageArray = {
            FirstCats: FirstCats,
            SecondCats: SecondCats
        }

        return imageArray;


    }



    ConvertTo2DArray(data: any, colcount: any) {

        var productList = [];
        var counter = 0;

        for (var i = 0; i < data.length; i = i + colcount) {
            var row = [];
            for (var j = 0; j < colcount; j++) {
                if (counter >= data.length)
                    break;
                row.push(data[counter]);
                counter++;
            }
            productList.push(row);
        }
        return productList;
    }


    SetUpAWS() {
        var albumBucketName = '';
        var bucketRegion = '';
        var IdentityPoolId = ''

        AWS.config.update({
            region: 'us-west-2',
            credentials: new AWS.CognitoIdentityCredentials({
                IdentityPoolId: IdentityPoolId
            })
        });

        return new AWS.S3({
            apiVersion: '2006-03-01',
            params: { Bucket: albumBucketName }
        });
    }



    showErrorMessage(title: any, test: any) {
        swal({
            title: title,
            text: test,
            type: 'error',
            confirmButtonClass: 'btn btn-info',
            buttonsStyling: false
        });
    }
    showSuccessMessage(title: any, test: any) {
        swal({
            title: title,
            text: test,
            type: 'success',
            confirmButtonClass: 'btn btn-info',
            buttonsStyling: false
        });
    }
    conformationMessage(text1: any, text2: any) {
        return new Promise(resolve => {
            swal({
                title: text1,
                text: text2,
                type: 'warning',
                showCancelButton: true,
                confirmButtonClass: 'btn btn-success',
                cancelButtonClass: 'btn btn-danger',
                confirmButtonText: 'Yes',
                buttonsStyling: false
            }).then(function () {
                resolve(true);
                //cb(true);
                //swal({
                //    title: 'Deleted!',
                //    text: text2,
                //    type: 'success',
                //    confirmButtonClass: 'btn btn-success',
                //    buttonsStyling: false
                //});
            });
        });
    }

    confirmMessage(text1: any, text2: any) {
        return new Promise(resolve => {
            swal({
                title: text1,
                text: text2,
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn-danger",
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                //closeOnConfirm: false,
                //closeOnCancel: false
            }).then(function () {
                resolve(true);
            });
        });
    }



    getRandomPassword() {

        var d = new Date().getTime();
        var uuid = 'xxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;

    }

    generateUUID() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxxxxxxxxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    };

    getAWSObj() {
        var albumBucketName = 'dolphino';
        var bucketRegion = 'us-west-2';
        var IdentityPoolId = 'us-west-2:ff182092-2a76-489c-9d58-45ba742d9e7d'

        AWS.config.update({
            region: 'us-west-2',//'us-west-2',
            credentials: new AWS.CognitoIdentityCredentials({
                IdentityPoolId: IdentityPoolId
            })
        });

        return new AWS.S3({
            apiVersion: '2012-10-17',//'2006-03-01',
            params: { Bucket: albumBucketName }
        });
    }
    logError(exception: any) {

    }
    getYouTubeVideoIdFromUrl(url) {
        if (url)
            return url.replace("https://www.youtube.com/embed/", "");
        else
            return "ru0K8uYEZWw";
    }

    getYouTubePosterByVideoId(url) {
        return "https://img.youtube.com/vi/" + this.getYouTubeVideoIdFromUrl(url) + "/sddefault.jpg";
    }


}
export enum Keys {
    User
}
