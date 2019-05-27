import { NavController, ViewController, NavParams, ModalController } from "ionic-angular";
import { Component } from "@angular/core";
import { RestaurantProvider } from "../../providers/restaurant/restaurant";
import { AuthProvider } from "../../providers/auth/auth";
import { UserServiceProvider } from "../../providers/user-service/user-service";
import { SpecialImageUrl, LogoImageUrl, BannerImageUrl } from "../common";
import { MyReservationPage } from "../my-reservation/my-reservation";
import { LoginModalPage } from "../login-modal/login-modal";
import { Geolocation } from '@ionic-native/geolocation';
import { CallNumber } from "@ionic-native/call-number";
import { RestaurantLogoBannerPage } from '../restaurant-logo-banner/restaurant-logo-banner';

@Component({
  selector: 'page-specials-of-restaurant',
  templateUrl: 'specials-of-restaurant.html',
})
export class SpecialsOfRestaurantPage {
  isLoggedIn: boolean;
  isEmpty: boolean;
  restId: string;
  myRestId: number;
  speId: string;
  selected: any;
  specials: any;
  userId: string;
  userType: string;
  specialImgUrl: string = SpecialImageUrl;
  logoImageUrl: string = LogoImageUrl;
  bannerImageUrl: string = BannerImageUrl;
  restaurant: any;
  logo: string;
  banner: string;

  lat: number;
  lng: number;

  COLORS: any = {
    GREY: "#EOEOEO",
    GREEN: "#76FF03",
    YELLOW: "#FFCA28",
    RED: "#DD2C00"
  };
  reservationList: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private restProvider: RestaurantProvider,
    private auth: AuthProvider, public modalCtrl: ModalController,public viewCtrl: ViewController, private userService: UserServiceProvider,
    private geolocation: Geolocation, private callNumber: CallNumber) {
    this.isEmpty = true;
    this.selected = navParams.data;
    this.restId = navParams.data['rest_id'];
    this.speId = navParams.data['spe_id'] || navParams.data['id'];
    this.restaurant = {
      'name': '',
      'category_labels': '',
      'logo': 'assets/imgs/business-logo-dummy.png',
      'banner': 'assets/imgs/logo.png',
    };

    console.log(this.selected)
  }

  getTotalPrice() {
    let total = 0;
    this.reservationList.forEach(function (item) {
      total += item['qty'] * (item['price'] - item['price'] * item['discount'] / 100);
    });
    return total;
  }

  ionViewCanEnter() {
    this.isLoggedIn = this.auth.isAuthorized();
    this.reservationList = this.userService.getReservationList();
  }
  
  ionViewWillEnter() {
    this.userId = localStorage.getItem("userId");
    this.reservationList = this.userService.getReservationList();
    this.myRestId = parseInt(localStorage.getItem("restId"));
    console.log(this.myRestId, this.restId)
    this.userType = localStorage.getItem("userType");
    if (this.selected['fromFavourite']) this.selected['isFavourite'] = true;
      else this.selected['isFavourite'] = +this.userId === +this.selected['user_id'];
    this.getSpecialByRestaurantId();

    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.lng = resp.coords.longitude;
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  decreaseQty(index) {
    if (this.reservationList[index]['qty'] > 1)
      this.reservationList[index]['qty'] = this.reservationList[index]['qty'] - 1;
    else this.userService.showToast("You can't zero.", 'bottom');
  }

  increaseQty(index) {
    this.reservationList[index]['qty'] = this.reservationList[index]['qty'] + 1;
  }

  removeItem(index) {
    this.reservationList.splice(index, 1);
  }

  getSpecialByRestaurantId() {
    this.restProvider.getSpecialByRestaurantId(this.restId, this.speId).then(
      (result) => {
        console.log(result)
        this.isEmpty = Object.keys(result['special']).length <= 0 ? true : false;
        this.specials = result['special'];
        console.log(this.specials);
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

    console.log(item)

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

  getQuantity() {
    let total = 0;
    this.reservationList.forEach(e => {
      total += e['qty'];
    });
    return total;
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
    const modal = this.modalCtrl.create(MyReservationPage, {modal: true});
    modal.onDidDismiss((result: boolean) => {});
    modal.present();
  }

  goToLogoBanner() {
    if (!this.isLoggedIn) {
      this.restProvider.showToast('Please login first.', 'bottom');
      this.login();
      return;
    }
    this.navCtrl.setRoot(RestaurantLogoBannerPage);
  }

  isOpen() {
    const now = new Date().getHours() + ':' + new Date().getMinutes();
    const opening = this.selected['opening'];
    const closing = this.selected['closing'];

    let n = now.split(':');
    let o = opening.split(':');
    let c = closing.split(':');

    let nowSecond = (+n[0]) * 60 * 60 + (+n[1]) * 60;
    let startSecond = (+o[0]) * 60 * 60 + (+o[1]) * 60;
    let endSecond = (+c[0]) * 60 * 60 + (+c[1]) * 60;
    
    return (startSecond <= nowSecond && nowSecond >= endSecond) ? true : false;
  }

  getday(days) {
    let dayArr = days.split(",");
    if(dayArr.length === 7) return "Everyday";
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

  cancel() {
    this.reservationList.length = 0;
    //this.closeModal(true);
  }
  
  closeModal(result: boolean) {
    this.viewCtrl.dismiss(result);
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
      if (this.isLoggedIn)
        this.getSpecialByRestaurantId();
    });
    modal.present();
  }
}
