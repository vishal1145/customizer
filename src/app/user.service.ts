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

  isAdmin(): boolean {
    let isAdmin = false;
    try {
      if (this.cookieService.check('USER')) {
        const user = JSON.parse(this.cookieService.get('USER'));
        isAdmin = user.role === "admin";
      }
    }
    catch (err) {

    }
    return isAdmin;
  }

  storeUser(user, token) {
    this.cookieService.set('TOKEN', token);
    this.cookieService.set('USER', JSON.stringify(user));
  }

  retrieveUser() {
    if (this.loggedIn())
      return JSON.parse(this.cookieService.get('USER'));
    else
      return null
  }

  clearUser() {
    this.cookieService.delete('USER');
    this.cookieService.delete('TOKEN');
  }
}
