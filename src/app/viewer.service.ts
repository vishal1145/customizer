import { Injectable } from '@angular/core';
import { BabylonViewerComponent } from './babylon-viewer/babylon-viewer.component';
import {Observable, Subject, Subscriber} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViewerService {
  public viewer: BabylonViewerComponent;

  private initializedSource = new Subject<boolean>();
  private meshClickedSource = new Subject<string>();
  private resetSource = new Subject<any>();

  public initialized: Observable<boolean> = this.initializedSource.asObservable();
  public meshClicked: Observable<string> = this.meshClickedSource.asObservable();
  public reset: Observable<any> = this.resetSource.asObservable();

  constructor() {}

  notifyClick(meshName: string) {
    this.meshClickedSource.next(meshName);
  }

  notifyInitialized() {
    this.initializedSource.next(true);
  }

  notifyReset() {
    this.resetSource.next();
  }
}
