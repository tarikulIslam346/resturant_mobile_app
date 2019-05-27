import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, Events } from 'ionic-angular';
import { StartPage } from '../start/start';
import { AuthProvider } from '../../providers/auth/auth';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import { LoginModalPage } from '../login-modal/login-modal';
import { SpecialImageUrl } from '../common';

@Component({
  selector: 'page-booking-details',
  templateUrl: 'booking-details.html',
})
export class BookingDetailsPage {
  private booking: any;
  private isLoggedIn: boolean;
  isEmpty: boolean;
  bookingDetails: any;
  isCancelable: boolean;
  specialImgUrl: string = SpecialImageUrl;
  isConfirmAble: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, private auth: AuthProvider, 
    private usetService: UserServiceProvider, private modalCtrl: ModalController, public events: Events) {
    this.booking = navParams.get("booking");
    this.isConfirmAble = false;
    this.isCancelable = false;
  }

  ionViewCanEnter() {
    this.isLoggedIn = this.auth.isAuthorized();
    if (!this.isLoggedIn) {
      this.navCtrl.setRoot(StartPage);
      return true;
    }
  }

  ionViewWillEnter() {
    let userType = localStorage.getItem("userType");
    if (userType === '2') {
      this.isCancelable = false;
      this.isConfirmAble = this.booking['status'] === '1' && this.booking['type'] === 'Today';
    } else if (userType === '3') {
      this.isCancelable = this.booking['status'] === '1' && this.booking['type'] === 'Today';
      this.isConfirmAble = false;
    } else {
      this.isCancelable = false;
      this.isConfirmAble = false;
    }
    setTimeout(() => {
      this.getBookingDetails();
    }, 1000)
  }

  getBookingDetails() {
    this.usetService.getBookingDetails(this.booking['id'])
      .then(result => {
        console.log(result)
        if (result) {
          this.bookingDetails = result;
          this.isEmpty = Object.keys(result).length <= 0 ? true : false;
        }
      }, (err) => {
        console.log(err);
        if (err.statusText === "Unauthorized") {
          this.auth.silentLogout();
          this.login();
        }
      });
  }

  getTotalPrice() {
    let total = 0;
    if (this.bookingDetails) {
      this.bookingDetails.forEach(function (item) {
        total += item['qty'] * (item['price'] - item['price'] * item['discount'] / 100);
      });
    }
    return total;
  }

  cancelBooking() {
    this.isCancelable = false;
    this.usetService.cencelBooking(this.booking['id'])
      .then(result => {
        this.events.publish('booking:cancel', true, Date.now());
        console.log(result)
        this.isCancelable = false;
        setTimeout(() => {
          this.navCtrl.pop();
        }, 1000);
      }, (err) => {
        console.log(err);
        if (err.statusText === "Unauthorized") {
          this.auth.silentLogout();
          this.login();
        }
      });
  }

  confirmBooking() {
    this.isCancelable = false;
    this.usetService.confirmBooking(this.booking['id'])
      .then(result => {
        console.log(result)
        this.events.publish('booking:confirm', true, Date.now());
        setTimeout(() => {
          this.navCtrl.pop();
        }, 1000);
      }, (err) => {
        console.log(err);
        if (err.statusText === "Unauthorized") {
          this.auth.silentLogout();
          this.login();
        }
      });
  }

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => {
      this.isLoggedIn = result;
      this.getBookingDetails();
    });
    modal.present();
  }
}
