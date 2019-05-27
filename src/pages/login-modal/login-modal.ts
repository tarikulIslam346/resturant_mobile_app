import { ForgotPasswordPage } from './../forgot-password/forgot-password';
import { ModalController, NavController } from 'ionic-angular';
import { AuthProvider } from './../../providers/auth/auth';
import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { SignUpChoicePage } from '../sign-up-choice/sign-up-choice';
import { StartPage } from '../start/start';

@Component({
  selector: 'page-login-modal',
  templateUrl: 'login-modal.html',
})
export class LoginModalPage {
  private form: FormGroup;
  private isReadyToSave: boolean;
  user: any;
  errorMessage: string;

  constructor(public formBuilder: FormBuilder, public viewCtrl: ViewController, public http: HttpClient,
    public auth: AuthProvider, public modalCtrl: ModalController, public navCtrl: NavController) {
    let EMAILPATTERN = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    this.form = formBuilder.group({
      email: new FormControl(this.email, [
        Validators.required,
        Validators.pattern(EMAILPATTERN)
      ]),
      password: ['', Validators.required]
    });

    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });
  }

  email() { return this.form.get('email'); }
  
  ionViewWillEnter() {
    this.form.get('email').setValue('');
    this.form.get('password').setValue('');
  }

  login() {
    let formData = new FormData();
    formData.append('email', this.form.value.email.trim());
    formData.append('password', this.form.value.password.trim());

    this.auth.login(formData).then((result) => {
      this.closeModal(this.auth.isAuthorized() ? true : false);
    }, (err) => {
      console.log(err);
    });
  }

  goToForgotPassword() {
    const modal = this.modalCtrl.create(ForgotPasswordPage);
    modal.onDidDismiss(()=>{
      
    });
    modal.present();
    this.closeModal(false);
  }

  goToRegisterPage(){
    const modal = this.modalCtrl.create(SignUpChoicePage);
    modal.onDidDismiss(data => {});
    modal.present();
  }

  closeModal(result: boolean) {
    this.viewCtrl.dismiss(result);
  }

}
