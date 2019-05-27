import { PaymentPage } from './../pages/payment/payment';
import { ClamMyBusinessPage } from './../pages/clam-my-business/clam-my-business';
import { OwnerSignUpPage } from './../pages/owner-sign-up/owner-sign-up';
import { FindRestaurantPage } from './../pages/find-restaurant/find-restaurant';
import { ReservationTodayPage } from './../pages/reservation-today/reservation-today';
import { CategoryModalPage } from './../pages/category-modal/category-modal';
import { SpecialModalPage } from './../pages/special-modal/special-modal';
import { RestaurantMenuPage } from './../pages/restaurant-menu/restaurant-menu';
import { Camera } from '@ionic-native/camera';
import { AuthProvider } from './../providers/auth/auth';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StartPage } from "../pages/start/start";
import { HttpClientModule } from "@angular/common/http";
import { RestaurantProvider } from "../providers/restaurant/restaurant";
import { SignUpModalPage } from "../pages/sign-up-modal/sign-up-modal";
import { LoginModalPage } from "../pages/login-modal/login-modal";
import { UserProfilePage } from "../pages/user-profile/user-profile";
import { TodaySpecialPage } from "../pages/today-special/today-special";
import { FindSpecialPage } from "../pages/find-special/find-special";
import { UserServiceProvider } from '../providers/user-service/user-service';
import { SettingsPage } from '../pages/settings/settings';
import { BookingHistoryPage } from '../pages/booking-history/booking-history';
import { RestaurantInfoPage } from '../pages/restaurant-info/restaurant-info';
import { RestaurantLogoBannerPage } from '../pages/restaurant-logo-banner/restaurant-logo-banner';
import { RestaurantSpecialPage } from '../pages/restaurant-special/restaurant-special';
import { TermsAndConditionsPage } from '../pages/terms-and-conditions/terms-and-conditions';
import { CategoryListModalPage } from '../pages/category-list-modal/category-list-modal';
import { MenuModalPage } from '../pages/menu-modal/menu-modal';
import { Geolocation } from '@ionic-native/geolocation';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { SpecialDetailsPage } from '../pages/special-details/special-details';
import { SpecialsOfRestaurantPage } from '../pages/specials-of-restaurant/specials-of-restaurant';
import { MenusOfRestaurantPage } from '../pages/menus-of-restaurant/menus-of-restaurant';
import { RestaurantDetailsPage } from '../pages/restaurant-details/restaurant-details';
import { GoogleMaps } from '@ionic-native/google-maps';
import { ReviewsOfRestaurantPage } from '../pages/reviews-of-restaurant/reviews-of-restaurant';
import { ReviewModalPage } from '../pages/review-modal/review-modal';
import { MyReservationPage } from '../pages/my-reservation/my-reservation';
import { BookingDetailsPage } from '../pages/booking-details/booking-details';
import { MyFavouritePage } from '../pages/my-favourite/my-favourite';
import { RestaurantReservationPage } from '../pages/restaurant-reservation/restaurant-reservation';
import { ReservationCancelPage } from '../pages/reservation-cancel/reservation-cancel';
import { ReservationConfirmedPage } from '../pages/reservation-confirmed/reservation-confirmed';
import { ReservationPendingPage } from '../pages/reservation-pending/reservation-pending';
import { AdminReservationPage } from '../pages/admin-reservation/admin-reservation';
import { AdminReservationDetailsPage } from '../pages/admin-reservation-details/admin-reservation-details';
import { LocationTrackerProvider } from '../providers/location-tracker/location-tracker';
import { BackgroundMode } from '@ionic-native/background-mode';
import { SearchFoodPage } from '../pages/search-food/search-food';
import { CityPage } from '../pages/city/city';
import { ForgotPasswordPage } from '../pages/forgot-password/forgot-password';
import { AboutFoodoliPage } from '../pages/about-foodoli/about-foodoli';
import { ResetPasswordPage } from '../pages/reset-password/reset-password';
import { SignUpChoicePage } from '../pages/sign-up-choice/sign-up-choice';
import { CallNumber } from '@ionic-native/call-number';
import { DirectionMapPage } from '../pages/direction-map/direction-map';
import { RestaurantReportPage } from '../pages/restaurant-report/restaurant-report';
import { AdvanceSearchPage } from '../pages/advance-search/advance-search';
import { ImagesOfRestaurantPage } from '../pages/images-of-restaurant/images-of-restaurant';
import { ReviewImageModalPage } from '../pages/review-image-modal/review-image-modal';
import { NotFoundPage } from '../pages/not-found/not-found';
import { AdminClientUserActivationPage } from '../pages/admin-client-user-activation/admin-client-user-activation';
import { AdminClientRestaurantOwnerActivationPage } from '../pages/admin-client-restaurant-owner-activation/admin-client-restaurant-owner-activation';
import { Diagnostic } from '@ionic-native/diagnostic';
import { ConnectivityProvider } from '../providers/connectivity/connectivity';

@NgModule({
  declarations: [
    MyApp,
    LoginModalPage,
    SignUpModalPage,
    SignUpChoicePage,
    ForgotPasswordPage,
    ResetPasswordPage,
    StartPage,
    CityPage,
    SearchFoodPage,
    FindSpecialPage,
    TodaySpecialPage,
    UserProfilePage,
    SettingsPage,
    MyReservationPage,
    BookingHistoryPage,
    BookingDetailsPage,
    RestaurantInfoPage,
    RestaurantLogoBannerPage,
    CategoryModalPage,
    CategoryListModalPage,
    MenuModalPage,
    RestaurantMenuPage,
    ReviewModalPage,
    ReviewsOfRestaurantPage,
    ReviewImageModalPage,
    ImagesOfRestaurantPage,
    RestaurantReservationPage,
    ReservationCancelPage,
    ReservationConfirmedPage,
    ReservationTodayPage,
    ReservationPendingPage,
    RestaurantReportPage,
    RestaurantSpecialPage,
    SpecialModalPage,
    SpecialsOfRestaurantPage,
    MenusOfRestaurantPage,
    RestaurantDetailsPage,
    SpecialDetailsPage,
    MyFavouritePage,
    FindRestaurantPage,
    OwnerSignUpPage,
    ClamMyBusinessPage,
    PaymentPage,
    AdminReservationPage,
    AdminReservationDetailsPage,
    TermsAndConditionsPage,
    AboutFoodoliPage,
    DirectionMapPage,
    AdvanceSearchPage,
    NotFoundPage,
    AdminClientUserActivationPage,
    AdminClientRestaurantOwnerActivationPage 
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginModalPage,
    SignUpModalPage,
    SignUpChoicePage,
    ForgotPasswordPage,
    ResetPasswordPage,
    StartPage,
    CityPage,
    SearchFoodPage,
    FindSpecialPage,
    TodaySpecialPage,
    UserProfilePage,
    SettingsPage,
    MyReservationPage,
    BookingHistoryPage,
    BookingDetailsPage,
    RestaurantInfoPage,
    RestaurantLogoBannerPage,
    CategoryModalPage,
    CategoryListModalPage,
    MenuModalPage,
    RestaurantMenuPage,
    ReviewModalPage,
    ReviewsOfRestaurantPage,
    ReviewImageModalPage,
    ImagesOfRestaurantPage,
    RestaurantReservationPage,
    ReservationCancelPage,
    ReservationConfirmedPage,
    ReservationTodayPage,
    ReservationPendingPage,
    RestaurantReportPage,
    RestaurantSpecialPage,
    SpecialModalPage,
    SpecialsOfRestaurantPage,
    MenusOfRestaurantPage,
    RestaurantDetailsPage,
    SpecialDetailsPage,
    MyFavouritePage,
    FindRestaurantPage,
    OwnerSignUpPage,
    ClamMyBusinessPage,
    PaymentPage,
    AdminReservationPage,
    AdminReservationDetailsPage,
    TermsAndConditionsPage,
    AboutFoodoliPage,
    DirectionMapPage,
    AdvanceSearchPage,
    NotFoundPage,
    AdminClientUserActivationPage,
    AdminClientRestaurantOwnerActivationPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Camera,
    CallNumber,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    RestaurantProvider,
    UserServiceProvider,
    Geolocation,
    BackgroundGeolocation,
    GoogleMaps,
    LocationTrackerProvider,
    BackgroundMode,
    AuthProvider,
    Diagnostic,
    ConnectivityProvider
  ]
})
export class AppModule {}
