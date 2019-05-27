import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, App } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { RestaurantProvider } from '../../providers/restaurant/restaurant';
import { StartPage } from '../start/start';
import { LoginModalPage } from '../login-modal/login-modal';
import { UserImageUrl } from '../common';
import { BookingDetailsPage } from '../booking-details/booking-details';

@Component({
  selector: 'page-reservation-pending',
  templateUrl: 'reservation-pending.html',
})
export class ReservationPendingPage {
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
    this.getPendingReservation();
  }

  doRefresh(refresher) {
    this.refresher = refresher;
    this.pageNumber = 1;
    this.getPendingReservation();
  }

  getPendingReservation() {
    this.restProvider.getPendingReservation(this.restId, this.pageNumber).then(
      (result) => {
        if (this.refresher)
          this.refresher.complete();
        if (this.infiniteScroll)
          this.infiniteScroll.complete();
        console.log(result)
        this.reservationList = result['reservation'];
        this.isEmpty = Object.keys(result['reservation']).length <= 0 ? true : false;
        this.totalPages = result['total_pages'];
        
      console.log("Result",this.pageNumber,this.totalPages);
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
    this.getPendingReservation();

    if (this.pageNumber === this.totalPages) {
      infiniteScroll.enable(false);
    }
  }

  goToReservationDetails(item) { 
    item['isConfirmAble'] = false;
    this.app.getRootNav().push(BookingDetailsPage, { booking: item });
  }

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => {
      this.isLoggedIn = result;
      this.getPendingReservation();
    });
    modal.present();
  }
}
