import { NavController, NavParams, ModalController } from 'ionic-angular';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Platform } from "ionic-angular";
import { GoogleMaps, GoogleMap, LatLng, GoogleMapsEvent } from "@ionic-native/google-maps";
import { AuthProvider } from '../../providers/auth/auth';
import { LoginModalPage } from '../login-modal/login-modal';
import { RestaurantProvider } from '../../providers/restaurant/restaurant';
import { LogoImageUrl, BannerImageUrl } from '../common';
import { CallNumber } from '@ionic-native/call-number';

@Component({
  selector: 'page-restaurant-details',
  templateUrl: 'restaurant-details.html',
})
export class RestaurantDetailsPage {

  @ViewChild('map')
  private mapElement: ElementRef;
  private map: GoogleMap;
  private location: LatLng;
  isLoggedIn: any;
  restId: string;
  userId: string;
  isEmpty: boolean;
  restaurant: any;
  logoImageUrl: string;
  bannerImageUrl: string;
  logo: string;
  banner: string;

  constructor(private platform: Platform, public navCtrl: NavController, public navParams: NavParams, 
    private auth: AuthProvider, public modalCtrl: ModalController, private restProvider: RestaurantProvider,
    private callNumber: CallNumber) {
      this.logoImageUrl = LogoImageUrl;
      this.bannerImageUrl = BannerImageUrl;
      this.restId = navParams.data['rest_id'];
      this.restaurant = {
        'name': '',
        'category_labels': '',
        'logo': '',
        'banner': '',
      };
  }

  ionViewCanEnter() {
    this.isLoggedIn = this.auth.isAuthorized();
  }

  ionViewWillEnter() {
    this.userId = localStorage.getItem("userId");
    this.getRestaurantInfo();
  }
  
  getRestaurantInfo() {
    this.restProvider.getRestInfo(this.restId).then(
      (result) => {
        //console.log(result[0])
        this.isEmpty = Object.keys(result).length <= 0 ? true : false;
        if (!this.isEmpty) {
          this.location = new LatLng(parseFloat(result[0]['lat']), parseFloat(result[0]['lng']));
          this.restaurant = result[0];
          if (this.restaurant) {
            if (this.restaurant.hasOwnProperty('logo'))
              if (this.restaurant['logo'] && this.restaurant['logo'] !== 'null')
                this.logo = this.logoImageUrl + this.restaurant['logo'];
              else this.logo = 'assets/imgs/business-logo-dummy.png';

            if (this.restaurant.hasOwnProperty('banner'))
              if (this.restaurant['banner'] && this.restaurant['banner'] !== 'null')
                this.banner = this.bannerImageUrl + this.restaurant['banner'];
              else this.banner = 'assets/imgs/logo.png';
          }
          this.setMap();
        }
      },
      (err) => {
        console.log(err);
        this.isEmpty = true;
        if (err.statusText === "Unauthorized") {
          this.auth.silentLogout();
          this.login();
        }
      });
  }

  getBanner() {
    return 'url(' + this.banner + ')';
  }

  callTheRestaurant(phone) {
    setTimeout(() => {
      window.open(`tel:${phone}`, '_system');
    }, 100);
  }

  setMap() {
    //this.platform.ready().then(() => {});

    let element = this.mapElement.nativeElement;
    this.map = GoogleMaps.create(element);

    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      let options = {
        target: this.location,
        zoom: 16
      };

      this.map.moveCamera(options);
      setTimeout(() => { this.addMarker() }, 2000);
    });
  }

  addMarker() {
    this.map.addMarker({
      title: this.restaurant['name'],
      icon: 'green',
      animation: 'DROP',
      position: {
        lat: this.location.lat,
        lng: this.location.lng
      }
    })
      .then(marker => {
        marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
          alert('Marker Clicked');
        });
      });
  }

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => {
      this.isLoggedIn = result;
      this.getRestaurantInfo();
    });
    modal.present();
  }
}
