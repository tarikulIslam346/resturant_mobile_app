import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { CityPage } from '../city/city';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'page-advance-search',
  templateUrl: 'advance-search.html',
})
export class AdvanceSearchPage {
  userId: string;
  city: any = '';
  restaurant: string = '';
  food: string = '';
  distance: number;
  priceUpper: number;
  citySearch: FormControl;

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public navParams: NavParams, 
    public modalCtrl: ModalController) {
    this.citySearch = new FormControl();
  }

  ionViewWillEnter() {
    this.userId = localStorage.getItem("userId");
  }

  done() {
    let data = {
      'user_id': this.userId,
      'city': '',
      'restaurant': '',
      'food': '',
      'distance': '',
      'price_lower': '',
      'price_upper': ''
    };

    if(this.city)
      data['city'] = this.city; 

    if (this.food)
      data['food'] = this.food; 

    if (this.restaurant)
      data['restaurant'] = this.restaurant; 

    if (this.distance)
      data['distance'] = this.distance.toString(); 

    if (this.priceUpper) {
      data['price_lower'] = '0.01'; 
      data['price_upper'] = this.priceUpper.toString(); 
    }
    for (let key in data) {
      if (!data[key]) {
        if (key === 'price_upper')
          delete data['price_lower']
        delete data[key];
      }
    }
    this.viewCtrl.dismiss(data);
  }

  getCity() {
    const modal = this.modalCtrl.create(CityPage);
    modal.onDidDismiss((city) => {
      if (city) {
        this.city = city;
      } else {
        this.citySearch.reset();
      }
    });
    modal.present();
  }

  closeModal(result: boolean) {
    this.viewCtrl.dismiss(result);
  }

}
