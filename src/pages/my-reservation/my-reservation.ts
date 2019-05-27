import { NavController, NavParams, ModalController, ViewController, Platform } from "ionic-angular";
import { Component } from "@angular/core";
import { SpecialImageUrl } from "../common";
import { AuthProvider } from "../../providers/auth/auth";
import { UserServiceProvider } from "../../providers/user-service/user-service";
import { RestaurantProvider } from "../../providers/restaurant/restaurant";
import { LocationTrackerProvider } from "../../providers/location-tracker/location-tracker";
import { StartPage } from "../start/start";
import { LoginModalPage } from "../login-modal/login-modal";

@Component({
  selector: 'page-my-reservation',
  templateUrl: 'my-reservation.html',
})
export class MyReservationPage {
  isLoggedIn: boolean;
  isEmpty: boolean;
  reservationList: any[] = new Array();
  specialImgUrl = SpecialImageUrl;
  userId: string;
  time: string;
  isModal: boolean;
  today: number = Date.now();
  restName: string = '';
  restAddress: string = '';

  constructor(private navCtrl: NavController, private navParams: NavParams, private auth: AuthProvider, 
    private userService: UserServiceProvider, private restProvider: RestaurantProvider, 
    private modalCtrl: ModalController, public viewCtrl: ViewController, public locationTracker: LocationTrackerProvider, 
    public platform: Platform) {
    this.isEmpty = true;
    this.isModal = false;
  }

  ionViewCanEnter() {
    this.isLoggedIn = this.auth.isAuthorized();
    this.isModal = this.navParams.get("modal");
    if (!this.isLoggedIn) {
      this.navCtrl.setRoot(StartPage);
      return true;
    }
  }

  ionViewWillEnter() {
    this.userId = localStorage.getItem("userId");
    this.reservationList = this.userService.getReservationList();
    console.log(this.reservationList);
    this.isEmpty = Object.keys(this.reservationList).length <= 0 ? true : false;
    if (!this.isEmpty) {
      this.restName = this.reservationList[0]['restaurant_name'] || this.reservationList[0]['name'];
      this.restAddress = this.reservationList[0]['address'];
    }
  }

  ionViewDidLeave() {
    this.isModal = false;
  }

  getTotalPrice() {
    let total = 0;
    this.reservationList.forEach(function (item) {
      total += item['qty'] * (item['price'] - item['price'] * item['discount'] / 100);
    });
    return total;
  }

  getQuantity() {
    let total = 0;
    this.reservationList.forEach(e => {
      total += e['qty'];
    });
    return total;
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

  reservedSpecials() {
    if (!this.time) {
      this.restProvider.showToast("Please give approximate time.", "bottom");
      return;
    }
    let formData = new FormData();
    formData.append('user_id', this.userId);
    formData.append('rest_id', this.reservationList[0]['rest_id']);
    formData.append('approximate_time', this.time);
    formData.append('item_list', JSON.stringify(this.reservationList));
    this.restProvider.reserve(formData).then(
      (result) => {
        this.reservationList.length = 0;
        this.isEmpty = true;
        if (this.isModal) {
          setTimeout(() => {
            this.closeModal(true);
          }, 1000);
        }
        console.log(result)
        setTimeout(()=>{
          this.locationTracker.startForegroundTracking(this.time);
          if (this.platform.is('android') || this.platform.is('ios')) {
            this.locationTracker.initBackgroundMode(this.time);
          }
        },100)
      },
      (err) => {
        console.log(err);
        if (err.statusText === "Unauthorized") {
          this.auth.silentLogout();
          this.login();
        }
      });
  }

  cancel() {
    this.reservationList.length = 0;
    this.closeModal(true);
  }

  closeModal(result: boolean) {
    this.viewCtrl.dismiss(result);
  }

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => { this.isLoggedIn = result; console.log(result) });
    modal.present();
  }
}
