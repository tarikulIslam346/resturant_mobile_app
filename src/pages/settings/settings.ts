import { StartPage } from './../start/start';
import { Component } from '@angular/core';
import { NavController, ModalController, Platform } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import { LoginModalPage } from '../login-modal/login-modal';
import { LocationTrackerProvider } from '../../providers/location-tracker/location-tracker';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  private form: FormGroup;
  private isReadyToSave: boolean;
  isLoggedIn: boolean;
  userId: string;
  isTracking: boolean;

  constructor(public navCtrl: NavController, public formBuilder: FormBuilder, public auth: AuthProvider, 
    public userService: UserServiceProvider, public modalCtrl: ModalController, public locationTracker: LocationTrackerProvider,
    public platform: Platform) {
    this.form = formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
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
    this.userId = localStorage.getItem('userId');
  }

  change() {
    if (this.form.value.newPassword !== this.form.value.confirmPassword) {
      this.userService.showToast('Password does not matched.', 'bottom');
      return;
    }

    let formData = new FormData();
    formData.append('user_id', this.userId);
    formData.append('current_password', this.form.value.currentPassword.trim());
    formData.append('new_password', this.form.value.newPassword.trim());

    this.userService.change(formData).then(
      (result) => {
        console.log(result)
        this.form.get('currentPassword').setValue('');
        this.form.get('newPassword').setValue('');
        this.form.get('confirmPassword').setValue('');
      },
      (err) => {
        console.log(err);
        if (err.statusText === "Unauthorized") {
          this.auth.silentLogout();
          this.login();
        }
      });
  }

  updateTrackingState() {
    if (this.isTracking) this.startTracking();
    else this.stopTracking();
  }

  startTracking() {
    this.locationTracker.startForegroundTracking("00:00");
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.locationTracker.initBackgroundMode("23:59");
    }
  }

  stopTracking() {
    this.locationTracker.stopForegroundTracking();
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.locationTracker.stopBackgorundTracking();
    }
  }

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => { this.isLoggedIn = result; console.log(result) });
    modal.present();
  }

}
