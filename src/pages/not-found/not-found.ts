import { SignUpChoicePage } from './../sign-up-choice/sign-up-choice';
import { AuthProvider } from './../../providers/auth/auth';
import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { LoginModalPage } from '../login-modal/login-modal';

@Component({
  selector: 'page-not-found',
  templateUrl: 'not-found.html',
})
export class NotFoundPage {

  isLoggedIn: boolean;
  userType: string = null;

  constructor(public navCtrl: NavController,public viewCtrl: ViewController,   public navParams: NavParams,
    public modalCtrl: ModalController, public auth: AuthProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NotFoundPage');
  }

  ionViewWillEnter() {
    if (this.isLoggedIn)
      this.userType = this.auth.getUser()['type'];
    console.log(this.userType)
  }

  closeModal(result: boolean) {
    this.viewCtrl.dismiss(result);
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
    this.closeModal(false);
  }

  signUpChoicePage(){
    const modal = this.modalCtrl.create(SignUpChoicePage);
    modal.onDidDismiss(data => {});
    modal.present();
    this.closeModal(false);
  }
}
