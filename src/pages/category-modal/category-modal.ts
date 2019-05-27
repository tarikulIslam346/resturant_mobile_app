import { NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { Component } from "@angular/core";
import { AuthProvider } from '../../providers/auth/auth';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { StartPage } from '../start/start';
import { RestaurantProvider } from '../../providers/restaurant/restaurant';
import { LoginModalPage } from '../login-modal/login-modal';

@Component({
  selector: 'page-category-modal',
  templateUrl: 'category-modal.html',
})
export class CategoryModalPage {
  private form: FormGroup;
  private isReadyToSave: boolean;
  isLoggedIn: boolean;
  restId: string;
  category: any;
  catId: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public auth: AuthProvider, 
    public viewCtrl: ViewController, public formBuilder: FormBuilder, public restProvider: RestaurantProvider,
    public modalCtrl: ModalController) {
    this.form = formBuilder.group({
      categoryId: [''],
      name: ['', Validators.required],
    });

    this.category = navParams.get('category');
    console.log(navParams.get('category'));

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

    if (this.category) {
      console.log(this.category)
      this.setCategory();
    }
  }

  setCategory() {
    this.form.get('categoryId').setValue(this.category['id']);
    this.form.get('name').setValue(this.category['name']);
  }

  addCategory() {
    let formData = new FormData();
    //formData.append('rest_id', this.restId);
    formData.append('name', this.form.value.name.trim());
    this.restProvider.addCategory(this.restId, formData).then(
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

  updateCategory() {
    let formData = new FormData();
    //formData.append('cat_id', this.catId);
    formData.append('name', this.form.value.name.trim());
    this.restProvider.updateCategory(this.form.value.categoryId, formData).then(
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

  closeNewModal(result: boolean) {
    this.viewCtrl.dismiss(result);
  }

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => { this.isLoggedIn = result; console.log(result) });
    modal.present();
  }
}
