import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoadingController, ToastController, Loading } from 'ionic-angular';
import { Domain } from '../../pages/common';
import { AuthProvider } from '../auth/auth';

@Injectable()
export class UserServiceProvider {
  private loading: Loading;
  private loaderStatus: boolean;
  private reservationList: any[] = new Array();

  constructor(private loadingCtrl: LoadingController, private toastCtrl: ToastController, private http: HttpClient,
    private auth: AuthProvider) {}

  activationUser(data){
    return this._postWithOutLoader(data,'user_activation');
  }

  getUser() {
    return this._getWithOutLoader('user_info');
  }

  searchUser(data){
    return this.silentUpdate(data,'user/get_user_search')
  }

  updateLocationdata(data) {
    return this.silentUpdate(data, 'user/update_location');
  }

  setReservation(item) {
    this.reservationList.push(item);
  }

  getReservationList() {
    return this.reservationList;
  }

  getRestaurantsReservationList() {
    return this._getWithOutLoader('special/admin_reservation');
  }

  getRestaurantsReservationByRestId(data) {
    return this._postWithOutLoader(data, 'special/admin_reservation_restaurant_search');
  }

  getUserReservationList(userId) {
    return this._get('special/user_reservation_list/' + userId);
  }

  getBookingDetails(orderId) {
    return this._get('special/reservation_details/' + orderId);
  }

  getMyFavourite(data) {
    return this._postWithOutLoader(data, 'favourite_list_search');
  }

  cencelBooking(orderId) {
    return this._getWithMassage('special/reservation_cancel/' + orderId);
  }

  confirmBooking(orderId) {
    return this._getWithMassage('special/reservation_confirm/' + orderId);
  }

  update(data) {
    return this._update(data, 'user/edit_user');
  }

  change(data) {
    return this._update(data, 'user/change_password');
  }

  getPasswordResetToken(data) {
    return this._add(data, 'user/forgot_password');
  }

  submitToken(data) {
    return this._add(data, 'user/verify_token');
  }

  resetPassword(data) {
    return this._add(data, 'user/reset_password');
  }

  private _add(data, url) {
    this.showLoading();
    return new Promise((resolve, reject) => {
      this.http.post(Domain + url, data, { headers: new HttpHeaders().set('Authorization', 'Bearer ' + this.auth.getToken()) })
        .subscribe(res => {
          if (res) {
            this.showToast(res['message'], 'bottom');
          }
          this.hideLoading();
          resolve(res);
        }, (err) => {
          this.hideLoading();
          this.showToast(err.statusText, 'bottom');
          reject(err);
        });
    });
  }

  private _update(data, url) {
    this.showLoading();
    return new Promise((resolve, reject) => {
      this.http.post(Domain + url, data, { headers: new HttpHeaders().set('Authorization', 'Bearer ' + this.auth.getToken()) })
        .subscribe(res => {
          if (res) {
            this.showToast(res['message'], 'bottom');
          }
          this.hideLoading();
          resolve(res);
        }, (err) => {
          this.hideLoading();
          this.showToast(err.statusText, 'bottom');
          reject(err);
        });
    });
  }

  private _postWithOutLoader(data, url) {
    return new Promise((resolve, reject) => {
      this.http.post(Domain + url, data, { headers: new HttpHeaders().set('Authorization', 'Bearer ' + this.auth.getToken()) })
        .subscribe(res => {
          if (res) {
            this.showToast(res['message'], 'bottom');
          }
          resolve(res);
        }, (err) => {
          this.showToast(err.statusText, 'bottom');
          reject(err);
        });
    });
  }

  private silentUpdate(data, url) {
    return new Promise((resolve, reject) => {
      this.http.post(Domain + url, data, { headers: new HttpHeaders().set('Authorization', 'Bearer ' + this.auth.getToken()) })
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });
  }

  private _get(url) {
    this.showLoading();
    return new Promise((resolve, reject) => {
      console.log(Domain + url)
      this.http.get(Domain + url, { headers: new HttpHeaders().set('Authorization', 'Bearer ' + this.auth.getToken()) })
        .subscribe(res => {
          this.hideLoading();
          resolve(res);
        }, (err) => {
          this.hideLoading();
          this.showToast(err.statusText, 'bottom');
          reject(err);
        });
    });
  }

  private _getWithOutLoader(url) {
    return new Promise((resolve, reject) => {
      console.log(Domain + url)
      this.http.get(Domain + url, { headers: new HttpHeaders().set('Authorization', 'Bearer ' + this.auth.getToken()) })
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          this.showToast(err.statusText, 'bottom');
          reject(err);
        });
    });
  }

  private _getWithMassage(url) {
    this.showLoading();
    return new Promise((resolve, reject) => {
      console.log(Domain + url)
      this.http.get(Domain + url, { headers: new HttpHeaders().set('Authorization', 'Bearer ' + this.auth.getToken()) })
        .subscribe(res => {
          this.hideLoading();
          if (res) {
            this.showToast(res['message'], 'bottom');
          }
          resolve(res);
        }, (err) => {
          this.hideLoading();
          this.showToast(err.statusText, 'bottom');
          reject(err);
        });
    });
  }

  public showLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...',
      dismissOnPageChange: false
    });
    this.loading.present();
    this.loaderStatus = true;
    this.loading.onDidDismiss(() => {
      this.loaderStatus = false;
      console.log('Dismissed loading');
    });
  }

  hideLoading() {
    if (this.loaderStatus) {
      this.loading.dismiss();
    }
  }

  public showToast(msg, position) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: position
    });
    toast.present();
  }

}
