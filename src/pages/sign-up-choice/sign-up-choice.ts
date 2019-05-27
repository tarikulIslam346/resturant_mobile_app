import { SignUpModalPage } from "../sign-up-modal/sign-up-modal";
import { ModalController, ViewController } from 'ionic-angular';
import { AuthProvider } from './../../providers/auth/auth';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FindRestaurantPage } from "../find-restaurant/find-restaurant";

@Component({
  selector: 'page-sign-up-choice',
  templateUrl: 'sign-up-choice.html',
})
export class SignUpChoicePage {
  isLoggedIn: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public auth: AuthProvider, 
    public modalCtrl: ModalController, public viewCtrl: ViewController) {
  }

  ionViewCanEnter() {
    this.isLoggedIn = this.auth.isAuthorized();
  }

  ionViewWillEnter() {}

  signUp() {
    const modal = this.modalCtrl.create(SignUpModalPage);
    modal.onDidDismiss(data => {
      this.closeModal(false);
    });
    modal.present();
    this.closeModal(false);
  }

  ownerSignUp() {
    const modal = this.modalCtrl.create(FindRestaurantPage);
    modal.onDidDismiss(data => {
      this.closeModal(false);
    });
    modal.present();
    this.closeModal(false);
  }

  closeModal(result: boolean) {
    this.viewCtrl.dismiss(result);
  }
}
