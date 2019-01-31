import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private cookieService: CookieService) { }

  loggedIn(): boolean {
    return this.cookieService.check('TOKEN')
  }

  storeUser(user, token) {
    this.cookieService.set('TOKEN', token);
    this.cookieService.set('USER', user);
  }

  retrieveUser() {
    if (this.loggedIn())
      return this.cookieService.get('USER');
    else
      return null
  }

  clearUser(){
    this.cookieService.delete('USER');
    this.cookieService.delete('TOKEN');
  }
}
