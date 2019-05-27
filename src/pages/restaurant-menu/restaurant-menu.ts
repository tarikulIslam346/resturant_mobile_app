import { MenuModalPage } from './../menu-modal/menu-modal';
import { RestaurantProvider } from './../../providers/restaurant/restaurant';
import { StartPage } from './../start/start';
import { LoginModalPage } from './../login-modal/login-modal';
import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';

@Component({
  selector: 'page-restaurant-menu',
  templateUrl: 'restaurant-menu.html',
})

export class RestaurantMenuPage {
  isLoggedIn: boolean;
  isEmpty: boolean;
  menus: any
  restId: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, 
    public auth: AuthProvider, public restProvider: RestaurantProvider) {
    this.isEmpty = true;
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
    this.getMenuList();
  }

  getMenuList() {
    this.restProvider.getMenuList(this.restId).then(
      (result) => {
        console.log(result)
        this.isEmpty = Object.keys(result).length <= 0 ? true : false;
        this.menus = result;
        console.log(this.menus)
      },
      (err) => {
        console.log(err);
        this.isEmpty = true;
        if (err.statusText === "Unauthorized") {
          this.auth.silentLogout();
          this.login();
        }
      });
  }

  addMenuModal() {
    const modal = this.modalCtrl.create(MenuModalPage);
    modal.onDidDismiss((result: any) => {
      this.getMenuList();
    });
    modal.present();
  }

  editMenuModal(itme) {
    const modal = this.modalCtrl.create(MenuModalPage, { menu: itme });
    modal.onDidDismiss((result: any) => {
      this.getMenuList();
    });
    modal.present();
  }

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => { 
      this.isLoggedIn = result; 
      this.getMenuList();
    });
    modal.present();
  }

}
