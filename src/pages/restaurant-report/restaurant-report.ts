import { AuthProvider } from './../../providers/auth/auth';
import { ModalController } from 'ionic-angular';
import { RestaurantProvider } from './../../providers/restaurant/restaurant';
import { Component } from '@angular/core';
import { NavController, NavParams,Select,RadioButton } from 'ionic-angular';
import { FormControl } from '@angular/forms';
import { LoginModalPage } from '../login-modal/login-modal';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';

@Component({
  selector: 'page-restaurant-report',
  templateUrl: 'restaurant-report.html',
})
export class RestaurantReportPage {
  list: any;
  isEmpty:boolean = true;
  day: string = '';
  special: string = '';
  from: string = '';
  to: string = '';
  searching: boolean = false;
  dayControl: FormControl;
  specialControl: FormControl;
  fromControl: FormControl;
  toControl: FormControl;
  isLoggedIn: boolean;
  report: any;
  restId: string;
  refresher: any;
  pageNumber: number = 1;
  totalPages: number = 1;
  infiniteScroll: any;
  private form: FormGroup;
  days = [ "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  constructor(public navCtrl: NavController, public navParams: NavParams, public restProvider: RestaurantProvider,
    public modalCtrl: ModalController, public auth: AuthProvider) {
    this.dayControl = new FormControl();
    this.specialControl = new FormControl();
    this.fromControl = new FormControl();
    this.toControl = new FormControl();
  }

  ionViewWillEnter() {
    this.restId = localStorage.getItem("restId");
    this.getReport();
    this.dayControl.valueChanges.debounceTime(700).subscribe(search => {
      this.searching = false;
      this.getReport();
    });

    this.specialControl.valueChanges.debounceTime(700).subscribe(search => {
      this.searching = false;
      this.getReport();
    });

    this.fromControl.valueChanges.debounceTime(700).subscribe(search => {
      this.searching = false;
      this.getReport();
    });

    this.toControl.valueChanges.debounceTime(700).subscribe(search => {
      this.searching = false;
      this.getReport();
    });
  }

  openSelect(_select: Select){
    let selectInputs: RadioButton[] = _select._overlay['data']['inputs'];
    _select.registerOnChange(() => {
      this.day = _select.value;
    })
    _select.value = '';
    _select.open();
  }


  onSearchInput() {
    this.searching = true;
  }

  doRefresh(refresher) {
    this.refresher = refresher;
    this.pageNumber = 1;
    this.day = '';
    this.special = '';
    this.from = '';
    this.to = '';
    this.toControl.reset();
  }

  getReport() {
    console.log(this.from && this.to)
    if (!this.from && !this.to) {
      if (this.refresher)
        this.refresher.complete();
      if (this.infiniteScroll)
        this.infiniteScroll.complete();
      return;
    }
    
    let formData = new FormData();
    formData.append('rest_id', this.restId);
    formData.append('day', this.day);
    formData.append('special', this.special.trim());
    formData.append('from', this.from);
    formData.append('to', this.to);

    this.restProvider.getReststaurantReport(formData)
      .then(result => {
        if (this.refresher)
          this.refresher.complete();
        if (this.infiniteScroll)
          this.infiniteScroll.complete();
        console.log(result)
        if (result) {
          this.report = result['report'];
          this.totalPages = result['total_pages'];
          this.isEmpty = Object.keys(result['report']).length <= 0 ? true : false;
          this.searching = false;
        }
      }, (err) => {
        console.log(err);
        this.searching = false;
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
    this.getReport();

    if (this.pageNumber === this.totalPages) {
      infiniteScroll.enable(false);
    }
  }


  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => {
      this.isLoggedIn = result;
      this.getReport();
    });
    modal.present();
  }
}
