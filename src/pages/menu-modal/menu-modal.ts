import { FormControl } from '@angular/forms';
import { RestaurantProvider } from './../../providers/restaurant/restaurant';
import { LoginModalPage } from './../login-modal/login-modal';
import { CategoryListModalPage } from './../category-list-modal/category-list-modal';
import { StartPage } from './../start/start';
import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';

@Component({
  selector: 'page-menu-modal',
  templateUrl: 'menu-modal.html',
})
export class MenuModalPage {
  form: FormGroup;
  isReadyToSave: boolean;
  isLoggedIn: boolean;
  restId: string;
  menu: any;
  status: FormControl;

  constructor(public navCtrl: NavController, public navParams: NavParams, private auth: AuthProvider,
    public formBuilder: FormBuilder, public viewCtrl: ViewController, public modalCtrl: ModalController, 
    public restProvider: RestaurantProvider) {
      this.status = new FormControl();
    this.form = formBuilder.group({
      menuId: [''],
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', Validators.required],
      category: ['', Validators.required],
      categoryId: [''],
      status: [false]
    });

    this.menu = navParams.get('menu');
    
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

    if (this.menu) {
      this.setMenu();
    }
  }

  setMenu() {
    this.form.get('menuId').setValue(this.menu['menu_id']);
    this.form.get('name').setValue(this.menu['name']);
    this.form.get('description').setValue(this.menu['details']);
    this.form.get('price').setValue(this.menu['price']);
    this.form.get('category').setValue(this.menu['category_name']);
    this.form.get('categoryId').setValue(this.menu['category_id']);
    this.form.get('status').setValue(this.menu['is_active']);
  }

  getCategory() {
    const modal = this.modalCtrl.create(CategoryListModalPage);
    modal.onDidDismiss((result: any) => {
      if (result) {
        this.form.get('category').setValue(result['name']);
        this.form.get('categoryId').setValue(result['id']);
      }
    });
    modal.present();
  }

  addMenu() {
    let formData = new FormData();
    formData.append('rest_id', this.restId);
    formData.append('category_id', this.form.value.categoryId);
    formData.append('name', this.form.value.name.trim());
    formData.append('details', this.form.value.description.trim());
    formData.append('price', this.form.value.price);
    const isActive = this.form.get('status').value === true ? 1 : 0;
    formData.append('is_active', <string><any>isActive);
    this.restProvider.addMenu(formData).then(
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

  updateMenu() {
    console.log(this.form.status)
    let formData = new FormData();
    //formData.append('menu_id', this.menu.id);
    formData.append('category_id', this.form.value.categoryId);
    formData.append('name', this.form.value.name.trim());
    formData.append('details', this.form.value.description.trim());
    formData.append('price', this.form.value.price);
    const isActive = this.form.get('status').value === true ? 1 : 0;
    formData.append('is_active', <string><any>isActive);
    this.restProvider.updateMenu(this.form.value.menuId, formData).then(
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

  closeMenuModal(result: boolean) {
    this.viewCtrl.dismiss(result);
  }

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => { this.isLoggedIn = result; console.log(result) });
    modal.present();
  }
}
