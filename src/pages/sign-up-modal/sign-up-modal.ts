import { LoginModalPage } from './../login-modal/login-modal';
import { Component } from '@angular/core';
import { ViewController, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { AuthProvider } from '../../providers/auth/auth';

@Component({
  selector: 'page-sign-up-modal',
  templateUrl: 'sign-up-modal.html',
})
export class SignUpModalPage {
  form: FormGroup;
  isReadyToSave: boolean;
  isLoggedIn: boolean;

  constructor(public formBuilder: FormBuilder, public modalCtrl: ModalController, public viewCtrl: ViewController, public auth: AuthProvider, 
    public http: HttpClient) {
    let EMAILPATTERN = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    this.form = formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: new FormControl(this.email, [
        Validators.required,
        Validators.pattern(EMAILPATTERN)
      ]),
      contact: [''],
      dob: [''],
      password: new FormControl(this.password, [
        Validators.required,
        Validators.minLength(4),
      ]),
      conPassword: ['', Validators.required],
      condition: [false, Validators.requiredTrue]
    });

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
    this.form.get('dob').setValue('');
    this.form.get('password').setValue('');
  }

  signUp() {
    if (this.form.value.password !== this.form.value.conPassword) {
      this.auth.showToast('Password does not matched.', 'bottom');
      return;
    }

    let formData = new FormData();
    formData.append('first_name', this.form.value.firstName.trim());
    formData.append('last_name', this.form.value.lastName.trim());
    formData.append('email', this.form.value.email.trim());
    formData.append('contact', this.form.value.contact.trim());
    formData.append('dob', this.form.value.contact.trim());
    formData.append('password', this.form.value.password.trim());

    this.auth.signUp(formData).then((result) => {
      this.goToSignInPage();
      //this.closeModal();
    }, (err) => {
      console.log(err);
    });
  }

  goToSignInPage(){
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss(data => {
      this.closeModal();
    });
    modal.present();
    this.closeModal();
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }
}
