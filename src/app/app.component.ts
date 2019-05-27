import { UserImageUrl } from './../pages/common';
import { BookingHistoryPage } from './../pages/booking-history/booking-history';
import { AuthProvider, UserInfo } from './../providers/auth/auth';
import { TermsAndConditionsPage } from './../pages/terms-and-conditions/terms-and-conditions';
import { RestaurantInfoPage } from './../pages/restaurant-info/restaurant-info';
import { RestaurantLogoBannerPage } from './../pages/restaurant-logo-banner/restaurant-logo-banner';
import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Events, ModalController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { StartPage } from "../pages/start/start";
import {UserProfilePage} from "../pages/user-profile/user-profile";
import {FindSpecialPage} from "../pages/find-special/find-special";
import {TodaySpecialPage} from "../pages/today-special/today-special";
import { SettingsPage } from '../pages/settings/settings';
import { RestaurantSpecialPage } from '../pages/restaurant-special/restaurant-special';
import { RestaurantMenuPage } from '../pages/restaurant-menu/restaurant-menu';
import { MyReservationPage } from '../pages/my-reservation/my-reservation';
import { MyFavouritePage } from '../pages/my-favourite/my-favourite';
import { RestaurantReservationPage } from '../pages/restaurant-reservation/restaurant-reservation';
import { AdminReservationPage } from '../pages/admin-reservation/admin-reservation';
import { LoginModalPage } from '../pages/login-modal/login-modal';
import { AdminClientUserActivationPage } from '../pages/admin-client-user-activation/admin-client-user-activation';
import { AdminClientRestaurantOwnerActivationPage } from '../pages/admin-client-restaurant-owner-activation/admin-client-restaurant-owner-activation';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = StartPage;
  pages: any;
  footer: any;
  initialPages: Array<{title: string, icon: string, component: any}>;
  adminPages: Array<{title: string, icon: string, component: any}>;
  restaurantOwnerPages: Array<{title: string, icon: string, component: any}>;
  generalUserPages: Array<{title: string, icon: string, component: any}>;
  footerPages: Array<{title: string, icon: string, component: any}>;

  isLoggedIn: boolean;
  user: any;
  userImageUrl:any = UserImageUrl;
  
  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, 
    public events: Events, private auth: AuthProvider, private modalCtrl: ModalController) {
    
    this.initializeApp();

    events.subscribe('user:login', (isLoggedIn, time) => {
      this.refresh();
    });

    events.subscribe('user:update', (isLoggedIn, time) => {
      this.isLoggedIn = isLoggedIn;
      this.refresh();
    });
    
    this.initialPages = [
      { title: 'Home', icon: '', component: StartPage },
      { title: 'Today s Special', icon: '', component: TodaySpecialPage },
      { title: 'Find Special', icon: '', component: FindSpecialPage },
      //{ title: 'Search Food', icon: '', component: SearchFoodPage },
    ];

    this.footerPages = [
      { title: 'Terms & Conditions', icon: '', component: TermsAndConditionsPage },
    ];

    this.adminPages = [
      { title: 'Home', icon: '', component: StartPage },
      { title: 'Today s Special', icon: '', component: TodaySpecialPage },
      { title: 'Find Special', icon: '', component: FindSpecialPage },
      { title: 'User Activation', icon: '', component: AdminClientUserActivationPage },
      { title: 'Restaurant Owner Activation', icon: '', component: AdminClientRestaurantOwnerActivationPage },
      { title: 'Reservations', icon: '', component: AdminReservationPage },
    ];

    this.restaurantOwnerPages = [
      { title: 'Home', icon: '', component: StartPage },
      { title: 'Today s Special', icon: '', component: TodaySpecialPage },
      { title: 'Find Special', icon: '', component: FindSpecialPage },
      //{ title: 'Search Food', icon: '', component: SearchFoodPage },
      { title: 'Reservation History', icon: '', component: RestaurantReservationPage },
      { title: 'My Profile', icon: '', component: UserProfilePage },
      { title: 'Settings', icon: '', component: SettingsPage },
      { title: 'Specials', icon: '', component: RestaurantSpecialPage },
      { title: 'Menus', icon: '', component: RestaurantMenuPage },
      { title: 'Logo & Banner', icon: '', component: RestaurantLogoBannerPage },
      { title: 'Restaurant Profile', icon: '', component: RestaurantInfoPage },
    ];

    this.generalUserPages = [
      { title: 'Home', icon: '', component: StartPage },
      { title: 'Today s Special', icon: '', component: TodaySpecialPage },
      { title: 'Find Special', icon: '', component: FindSpecialPage },
      //{ title: 'Search Food', icon: '', component: SearchFoodPage },
      { title: 'My Favourite', icon: '', component: MyFavouritePage },
      { title: 'My Reservation', icon: '', component: MyReservationPage },
      { title: 'Reservation History', icon: '', component: BookingHistoryPage },
      { title: 'My Profile', icon: '', component: UserProfilePage },
      { title: 'Settings', icon: '', component: SettingsPage },
    ];

    this.refresh();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (this.statusBar)
        this.statusBar.styleDefault();
      if (this.splashScreen)
        this.splashScreen.hide();
    });
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }

  goToHome() {
    this.nav.setRoot(StartPage);
  }

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => {
      this.isLoggedIn = result;
      console.log(result)
    });
    modal.present();
  }

  logout() {
    if (this.isLoggedIn) {
      this.auth.logout().then((result) => {
        this.isLoggedIn = false;
        this.nav.setRoot(StartPage);
      }, (err) => {
        console.log(err);
        if (err.statusText === "Unauthorized") {
          this.auth.silentLogout();
        }
      });
    }
  }

  refresh() {
    this.isLoggedIn = this.auth.isAuthorized();
    if (!this.isLoggedIn) {
      this.pages = this.initialPages;
      this.footer = this.footerPages;
    } else if (this.isLoggedIn) {
      let user = JSON.parse(localStorage.getItem('user'));
      this.auth.setUser(new UserInfo(
        user['id'],
        user['client_id'],
        user['type'],
        user['rest_id'],
        user['first_name'],
        user['last_name'],
        user['email'],
        user['contact'],
        user['gender'],
        user['dob'],
        user['profile_pic']
      ));
      this.user = this.auth.getUser();
      let userType = localStorage.getItem("userType");
      switch (userType) {
        case '1':
          this.pages = this.adminPages;
          break;
        case '2':
          this.pages = this.restaurantOwnerPages;
          break;
        case '3':
          this.pages = this.generalUserPages;
          break;
        default:
          this.pages = this.initialPages;
          this.footer = this.footerPages;
        }
      } else {
        this.pages = this.initialPages;
        this.footer = this.footerPages;
    }
  }
}
