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

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
    public openModal: BsModalRef = null;

    loggedUser = null;
    constructor(private modalService: BsModalService, private userService: UserService,
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
            this.openModal = this.modalService.show(LoginModalComponent);
        }

        return this.stopEvent(event);
    }

    openLoginModal(event: MouseEvent) {
        if (this.userService.loggedIn()) {
            // TODO
        } else {
            this.openModal = this.modalService.show(LoginModalComponent);
        }

        return this.stopEvent(event);
    }

    logout(event: MouseEvent) {
        this.userService.clearUser()
        this.loggedUser = this.userService.retrieveUser();
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
}
