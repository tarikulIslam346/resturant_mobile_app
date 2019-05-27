import { ClamMyBusinessPage } from './../clam-my-business/clam-my-business';
import { RestaurantProvider } from './../../providers/restaurant/restaurant';
import { Platform } from 'ionic-angular';
import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation';
//import { Googlemaps } from '@ionic-native/google-maps';
import { FormControl } from '@angular/forms';
import { OwnerSignUpPage } from '../owner-sign-up/owner-sign-up';

@Component({
  selector: 'page-find-restaurant',
  templateUrl: 'find-restaurant.html',
})
export class FindRestaurantPage {
  searching: boolean = false;
  restaurant: string = '';
  restaurantControl: FormControl;
  city: string = '';
  cityControl: FormControl;

  searchData: any = {
    'city': '',
    'restaurant': '',
  };
  refresher: any;
  restaurantList: any;
  isEmpty: boolean = true;

  COLORS: any = {
    GREY: "#EOEOEO",
    GREEN: "#76FF03",
    YELLOW: "#FFCA28",
    RED: "#DD2C00"
  };

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController,
    private diagnostic: Diagnostic, public platform: Platform, private ngZone: NgZone, private geolocation: Geolocation,
    public restProvider: RestaurantProvider) {
    this.restaurantControl = new FormControl();
    this.cityControl = new FormControl();
  }

  ionViewWillEnter() {
    this.searching = true;
    this.getRestaurantOwner();
    this.restaurantControl.valueChanges.debounceTime(700).subscribe(search => {
      this.searching = false;
      if (search) {
        this.searchData['restaurant'] = search;
      } else {
        this.searchData['restaurant'] = '';
      }
      this.getRestaurantOwner();
    });

    this.cityControl.valueChanges.debounceTime(700).subscribe(search => {
      this.searching = false;
      if (search) {
        this.searchData['city'] = search;
      } else {
        this.searchData['city'] = '';
      }
      this.getRestaurantOwner();
    });
  }

  onSearchInput() {
    this.searching = true;
  }
  
  doRefresh(refresher) {
    this.refresher = refresher;
    this.searchData = {
      'city': '',
      'restaurant': ''
    };

    this.restaurantControl.setValue('');
    this.cityControl.setValue('');
    
    this.getRestaurantOwner();
  }
  
  getRestaurantOwner() {
    this.searchData['restaurant'] = this.restaurant;
    this.searchData['city'] = this.city;
    this.searching = true;
    
    let formData = new FormData();
    for (let key in this.searchData) {
      if (this.searchData[key]) {
        formData.append(key, this.searchData[key]);
      } else {
        delete this.searchData[key];
      }
    }
    console.log(this.searchData);

    this.restProvider.getRestaurantOwner(formData).then(
      (result) => {
        if (this.refresher)
          this.refresher.complete();
        if (result) {
          console.log(result)
          this.restaurantList = result['restaurant'];
          this.isEmpty = Object.keys(result['restaurant']).length <= 0 ? true : false;
          this.searching = false;
        }
      },
      (err) => {
        console.log(err);
        if (this.refresher)
          this.refresher.complete();
        this.searching = false;
      });
  }

  getStartArray(rating: number) {
    let arr = [];
    if (!rating)
      return arr;

    for (let index = 0; index < rating; index++) {
      arr.push(index);
    }
    return arr;
  }

  isAboveRating(rating: number, index: number): boolean {
    return index > rating;
  }

  getColor(rating: number, index: number) {
    if (this.isAboveRating(+rating, index)) {
      return this.COLORS["GREY"];
    }

    switch (+rating) {
      case 1:
      case 2:
        return this.COLORS["RED"];
      case 3:
        return this.COLORS["YELLOW"];
      case 4:
      case 5:
        return this.COLORS["GREEN"];

      default:
        return this.COLORS["GREY"];
    }
  }

  goToClamMyBusiness(restaurant?) {
    if(restaurant)this.navCtrl.push(ClamMyBusinessPage, { restaurant: restaurant});
    else this.navCtrl.push(OwnerSignUpPage);
  }
  
  closeModal(result: boolean) {
    this.viewCtrl.dismiss(result);
  }
}
