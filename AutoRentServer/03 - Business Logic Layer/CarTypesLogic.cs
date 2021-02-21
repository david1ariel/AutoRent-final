using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BeardMan
{
    public class CarTypesLogic : BaseLogic
    {
        private readonly BlobsLogic blobsLogic;
        public CarTypesLogic(AutoRentContext db, BlobsLogic blobsLogic) : base(db) 
        {
            this.blobsLogic = blobsLogic;
        }

        public List<CarTypeModel> GetAllCarTypes()
        {
            return DB.CarTypes.Select(p => new CarTypeModel(p)).ToList();
        }

        public async Task<CarTypeModel> UpdateCarType(CarTypeModel carTypeModel)
        {
            if (carTypeModel.Image != null)
            {


                string extension = Path.GetExtension(carTypeModel.Image.FileName);

                carTypeModel.ImageFileName = Guid.NewGuid() + extension;

                await blobsLogic.UploadFileBlobAsync(carTypeModel.Image, carTypeModel.ImageFileName);

                carTypeModel.Image = null;
            }

            CarType carType = DB.CarTypes.SingleOrDefault(p => p.CarTypeId == carTypeModel.CarTypeId);

            carType.Manufacturer = carTypeModel.Manufacturer;
            carType.Model = carTypeModel.Model;
            carType.PricePerDay = carTypeModel.PricePerDay;
            carType.PricePerDayLate = carTypeModel.PricePerDayLate;
            carType.Year = carTypeModel.Year;
            carType.Gear = carTypeModel.Gear;
            carType.ImageFileName = carTypeModel.ImageFileName;


            DB.SaveChanges();
            carTypeModel.CarTypeId = carType.CarTypeId;
            return carTypeModel;
        }

        public CarTypeModel AddNewCarType(CarTypeModel carTypeModel)
        {
            if (carTypeModel.Image != null)
            {
                string extension = Path.GetExtension(carTypeModel.Image.FileName);

                carTypeModel.ImageFileName = Guid.NewGuid() + extension;

                using (FileStream fileStream = File.Create("Uploads/" + carTypeModel.ImageFileName))
                {
                    carTypeModel.Image.CopyTo(fileStream);
                }
                carTypeModel.Image = null;
            }
            CarType addedCarType = carTypeModel.ConvertToCarType();

            DB.CarTypes.Add(addedCarType);
            DB.SaveChanges();
            carTypeModel.CarTypeId = addedCarType.CarTypeId;
            return carTypeModel;
        }

        //public List<CarTypeModel> UpdateManyCarTypes(List<CarTypeModel> carTypesToUpdate)
        //{
        //    for (int i = 0; i < carTypesToUpdate.Count; i++)
        //    {
        //        carTypesToUpdate[i] = this.UpdateCarType(carTypesToUpdate[i]);
        //    }

        //    return carTypesToUpdate;
        //}

        public List<CarTypeModel> GetAllAvailableCarTypes(RentModel rentModel)
        {
            var query = (from car in DB.Cars
                         join rent in DB.Rents on car.CarId equals rent.CarId
                         join carType in DB.CarTypes on car.CarTypeId equals carType.CarTypeId
                         where (
                         !(rent.ReturnDate >= rentModel.PickupDate && rent.ReturnDate <= rentModel.ReturnDate) &&
                         !(rent.PickupDate >= rentModel.PickupDate && rent.PickupDate <= rentModel.ReturnDate) &&
                         !(rent.PickupDate <= rentModel.PickupDate && rent.ReturnDate >= rentModel.ReturnDate)) &&
                         car.IsFixed==1
                         select carType).Distinct();

            

            List<CarTypeModel> carTypeModels = new List<CarTypeModel>();
            foreach (var item in query)
            {
                carTypeModels.Add(new CarTypeModel(item));
            }

            List<Car> carsWithNoAvail = new List<Car>();
            bool carHasNoAvail;

            List<Car> cars = DB.Cars.ToList();

            foreach (var car in cars)
            {
                carHasNoAvail = true;
                foreach (var rent in DB.Rents)
                {
                    if (rent.CarId == car.CarId)
                    {
                        carHasNoAvail = false;
                        break;
                    }
                   
                }
                
                if (carHasNoAvail == true)
                {
                    carsWithNoAvail.Add(car);
                }

            }

            foreach (var item in carsWithNoAvail)
            {
                CarTypeModel carTypeToCheck = carTypeModels.SingleOrDefault(p => p.CarTypeId == item.CarTypeId);
                if(carTypeToCheck==null)
                    carTypeModels.Add (new CarTypeModel(DB.CarTypes.SingleOrDefault(p => p.CarTypeId == item.CarTypeId)));
            }

            

            return carTypeModels;
        }

        public void DeleteCarType(int id)
        {
            CarType carTypeToDelete = DB.CarTypes.SingleOrDefault(p => p.CarTypeId == id);
            DB.CarTypes.Remove(carTypeToDelete);
            DB.SaveChanges();
        }
    }
}

