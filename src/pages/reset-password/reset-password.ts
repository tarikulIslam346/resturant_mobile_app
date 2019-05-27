import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { UserServiceProvider } from '../../providers/user-service/user-service';

@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html',
})
export class ResetPasswordPage {
  email: any;
  form: FormGroup;
  isReadyToSave: boolean;
  showPass: boolean;
  type: string;
  showConfirmPass: boolean;
  confirmPassType: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, 
    public formBuilder: FormBuilder, public auth: AuthProvider, public userService: UserServiceProvider,) {
    this.email = this.navParams.get('email');

    this.form = formBuilder.group({
      //email: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });

    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });

    this.showPass = false;
    this.showConfirmPass = false;
    this.type = 'password';
    this.confirmPassType = 'password';  
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResetPasswordPage');
  }

  showPassword() {
    this.showPass = !this.showPass;
    if(this.showPass) {
      this.type = 'text';
    } else {
      this.type = 'password';
    }
  }

  showConfirmPassword() {
    this.showConfirmPass = !this.showConfirmPass;
    if(this.showConfirmPass) {
      this.confirmPassType = 'text';
    } else {
      this.confirmPassType = 'password';
    }
  }
  
  resetPassword() {
    if (this.form.value.password !== this.form.value.confirmPassword) {
      this.userService.showToast('Password does not matched.', 'bottom');
      return;
    }
    let formData = new FormData();
    formData.append('email', this.email);
    formData.append('password', this.form.value.password.trim());
    formData.append('confirmPassword', this.form.value.confirmPassword.trim());
    this.userService.resetPassword(formData).then((result)=>{
      console.log(result)
      if(result) {
        if(result['success'] === true) {
          this.closeModal(true);
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
