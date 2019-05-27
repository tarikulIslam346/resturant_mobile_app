import { RestaurantProvider } from './../../providers/restaurant/restaurant';
import { LoginModalPage } from './../login-modal/login-modal';
import { AuthProvider } from './../../providers/auth/auth';
import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { ReviewsImageUrl, LogoImageUrl, BannerImageUrl, UserImageUrl } from '../common';
import { ReviewModalPage } from '../review-modal/review-modal';
import { CallNumber } from '@ionic-native/call-number';

@Component({
  selector: 'page-reviews-of-restaurant',
  templateUrl: 'reviews-of-restaurant.html',
})
export class ReviewsOfRestaurantPage {
  reviewsImageUrl: string;
  logoImageUrl: string;
  bannerImageUrl: string;
  restaurant: any;
  isLoggedIn: boolean;
  restId: string;
  userId: string;
  banner: string;
  isEmpty: boolean;
  logo: string;
  reviews: any;
  userImageUrl: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private auth: AuthProvider, 
    public modalCtrl: ModalController, private restProvider: RestaurantProvider, private callNumber: CallNumber) {
    this.reviewsImageUrl = ReviewsImageUrl;
    this.logoImageUrl = LogoImageUrl;
    this.bannerImageUrl = BannerImageUrl;
    this.userImageUrl = UserImageUrl;
    this.restId = navParams.data['rest_id'];
    this.restaurant = {
      'name': '',
      'category_labels': '',
      'logo': '',
      'banner': '',
    };
  }

  ionViewCanEnter() {
    this.isLoggedIn = this.auth.isAuthorized();
  }

  ionViewWillEnter() {
    this.userId = localStorage.getItem("userId");
    this.getReviews();
  }

  getReviews() {
    this.restProvider.getReviews(this.restId).then(
      (result) => {
        console.log(result)
        this.isEmpty = Object.keys(result['reviews']).length <= 0 ? true : false;
        if (!this.isEmpty) {
          this.reviews = result['reviews'];
          this.restaurant = result['restaurant'];
          if (this.restaurant) {
            if (this.restaurant.hasOwnProperty('logo'))
              if (this.restaurant['logo'] && this.restaurant['logo'] !== 'null')
                this.logo = this.logoImageUrl + this.restaurant['logo'];
              else this.logo = 'assets/imgs/business-logo-dummy.png';

            if (this.restaurant.hasOwnProperty('banner'))
              if (this.restaurant['banner'] && this.restaurant['banner'] !== 'null')
                this.banner = this.bannerImageUrl + this.restaurant['banner'];
              else this.banner = 'assets/imgs/logo.png';
          }
        }
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

  addReviewModal() {
    const modal = this.modalCtrl.create(ReviewModalPage, { restId: this.restId});
    modal.onDidDismiss((result: any) => {
      this.getReviews();
    });
    modal.present();
  }

  getBanner() {
    return 'url(' + this.banner + ')';
  }

  callTheRestaurant(phone) {
    setTimeout(() => {
      window.open(`tel:${phone}`, '_system');
    }, 100);
  }

  login() {
    const modal = this.modalCtrl.create(LoginModalPage);
    modal.onDidDismiss((result: boolean) => {
      this.isLoggedIn = result;
      this.getReviews();
    });
    modal.present();
  }
}
