import { NavController, NavParams, ModalController } from "ionic-angular";
import { Component } from "@angular/core";
import { SpecialImageUrl, LogoImageUrl, BannerImageUrl } from "../common";
import { RestaurantProvider } from "../../providers/restaurant/restaurant";
import { AuthProvider } from "../../providers/auth/auth";
import { UserServiceProvider } from "../../providers/user-service/user-service";
import { MyReservationPage } from "../my-reservation/my-reservation";
import { LoginModalPage } from "../login-modal/login-modal";
import { Geolocation } from '@ionic-native/geolocation';
import { CallNumber } from "@ionic-native/call-number";

@Component({
  selector: 'page-menus-of-restaurant',
  templateUrl: 'menus-of-restaurant.html',
})
export class MenusOfRestaurantPage {
  isLoggedIn: boolean;
  isEmpty: boolean;
  restId: any;
  menus: any;
  selected: any;
  speId: any;
  userId: any;
  specialImgUrl: string = SpecialImageUrl;
  logoImageUrl: string = LogoImageUrl;
  bannerImageUrl: string = BannerImageUrl;
  restaurant: any;
  banner: string;
  logo: string;
  userType: string;

  lat: number;
  lng: number;

  COLORS: any = {
    GREY: "#EOEOEO",
    GREEN: "#76FF03",
    YELLOW: "#FFCA28",
    RED: "#DD2C00"
  };

  constructor(public navCtrl: NavController, public navParams: NavParams, private restProvider: RestaurantProvider, 
    private auth: AuthProvider, private userService: UserServiceProvider, public modalCtrl: ModalController,
    private geolocation: Geolocation, private callNumber: CallNumber) {
    this.isEmpty = true;
    this.selected = navParams.data;
    this.restId = navParams.data['rest_id'];
    this.speId = navParams.data['spe_id'] || navParams.data['id'];
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
    console.log(this.speId)
    this.userId = localStorage.getItem("userId");
    this.userType = localStorage.getItem("userType");
    this.selected['isFavourite'] = +this.userId === +this.selected['user_id'];
    this.getMenuList();

    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.lng = resp.coords.longitude;
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  getMenuList() {
    this.restProvider.getMenuWithRestaurantDetails(this.restId).then(
      (result) => {
        console.log(result)
        this.isEmpty = Object.keys(result['menus']).length <= 0 ? true : false;
        this.menus = result['menus'];
        this.restaurant = result['restaurant'];
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

  addFavourite() {
    if (!this.isLoggedIn) {
      this.restProvider.showToast('Please login first.', 'bottom');
      this.login();
      return;
    }
    let formData = new FormData();
    formData.append('spe_id', this.speId);
    formData.append('user_id', this.userId);
    this.restProvider.addFavourite(formData).then(
      (result) => {
        console.log(result)
        this.selected['isFavourite'] = true;
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

  removeFavourite() {
    if (!this.isLoggedIn) {
      this.restProvider.showToast('Please login first.', 'bottom');
      this.login();
      return;
    }
    let formData = new FormData();
    formData.append('spe_id', this.speId);
    formData.append('user_id', this.userId);
    this.restProvider.removeFavourite(formData).then(
      (result) => {
        console.log(result)
        this.selected['isFavourite'] = false;
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

  addToReserveList(item) {
    if (!this.isLoggedIn) {
      this.restProvider.showToast('Please login first.', 'bottom');
      this.login();
      return;
    }
    item['qty'] = 1;
    if (item.hasOwnProperty('spe_id')) {
      const id = item['spe_id'];
      delete item['spe_id'];
      item['id'] = id;
    }

    const checkRestIdExistence = restId => this.userService.getReservationList().some(({ rest_id }) => rest_id !== restId);
    if (!checkRestIdExistence(item['rest_id'])) {
      const checkIdExistence = itemId => this.userService.getReservationList().some(({ id }) => id == itemId);
      if (!checkIdExistence(item['id'])) {
        this.userService.setReservation(item);
        this.userService.showToast('Special added into reservation list.', 'bottom');
      } else
        this.userService.showToast('Already added.', 'bottom');
    } else
      this.userService.showToast("You can't order at a time from different restaurant.", 'bottom');
  }
  
  callTheRestaurant(phone) {
    setTimeout(() => {
      window.open(`tel:${phone}`, '_system');
    }, 100);
  }

  isEmptyReservation() {
    if (this.userService.getReservationList().length > 0) return false;
    else return true;
  }

  gotToReservation() {
    //this.app.getRootNav().push(MyReservationPage);
    const modal = this.modalCtrl.create(MyReservationPage, { modal: true });
    modal.onDidDismiss((result: boolean) => { });
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

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => {
      this.isLoggedIn = result;
      this.getMenuList();
    });
    modal.present();
  }

}
