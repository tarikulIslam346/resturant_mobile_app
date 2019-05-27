import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-about-foodoli',
  templateUrl: 'about-foodoli.html',
})
export class AboutFoodoliPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutFoodoliPage');
  }

}
