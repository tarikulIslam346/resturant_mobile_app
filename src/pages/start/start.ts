import { NotFoundPage } from './../not-found/not-found';
import { Component } from '@angular/core';
import { ModalController, NavController } from 'ionic-angular';
import { RestaurantProvider } from "../../providers/restaurant/restaurant";
import { LoginModalPage } from "../login-modal/login-modal";
import { FindSpecialPage } from "../find-special/find-special";
import { AuthProvider } from '../../providers/auth/auth';
import { TodaySpecialPage } from '../today-special/today-special';
import { TermsAndConditionsPage } from '../terms-and-conditions/terms-and-conditions';
import { SearchFoodPage } from '../search-food/search-food';
import { SignUpChoicePage } from '../sign-up-choice/sign-up-choice';
import { AdminReservationPage } from '../admin-reservation/admin-reservation';
import { RestaurantReservationPage } from '../restaurant-reservation/restaurant-reservation';

@Component({
  selector: 'page-start',
  templateUrl: 'start.html',
})
export class StartPage {
  restaurants: string[];
  errorMessage: string;
  isLoggedIn: boolean;
  userType: string = null;

  constructor(public navCtrl: NavController, public modalCtrl: ModalController, public auth: AuthProvider,
     public restaurant:RestaurantProvider) {}

  ionViewCanEnter() {
    this.isLoggedIn = this.auth.isAuthorized();
  }

  ionViewWillEnter() {
    if (this.isLoggedIn)
      this.userType = this.auth.getUser()['type'];
    console.log(this.userType)
  }

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => { 
      this.isLoggedIn = result;
      if (this.isLoggedIn)
        this.userType = this.auth.getUser()['type'];
      console.log(result) 
    });
    modal.present();
  }

  logout() {
    if (this.isLoggedIn) {
      this.auth.logout().then((result) => {
        this.isLoggedIn = false;
        this.userType = null;
      }, (err) => {
        console.log(err);
        if (err.statusText === "Unauthorized") {
          this.auth.silentLogout();
          this.login();
        }
      });
    }
  }

  notFound(){
    this.navCtrl.push(NotFoundPage);
  }

  signUpChoicePage(){
    const modal = this.modalCtrl.create(SignUpChoicePage);
    modal.onDidDismiss(data => {});
    modal.present();
  }

  todaySpecials() {
    //this.navCtrl.setRoot(TodaySpecialPage);
    this.navCtrl.push(TodaySpecialPage);
  }

  findSpecials() {
    this.navCtrl.push(FindSpecialPage);
  }

  seeReport() {
    this.navCtrl.setRoot(AdminReservationPage);
  }

  seeReservation() {
    this.navCtrl.setRoot(RestaurantReservationPage);
  }

  searchFood() {
    this.navCtrl.push(SearchFoodPage);
  }

  goToTermsAndCondition() {
    this.navCtrl.push(TermsAndConditionsPage);
  }
}
