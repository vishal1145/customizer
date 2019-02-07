import {Component, OnInit} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {UserService} from '../user.service';
import {LoginModalComponent} from '../login-modal/login-modal.component';
import {NotifierService} from '../notifier.service';
import {THREE2GIFConverter} from '../utils/GIFExport';
import {ViewerService} from '../viewer.service';
import {ShareModalComponent} from '../share-modal/share-modal.component';
import {GIFExportPreview} from '../utils/GIFExportPreview';
import {GIFUpload} from '../utils/GIFUpload';
import { APIService } from '../../providers/api-service';
declare var $: any;

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.css'],
    providers: [APIService]
})
export class NavBarComponent implements OnInit {
    public openModal: BsModalRef = null;

    loggedUser = null;
    constructor(private modalService: BsModalService, private userService: UserService,
        private apiService: APIService,
                private notifierService: NotifierService, private viewerService: ViewerService) {
    }


    ngOnInit() {
        this.loggedUser = this.userService.retrieveUser();
    }

    /**
     * Initialises the sharing of the content via social media
     * @param {Event} event
     */
    startSharing(event?: MouseEvent) {

        this.openShareModal(event);



    }
    openFavoriteModal(event: MouseEvent) {
        if (this.userService.loggedIn()) {
            // TODO
        } else {
            //this.openModal = this.modalService.show(LoginModalComponent);
            $("#loginmodel").show();
        }

        return this.stopEvent(event);
    }

    openLoginModal(event: MouseEvent) {
        if (this.userService.loggedIn()) {
            // TODO
        } else {
            //this.openModal = this.modalService.show(LoginModalComponent);
          $('#loginUsername').val('')
          $('#loginPassword').val('')
            $("#loginmodel").show();
        }

        return this.stopEvent(event);
    }

    logout(event: MouseEvent) {
        this.userService.clearUser()
        this.loggedUser = this.userService.retrieveUser();
        window.location.reload();
    }

    openShareModal(event: MouseEvent) {
            this.openModal = this.modalService.show(ShareModalComponent);
        return this.stopEvent(event);
    }


    resetMaterials(event: MouseEvent) {
        this.notifierService.notify('reset');

        return this.stopEvent(event);
    }

    stopEvent(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        return false;
    }


    username='';
  password='';
  async login() {
    // const output = await this.apiService.executeByURL('api/login', {
    //   email: "user1@gmail.com", password: "user123"
    // });
    const output = await this.apiService.executeByURL('api/login', {
      email: this.username, password: this.password
    });
    console.log(output);
    if (output && output.isapisuccess) {
      const res: any = output.apidata;
      if (res.Code === "P00001") {
        this.userService.storeUser(res.Data,res.Data._id);
        this.loggedUser = res.Data;
        window.location.reload();
        $("#loginmodel").hide();
      }
      else {
        alert("Invalid user name and password");
      }
    } else {
      alert("Invalid user name and password");
    }
  }

  hideLoginModel(){
    $("#loginmodel").hide();
  }
}
