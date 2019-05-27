import { Component } from '@angular/core';
import { NavParams, ViewController, ModalController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { HttpClient } from '@angular/common/http';
import { LoginModalPage } from '../login-modal/login-modal';
import { Geolocation } from '@ionic-native/geolocation';

@Component({
  selector: 'page-owner-sign-up',
  templateUrl: 'owner-sign-up.html',
})
export class OwnerSignUpPage {
  form: FormGroup;
  isReadyToSave: boolean;
  isLoggedIn: boolean;
  restaurant: any;
  isManual:boolean = false;

  constructor(
    public formBuilder: FormBuilder, 
    public modalCtrl: ModalController, 
    public viewCtrl: ViewController, 
    public auth: AuthProvider,
    public http: HttpClient, 
    public navParams: NavParams,
    private geolocation: Geolocation, 
    ) {
    this.restaurant = navParams.get('restaurant');
    console.log(this.restaurant)
    if(this.restaurant=== undefined)this.isManual = true;

    let EMAILPATTERN = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    if(this.isManual === true){
      this.form = formBuilder.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        restaurant_name:['', Validators.required],
        opening:['', Validators.required],
        closing:['', Validators.required],
        street:['', Validators.required],
        city:['', Validators.required],
        postcode:['', Validators.required],
        email: new FormControl(this.email, [
          Validators.required,
          Validators.pattern(EMAILPATTERN)
        ]),
        contact: [''],
        password: new FormControl(this.password, [
          Validators.required,
          Validators.minLength(4),
        ]),
        conPassword: ['', Validators.required],
        condition: [false, Validators.requiredTrue],
        authorized: [false, Validators.requiredTrue]
      });
    }else{
      this.form = formBuilder.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: new FormControl(this.email, [
          Validators.required,
          Validators.pattern(EMAILPATTERN)
        ]),
        contact: [''],
        password: new FormControl(this.password, [
          Validators.required,
          Validators.minLength(4),
        ]),
        conPassword: ['', Validators.required],
        condition: [false, Validators.requiredTrue],
        authorized: [false, Validators.requiredTrue]
      });
    }

    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });
  }

  email() { return this.form.get('email'); }
  password() { return this.form.get('password'); }

  ionViewWillEnter() {
    this.form.get('firstName').setValue('');
    this.form.get('lastName').setValue('');
    this.form.get('email').setValue('');
    this.form.get('contact').setValue('');
    this.form.get('password').setValue('');
  }

  signUp() {
    if (this.form.value.password !== this.form.value.conPassword) {
      this.auth.showToast('Password does not matched.', 'bottom');
      return;
    }

    console.log(this.form.value);
    if(this.isManual == true){
      this.geolocation.getCurrentPosition().then((resp) => {
        let lat = resp.coords.latitude;
        let lng = resp.coords.longitude;
        let formData = new FormData();
        formData.append('first_name', this.form.value.firstName.trim());
        formData.append('last_name', this.form.value.lastName.trim());
        formData.append('email', this.form.value.email.trim());
        formData.append('contact', this.form.value.contact.trim());
        formData.append('password', this.form.value.password.trim());
        formData.append('restaurant_name', this.form.value.restaurant_name.trim());
        formData.append('opening', this.form.value.opening.trim());
        formData.append('closing', this.form.value.closing.trim());
        formData.append('address', this.form.value.street+''+this.form.value.city);
        formData.append('postcode', this.form.value.postcode.trim());
        formData.append('lat', lat.toString());
        formData.append('lng', lng.toString());
        formData.append('isManual', 'true');
        this.auth.ownerSignUp(formData).then((result) => {
          this.goToSignInPage();
        }, (err) => {
          console.log(err);
        });
      }).catch((error) => {
        console.log('Error getting location', error);
        this.auth.showToast("Error getting location.", "bottom");
      });

    }else{ 
      
    let formData = new FormData();
    formData.append('first_name', this.form.value.firstName.trim());
    formData.append('last_name', this.form.value.lastName.trim());
    formData.append('email', this.form.value.email.trim());
    formData.append('contact', this.form.value.contact.trim());
    formData.append('password', this.form.value.password.trim());
    formData.append('restaurant', JSON.stringify(this.restaurant));
      this.auth.ownerSignUp(formData).then((result) => {
        this.goToSignInPage();
      }, (err) => {
        console.log(err);
      });
    }


  }

  goToSignInPage() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss(data => {
      this.closeModal();
    });
    modal.present();
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }
}
