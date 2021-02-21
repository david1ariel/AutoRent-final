import { CarTypesService } from './../../services/car-types.service';
import { Unsubscribe } from 'redux';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { store } from 'src/app/redux/store';
import { CarTypeModel } from 'src/app/models/carType.model';
import { Router } from '@angular/router';
import { CarModel } from 'src/app/models/car.model';
import { CarsService } from 'src/app/services/cars.service';
import { RentModel } from 'src/app/models/rent.model';
import { UserModel } from 'src/app/models/user.model';
import { MatDialog } from '@angular/material/dialog';
import { RentsService } from 'src/app/services/rents.service';

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.css']
})
export class CarsComponent implements OnInit, OnDestroy {

  public carTypes: CarTypeModel[] = store.getState().carTypes;
  public availableCarTypes: CarTypeModel[] = store.getState().availableCarTypes;
  public availableCars: CarModel[] = store.getState().availableCars;
  public user: UserModel = store.getState().user;
  public carsToShow: CarTypeModel[] = [];
  public cars: CarModel[] = store.getState().cars;
  public unsubscribe: Unsubscribe;
  public yearFilter: number[];
  public manufacturerFilter: string[];
  public modelFilter: string[];
  public branchFilter: string[];
  public searchStr: string;
  public available: boolean;
  public pickupDateString: string;
  public returnDateString: string;
  public localStorageCarTypes: CarTypeModel[] = [];
  public fullCarDisplay: boolean = false;
  public rent: RentModel = new RentModel();
  public chosenBranchId: number;
  public chosenCarType: CarTypeModel = new CarTypeModel();
  public localDialogRef;
  public preview: string;
  public carToRent: CarModel;
  public isCarExistsInBranch: number = 0;
  public windowWidth = window.innerWidth;
  public isShowFilters = false;

  constructor(
    private carTypesService: CarTypesService,
    private router: Router,
    private carsService: CarsService,
    private rentsService: RentsService,
    private dialog: MatDialog) { }


  async ngOnInit() {
    try {
      this.unsubscribe = store.subscribe(() => this.carTypes = store.getState().carTypes);
      if (store.getState().carTypes.length === 0) {
        const success = await this.carTypesService.getAllCarTypes();
        if (success) {
          this.carsToShow = this.carTypes;
          this.initManufacturerFilter();
          console.log(this.manufacturerFilter);
          this.initYearFilter();
          console.log(this.yearFilter);
          console.log(this.isShowFilters);
        }
      }
      else {
        this.carTypes = store.getState().carTypes;
        this.carsToShow = this.carTypes;
      }
      this.unsubscribe = store.subscribe(() => this.cars = store.getState().cars);
      if (store.getState().cars.length === 0) {
        await this.carsService.getAllCars();
      }
      this.rent.pickupDate = new Date();
      this.rent.returnDate = new Date();
      this.unsubscribe = store.subscribe(() => this.availableCars = store.getState().availableCars);
      if (store.getState().availableCars.length === 0)
        await this.carsService.getAllAvailableCars(this.rent);
      this.initBranchFilter();
      this.unsubscribe = store.subscribe(() => {
        this.user = store.getState().user;
        this.windowWidth = store.getState().windowWidth;
      });

      if (localStorage.getItem("carTypes") !== null)
        this.localStorageCarTypes = JSON.parse(localStorage.getItem("carTypes"));

      console.log(window.innerWidth);
    }
    catch (error) {
      console.log(error.message);
    }
  }

  public onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  changeDateToNow() {
    if (this.pickupDateString === undefined) {
      const date = new Date();
      date.setTime(date.getTime() + 2 * 60 * 60 * 1000);
      this.pickupDateString = date.toISOString().slice(0, 10);
      this.returnDateString = date.toISOString().slice(0, 10);
      this.rent.pickupDate = new Date(this.pickupDateString);
      this.rent.returnDate = new Date(this.returnDateString);
    }

  }

  toggleFilters(){
    this.isShowFilters = !this.isShowFilters;
  }

  initYearFilter() {
    const yearNotFiltered: number[] = [];
    for (let c of this.carTypes)
      yearNotFiltered.push(c.year);
    this.yearFilter = yearNotFiltered.filter(this.onlyUnique);
  }

  initManufacturerFilter() {
    const manufacturerNotFiltered: string[] = [];
    for (let c of this.carTypes)
      manufacturerNotFiltered.push(c.manufacturer);
    this.manufacturerFilter = manufacturerNotFiltered.filter(this.onlyUnique);
  }

  initBranchFilter() {
    const branchNotFiltered: string[] = [];
    for (let c of this.cars)
      branchNotFiltered.push(c.branch);
    this.branchFilter = branchNotFiltered.filter(this.onlyUnique);
  }

  selectedGear(event) {
    this.carsToShow = this.carTypes.filter(p => p.gear === event.target.value);
  }

  filterByManufacturer(event) {
    this.carsToShow = this.carTypes.filter(p => p.manufacturer === event.target.value);
  }

  filterByModel(event) {
    this.carsToShow = this.carTypes.filter(p => p.model === event.target.value);
  }

  filterByYear(event) {
    if (event.target.value !== '') {
      this.carsToShow = this.carTypes.filter(p => p.year === +event.target.value);
    }
  }

  filterByBranch(event) {
    if (event.target.value !== '') {
      const carsByBranch = [];
      this.carsToShow = [];
      for (const car of this.cars) {
        if (car.branch === event.target.value) {
          carsByBranch.push(car);
        }
      }
      for (const car of carsByBranch) {

        this.carsToShow.push(this.carTypes.find(p => p.carTypeId === car.carTypeId));
      }
      this.carsToShow = this.carsToShow.filter(this.onlyUnique);
    }
  }

  search() {
    this.carsToShow = [];
    if (this.searchStr === '')
      this.carsToShow = this.carTypes;
    if (this.searchStr !== '') {
      for (let obj of this.carTypes) {
        for (let prop in obj) {
          let property: string = '';
          if (obj[prop] != null && obj[prop] != undefined)
            property = obj[prop].toString();
          if (property.toLocaleLowerCase().includes(this.searchStr.toLocaleLowerCase())) {
            this.carsToShow.push(obj);
            break;
          }
        }
      }
    }
  }


  async sendDates() {
    try {
      // check if checkbox it checked:
      if (this.available === true) {
        // check if dates are valid:
        const now = new Date();
        if (this.pickupDateString === "" || this.returnDateString === ""
          || this.pickupDateString === undefined || this.returnDateString === undefined
          || new Date(this.pickupDateString).valueOf() < now.valueOf() - (1000 * 60 * 60 * 24)
          || new Date(this.pickupDateString).valueOf() > new Date(this.returnDateString).valueOf()) {
            // if dates are not valid, alert it and set dates to now:
            alert("Dates must make sense!");
          this.available = false;
          const date = new Date();
          this.pickupDateString = date.toISOString().slice(0, 10);
          this.returnDateString = date.toISOString().slice(0, 10);
          this.rent.pickupDate = new Date(this.pickupDateString);
          this.rent.returnDate = new Date(this.returnDateString);
          return;
        }
        // if dates are valid, send them to server as rentModel:
        this.rent.pickupDate = new Date(this.pickupDateString);
        this.rent.returnDate = new Date(this.returnDateString);
        const success = await this.carTypesService.getAllAvailableCarTypes(this.rent);
        if (store.getState().availableCarTypes.length>0)
          this.carsToShow = store.getState().availableCarTypes;
      }
      else {
        this.carsToShow = this.carTypes;
      }
    }

    catch (error) {
      console.log(error.message);
    }
  }



  public async beginRent(carTypeId: number, confirmRentTemplateRef, loggedOutTemplateRef) {
    try {
      this.isCarExistsInBranch = 0;
      // await this.carsService.getAllAvailableCars(this.rent);
      // await this.carTypesService.getAllAvailableCarTypes(this.rent);

      //handling the local storage carTypes array:
      if (localStorage.getItem("carTypes") === null) {
        if (this.localStorageCarTypes !== undefined) {
          const carTypeToCheck = this.localStorageCarTypes.find(p => p.carTypeId === carTypeId);
          if (carTypeToCheck === undefined) {
            this.localStorageCarTypes.push(this.carsToShow.find(p => p.carTypeId === carTypeId));
            localStorage.setItem("carTypes", JSON.stringify(this.localStorageCarTypes));
          }
        }
        else {
          this.localStorageCarTypes.push(this.carsToShow.find(p => p.carTypeId === carTypeId));
          localStorage.setItem("carTypes", JSON.stringify(this.localStorageCarTypes));
        }
      }
      else {
        const carTypeToCheck = this.localStorageCarTypes.find(p => p.carTypeId === carTypeId);
        if (carTypeToCheck === undefined) {
          this.localStorageCarTypes = JSON.parse(localStorage.getItem("carTypes"));
          this.localStorageCarTypes.push(this.carsToShow.find(p => p.carTypeId === carTypeId));
          localStorage.setItem("carTypes", JSON.stringify(this.localStorageCarTypes));
        }
      }

      // checking if user logged in:
      if (this.user) {
        this.chosenCarType = this.carsToShow.find(p => p.carTypeId === carTypeId);

        //handling the date inputs:
        if (this.pickupDateString === "") {
          const date = new Date();
          this.pickupDateString = date.toISOString().slice(0, 10);
        }
        if (this.pickupDateString === "") {
          const date = new Date();
          this.returnDateString = date.toISOString().slice(0, 10);
        }
        if (this.rent.pickupDate === undefined) {
          this.changeDateToNow();
        }

        // if user is logged in:
        this.openDialog(confirmRentTemplateRef);
      }

      //if user is not logge in:
      else {
        this.openDialog(loggedOutTemplateRef);
      }
    } catch (error) {
      console.log(error.message);
    }

  }

 async checkCarTypesByBranch(event) {

    this.isCarExistsInBranch = 0;
    const success = await this.carsService.getAllAvailableCars(this.rent);
    if(success){
      console.log(this.availableCars);
      for (const car of this.availableCars) {
        if (car.carTypeId === this.chosenCarType.carTypeId && car.branch == event.target.value) {
          this.carToRent = car;
          this.rent.carId = car.carId;
          this.isCarExistsInBranch = 1;
          return;
        }
      }

    }
    this.isCarExistsInBranch = -1;
  }

  async executeRent(receivedTemplateRef, errorTemplateRef) {
    try {
      this.rent.userId = this.user.userId;
      const success = await this.rentsService.rentCar(this.rent);
      this.dialog.closeAll();
      if (success)
        this.openDialog(receivedTemplateRef)
      else
        this.openDialog(errorTemplateRef)
    } catch (error) {
      alert('Something went terribly roung');
    }
  }

  pickupDateChanged() {

    const now = new Date();
    if (new Date(this.pickupDateString).valueOf() < now.valueOf() - (1000 * 60 * 60 * 24)
    ) {
      console.log(new Date(this.pickupDateString).valueOf() < (now.setHours(now.getHours() + 1)).valueOf());
      alert("Dates must make sense!");
      const date = new Date();
      this.pickupDateString = date.toISOString().slice(0, 10);
      this.returnDateString = date.toISOString().slice(0, 10);
      this.rent.pickupDate = new Date(this.pickupDateString);
      this.rent.returnDate = new Date(this.returnDateString);
      return;
    }
    else {
      this.rent.pickupDate = new Date(this.pickupDateString);
      this.rent.returnDate = new Date(this.returnDateString);
    }
  }

  returnDateChanged() {

    const now = new Date();
    if (
      new Date(this.pickupDateString).valueOf() > new Date(this.returnDateString).valueOf()
    ) {
      console.log(new Date(this.pickupDateString).valueOf() < (now.setHours(now.getHours() + 1)).valueOf());
      alert("Dates must make sense!");
      const date = new Date();
      this.pickupDateString = date.toISOString().slice(0, 10);
      this.returnDateString = date.toISOString().slice(0, 10);
      this.rent.pickupDate = new Date(this.pickupDateString);
      this.rent.returnDate = new Date(this.returnDateString);
      return;
    }
    else {
      this.rent.pickupDate = new Date(this.pickupDateString);
      this.rent.returnDate = new Date(this.returnDateString);
    }
  }

  openDialog(templateRef) {
    this.localDialogRef = this.dialog.open(templateRef, {
      width: "fit-content",
      panelClass: 'custom-dialog-container',
    });
  }


  async onCloseDialog() {
    this.dialog.closeAll();
    // handling list of available car types:
    if(this.available){
      const success = await this.carTypesService.getAllAvailableCarTypes(this.rent);
      if(success){
        if (store.getState().availableCarTypes.length>0)
          this.carsToShow = store.getState().availableCarTypes;
      else
        this.carsToShow = [];
      }

    }

  }

  enableFullCarTypeDisplay(c: CarTypeModel, templateRef) {
    this.chosenCarType = c;
    this.dialog.closeAll();
    this.openDialog(templateRef);
  }



  ngOnDestroy(): void {
    // this.unsubscribe();
  }
}

// async showAvail() {
  //   console.log(this.available);
  //   if (this.available === true) {
  //     const rent: RentModel = new RentModel();
  //     rent.pickupDate = new Date(Date.now());
  //     rent.returnDate = new Date(Date.now());
  //     rent.returnDate = new Date(rent.returnDate.getTime() + (1000 * 60 * 60 * 24));
  //     await this.carTypesService.getAllAvailableCarTypes(rent);
  //     this.carsToShow = store.getState().availableCars;
  //   }
  //   else {
  //     this.carsToShow = this.carTypes;
  //   }
  // }
