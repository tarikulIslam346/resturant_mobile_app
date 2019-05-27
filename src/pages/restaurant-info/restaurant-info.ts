import { LoginModalPage } from './../login-modal/login-modal';
import { RestaurantProvider } from './../../providers/restaurant/restaurant';
import { Component } from '@angular/core';
import { ViewController, NavController, ModalController } from 'ionic-angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { HttpClient } from '@angular/common/http';
import { StartPage } from '../start/start';

@Component({
  selector: 'page-restaurant-info',
  templateUrl: 'restaurant-info.html',
})
export class RestaurantInfoPage {
  form: FormGroup;
  isReadyToSave: boolean;
  isLoggedIn: boolean;
  restId: string;

  constructor(public formBuilder: FormBuilder, public viewCtrl: ViewController, public auth: AuthProvider, 
    public http: HttpClient, public restProvider: RestaurantProvider, public navCtrl: NavController, 
    public modalCtrl: ModalController) {
    this.form = formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required],
      ethnicity: ['', Validators.required],
      foodCategory: ['', Validators.required],
      restaurantCategory: ['', Validators.required],
      cuisine: ['', Validators.required],
      opening: ['', Validators.required],
      closing: ['', Validators.required],
      address: ['', Validators.required],
      postcode: ['', Validators.required],
      locality: ['', Validators.required],
      region: ['', Validators.required],
      contact: ['', Validators.required],
      email: ['', Validators.required],
      web: ['', Validators.required],
    });

    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });
  }

  ionViewCanEnter() {
    this.isLoggedIn = this.auth.isAuthorized();
    if (!this.isLoggedIn) {
      this.navCtrl.setRoot(StartPage);
      return true;
    }
  }

  ionViewWillEnter() {
    this.restId = localStorage.getItem("restId");
    this.getRestInfo();
  }

  getRestInfo() {
    this.restProvider.getRestInfo(this.restId)
      .then(result => {
        console.log(result)
        if (result[0]) {
          this.form.get('name').setValue(result[0]['name']);
          this.form.get('description').setValue(result[0]['description']);
          this.form.get('type').setValue(result[0]['type']);
          this.form.get('ethnicity').setValue(result[0]['ethnicity']);
          this.form.get('foodCategory').setValue(result[0]['category']);
          this.form.get('restaurantCategory').setValue(result[0]['category_labels']);
          this.form.get('cuisine').setValue(result[0]['cuisine']);
          this.form.get('opening').setValue(result[0]['opening']);
          this.form.get('closing').setValue(result[0]['closing']);
          this.form.get('address').setValue(result[0]['address']);
          this.form.get('postcode').setValue(result[0]['postcode']);
          this.form.get('locality').setValue(result[0]['locality']);
          this.form.get('region').setValue(result[0]['region']);
          this.form.get('contact').setValue(result[0]['contact']);
          this.form.get('email').setValue(result[0]['email']);
          this.form.get('web').setValue(result[0]['web']);
        }
      }, (err) => {
        console.log(err);
        if (err.statusText === "Unauthorized") {
          this.auth.silentLogout();
          this.login();
        }
      });
  }

  update() {
    let formData = new FormData();
    formData.append('name', this.form.value.name.trim());
    formData.append('description', this.form.value.description.trim());
    formData.append('type', this.form.value.type.trim());
    formData.append('ethnicity', this.form.value.ethnicity.trim());
    formData.append('category', this.form.value.foodCategory.trim());
    formData.append('category_labels', this.form.value.restaurantCategory.trim());
    formData.append('cuisine', this.form.value.cuisine.trim());
    formData.append('opening', this.form.value.opening.trim());
    formData.append('closing', this.form.value.closing.trim());
    formData.append('address', this.form.value.address.trim());
    formData.append('postcode', this.form.value.postcode.trim());
    formData.append('locality', this.form.value.locality.trim());
    formData.append('region', this.form.value.region.trim());
    formData.append('contact', this.form.value.contact.trim());
    formData.append('email', this.form.value.email.trim());
    formData.append('web', this.form.value.web.trim());
    this.restProvider.updateRestaurantInfo(this.restId, formData).then(
      (result) => {
        console.log(result)
      },
      (err) => {
        console.log(err);
        if (err.statusText === "Unauthorized") {
          this.auth.silentLogout();
          this.login();
        }
      });
  }

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => {
      this.isLoggedIn = result;
      this.getRestInfo();
    });
    modal.present();
  }

}
