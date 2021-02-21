using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BeardMan
{
    public class UsersLogic : BaseLogic
    {
        private readonly BlobsLogic blobsLogic;
        public UsersLogic(AutoRentContext db, BlobsLogic blobsLogic) : base(db) 
        {
            this.blobsLogic = blobsLogic;
        }

        public List<UserModel> GetAllUsers()
        {
            return DB.Users.Select(p => new UserModel(p)).ToList();
        }

        public bool isUserNameExists(string userName)
        {
            return DB.Users.Any(u => u.Username == userName);
        }

        public UserModel GetUserByCredentials(CredentialsModel credentialsModel)
        {
            return new UserModel(DB.Users.SingleOrDefault(u => u.Username == credentialsModel.Username && u.Password == credentialsModel.Password));
        }



        public UserModel AddUser(UserModel userModel)
        {
            if (userModel.Image != null)
            {
                string extension = Path.GetExtension(userModel.Image.FileName);

                userModel.ImageFileName = Guid.NewGuid() + extension;

                using (FileStream fileStream = File.Create("Uploads/" + userModel.ImageFileName))
                {
                    userModel.Image.CopyTo(fileStream);
                }
                userModel.Image = null;
            }
            using (DB.Database.BeginTransaction())
            {
                if (userModel.Role == null)
                    userModel.Role = "user";
                User addedUser = userModel.ConvertToUser();
                DB.Users.Add(addedUser);
                DB.SaveChanges();

                if (userModel.City != null && userModel.AdressLine != null)
                {
                    Adress addedAdress = userModel.ConvertToAdress();
                    DB.Adresses.Add(addedAdress);
                    DB.SaveChanges();

                    UsersAdress usersAdress = new UsersAdress
                    {
                        UserId = addedUser.UserId,
                        AdressId = addedAdress.AdressId
                    };
                    DB.SaveChanges();
                }

                DB.Database.CommitTransaction();

                userModel.UserId = addedUser.UserId;
            }
            return userModel;
        }

        public async Task<UserModel> UpdateUser(UserModel userModel)
        {

            if (userModel.Image != null)
            {
                string extension = Path.GetExtension(userModel.Image.FileName);

                userModel.ImageFileName = Guid.NewGuid() + extension;

                await blobsLogic.UploadFileBlobAsync(userModel.Image, userModel.ImageFileName);

                userModel.Image = null;
            }
            User user = DB.Users.SingleOrDefault(p => p.UserId == userModel.UserId);
            if (user.FirstName != userModel.FirstName)
                user.FirstName = userModel.FirstName;

            if (user.LastName != userModel.LastName)
                user.LastName = userModel.LastName;

            if (user.Email != userModel.Email)
                user.Email = userModel.Email;

            if (user.Username != userModel.Username)
                user.Username = userModel.Username;

            if (user.Password != userModel.Password)
                user.Password = userModel.Password;

            if (user.ImageFileName != userModel.ImageFileName)
                user.ImageFileName = userModel.ImageFileName;

            Adress adress = DB.Adresses.SingleOrDefault(p => p.AdressId == DB.UsersAdresses.FirstOrDefault(p => p.UserId == userModel.UserId).AdressId);
            if (adress != null)
            {
                if (userModel.Country != adress.Country || userModel.City != adress.City || userModel.AdressLine != adress.AdressLine)
                {
                    if (adress.Country != userModel.Country)
                        adress.Country = userModel.Country;
                    if (adress.City != userModel.City)
                        adress.City = userModel.City;
                    if (adress.AdressLine != userModel.AdressLine)
                        adress.AdressLine = userModel.AdressLine;
                    if (adress.PostalZipCode != userModel.PostalZipCode)
                        adress.PostalZipCode = userModel.PostalZipCode;
                }
            }

            DB.SaveChanges();

            return userModel;
        }

        public void DeleteUser(string userId)
        {
            User userToDelete = DB.Users.SingleOrDefault(p => p.UserId == userId);
            DB.Users.Remove(userToDelete);
            DB.SaveChanges();
        }

        public UserModel GetRentingClient(int rentId)
        {
            RentModel currentRent = new RentModel(DB.Rents.SingleOrDefault(p => p.RentId == rentId));
            UserModel rentingClient = new UserModel(DB.Users.SingleOrDefault(p => p.UserId == currentRent.UserId));
            return rentingClient;
        }
    }
}
