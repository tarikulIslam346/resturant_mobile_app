import { ModalController, ViewController } from 'ionic-angular';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { OwnerSignUpPage } from '../owner-sign-up/owner-sign-up';

@Component({
  selector: 'page-clam-my-business',
  templateUrl: 'clam-my-business.html',
})
export class ClamMyBusinessPage {
  restaurant: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, 
    public viewCtrl: ViewController) {
    this.restaurant = navParams.get('restaurant');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClamMyBusinessPage');
  }

  clamMyBusiness() {
    const modal = this.modalCtrl.create(OwnerSignUpPage, { restaurant: this.restaurant });
    modal.onDidDismiss(data => { });
    modal.present();
  }

  closeModal(result: boolean) {
    this.viewCtrl.dismiss(result);
  }
}
