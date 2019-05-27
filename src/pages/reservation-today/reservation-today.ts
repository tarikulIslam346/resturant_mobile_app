import { UserImageUrl } from './../common';
import { RestaurantProvider } from './../../providers/restaurant/restaurant';
import { NavController, NavParams, ModalController, App, Events } from "ionic-angular";
import { Component } from "@angular/core";
import { AuthProvider } from "../../providers/auth/auth";
import { StartPage } from "../start/start";
import { LoginModalPage } from "../login-modal/login-modal";
import { BookingDetailsPage } from '../booking-details/booking-details';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'page-reservation-today',
  templateUrl: 'reservation-today.html',
})
export class ReservationTodayPage {
  restId: string;
  isLoggedIn: boolean;
  reservationList: any;
  userImageUrl = UserImageUrl;
  isEmpty: boolean;
  pageNumber: number = 1;
  loadCriteria: string = 'General';
  lastSearchValue: string;
  infiniteScroll: any;
  totalPages: number = 1;
  clientId: string = '';
  searching: boolean = false;
  searchControl: FormControl;
  refresher: any;

  constructor(private navCtrl: NavController, private navParams: NavParams, private auth: AuthProvider, 
    private modalCtrl: ModalController, private restProvider: RestaurantProvider, private app: App, public events: Events) {
    this.searchControl = new FormControl();

    events.subscribe('booking:cancel', (isCancel, time) => {
      this.getTodaysReservation();
    });

    events.subscribe('booking:confirm', (isConfirm, time) => {
      this.getTodaysReservation();
    });
  }

  ionViewCanEnter() {
    console.log("ionViewWillEnter")
    this.isLoggedIn = this.auth.isAuthorized();
    if (!this.isLoggedIn) {
      this.navCtrl.setRoot(StartPage);
      return true;
    }
  }

  ionViewWillEnter() {
    this.restId = localStorage.getItem("restId");
    this.searching = true;
    this.getTodaysReservation();
    this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
      this.searching = false;
      this.getClient();
    });
  }

  doRefresh(refresher) {
    this.refresher = refresher;
    this.pageNumber = 1;
    //this.getTodaysReservation();
    this.clientId = '';
    this.searchControl.reset();
  }

  async doInfinite(infiniteScroll): Promise<any> {
    return new Promise((resolve) => {
      this.pageNumber += 1;
      this.infiniteScroll = infiniteScroll;
      if (this.totalPages >= this.pageNumber) {
        this.getTodaysReservation();
      }
    });
  }

  getTodaysReservation() {
    this.restProvider.getTodaysReservation(this.restId).then(
      (result) => {
        if (this.refresher)
          this.refresher.complete();
        if (this.infiniteScroll)
          this.infiniteScroll.complete();
        console.log(result)
        this.reservationList = result;
        this.isEmpty = Object.keys(result).length <= 0 ? true : false;
        this.searching = false;
      },
      (err) => {
        console.log(err);
        if (this.refresher)
          this.refresher.complete();
        if (this.infiniteScroll)
          this.infiniteScroll.complete();
        this.searching = false;
        if (err.statusText === "Unauthorized") {
          this.auth.silentLogout();
          this.login();
        }
      });
  }

  filterItems(searchTerm) {
    return this.reservationList.filter((item) => {
      return item.client_id.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });
  }

  onSearchInput() {
    this.searching = true;
  }

  getClient() {
    this.restProvider.getClient(this.restId, this.clientId).then(
      (result) => {
        console.log(result)
        if (this.refresher)
          this.refresher.complete();
        if (this.infiniteScroll)
          this.infiniteScroll.complete();
        this.reservationList = result;
        this.isEmpty = Object.keys(result).length <= 0 ? true : false;
        this.searching = false;
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

  goToReservationDetails(booking) {
    booking['type'] = 'Today';
    booking['isConfirmAble'] = booking['status'] === '1' ? true : false;
    this.app.getRootNav().push(BookingDetailsPage, { booking: booking });
  }

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => {
      this.isLoggedIn = result;
      this.getTodaysReservation();
    });
    modal.present();
  }
}
