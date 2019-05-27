import { Component,ViewChild, QueryList } from '@angular/core';
import { NavController, NavParams, Select,RadioButton, ViewController, ModalController, ActionSheetController, normalizeURL, Platform} from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { StartPage } from './../start/start';
import { RestaurantProvider } from '../../providers/restaurant/restaurant';
import { Camera } from '@ionic-native/camera';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { LoginModalPage } from '../login-modal/login-modal';
import { SpecialImageUrl } from '../../pages/common';

@Component({
  selector: 'page-special-modal',
  templateUrl: 'special-modal.html',
})
export class SpecialModalPage {

  @ViewChild('myselect') selectGroup: QueryList<Select>;
  @ViewChild('fileInput') fileInput;

  private form: FormGroup;
  private isReadyToSave: boolean;
  isLoggedIn: boolean;
  errorMessage: string;
  restId: string;
  speId: number;
  private files: any = [];
  optionsList: any;
  days = [ "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  allSelected: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController, 
    public modalCtrl:ModalController,
    private auth: AuthProvider,
    public formBuilder: FormBuilder, 
    private camera: Camera, public actionSheetCtrl: ActionSheetController, private restProvider: RestaurantProvider,
    public platform: Platform) {
      this.form = formBuilder.group({
        specialPic: [''],
        title: ['', Validators.required],
        description: ['', Validators.required],
        price: ['', Validators.required],
        discount: ['', Validators.required],
        for: ['', Validators.required],
        available: ['', Validators.required],
        status: [false, Validators.required]
      });
      
    this.allSelected = false;
    this.speId = navParams.get('speId');
    console.log(navParams.get('speId'));
    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });
  }

  openSelect(_select: Select){
    let selectInputs: RadioButton[] = _select._overlay['data']['inputs'];
    _select.registerOnChange(() => {
      if(_select.value[0] === "All") {
        _select.value.splice(0,1)
      }
      this.form.get('available').setValue(_select.value);
      console.log(_select.value);
    })
    _select.value = [];
    selectInputs.map((array) => {
      array.checked = false;
    })
    _select.open();
  }

  selectAll(_select: Select){
    let selectInputs: RadioButton[] = _select._overlay['data']['inputs'];
    if (this.allSelected) {
      selectInputs.map((array) => {
        array.checked = false;
        this.allSelected = false;
      });
    } else {
      selectInputs.map((array) => {
        array.checked = true;
        this.allSelected = true;
      });
    }
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

    if(this.speId) {
      console.log(this.speId)
      this.getSpecialDetails();
    }
  }

  closeModal(result: boolean) {
    this.viewCtrl.dismiss(result);
  }

  getSpecialDetails(){
    this.restProvider.getRestSpecial(this.speId)
    .then(result => {
      console.log(result)
      if (result[0]) {
        this.form.get('title').setValue(result[0]['title']);
        this.form.get('description').setValue(result[0]['description']);
        this.form.get('price').setValue(result[0]['price']);
        this.form.get('discount').setValue(result[0]['discount']);
        this.form.get('for').setValue(result[0]['for']);
        this.form.get('available').setValue(result[0]['available'].split(","));
        this.form.get('status').setValue(result[0]['status']); // === 1? "VALID":"INVALID"
        this.form.get('specialPic').setValue(SpecialImageUrl + result[0]['image']);
      }
    }, (err) => {
      console.log(err);
      if (err.statusText === "Unauthorized") {
        this.auth.silentLogout();
        this.login();
      }
    });
  }

  addSpecial() {
    let formData = new FormData();
    formData.append('rest_id', this.restId);
    formData.append('title', this.form.value.title.trim());
    formData.append('description', this.form.value.description.trim());
    formData.append('price', this.form.value.price.trim());
    formData.append('discount', this.form.value.discount.trim());
    formData.append('for', this.form.value.for.trim());
    formData.append('available', this.form.value.available.toString());
    const isActive = this.form.get('status').value === true ? 1 : 0;
    formData.append('status',  <string><any>isActive);
    formData.append('image', this.files);
    this.restProvider.add(formData).then(
      (result) => {
        console.log(result)
        this.form.reset();
      }, 
      (err) => {
      console.log(err);
      if (err.statusText === "Unauthorized") {
        this.auth.silentLogout();
        this.login();
      }
    });
  }

  updateSpecial() {
    let formData = new FormData();
    formData.append('title', this.form.value.title.trim());
    formData.append('description', this.form.value.description.trim());
    formData.append('price', this.form.value.price);
    formData.append('discount', this.form.value.discount);
    formData.append('for', this.form.value.for.trim());
    formData.append('available', this.form.value.available.toString());
    const isActive = this.form.get('status').value === true ? 1 : 0;
    formData.append('status', <string><any>isActive);
    formData.append('image', this.files);
    this.restProvider.updateRestSpecial(this.speId, formData).then(
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

  /* image upload functionality */
  getSpecial() {
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
                this.form.patchValue({ 'specialPic': 'data:image/jpg;base64,' + normalizeURL(data) });
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
            this.camera.getPicture({
              quality: 100,
              destinationType: this.camera.DestinationType.DATA_URL,
              encodingType: this.camera.EncodingType.JPEG,
              mediaType: this.camera.MediaType.PICTURE,
              sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
              targetWidth: 96,
              targetHeight: 96,
            }).then((data) => {
              this.form.patchValue({ 'specialPic': 'data:image/jpg;base64,' + normalizeURL(data) });
            }, (err) => {
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
  processWebImage(event) {
    if (event.target.value) {
      try {
        let reader = new FileReader();
        reader.onload = (readerEvent) => {
          let imageData = (readerEvent.target as any).result;
          this.form.patchValue({ 'specialPic': imageData });
        };
        this.files = event.target.files[0];
        reader.readAsDataURL(event.target.files[0]);
      } catch (e) {
        console.log(e)
      }
    }
  }
  getSpecialImageStyle() {
    return 'url(' + this.form.controls['specialPic'].value + ')'
  }
  
  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => { this.isLoggedIn = result; console.log(result) });
    modal.present();
  }
}
