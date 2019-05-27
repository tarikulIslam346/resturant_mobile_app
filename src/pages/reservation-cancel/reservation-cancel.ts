import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, App } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { RestaurantProvider } from '../../providers/restaurant/restaurant';
import { StartPage } from '../start/start';
import { LoginModalPage } from '../login-modal/login-modal';
import { UserImageUrl } from '../common';
import { BookingDetailsPage } from '../booking-details/booking-details';

@Component({
  selector: 'page-reservation-cancel',
  templateUrl: 'reservation-cancel.html',
})
export class ReservationCancelPage {
  restId: string;
  isLoggedIn: boolean;
  reservationList: any;
  userImageUrl = UserImageUrl;
  pageNumber: number = 1;
  totalPages: number = 1;
  infiniteScroll: any;
  isEmpty: boolean;
  refresher: any;

  constructor(private navCtrl: NavController, private navParams: NavParams, private auth: AuthProvider,
    private modalCtrl: ModalController, private restProvider: RestaurantProvider, private app: App) {}

  ionViewCanEnter() {
    this.isLoggedIn = this.auth.isAuthorized();
    if (!this.isLoggedIn) {
      this.navCtrl.setRoot(StartPage);
      return true;
    }
  }

  ionViewWillEnter() {
    this.restId = localStorage.getItem("restId");
    this.getCancledReservation();
  }

  doRefresh(refresher) {
    this.refresher = refresher;
    this.pageNumber = 1;
    this.getCancledReservation();
  }

  getCancledReservation() {
    this.restProvider.getCancledReservation(this.restId, this.pageNumber).then(
      (result) => {
        if (this.refresher)
          this.refresher.complete();
        if (this.infiniteScroll)
          this.infiniteScroll.complete();
        console.log(result)
        this.reservationList = result['reservation'];
        this.isEmpty = Object.keys(result['reservation']).length <= 0 ? true : false;
        this.totalPages = result['total_pages'];
      },
      (err) => {
        console.log(err);
        if (this.refresher)
          this.refresher.complete();
        if (this.infiniteScroll)
          this.infiniteScroll.complete();
        if (err.statusText === "Unauthorized") {
          this.auth.silentLogout();
          this.login();
        }
      });
  }

  loadMore(infiniteScroll) {
    this.pageNumber++;
    this.infiniteScroll = infiniteScroll;
    this.getCancledReservation();

    if (this.pageNumber === this.totalPages) {
      infiniteScroll.enable(false);
    }
  }

  goToReservationDetails(item) {
    item['isConfirmAble'] = item['status'] === '1' ? true : false;
    this.app.getRootNav().push(BookingDetailsPage, { booking: item });
  }

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => {
      this.isLoggedIn = result;
      this.getCancledReservation();
    });
    modal.present();
  }
}
