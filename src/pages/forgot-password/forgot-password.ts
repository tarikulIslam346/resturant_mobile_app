import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthProvider } from '../../providers/auth/auth';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import { ResetPasswordPage } from '../reset-password/reset-password';

@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})

export class ForgotPasswordPage {
  private form: FormGroup;
  private isReadyToSave: boolean;

  input: any = [
    {
      name: 'token',
      placeholder: 'Token'
    }
  ];

  inputs: any = [
    {
      name: 'email',
      placeholder: 'Email'
    }, {
      name: 'token',
      placeholder: 'Token'
    }
  ];

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController,
    public formBuilder: FormBuilder, public auth: AuthProvider, public userService: UserServiceProvider, 
    public alertCtrl: AlertController, public modalCtrl: ModalController) {
    this.form = formBuilder.group({
      email: ['', Validators.required]
    });
    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });
  }

  ionViewDidEnter() {
    //this.getToken();
  }

  setToken() {
    this.getToken(this.inputs);
  }

  getToken(inputs) {
    const prompt = this.alertCtrl.create({
      title: 'Token',
      message: "Enter a your token.",
      inputs: inputs,
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Submit',
          handler: data => {
            console.log(data);
            if(data.email)
              this.form.get('email').setValue(data.email);

            let formData = new FormData();
            formData.append('email', this.form.value.email.trim());
            formData.append('token', data.token);
            this.userService.submitToken(formData).then((result)=>{
              console.log(result)
              if(result) {
                if(result['success'] === true) {
                  const modal = this.modalCtrl.create(ResetPasswordPage, {email: this.form.value.email.trim()});
                  modal.onDidDismiss(data => {
                    console.log(data);
                  });
                  modal.present();
                  this.closeModal(true);
                }
              }
            }).catch((err)=>{
              console.error(err);
            });
          }
        }
      ]
    });
    prompt.present();
  }

  getEmailForToken() {
    let formData = new FormData();
    formData.append('email', this.form.value.email.trim());
    console.log(this.form.get('email').value);
    this.userService.getPasswordResetToken(formData).then((result)=>{
      console.log(result)
      if(result) {
        if(result['success'] === true) {
          this.getToken(this.input);
        }
      }
    }).catch((err)=>{
      console.error(err);
    });
  }

  closeModal(result: boolean) {
    this.viewCtrl.dismiss(result);
  }
}
