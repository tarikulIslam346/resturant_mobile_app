import { RestaurantProvider } from './../../providers/restaurant/restaurant';
import { AuthProvider } from './../../providers/auth/auth';
import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { LoginModalPage } from '../login-modal/login-modal';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import { StartPage } from '../start/start';
import { SpecialImageUrl } from '../common';
import { SpecialDetailsPage } from '../special-details/special-details';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'page-my-favourite',
  templateUrl: 'my-favourite.html',
})
export class MyFavouritePage {
  specialImgUrl: string = SpecialImageUrl;
  userId: string;
  isEmpty: boolean;
  isLoggedIn: boolean;
  favouriteList: any;
  pageNumber: number = 1;
  searching: boolean;
  searchControl: FormControl;
  food: string = '';
  refresher: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private userService: UserServiceProvider,
    private auth: AuthProvider, private modalCtrl: ModalController, private restProvider: RestaurantProvider) {
    this.searchControl = new FormControl();
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
    this.getMyFavourite();
    this.searching = true;
    this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
      this.searching = false;
      this.getMyFavourite();
    });
  }

  async doRefresh(refresher) {
    this.pageNumber = 1;
    await this.getMyFavourite();
    await refresher.complete();
  }

  onSearchInput() {
    this.searching = true;
  }

  getMyFavourite() {
    let formData = new FormData();
    formData.append('user_id', this.userId);
    formData.append('page', this.pageNumber.toString());
    formData.append('food', this.food);
    this.userService.getMyFavourite(formData)
      .then(result => {
        console.log(result)
        if (this.refresher)
          this.refresher.complete();
        if (result) {
          this.favouriteList = result['favourites'];
          this.isEmpty = Object.keys(result['favourites']).length <= 0 ? true : false;
          this.searching = false;
        }
      }, (err) => {
        console.log(err);
        if (this.refresher)
          this.refresher.complete();
        this.searching = false;
        if (err.statusText === "Unauthorized") {
          this.auth.silentLogout();
          this.login();
        }
      });
  }

  removeFavourite(speId) {
    if (!this.isLoggedIn) {
      this.restProvider.showToast('Please login first.', 'bottom');
      this.login();
      return;
    }
    let formData = new FormData();
    formData.append('spe_id', speId);
    formData.append('user_id', this.userId);
    this.restProvider.removeFavourite(formData).then(
      (result) => {
        this.getMyFavourite();
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

  removeItem(index) {
    const spe_id = this.favouriteList.splice(index, 1)[0]['spe_id'];
    this.removeFavourite(spe_id);
    this.favouriteList.splice(index, 1);
  }

  getday(days) {
    let dayArr = days.split(",");
    if (dayArr.length === 7) return "Everyday";
    else return days;
  }

  goToDetails(item) {
    item['isFavourite'] = true;
    item['fromFavourite'] = true;
    //this.navCtrl.push(SpecialDetailsPage, { special: item });
    const modal = this.modalCtrl.create(SpecialDetailsPage, { special: item });
    modal.onDidDismiss(data => { });
    modal.present();
  }

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => {
      this.isLoggedIn = result;
      this.getMyFavourite();
    });
    modal.present();
  }
}
