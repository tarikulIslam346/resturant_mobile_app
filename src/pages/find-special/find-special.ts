import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ModalController, Content, AlertController, PopoverController, Events } from 'ionic-angular';
import { SpecialImageUrl } from '../common';
import { RestaurantProvider } from '../../providers/restaurant/restaurant';
import { AuthProvider } from '../../providers/auth/auth';
import { SpecialDetailsPage } from '../special-details/special-details';
import { Geolocation } from '@ionic-native/geolocation';
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import { DirectionMapPage } from '../direction-map/direction-map';
import { CallNumber } from '@ionic-native/call-number';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import { AdvanceSearchPage } from '../advance-search/advance-search';
import { NotFoundPage } from '../not-found/not-found';

@Component({
  selector: 'page-find-special',
  templateUrl: 'find-special.html',
})
export class FindSpecialPage {
  @ViewChild(Content) content: Content;
  isLoggedIn: boolean;
  userId: string;
  specialList: Array<Object> = [];
  specialImgUrl: string = SpecialImageUrl;
  priceRange: any = { lower: 0, upper: 10000 };
  isEmpty: boolean;
  pageNumber: number = 1;
  loadCriteria: string = 'General';
  infiniteScroll: any;
  totalPages: number = 1;
  lat: number;
  lng: number;

  COLORS: any = {
    GREY: "#EOEOEO",
    GREEN: "#76FF03",
    YELLOW: "#FFCA28",
    RED: "#DD2C00"
  };
  searching: boolean = false;
  searchControl: FormControl;
  searchTerm: any = '';

  searchData: any = {
    'user_id': this.userId,
    'city': '',
    'restaurant': '',
    'food': '',
    'distance': '',
    'price_lower': '',
    'price_upper': ''
  };
  refresher: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private geolocation: Geolocation,
    private restProvider: RestaurantProvider, private auth: AuthProvider, private modalCtrl: ModalController,
    private callNumber: CallNumber, public alertCtrl: AlertController, public popoverCtrl: PopoverController,
    public userService: UserServiceProvider, public events: Events) {
    this.searchControl = new FormControl();
    events.subscribe('user:login', (isLoggedIn, time) => {
      this.isLoggedIn = isLoggedIn;
      if(isLoggedIn)
        this.getResult(this.searchData);
    });
  }

  ionViewCanEnter() {
    this.isLoggedIn = this.auth.isAuthorized();
    this.userId = localStorage.getItem("userId");
  }

  ionViewWillEnter() {
    this.searching = true;
    console.log(this.searchData);
    this.getResult(this.searchData);
    this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
      this.searching = false;
      if (search) {
        this.searchData['price_lower'] = 0.01;
        this.searchData['price_upper'] = parseFloat(search);
      } else {
        this.searchData['price_lower'] = '';
        this.searchData['price_upper'] = '';
      }
      this.getResult(this.searchData);
    });
  }

  checkInitialChange(item, itemIndex, items) {
    if (itemIndex == 0)
      return item.day;

    if (item.day != items[itemIndex - 1].day)
      return item.day;

    return null;
  }

  decreasePrice() {
    if (this.searchTerm > 0 || this.searchTerm) {
      this.searchTerm--;
    }
  }

  increasePrice() {
    if (this.searchTerm < 0 || !this.searchTerm) {
      this.searchTerm = 0;
    }
    this.searchTerm++;
  }

  onSearchInput() {
    this.searching = true;
  }

  doRefresh(refresher) {
    this.refresher = refresher;
    this.pageNumber = 1;
    this.searchData = {
      'user_id': '',
      'city': '',
      'restaurant': '',
      'food': '',
      'distance': '',
      'price_lower': '',
      'price_upper': ''
    };
    this.searchControl.reset();
    //this.getResult(this.searchData);
  }

  getday(days) {
    let dayArr = days.split(",");
    if (dayArr.length === 7) return "Everyday";
    else return days;
  }

  callTheRestaurant(phone) {
    setTimeout(() => {
      window.open(`tel:${phone}`, '_system');
    }, 100);
  }

  getResult(data) {
    this.searchData = data;
    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.lng = resp.coords.longitude;
      this.searching = true;
      console.log(data)
      let formData = new FormData();
      formData.append('page', this.pageNumber.toString());
      formData.append('lat', this.lat.toString());
      formData.append('lng', this.lng.toString());

      for (let key in this.searchData) {
        if (this.searchData[key]) {
          formData.append(key, this.searchData[key]);
        } else {
          delete this.searchData[key];
        }
      }
      console.log(this.searchData);
      this.restProvider.findAdvanceSearch(formData).then(
        (result) => {
          if (this.refresher)
            this.refresher.complete();
          if (this.infiniteScroll)
            this.infiniteScroll.complete();
          if (result) {
            console.log(result)
            this.specialList = result['specials'];
            this.isEmpty = Object.keys(result['specials']).length <= 0 ? true : false;
            this.totalPages = result['total_pages'];
            this.searching = false;
          }
        },
        (err) => {
          console.log(err);
          this.searching = false;
          if (this.refresher)
            this.refresher.complete();
          if (this.infiniteScroll)
            this.infiniteScroll.complete();
        });
    }).catch((error) => {
      this.searching = false;
      if (this.refresher)
        this.refresher.complete();
      if (this.infiniteScroll)
        this.infiniteScroll.complete();
      console.log('Error getting location', error);
      this.restProvider.showToast("Error getting location.", "bottom");
    });
  }

  loadMore(infiniteScroll) {
    this.pageNumber++;
    this.infiniteScroll = infiniteScroll;
    this.getResult(this.searchData);

    if (this.pageNumber === this.totalPages) {
      this.infiniteScroll.enable(false);
    }
  }

  advanceSearch() {
    const modal = this.modalCtrl.create(AdvanceSearchPage, { search: this.searchData });
    modal.onDidDismiss(data => {
      if (Object.keys(data).length > 0) {
        this.getResult(data);
      }
    });
    modal.present();
  }

  showInformation(s) {
    let alert = this.alertCtrl.create({
      title: s.name,
      message: '<strong>Cuisine:</strong> ' + s.cuisine + '<br/> ' +
        '<strong> Ethnicity:</strong> ' + s.ethnicity + '<br/>' +
        '<strong> Address:</strong> ' + s.address + ', ' + s.locality + '<br/>' +
        '<strong> Contact:</strong> ' + s.contact + '<br/>' +
        '<strong> Email:</strong> ' + s.address + '<br/>',
      cssClass: '',
      buttons: [
        /* {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }, */
        {
          text: 'Direction',
          handler: () => {
            console.log('Direction clicked');
            let modal = this.modalCtrl.create(DirectionMapPage, { restaurantSpecial: s });
            modal.onDidDismiss(result => {
              console.log(result)
            })
            modal.present();
          }
        },
        {
          text: 'Call',
          handler: () => {
            console.log('Call clicked');
            if (s.contact) {
              this.callTheRestaurant(s.contact)
            } else
              this.restProvider.showToast("No contact available.", "bottom");
          }
        }
      ]
    });
    alert.present();
  }

  addFavourite(s) {
    if (!this.isLoggedIn) {
      this.restProvider.showToast('Please login first.', 'bottom');
      this.login();
      return;
    }
    let formData = new FormData();
    formData.append('spe_id', s['spe_id']);
    formData.append('user_id', this.userId);
    this.restProvider.addFavourite(formData).then(
      (result) => {
        console.log(result)
        this.getResult(this.searchData);
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

  removeFavourite(s) {
    if (!this.isLoggedIn) {
      this.restProvider.showToast('Please login first.', 'bottom');
      this.login();
      return;
    }
    let formData = new FormData();
    formData.append('spe_id', s['spe_id']);
    formData.append('user_id', this.userId);
    this.restProvider.removeFavourite(formData).then(
      (result) => {
        console.log(result)
        this.getResult(this.searchData);
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

  addToReserveList(item) {
    if (!this.isLoggedIn) {
      this.restProvider.showToast('Please login first.', 'bottom');
      this.login();
      return;
    }
    
    let special = item;
    item['qty'] = 1;
    if (item.hasOwnProperty('spe_id')) {
      const id = item['spe_id'];
      delete item['spe_id'];
      item['id'] = id;
    }

    const checkRestIdExistence = restId => this.userService.getReservationList().some(({ rest_id }) => rest_id !== restId);
    if (!checkRestIdExistence(item['rest_id'])) {
      const checkIdExistence = itemId => this.userService.getReservationList().some(({ id }) => id == itemId);
      if (!checkIdExistence(item['id'])) {
        this.userService.setReservation(item);
        this.userService.showToast('Special added into reservation list.', 'bottom');
        this.goToDetails(special);
      } else
        this.userService.showToast('Already added.', 'bottom');
    } else
      this.userService.showToast("You can't order at a time from different restaurant.", 'bottom');
  }

  getDistanceFromLatLonInKm(lat, lon) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat - this.lat);  // deg2rad below
    var dLon = this.deg2rad(lon - this.lng);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(this.lat)) * Math.cos(this.deg2rad(lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

  isFavourite(userId): boolean {
    return +this.userId === userId;
  }

  getStartArray(rating: number) {
    let arr = [];
    for (let index = 0; index < rating; index++) {
      arr.push(index);
    }
    return arr;
  }

  isAboveRating(rating: number, index: number): boolean {
    return index > rating;
  }

  getColor(rating: number ,index: number) {
    if (this.isAboveRating(+rating, index)) {
      return this.COLORS["GREY"];
    }

    switch (+rating) {
      case 1:
      case 2:
        return this.COLORS["RED"];
      case 3:
        return this.COLORS["YELLOW"];
      case 4:
      case 5:
        return this.COLORS["GREEN"];
    
      default:
        return this.COLORS["GREY"];
    }
  }

  goToDetails(item) {
    //this.navCtrl.push(SpecialDetailsPage, { special: item });
    const modal = this.modalCtrl.create(SpecialDetailsPage, { special: item });
    modal.onDidDismiss(data => { });
    modal.present();
  }

  login() {
    const modal = this.modalCtrl.create(NotFoundPage);
    modal.onDidDismiss((result: boolean) => {});
    modal.present();
  }
}
