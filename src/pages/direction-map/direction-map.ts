import { Component, ViewChild, ElementRef } from "@angular/core";
import { GoogleMap, LatLng, GoogleMaps, GoogleMapsEvent } from "@ionic-native/google-maps";
import { NavController, NavParams, ViewController } from "ionic-angular";

@Component({
  selector: 'page-direction-map',
  templateUrl: 'direction-map.html',
})
export class DirectionMapPage {
  @ViewChild('map')
  private mapElement: ElementRef;
  private map: GoogleMap;
  private location: LatLng;
  restaurant: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
    this.restaurant = navParams.get('restaurantSpecial');
    this.location = new LatLng(parseFloat(this.restaurant['lat']), parseFloat(this.restaurant['lng']));
  }

  ionViewWillEnter() {
    console.log('ionViewDidLoad DirectionMapPage');
    this.setMap();
  }

  setMap() {
    let element = this.mapElement.nativeElement;
    this.map = GoogleMaps.create(element);

    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      let options = {
        target: this.location,
        zoom: 16
      };

      this.map.moveCamera(options);
      setTimeout(() => { this.addMarker() }, 2000);
    });
  }

  addMarker() {
    this.map.addMarker({
      title: this.restaurant['name'],
      icon: 'green',
      animation: 'DROP',
      position: {
        lat: this.restaurant['lat'],
        lng: this.restaurant['lng']
      }
    })
      .then(marker => {
        marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
          alert('Marker Clicked');
        });
      });
  }
  
  closeModal(result: boolean) {
    this.viewCtrl.dismiss(result);
  }

}
