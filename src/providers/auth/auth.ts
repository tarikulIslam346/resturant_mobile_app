import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Domain } from '../../pages/common';
import { Loading, LoadingController, ToastController, Events } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

export class UserInfo {
  private id:string;
  private clientId:string;
  private type: string;
  private restId:number;
  private firstName:string;
  private lastName:string;
  private email:string;
  private contact:string;
  private gender:string;
  private dob:string;
  private profilePic:string;

  constructor(id: string, clientId: string, type: string, restId: number, firstName:string, lastName:string, email:string, contact:string,
              gender: string, dob:string, profilePic:string) {
    this.id = id;
    this.clientId = clientId;
    this.type = type;
    this.restId = restId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.contact = contact;
    this.gender = gender;
    this.dob = dob;
    this.profilePic = profilePic;
  }
}

@Injectable()
export class AuthProvider {
  public loading: Loading;
  isLoggedIn: boolean;
  userInfo: UserInfo;

  constructor(public loadingCtrl: LoadingController, public toastCtrl: ToastController, public http: HttpClient,
    public events: Events) {
    if (localStorage.getItem('x')) {
      this.init().subscribe(allowed => {
        if (allowed) {}
      }, error => {
        console.log(error);
      });
    }
  }

  public isAuthorized(): boolean {
    return this.isLoggedIn;
  }

  public getUser(): UserInfo {
    return this.userInfo;
  }

  setUser(user: UserInfo) {
    this.userInfo = user;
  }

  public getToken() {
    const x = localStorage.getItem('x');
    return x;
  }

  private init() {
    return Observable.create(observer => {
      try {
        let user = JSON.parse(localStorage.getItem('user'));
        this.setUser(new UserInfo(
          user['id'],
          user['client_id'],
          user['type'],
          user['rest_id'],
          user['first_name'],
          user['last_name'],
          user['email'],
          user['contact'],
          user['gender'],
          user['dob'],
          user['profile_pic']
        ));
        this.isLoggedIn = true;
        observer.next(true);
        observer.complete();
      } catch (error) {
        this.isLoggedIn = false;
        observer.next(false);
      }
    });
  }

  login2(data: any) {
    return Observable.create(observer => {
      this.showLoading();
      this.http.post(Domain + 'user/login', data, {
        headers: new HttpHeaders().set('Authorization', 'Bearer '),
      }).subscribe(res => {
        this.loading.dismissAll();
        //console.log(res)
        if (res) {
          //this.showToast('Login Successfully.', 'bottom');
          this.showToast(res['message'], 'bottom');
          this.setUser(new UserInfo(
            res['user']['id'],
            res['user']['client_id'],
            res['user']['type'],
            res['user']['rest_id'],
            res['user']['first_name'],
            res['user']['last_name'],
            res['user']['email'],
            res['user']['contact'],
            res['user']['gender'],
            res['user']['dob'],
            res['user']['profile_pic']
          ));
          localStorage.setItem('x', res['token']);
          localStorage.setItem('userId', res['user']['id']);
          localStorage.setItem('userType', res['user']['type']);
          localStorage.setItem('restId', res['user']['rest_id']);
          let user = res['user'];
          localStorage.setItem('user', JSON.stringify(user));
          this.isLoggedIn = true;
          this.events.publish('user:login', true, Date.now());
          observer.next(true);
          observer.complete();
        }
      }, err => {
        this.loading.dismissAll();
        console.log(err);
        this.events.publish('user:login', false, Date.now());
        this.showToast(err.error.error, 'bottom');
        //this.showToast('Something is wrong. Try later.', 'bottom');
        this.isLoggedIn = false;
        observer.next(false);
        observer.complete();
      });
    });
  }

  login(data) {
    this.showLoading();
    return new Promise((resolve, reject) => {
      this.http.post(Domain + 'user/login', data, {})
        .subscribe(res=> {
          this.showToast('Login Successfully.', 'bottom');
          //this.showToast(res['message'], 'bottom');
          this.loading.dismissAll();
          console.log(res)
          this.setUser(new UserInfo(
            res['user']['id'],
            res['user']['client_id'],
            res['user']['type'],
            res['user']['rest_id'],
            res['user']['first_name'],
            res['user']['last_name'],
            res['user']['email'],
            res['user']['contact'],
            res['user']['gender'],
            res['user']['dob'],
            res['user']['profile_pic']
            ));
            localStorage.setItem('x', res['token']);
            localStorage.setItem('userId', res['user']['id']);
            localStorage.setItem('userType', res['user']['type']);
            localStorage.setItem('restId', res['user']['rest_id']);
            let user = res['user'];
            localStorage.setItem('user', JSON.stringify(user));
            this.isLoggedIn = true;
            this.events.publish('user:login', true, Date.now());
          resolve(res);
        }, (err) => {
          this.loading.dismissAll();
          this.events.publish('user:login', false, Date.now());
          //this.showToast('Something is wrong. Please try later.', 'bottom');
          this.showToast(err.error.error, 'bottom');
          reject(err);
        });
    });
  }

  logout() {
    this.showLoading();
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('x');
      let formData = new FormData();
      formData.append('token', token);
      this.http.get(Domain + 'logout', { headers: new HttpHeaders().set('Authorization', 'Bearer ' + token) })
        .subscribe(res=> {
          //console.log(res)
          //this.showToast('Logout Successfully.', 'bottom');
          this.showToast(res['message'], 'bottom');
          this.loading.dismissAll();
          this.isLoggedIn = false;
          this.events.publish('user:login', false, Date.now());
          localStorage.removeItem('x');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          localStorage.removeItem('restId');
          localStorage.removeItem('reserveationList');
          resolve(res);
        }, (err) => {
          this.loading.dismissAll();
          //this.showToast("Something is wrong. Please try later.", 'bottom');
          this.showToast(err.error.error, 'bottom');
          reject(err);
        });
    });
  }

  silentLogout() {
    this.isLoggedIn = false;
    localStorage.removeItem('x');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('restId');
    this.showToast("Session expired. Please login.", 'bottom');
  }

  signUp(data) {
    this.showLoading();
    return new Promise((resolve, reject) => {
      this.http.post(Domain + 'user/register', data, {
        headers: new HttpHeaders().set('Authorization', 'my-auth-token'),
        //params: new HttpParams().set('id', '3'),
      })
        .subscribe(res => {
          //this.showToast('Please check your email.', 'bottom');
          this.showToast(res['message'], 'bottom');
          this.loading.dismissAll();
          resolve(res);
        }, (err) => {
          this.loading.dismissAll();
          //this.showToast('Something is wrong. Please try later.', 'bottom');
          this.showToast(err.error.error, 'bottom');
          reject(err);
        });
    });
  }

  ownerSignUp(data) {
    this.showLoading();
    return new Promise((resolve, reject) => {
      this.http.post(Domain + 'restaurant/owner_registration', data, {
        headers: new HttpHeaders().set('Authorization', 'my-auth-token'),
      })
        .subscribe(res => {
          this.showToast(res['message'], 'bottom');
          this.loading.dismissAll();
          resolve(res);
        }, (err) => {
          this.loading.dismissAll();
          this.showToast(err.error.error, 'bottom');
          reject(err);
        });
    });
  }

  private showLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...',
      dismissOnPageChange: true
    });
    this.loading.present();
  }

  showToast(msg, position) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: position
    });
    toast.present();
  }
}
