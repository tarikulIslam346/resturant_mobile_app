import { UserServiceProvider } from './../../providers/user-service/user-service';
import { AuthProvider } from './../../providers/auth/auth';
import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { LoginModalPage } from '../login-modal/login-modal';
import { StartPage } from '../start/start';
import { BookingDetailsPage } from '../booking-details/booking-details';

@Component({
  selector: 'page-booking-history',
  templateUrl: 'booking-history.html',
})
export class BookingHistoryPage {
  private userId: string;
  protected isEmpty: boolean;
  protected isEmpty2: boolean;
  protected isLoggedIn: boolean;
  protected todaysReservationList: any;
  protected previousReservationList: any;

  constructor(private navCtrl: NavController, private navParams: NavParams, private modalCtrl: ModalController,
    private auth: AuthProvider, private usetService: UserServiceProvider) {
  }

  ionViewCanEnter() {
    this.isLoggedIn = this.auth.isAuthorized();
    if (!this.isLoggedIn) {
      this.navCtrl.setRoot(StartPage);
      return true;
    }
  }

  ionViewWillEnter() {
    this.userId = localStorage.getItem("userId");
    setTimeout(()=>{
      this.getReservationList();
    },1000)
  }

  getReservationList() {
    this.usetService.getUserReservationList(this.userId)
      .then(result => {
        console.log(result)
        if (result) {
          this.todaysReservationList = result['todays'];
          this.previousReservationList = result['previous'];
          this.isEmpty = Object.keys(result['todays']).length <= 0 ? true : false;
          this.isEmpty2 = Object.keys(result['previous']).length <= 0 ? true : false;
        }
      }, (err) => {
        console.log(err);
        if (err.statusText === "Unauthorized") {
          this.auth.silentLogout();
          this.login();
        }
      });
  }

  itemSelected(booking, type) {
    booking['type'] = type;
    this.navCtrl.push(BookingDetailsPage, { booking: booking });
  }
  
  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => {
      this.isLoggedIn = result;
      this.getReservationList();
    });
    modal.present();
  }
}
