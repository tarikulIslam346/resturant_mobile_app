import { NavController, NavParams } from "ionic-angular";
import { Component } from "@angular/core";
import { AuthProvider } from "../../providers/auth/auth";
import { StartPage } from "../start/start";
import { ReservationTodayPage } from '../reservation-today/reservation-today';
import { ReservationConfirmedPage } from "../reservation-confirmed/reservation-confirmed";
import { ReservationCancelPage } from '../reservation-cancel/reservation-cancel';
import { ReservationPendingPage } from '../reservation-pending/reservation-pending';
import { RestaurantReportPage } from "../restaurant-report/restaurant-report";

@Component({
  selector: 'page-restaurant-reservation',
  templateUrl: 'restaurant-reservation.html',
})
export class RestaurantReservationPage {
  isLoggedIn: boolean;
  restId: string;
  todaysTab: typeof ReservationTodayPage;
  confirmTab: typeof ReservationConfirmedPage;
  cancelTab: typeof ReservationCancelPage;
  pendingTab: typeof ReservationPendingPage;
  reportTab: typeof RestaurantReportPage;

  constructor(private navCtrl: NavController, private navParams: NavParams, private auth: AuthProvider) {
    this.todaysTab = ReservationTodayPage;
    this.confirmTab = ReservationConfirmedPage;
    this.cancelTab = ReservationCancelPage;
    this.pendingTab = ReservationPendingPage;
    this.reportTab = RestaurantReportPage;
  }

  ionViewCanEnter() {
    this.isLoggedIn = this.auth.isAuthorized();
    if (!this.isLoggedIn) {
      this.navCtrl.setRoot(StartPage);
      return true;
    }
  }

  ionViewWillEnter() {
    this.restId = localStorage.getItem("restId");
  }

  goBack() {
    this.navCtrl.pop();
  }
}
