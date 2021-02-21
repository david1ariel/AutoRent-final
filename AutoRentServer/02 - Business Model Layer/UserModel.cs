using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace BeardMan
{
    public class UserModel: ICloneable
    {
        public string UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Gender { get; set; }
        public DateTime? BirthDate { get; set; }
        public string Email { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }
        public string JwtToken { get; set; }
        public IFormFile Image { get; set; }
        public string ImageFileName { get; set; }
        public string Country { get; set; }
        public string City { get; set; }
        public string AdressLine { get; set; }
        public string PostalZipCode { get; set; }

        public UserModel() { }

        public UserModel(User user)
        {
            UserId = user.UserId;
            FirstName = user.FirstName;
            LastName = user.LastName;
            Gender = user.Gender;
            BirthDate = user.BirthDate;
            Email = user.Email;
            Username = user.Username;
            Password = user.Password;
            Role = user.Role;
            ImageFileName = user.ImageFileName;
        }

        public UserModel(User user, Adress adress)
        {
            UserId = user.UserId;
            FirstName = user.FirstName;
            LastName = user.LastName;
            Gender = user.Gender;
            BirthDate = user.BirthDate;
            Email = user.Email;
            Username = user.Username;
            Password = user.Password;
            Role = user.Role;
            ImageFileName = user.ImageFileName;
            Country = adress.Country;
            City = adress.City;
            AdressLine = adress.AdressLine;
            PostalZipCode = adress.PostalZipCode;
        }

        public User ConvertToUser()
        {
            return new User
            {
                UserId = UserId,
                FirstName = FirstName,
                LastName = LastName,
                Gender = Gender,
                BirthDate = BirthDate,
                Email = Email,
                Username = Username,
                Password = Password,
                Role = Role,
                ImageFileName = ImageFileName,
            };
        }

        public Adress ConvertToAdress()
        {
            return new Adress
            {
                Country = Country,
                City = City,
                AdressLine = AdressLine,
                PostalZipCode = PostalZipCode
            };
        }

        public object Clone()
        {
            return new UserModel
            {
                UserId = UserId,
                FirstName = FirstName,
                LastName = LastName,
                Gender = Gender,
                BirthDate = BirthDate,
                Email = Email,
                Username = Username,
                Password = Password,
                Role = Role,
                JwtToken = JwtToken,
                Image = Image,
                ImageFileName = ImageFileName,
                Country = Country,
                City = City,
                AdressLine = AdressLine,
                PostalZipCode = PostalZipCode,
            };
        }
    }
}
