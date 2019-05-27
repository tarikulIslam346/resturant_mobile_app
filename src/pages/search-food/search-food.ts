import { NavController, NavParams, ModalController, Content } from "ionic-angular";
import { Component, ViewChild } from "@angular/core";
import { SpecialImageUrl } from "../common";
import { RestaurantProvider } from "../../providers/restaurant/restaurant";
import { AuthProvider } from "../../providers/auth/auth";
import { CityPage } from "../city/city";
import { SpecialDetailsPage } from "../special-details/special-details";
import { Geolocation } from '@ionic-native/geolocation';
import { throttle } from 'lodash';
import 'rxjs/add/operator/debounceTime';
import { FormControl } from "@angular/forms";

@Component({
  selector: 'page-search-food',
  templateUrl: 'search-food.html',
})
export class SearchFoodPage {
  @ViewChild('pageTop') pageTop: Content;

  isLoggedIn: boolean;
  userId: string;
  specialList: any;
  specialImgUrl: string = SpecialImageUrl;
  isEmpty: boolean;
  pageNumber: number = 1;
  infiniteScroll: any;
  totalPages: number = 1;
  lat: number;
  lng: number;

  COLORS: any = {
    GREY: "#EOEOEO",
    GREEN: "#76FF03",
    YELLOW: "#FFCA28",
    RED: "#DD2C00"
  };
  foodName: string = undefined;
  city: string = undefined;
  zipCode: string = undefined;
  searching: boolean = false;
  foodSearch: FormControl;
  citySearch: FormControl;
  zipCodeSearch: FormControl;

  constructor(public navCtrl: NavController, public navParams: NavParams, private restProvider: RestaurantProvider, 
    private auth: AuthProvider, private modalCtrl: ModalController, private geolocation: Geolocation) {
    this.foodSearch = new FormControl();
    this.citySearch = new FormControl();
    this.zipCodeSearch = new FormControl();
    this.scrollToTop = throttle(this.scrollToTop, 500, { leading: true, trailing: false });
  }

  scrollToTop() {
    if (this.pageTop) {
      const wait = this.pageTop.isScrolling ? 1000 : 0
      setTimeout(() => this.pageTop.scrollToTop(200), wait);
    }
  }

  ionViewCanEnter() {
    this.isLoggedIn = this.auth.isAuthorized();
    this.userId = localStorage.getItem("userId");
  }

  ionViewDidEnter() {
    this.searching = true;
    this.getFood();
    this.foodSearch.valueChanges.debounceTime(700).subscribe(search => {
      this.searching = false;
      this.getFood();
    });

    this.citySearch.valueChanges.debounceTime(700).subscribe(search => {
      this.searching = false;
      this.getFood();
    });

    this.zipCodeSearch.valueChanges.debounceTime(700).subscribe(search => {
      this.searching = false;
      this.getFood();
    });
  }

  onSearchInput() {
    this.searching = true;
  }

  doRefresh(refresher) {
    this.pageNumber = 1;
    this.foodSearch.reset();
    this.citySearch.reset();
    this.zipCodeSearch.reset();
    this.city = undefined;
    this.zipCode = undefined;
    this.foodName = undefined;
    this.getFood();
    refresher.complete();
  }

  doInfinite(infiniteScroll): Promise<any> {
    return new Promise((resolve) => {
      this.infiniteScroll = infiniteScroll;
      this.pageNumber += 1;
      if (this.totalPages >= this.pageNumber) {
        this.getFood();
      } else {
        this.infiniteScroll.complete();
        this.pageNumber = 1;
      }
    });
  }

  getFood() {
    if (!this.city) this.city = undefined;
    if (!this.zipCode) this.city = undefined;
    if (!this.foodName) this.city = undefined;
    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.lng = resp.coords.longitude;
      this.restProvider.getFood(resp.coords.latitude, resp.coords.longitude, this.pageNumber, this.city, this.zipCode, this.foodName)
        .then(result => {
          if (this.infiniteScroll)
            this.infiniteScroll.complete();
          console.log(result)
          if (result) {
            this.specialList = result['specials'];
            this.totalPages = result['total_pages'];
            this.isEmpty = Object.keys(result['specials']).length <= 0 ? true : false;
            this.searching = false;
            setTimeout(() => {
              this.scrollToTop();
            }, 1000);
          }
        }, (err) => {
          console.log(err);
          this.searching = false;
        });
    }).catch((error) => {
      this.searching = false;
      console.log('Error getting location', error);
    });
  }

  /* silentLoad() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.lng = resp.coords.longitude;
      this.restProvider.getFood(resp.coords.latitude, resp.coords.longitude, this.pageNumber, this.city, this.zipCode, this.foodName)
        .then(result => {
          if (this.infiniteScroll)
            this.infiniteScroll.complete();
          console.log(result)
          if (result) {
            this.specialList = result['specials'];
            this.totalPages = result['total_pages'];
            this.isEmpty = Object.keys(result['specials']).length <= 0 ? true : false;
            this.searching = false;
            setTimeout(() => {
              this.scrollToTop();
            }, 1000);
          }
        }, (err) => {
          console.log(err);
        });
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  } */

  getCity() {
    const modal = this.modalCtrl.create(CityPage);
    modal.onDidDismiss((city) => {
      if (city) {
        this.city = city;
        this.onSearchInput();
      } else {
        this.citySearch.reset();
        this.city = undefined;
      }
    });
    modal.present();
  }

  getday(days) {
    let dayArr = days.split(",");
    if (dayArr.length === 7) return "Everyday";
    else return days;
  }

  getDistanceFromLatLonInKm(lat, lon) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat - this.lat);  // deg2rad below
    var dLon = this.deg2rad(lon - this.lng);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(this.lat)) * Math.cos(this.deg2rad(lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

  isFavourite(userId): boolean {
    return +this.userId === userId;
  }

  getStartArray(rating: number) {
    let arr = [];
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

  goToDetails(item) {
    const modal = this.modalCtrl.create(SpecialDetailsPage, { special: item });
    modal.onDidDismiss(data => { });
    modal.present();
  }
}
