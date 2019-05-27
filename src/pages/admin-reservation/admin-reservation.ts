import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { StartPage } from '../start/start';
import { LoginModalPage } from '../login-modal/login-modal';
import { AuthProvider } from '../../providers/auth/auth';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import { AdminReservationDetailsPage } from '../admin-reservation-details/admin-reservation-details';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'page-admin-reservation',
  templateUrl: 'admin-reservation.html',
})
export class AdminReservationPage {
  isLoggedIn: boolean;
  userId: string;
  list: any;
  isEmpty: boolean;
  pageNumber: number;
  totalPages: number;
  infiniteScroll: any;
  refresher: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private modalCtrl: ModalController,
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
    this.getRestaurantsReservationList();
  }

  doRefresh(refresher) {
    this.refresher = refresher;
    this.pageNumber = 1;
    this.getRestaurantsReservationList();
  }

  getRestaurantsReservationList() {
    this.usetService.getRestaurantsReservationList()
    .then(result => {
      console.log(result)
      if (this.refresher)
        this.refresher.complete();
      if (this.infiniteScroll)
        this.infiniteScroll.complete();
      if (result) {
        this.list = result['restaurant_details'];
        this.isEmpty = Object.keys(result['restaurant_details']).length <= 0 ? true : false;
      }
    }, (err) => {
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
    this.getRestaurantsReservationList();

    if (this.pageNumber === this.totalPages) {
      infiniteScroll.enable(false);
    }
  }
  
  getRestaurantReservationDetails(rest) {
    this.navCtrl.push(AdminReservationDetailsPage, {rest: rest});
  }
  
  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => {
      this.isLoggedIn = result;
      this.getRestaurantsReservationList();
    });
    modal.present();
  }
}
