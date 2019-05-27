import { UserImageUrl } from './../common';
import { LoginModalPage } from './../login-modal/login-modal';
import { StartPage } from './../start/start';
import { UserServiceProvider } from './../../providers/user-service/user-service';
import { Component, ViewChild } from '@angular/core';
import { Camera } from '@ionic-native/camera';
import { NavController, ModalController, ActionSheetController, normalizeURL, Platform, Events } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';

@Component({
  selector: 'page-user-profile',
  templateUrl: 'user-profile.html',
})
export class UserProfilePage {
  @ViewChild('fileInput') fileInput;

  private form: FormGroup;
  private isReadyToSave: boolean;
  isLoggedIn: boolean;
  errorMessage: string;
  userId: string;
  private files: any = [];
  
  constructor(public formBuilder: FormBuilder, public navCtrl: NavController, public userService: UserServiceProvider, 
    public auth: AuthProvider, public modalCtrl: ModalController, private actionSheetCtrl: ActionSheetController, 
    private camera: Camera, public platform: Platform, public events: Events) {
    this.form = formBuilder.group({
      profilePic: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      contact: ['', Validators.required],
      //gender: [''],
      dob: ['']
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
    this.getUser();
  }

  getUser() {
    this.userService.getUser()
      .then(user => {
        this.userId = user['id']
        this.form.get('firstName').setValue(user['first_name']);
        this.form.get('lastName').setValue(user['last_name']);
        this.form.get('email').setValue(user['email']);
        this.form.get('contact').setValue(user['contact']);
        //this.form.get('gender').setValue(user['gender']);
        this.form.get('dob').setValue(user['dob']);
        if (user['profile_pic']) {
          this.form.get('profilePic').setValue(UserImageUrl + user['profile_pic']);
        }
        localStorage.setItem('user', JSON.stringify(user));
        this.events.publish('user:update', true, Date.now());
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
    formData.append('user_id', this.userId);
    formData.append('first_name', this.form.value.firstName.trim());
    formData.append('last_name', this.form.value.lastName.trim());
    formData.append('email', this.form.value.email.trim());
    formData.append('contact', this.form.value.contact.trim());
    //formData.append('gender', this.form.value.gender);
    formData.append('dob', this.form.value.dob);
    //formData.append('password', this.form.value.password.trim());
    formData.append('image', this.files);
    this.userService.update(formData).then(
      (result) => {
        console.log(result)
        this.getUser();
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
                this.form.patchValue({ 'profilePic': 'data:image/jpg;base64,' + normalizeURL(data) });
              }, (err) => {
                this.userService.showToast("You aren't take any picture", "bottom");
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
              this.form.patchValue({ 'profilePic': 'data:image/jpg;base64,' + normalizeURL(data) });
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

  private processWebImage(event) {
    if (event.target.value) {
      try {
        let reader = new FileReader();
        reader.onload = (readerEvent) => {
          let imageData = (readerEvent.target as any).result;
          this.form.patchValue({ 'profilePic': imageData });
        };
        this.files = event.target.files[0];
        reader.readAsDataURL(event.target.files[0]);
      } catch (e) {
        console.log(e)
      }
    }
  }

  private getProfileImageStyle() {
    return 'url(' + this.form.controls['profilePic'].value + ')';
  }

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => { 
      this.isLoggedIn = result; 
      this.getUser();
    });
    modal.present();
  }

}
