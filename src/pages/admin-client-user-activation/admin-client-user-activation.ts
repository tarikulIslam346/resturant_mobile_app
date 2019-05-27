import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content, ModalController, AlertController } from 'ionic-angular';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { throttle } from 'lodash';
import { LoginModalPage } from '../login-modal/login-modal';
import { AuthProvider } from '../../providers/auth/auth';
import { UserServiceProvider } from '../../providers/user-service/user-service';


@Component({
  selector: 'page-admin-client-user-activation',
  templateUrl: 'admin-client-user-activation.html',
})
export class AdminClientUserActivationPage {

  @ViewChild('pageTop') pageTop: Content;

  /* private form: FormGroup; */
  userList: Array<Object> = [];
  pageNumber: number = 1;
  userId: string;
  searchData: any = {
    'user_id': this.userId,
    'client': '',
  };
  userData: any = {
    'user_id':'',
    'status':''
  };
  refresher: any;
  searchControl: FormControl;
  isLoggedIn: boolean;
  searching: boolean = false;
  status: boolean;
  isToggled: boolean;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public modalCtrl: ModalController, 
              private auth: AuthProvider,
              private userProvider: UserServiceProvider,
              public alertCtrl: AlertController) {
    this.searchControl = new FormControl();
    this.scrollToTop = throttle(this.scrollToTop, 500, { leading: true, trailing: false });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AdminClientUserActivationPage');
   // this.getResult(this.searchData);
  }

  ionViewCanEnter() {
    this.isLoggedIn = this.auth.isAuthorized();
    this.userId = localStorage.getItem("userId");
    //this.getResult(this.searchData);
  }

  
  ionViewWillEnter() {
    this.searching = true;
    this.getResult(this.searchData);
    this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
      this.searching = false;
      if (search) {
        this.searchData['client'] = search;

      } else {
        this.searchData['client'] = '';

      }
      this.getResult(this.searchData);
    });
  }

  isOpen(status) {
   if(status==1)
    return true ;
    else return false;
  }

  updateStatus(status,id){
    let alert = this.alertCtrl.create({
      title: 'User Activation',
      message: 'Are you sure?',
      buttons: [
        {
          text: 'Yes',
          role: 'Yes',
          handler: () => {
            console.log(status);
            if(this.isOpen(status))this.userData['status'] = 2;
            else this.userData['status'] = 1;
            this.userData['user_id'] = id;
            this.updateUserStatus(this.userData);
            // this.doRefresh(this.refresher);
            // this.refresher.complete();
          }
        },
        {
          text: 'No',
          handler: () => {
            //console.log('No clicked');
          }
        }
      ]
    });
    alert.present();
  }

  onSearchInput() {
    this.searching = true;
  }

  scrollToTop() {
    if (this.pageTop) {
      const wait = this.pageTop.isScrolling ? 1000 : 0
      setTimeout(() => {
        if (this.pageTop) {
          this.pageTop.scrollToTop(200)
        }
      }, wait);
    }
  }

  doRefresh(refresher) {
    this.refresher = refresher;
    this.pageNumber = 1;
    this.searchData = {
      'user_id': this.userId,
      'client': '',
    };
    this.getResult(this.searchData)
    //this.refresher.complete();
  }

  getResult(data) {
    this.searchData = data;
    let formData = new FormData();
    for (let key in this.searchData) {
      if (this.searchData[key]) {
        formData.append(key, this.searchData[key]);
      } else {
        delete this.searchData[key];
      }
    }
    console.log(data);
    
    this.userProvider.searchUser(formData).then(
      (result) => {
        if (this.refresher)
          this.refresher.complete();
        // if (this.infiniteScroll)
        //   this.infiniteScroll.complete();
        if (result) { 
          console.log(result)
          this.userList = result['user_info'];
          this.searching = false;
        }
      },
      (err) => {
        console.log(err);
        if (this.refresher)
          this.refresher.complete();
        // if (this.infiniteScroll)
        //   this.infiniteScroll.complete();
        this.searching = false;
      });
  }

  updateUserStatus(data) {
    this.userData = data;
    let formData = new FormData();
    for (let key in this.userData) {
      if (this.userData[key]) {
        formData.append(key, this.userData[key]);
      } else {
        delete this.userData[key];
      }
    }
    //console.log(data);
    
    this.userProvider.activationUser(formData).then(
      (result) => {
      this.doRefresh(this.refresher);
        if (this.refresher)
          this.refresher.complete();
        // if (this.infiniteScroll)
        //   this.infiniteScroll.complete();
      },
      (err) => {
        console.log(err);
        if (this.refresher)
          this.refresher.complete();
        // if (this.infiniteScroll)
        //   this.infiniteScroll.complete();
      });
  }

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => { 
      this.isLoggedIn = result; 
      //this.getAllSpecialOfMyResturant();
    });
    modal.present();
  }

}
