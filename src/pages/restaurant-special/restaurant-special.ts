import { Component } from '@angular/core';
import { NavController, NavParams,  ModalController } from 'ionic-angular';
import { LoginModalPage } from '../login-modal/login-modal';
import { AuthProvider } from '../../providers/auth/auth';
import { SpecialModalPage } from '../special-modal/special-modal';
import { RestaurantProvider } from '../../providers/restaurant/restaurant';
import { SpecialImageUrl } from '../../pages/common';

@Component({
  selector: 'page-restaurant-special',
  templateUrl: 'restaurant-special.html',
})
export class RestaurantSpecialPage {

  isLoggedIn: boolean;
  errorMessage: string;
  restId: string;
  public specials : any;
  specialImgUrl: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams, 
    private auth: AuthProvider, 
    public modalCtrl: ModalController,
    public restProvider: RestaurantProvider) {
      this.specialImgUrl = SpecialImageUrl;
  }

  ionViewCanEnter() {
    this.isLoggedIn = this.auth.isAuthorized();
  }

  ionViewWillEnter() {
    this.getAllSpecialOfMyResturant();
  }
  
  getAllSpecialOfMyResturant(){
    this.restId = localStorage.getItem("restId");
    this.restProvider.getSpecialListForResturant(this.restId).then(
      (result) => {
        console.log(result)
        this.specials = result;
      }, 
      (err) => {
      console.log(err);
      if (err.statusText === "Unauthorized") {
        this.auth.silentLogout();
        this.login();
      }
    });
  }

  addSpecial() {
    const modal = this.modalCtrl.create(SpecialModalPage);
    modal.onDidDismiss((result: boolean) => { 
      this.getAllSpecialOfMyResturant();
    });
    modal.present();

  }
  
  updateSpecial(speId) {
    console.log(speId)
    const modal = this.modalCtrl.create(SpecialModalPage,{ speId: speId });
    modal.onDidDismiss((result: boolean) => { 
      this.getAllSpecialOfMyResturant();
    });
    modal.present();
  }


  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => { 
      this.isLoggedIn = result; 
      this.getAllSpecialOfMyResturant();
    });
    modal.present();
  }
}
