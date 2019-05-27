import { RestaurantProvider } from './../../providers/restaurant/restaurant';
import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, ActionSheetController, normalizeURL, Platform } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import { AuthProvider } from '../../providers/auth/auth';
import { StartPage } from '../start/start';
import { Camera } from '@ionic-native/camera';
import { LoginModalPage } from '../login-modal/login-modal';
import { LogoImageUrl, BannerImageUrl } from '../common';

@Component({
  selector: 'page-restaurant-logo-banner',
  templateUrl: 'restaurant-logo-banner.html',
})
export class RestaurantLogoBannerPage {
  @ViewChild('logoInput') logoInput;
  @ViewChild('bannerInput') bannerInput;

  private form: FormGroup;
  private isReadyToSave: boolean;
  private isLoggedIn: boolean;
  private errorMessage: string;
  private restId: string;
  private logoFiles: any = [];
  private bannerFiles: any = [];

  constructor(public formBuilder: FormBuilder, public navCtrl: NavController, public userService: UserServiceProvider,
    public auth: AuthProvider, public modalCtrl: ModalController, private actionSheetCtrl: ActionSheetController, 
    private camera: Camera, public restProvider: RestaurantProvider, public platform: Platform) {
    this.form = formBuilder.group({
      logo: ['', Validators.required],
      banner: ['', Validators.required]
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
    this.getLogoBanner();
  }

  getLogoBanner() {
    this.restProvider.getLogoBanner(this.restId)
      .then(result => {
        console.log(result)
        if (result[0]['logo']) {
          this.form.get('logo').setValue(LogoImageUrl + result[0]['logo']);
        }

        if (result[0]['banner']) {
          this.form.get('banner').setValue(BannerImageUrl + result[0]['banner']);
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
    console.log(this.restId)
    formData.append('rest_id', this.restId);
    formData.append('logo', this.logoFiles);
    formData.append('banner', this.bannerFiles);

    this.restProvider.updateLogoBanner(formData).then(
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

  private getLogo() {
    if (this.platform.is('cordova')) {
      this.logoInput.nativeElement.click();
      return;
    }
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Choose an option',
      buttons: [
        {
          text: 'Take a Logo',
          icon: 'camera',
          handler: () => {
            if (Camera['installed']()) {
              this.camera.getPicture({
                quality: 100,
                destinationType: this.camera.DestinationType.DATA_URL,
                encodingType: this.camera.EncodingType.JPEG,
                mediaType: this.camera.MediaType.PICTURE,
                targetWidth: 96,
                targetHeight: 96
              }).then((data) => {
                this.form.patchValue({ 'logo': 'data:image/jpg;base64,' + normalizeURL(data) });
              }, (err) => {
                this.userService.showToast("You aren't take any logo", "bottom");
              })
            } else {
              this.logoInput.nativeElement.click();
            }
          }
        }, {
          text: 'Choose an Logo',
          icon: 'images',
          handler: () => {
            this.camera.getPicture({
              quality: 100,
              destinationType: this.camera.DestinationType.DATA_URL,
              encodingType: this.camera.EncodingType.JPEG,
              mediaType: this.camera.MediaType.PICTURE,
              sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
              targetWidth: 96,
              targetHeight: 96,
            }).then((data) => {
              this.form.patchValue({ 'logo': 'data:image/jpg;base64,' + normalizeURL(data) });
            }, (err) => {
              this.logoInput.nativeElement.click();
            })
          }
        }, {
          text: 'Cancel',
          role: 'cancel',
          handler: () => { }
        }
      ]
    });
    actionSheet.present();
  }

  private getBanner() {
    if (this.platform.is('cordova')) {
      this.bannerInput.nativeElement.click();
      return;
    }
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Choose an option',
      buttons: [
        {
          text: 'Take a Banner',
          icon: 'camera',
          handler: () => {
            if (Camera['installed']()) {
              this.camera.getPicture({
                quality: 100,
                destinationType: this.camera.DestinationType.DATA_URL,
                encodingType: this.camera.EncodingType.JPEG,
                mediaType: this.camera.MediaType.PICTURE,
                targetWidth: 96,
                targetHeight: 96
              }).then((data) => {
                this.form.patchValue({ 'banner': 'data:image/jpg;base64,' + normalizeURL(data) });
              }, (err) => {
                this.userService.showToast("You aren't take any banner", "bottom");
              })
            } else {
              this.bannerInput.nativeElement.click();
            }
          }
        }, {
          text: 'Choose an Banner',
          icon: 'images',
          handler: () => {
            this.camera.getPicture({
              quality: 100,
              destinationType: this.camera.DestinationType.DATA_URL,
              encodingType: this.camera.EncodingType.JPEG,
              mediaType: this.camera.MediaType.PICTURE,
              sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
              targetWidth: 96,
              targetHeight: 96,
            }).then((data) => {
              this.form.patchValue({ 'banner': 'data:image/jpg;base64,' + normalizeURL(data) });
            }, (err) => {
              this.bannerInput.nativeElement.click();
            })
          }
        }, {
          text: 'Cancel',
          role: 'cancel',
          handler: () => { }
        }
      ]
    });
    actionSheet.present();
  }

  private processWebLogo(event) {
    if (event.target.value) {
      try {
        let reader = new FileReader();
        reader.onload = (readerEvent) => {
          let imageData = (readerEvent.target as any).result;
          this.form.patchValue({ 'logo': imageData });
        };
        this.logoFiles = event.target.files[0];
        reader.readAsDataURL(event.target.files[0]);
      } catch (e) {
        console.log(e)
      }
    }
  }

  private processWebBanner(event) {
    if (event.target.value) {
      try {
        let reader = new FileReader();
        reader.onload = (readerEvent) => {
          let imageData = (readerEvent.target as any).result;
          this.form.patchValue({ 'banner': imageData });
        };
        this.bannerFiles = event.target.files[0];
        reader.readAsDataURL(event.target.files[0]);
      } catch (e) {
        console.log(e)
      }
    }
  }

  private getLogoStyle() {
    return 'url(' + this.form.controls['logo'].value + ')';
  }

  private getBannerStyle() {
    return 'url(' + this.form.controls['banner'].value + ')';
  }

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => {
      this.isLoggedIn = result;
      this.getLogoBanner();
    });
    modal.present();
  }

}
