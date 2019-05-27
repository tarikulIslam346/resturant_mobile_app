import { AuthProvider } from './../../providers/auth/auth';
import { ViewChild, Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { RestaurantProvider } from '../../providers/restaurant/restaurant';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'page-city',
  templateUrl: 'city.html',
})
export class CityPage {
  isEmpty: boolean;
  cityList: any;
  isLoggedIn: boolean;

  @ViewChild('search') searchInput;
  searching: boolean = false;
  searchControl: FormControl;
  searchTerm: any = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, 
    public restProvider: RestaurantProvider, public auth: AuthProvider) {
    this.isEmpty = true;
    this.searchControl = new FormControl();
  }

  ionViewWillEnter() {
    /* setTimeout(() => {
      this.searchInput.setFocus();
    }, 150); */
    this.searching = false;
    this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
      this.searching = false;
      this.getCity();
    });
  }

  onSearchInput() {
    this.searching = true;
  }

  onClearInput() {
    this.searchControl.reset();
    this.cityList = {};
    this.isEmpty = true;
  }

  getCity() {
    console.log(this.searchTerm)
    if(!this.searchTerm) return;
    if (this.searchTerm.length < 4) {
      //this.restProvider.showToast("Minimum 4 letter", "bottom");
      return;
    }
    this.restProvider.getCityList(this.searchTerm).then(
      (result) => {
        console.log(result)
        this.isEmpty = Object.keys(result).length <= 0 ? true : false;
        this.cityList = result;
      },
      (err) => {
        console.log(err);
        this.isEmpty = true;
      });
  }

  setCity(city) {
    console.log(city.id, city.name)
    this.viewCtrl.dismiss(city.name);
  }

  closeModal() {
    this.viewCtrl.dismiss(undefined);
  }
}
