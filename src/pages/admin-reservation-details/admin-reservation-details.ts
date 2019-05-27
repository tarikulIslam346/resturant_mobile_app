import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { StartPage } from '../start/start';
import { LoginModalPage } from '../login-modal/login-modal';
import { AuthProvider } from '../../providers/auth/auth';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'page-admin-reservation-details',
  templateUrl: 'admin-reservation-details.html',
})
export class AdminReservationDetailsPage {
  restId: string;
  restaurant: any;
  isLoggedIn: boolean;
  isEmpty: boolean;
  list: any;
  refresher: any;
  infiniteScroll: any;
  searching: boolean;

  searchFromControl: FormControl;
  searchToControl: FormControl;
  searchData: any = {
    'from': '',
    'to': ''
  };
  pageNumber: number = 1;
  totalPages: number = 1;
  from: any = '';
  to: any = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, private modalCtrl:ModalController, 
    private auth:AuthProvider, private usetService:UserServiceProvider) {
      this.restaurant = this.navParams.get('rest');
      this.restId = this.restaurant['id'];

    this.searchFromControl = new FormControl();
    this.searchToControl = new FormControl();
  }

  ionViewCanEnter() {
    this.isLoggedIn = this.auth.isAuthorized();
    if (!this.isLoggedIn) {
      this.navCtrl.setRoot(StartPage);
      return true;
    }
  }

  initSearch() {
    this.searching = false;
    if (this.from && this.to) {
      this.searchData['from'] = this.from;
      this.searchData['to'] = this.to;
      this.getRestaurantsReservationByRestId();
    }

    if (!this.from && !this.to) {
      this.searchData['restaurant'] = '';
      this.searchData['food'] = '';
      this.getRestaurantsReservationByRestId();
    }
  }

  ionViewWillEnter() {
    this.searching = true;
    console.log(this.searchData);
    this.getRestaurantsReservationByRestId();
    this.searchFromControl.valueChanges.debounceTime(700).subscribe(search => {
      this.initSearch()
    });
    this.searchToControl.valueChanges.debounceTime(700).subscribe(search => {
      this.initSearch()
    });
  }

  onSearchInput() {
    this.searching = true;
  }

  doRefresh(refresher) {
    this.refresher = refresher;
    this.pageNumber = 1;
    this.searchData = {
      'from': '',
      'to': '',
    };
    this.searchFromControl.reset();
    this.searchToControl.reset();
  }
  
  getRestaurantsReservationByRestId() {
    let formData = new FormData();
    formData.append('page', this.pageNumber.toString());
    formData.append('rest_id', this.restId);
    formData.append('from', this.searchData['from']);
    formData.append('to', this.searchData['to']);
    this.usetService.getRestaurantsReservationByRestId(formData)
    .then(result => {
      if (this.refresher)
        this.refresher.complete();
      if (this.infiniteScroll)
        this.infiniteScroll.complete();
      console.log(result)
      if (result) {
        this.list = result['orders'];
        this.isEmpty = Object.keys(result['orders']).length <= 0 ? true : false;
      }
    }, (err) => {
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

  loadMore(infiniteScroll) {
    this.pageNumber++;
    this.infiniteScroll = infiniteScroll;
    this.getRestaurantsReservationByRestId();

    if (this.pageNumber === this.totalPages) {
      infiniteScroll.enable(false);
    }
  }

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => {
      this.isLoggedIn = result;
      this.getRestaurantsReservationByRestId();
    });
    modal.present();
  }

}
