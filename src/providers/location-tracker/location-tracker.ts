import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import 'rxjs/add/operator/filter';
import { AuthProvider } from '../auth/auth';
import { UserServiceProvider } from '../user-service/user-service';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Platform } from 'ionic-angular';
import { Domain } from '../../pages/common';

@Injectable()
export class LocationTrackerProvider {

  public watch: any;
  public lat: number = 0;
  public lng: number = 0;
  userId: string;

  constructor(public zone: NgZone, public backgroundGeolocation: BackgroundGeolocation, 
    public geolocation: Geolocation, public http: HttpClient, public auth: AuthProvider, 
    public userService: UserServiceProvider, public backgroundMode: BackgroundMode, 
    public platform: Platform) {
    console.log('Hello LocationTrackerProvider Provider');
    this.userId = this.auth.getUser()['id'];
  }

  startBackgroundTracking(givenTime) {
    let config = {
      locationProvider: 1, // this.backgroundGeolocation.LocationProvider
      fastestInterval: 5000,
      activitiesInterval: 10000,
      notificationTitle: "Keep device GPS ON",
      notificationText: "Foodoli is running in background",
      stopOnTerminate: false,
      startOnBoot: true,
      startForeground: true,
      desiredAccuracy: 0,
      stationaryRadius: 20,
      distanceFilter: 10,
      debug: true,
      interval: 10000,
      pauseLocationUpdates: false,
      url: Domain + 'user/update_location_from_background/' + this.userId,
      httpHeaders: {
        'Authorization': 'Bearer ' + this.auth.getToken()
      },
      maxLocations: 1
    };

    this.backgroundGeolocation.configure(config).subscribe((location) => {
      console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);
      //this.backgroundGeolocation.finish();
      this.zone.run(() => {
        this.lat = location.latitude;
        this.lng = location.longitude;
      });
    }, (err) => {
      console.log(err);
    });
    
    //this.backgroundGeolocation.start();
    this.backgroundGeolocation.isLocationEnabled()
    .then((rta) => {
      if (rta) {
        this.backgroundGeolocation.start();
        let stopTime = this.getEndTime(givenTime) - 1800;
        setTimeout(() => {
          this.backgroundGeolocation.finish();
          this.backgroundGeolocation.stop();
          this.backgroundMode.disable();
        }, stopTime);
        } else {
          this.backgroundGeolocation.showLocationSettings();
        }
      });
  }

  stopBackgorundTracking() {
    console.log('stopBackgorundTracking');
    this.backgroundGeolocation.finish();
    this.backgroundGeolocation.stop();
    this.backgroundMode.disable();
  }

  startForegroundTracking(given) {
    let options = {
      frequency: 3000,
      enableHighAccuracy: true
    };

    this.watch = this.geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {
      console.log(position);
      this.zone.run(() => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.updateUserLocation(position.coords.latitude, position.coords.longitude);
      });
    });

    let stopTime = this.getEndTime(given);
    setTimeout(() => {
      this.stopForegroundTracking();
    }, stopTime);
  }

  stopForegroundTracking() {
    this.watch.unsubscribe();
  }

  updateUserLocation(lat, lng) {
    if (this.userId) {
      let formData = new FormData();
      formData.append('user_id', this.userId);
      formData.append('lat', lat);
      formData.append('lng', lng);
      this.userService.updateLocationdata(formData).then(
        (result) => {
          console.log(result)
        },
        (err) => {
          console.log(err);
        });
    }
  }

  getEndTime(given) {
    const end = '23:59';
    let e = end.split(':');
    let g = given.split(':');
    let startSecond = (+g[0]) * 60 * 60 + (+g[1]) * 60; //  + (+g[2])
    let endSecond = (+e[0]) * 60 * 60 + (+e[1]) * 60; //  + (+e[2])
    console.log(endSecond - startSecond)

    return endSecond - startSecond;
  }

  initBackgroundMode(givenTime) {
    this.platform.ready().then(() => {
      this.backgroundMode.setDefaults({
        title: 'Geolocation Tracking',
        text: 'Executing background tasks.',
        resume: true,
        hidden: false,
        silent: true
      });
      if (!this.backgroundMode.isEnabled()) {
        if (!this.backgroundMode.isActive()) {
          this.backgroundMode.enable();
        }
      }
      //if (this.platform.is("android")) {
        this.backgroundMode.on('activate').subscribe(() => {
          //this.backgroundMode.disableWebViewOptimizations();
          this.startBackgroundTracking(givenTime);
        });
      //}
      
      this.backgroundMode.on('deactivate').subscribe(() => {
          this.stopBackgorundTracking();
        });

      this.backgroundMode.on('failure').subscribe(() => {
          this.stopBackgorundTracking();
        });
    });
  }
}
