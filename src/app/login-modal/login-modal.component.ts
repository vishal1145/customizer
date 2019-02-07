import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { APIService } from '../../providers/api-service';
import { UserService } from '../user.service';

@Component({
  selector: 'modal-content',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css'],
  providers: [APIService]
})
export class LoginModalComponent implements OnInit {

  constructor(private modalRef: BsModalRef, private apiService: APIService,
    private userService: UserService) { }

  ngOnInit() {
  }

  close() {
    this.modalRef.hide();
  }

  async login() {
    const output = await this.apiService.executeByURL('api/login', {
      email: "user1@gmail.com", password: "user123"
    });
    if (output && output.isapisuccess) {
      const res: any = output.apidata;
      if (res.Code === "P00001") {
        this.userService.storeUser(res.Data.user,res.Data.tokenId);
        this.close();
      }
      else {
        alert("Invalid user name and password");
      }
    } else {
      alert("Invalid user name and password");
    }
  }
}
