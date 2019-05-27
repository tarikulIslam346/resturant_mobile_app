import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoadingController, ToastController, Loading } from 'ionic-angular';
import { Domain } from '../../pages/common';
import { AuthProvider } from '../auth/auth';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
@Injectable()
export class RestaurantProvider {
  private restaurantApi: string;
  public loading: Loading;
  loaderStatus: boolean;

  constructor(public loadingCtrl: LoadingController, public toastCtrl: ToastController, public http: HttpClient, public auth: AuthProvider) {
    console.log('Hello RestaurantProvider');
  }

  add(data) {
    return this._add(data, 'special');
  }

  reserve(data) {
    return this._add(data, 'special/reservation');
  }

  getTodaysSpecial(lat, lng, page) {
    return this._getWithOutLoader('get_today_special/' + lat + '/' + lng + '/' + page);
  }

  findSpecial(lat, lng, page) {
    return this._getWithOutLoader('find_special/' + lat + '/' + lng + '/' + page);
  }

  getTodaysSpecialSearch(lat, lng, page, search) {
    return this._getWithOutLoader('search_today_special/' + lat + '/' + lng + '/' + page + '/' + search);
  }

  findSpecialSearch(lat, lng, page, search) {
    return this._getWithOutLoader('search_find_special/' + lat + '/' + lng + '/' + page + '/' + search);
  }

  getTodaysSpecialFilter(lat, lng, page, min, max) {
    return this._getWithOutLoader('filter_today_special/' + lat + '/' + lng + '/' + page + '/' + min + '/' + max);
  }

  todaySpecialCombineSearch(lat, lng, page, search, min, max) {
    return this._getWithOutLoader('today_special_combined_search/' + lat + '/' + lng + '/' + page + '/' + search + '/' + min + '/' + max);
  }

  findSpecialFilter(lat, lng, page, min, max) {
    return this._getWithOutLoader('filter_find_special/' + lat + '/' + lng + '/' + page + '/' + min + '/' + max);
  }

  findSpecialCombineSearch(lat, lng, page, search, min, max) {
    return this._getWithOutLoader('find_special_combined_search/' + lat + '/' + lng + '/' + page + '/' + search + '/' + min + '/' + max);
  }

  getClient(restId, clientId) {
    if (clientId)
      return this._getWithOutLoader('get_client/' + restId + '/' +clientId);
    else
      return this._getWithOutLoader('special/restaurant_reservation_today/' + restId);
  }

  getReststaurantReport(data) {
    return this._postWithOutLoader(data, 'get_restaurant_report');
  }

  todatAdvanceSearch(data) {
    return this._postWithOutLoader(data, 'get_today_advanced_search');
  }

  getRestaurantOwner(data) {
    return this._postWithOutLoader(data, 'find_restaurant');
  }

  findAdvanceSearch(data) {
    return this._postWithOutLoader(data, 'get_find_special_advanced_search');
  }

  addFavourite(data) {
    return this._add(data, 'add_favourite');
  }

  removeFavourite(data) {
    return this._delete(data, 'remove_favourite');
  }

  getRestaurntById(restId, speId) {
    return this._get('get_restaurant_details/' + speId+ '/' +restId);
  }

  getSpecialByRestaurantId(restId, speId) {
    return this._get('get_restaurant_special/' + speId+ '/' +restId);
  }

  getSpecialListForResturant(restId) {
    return this._get('special_show/' + restId);
  }

  getCategoryList(restId) {
    return this._get('get_category_list/' + restId);
  }

  addCategory(restId, data) {
    return this._add(data, 'category_create/' + restId);
  }

  updateCategory(catId, data) {
    return this._update(data, 'category_update/' + catId);
  }

  getMenuList(restId) {
    return this._get('restaurant_menu_list/' + restId);
  }

  getMenuWithRestaurantDetails(restId) {
    return this._get('get_menu_with_restaurant_details/' + restId);
  }

  getReviews(restId) {
    return this._get('special/review_list/' + restId);
  }

  getReviewImages(restId) {
    return this._get('special/review_image_list/' + restId);
  }

  addReview(data, userId, restId) {
    return this._add(data, 'special/add_review/' + userId + '/' + restId);
  }

  addReviewImage(data, userId, restId) {
    return this._add(data, 'special/add_review_image/' + userId + '/' + restId);
  }

  addMenu(data) {
    return this._add(data, 'restaurant_menu_create');
  }

  updateMenu(menuId, data) {
    return this._update(data, 'restaurant_menu_update/' + menuId);
  }
  

  getLogoBanner(restId) {
    return this._get('show_logo_banner/' + restId);
  }

  getRestSpecial(speId) {
    return this._get('get_special/' + speId);
  }

  getRestInfo(restId) {
    return this._get('resturant_info/' + restId);
  }

  getTodaysReservation(restId) {
    return this._getWithOutLoader('special/restaurant_reservation_today/' + restId);
  }

  getCancledReservation(restId, page) {
    return this._getWithOutLoader('special/restaurant_reservation_cancelled/' + restId + '/' + page);
  }

  getConfirmedReservation(restId, page) {
    return this._getWithOutLoader('special/restaurant_reservation_confirmed/' + restId + '/' + page);
  }

  getPendingReservation(restId, page) {
    return this._getWithOutLoader('special/restaurant_reservation_pending/' + restId + '/' + page);
  }

  getFood(lat, lng, pageNumber, city, zipCode, foodName) {
    return this._getWithOutLoader('search_food/' + lat + '/' + lng + '/' + pageNumber + '/' + city + '/' + zipCode + '/' + foodName);
  }

  getCityList(city) {
    return this._getWithOutLoader('get_city/' + city);
  }

  updateLogoBanner(data) {
    return this._update(data, 'logo_banner_upload');
  }
  
  updateRestaurantInfo(restId, data) {
    return this._update(data, 'restaurant_update/' + restId);
  }

  updateRestSpecial(speId, data) {
    return this._update(data, 'special_update/' + speId);
  }

  getRestaurantList(url) {
    return this._getGoogle(url);
  }

  private _add(data, url) {
    this.showLoading();
    return new Promise((resolve, reject) => {
      this.http.post(Domain + url, data, { headers: new HttpHeaders().set('Authorization', 'Bearer ' + this.auth.getToken()) })
        .subscribe(res => {
          //this.showToast('Added Successfully.', 'bottom');
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

  private _update(data, url) {
    this.showLoading();
    return new Promise((resolve, reject) => {
      this.http.post(Domain + url, data, { headers: new HttpHeaders().set('Authorization', 'Bearer ' + this.auth.getToken()) })
        .subscribe(res => {
          //this.showToast('Updated Successfully.', 'bottom');
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

  private _delete(data, url) {
    // this.showLoading();
    return new Promise((resolve, reject) => {
      this.http.post(Domain + url, data, { headers: new HttpHeaders().set('Authorization', 'Bearer ' + this.auth.getToken()) })
        .subscribe(res => {
          if (res) {
            this.showToast(res['message'], 'bottom');
          }
          // this.hideLoading();
          resolve(res);
        }, (err) => {
          // this.hideLoading();
          this.showToast(err.statusText, 'bottom');
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

  private _getGoogle(url) {
    this.showLoading();
    return new Promise((resolve, reject) => {
      this.http.get(url)
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

  private hideLoading() {
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
