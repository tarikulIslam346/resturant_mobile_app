import { NavController, NavParams, ViewController, ModalController, ActionSheetController } from 'ionic-angular';
import { Component } from "@angular/core";
import { StartPage } from "../start/start";
import { AuthProvider } from '../../providers/auth/auth';
import { RestaurantProvider } from '../../providers/restaurant/restaurant';
import { LoginModalPage } from "../login-modal/login-modal";
import { CategoryModalPage } from "../category-modal/category-modal";

@Component({
    selector: 'page-list-category-modal',
    templateUrl: 'category-list-modal.html',
})
export class CategoryListModalPage {
  category: any;
  isLoggedIn: any;
  restId: string;
  isEmpty: boolean;
  categoryList: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, 
    public auth: AuthProvider, public restProvider: RestaurantProvider, public modalCtrl: ModalController, 
    public actionSheetCtrl: ActionSheetController) {
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
    
    this.getCategory();
  }

  getCategory() {
    this.restProvider.getCategoryList(this.restId).then(
      (result) => {
        console.log(result)
        this.isEmpty = Object.keys(result).length <= 0 ? true : false;
        this.categoryList = result;
        console.log(this.categoryList)
      },
      (err) => {
        console.log(err);
        this.isEmpty = true;
        if (err.statusText === "Unauthorized") {
          this.auth.silentLogout();
          this.login();
        }
      });
  }

  addNewCategoryModal() {
    const modal = this.modalCtrl.create(CategoryModalPage);
    modal.onDidDismiss((result: any) => {
      //this.getCategory();
    });
    modal.present();
  }

  editCategoriesModal(itme) {
    const modal = this.modalCtrl.create(CategoryModalPage, { category: itme });
    modal.onDidDismiss((result: any) => {
      //this.getCategory();
    });
    modal.present();
  }

  setSelectedCategory(selectedCategory) {
    //console.log(selectedCategory.id, selectedCategory.name)
    this.viewCtrl.dismiss(selectedCategory);
  }

  closeCategoryModal(result: boolean) {
    this.viewCtrl.dismiss(result);
  }

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => {
      this.isLoggedIn = result;
      this.getCategory();
    });
    modal.present();
  }
}
