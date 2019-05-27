import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ActionSheetController, ModalController, ViewController, Platform, normalizeURL } from 'ionic-angular';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { RestaurantProvider } from '../../providers/restaurant/restaurant';
import { Camera } from '@ionic-native/camera';
import { StartPage } from '../start/start';
import { LoginModalPage } from '../login-modal/login-modal';

@Component({
  selector: 'page-review-image-modal',
  templateUrl: 'review-image-modal.html',
})
export class ReviewImageModalPage {
  @ViewChild('fileInput') fileInput;

  form: FormGroup;
  isReadyToSave: boolean;
  isLoggedIn: boolean;
  errorMessage: string;
  userId: string;
  files: any = [];
  restId: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder,
    private auth: AuthProvider, private actionSheetCtrl: ActionSheetController, private restProvider: RestaurantProvider,
    public modalCtrl: ModalController, private camera: Camera, public viewCtrl: ViewController, public platform: Platform) {

    this.restId = navParams.get('restId');

    this.form = formBuilder.group({
      reviewImg: [''],
      review: ['']
    });

    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });
  }

  ionViewCanEnter() {
    if (!this.auth.isAuthorized()) {
      this.navCtrl.setRoot(StartPage);
    }
    this.userId = localStorage.getItem("userId");
    this.isLoggedIn = this.auth.isAuthorized();
  }

  ionViewDidEnter() { }

  submit() {
    let formData = new FormData();
    formData.append('user_id', this.userId);
    formData.append('rest_id', this.restId);
    formData.append('review', this.form.value.review.trim());
    formData.append('image', this.files);
    this.form.reset();
    this.restProvider.addReviewImage(formData, this.userId, this.restId).then(
      (result) => {
        this.closeModal(true);
        console.log(result)
      },
      (err) => {
        console.log(err);
      });
  }

  private getPicture() {
    if (this.platform.is('cordova')) {
      this.fileInput.nativeElement.click();
      return;
    }
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Choose an option',
      buttons: [
        {
          text: 'Take a Picture',
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
                this.form.patchValue({ 'reviewImg': 'data:image/jpg;base64,' + normalizeURL(data) });
              }, (err) => {
                this.restProvider.showToast("You aren't take any picture", "bottom");
              })
            } else {
              this.fileInput.nativeElement.click();
            }
          }
        }, {
          text: 'Choose an Image',
          icon: 'images',
          handler: () => {
            ///this.fileInput.nativeElement.click();
            this.camera.getPicture({
              quality: 100,
              destinationType: this.camera.DestinationType.DATA_URL,
              encodingType: this.camera.EncodingType.JPEG,
              mediaType: this.camera.MediaType.PICTURE,
              sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
              targetWidth: 96,
              targetHeight: 96,
            }).then((data) => {
              this.form.patchValue({ 'reviewImg': 'data:image/jpg;base64,' + normalizeURL(data) });
            }, (err) => {
              //this.userService.showToast("You aren't take any picture", "bottom");
              this.fileInput.nativeElement.click();
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

  private processReviewImage(event) {
    if (event.target.value) {
      try {
        let reader = new FileReader();
        reader.onload = (readerEvent) => {
          let imageData = (readerEvent.target as any).result;
          this.form.patchValue({ 'reviewImg': imageData });
        };
        this.files = event.target.files[0];
        reader.readAsDataURL(event.target.files[0]);
      } catch (e) {
        console.log(e)
      }
    }
  }

  private getReviewImageStyle() {
    return 'url(' + this.form.controls['reviewImg'].value + ')';
  }

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => {
      this.isLoggedIn = result;
    });
    modal.present();
  }

  private closeModal(result: boolean) {
    this.viewCtrl.dismiss(result);
  }
}
