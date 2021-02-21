using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using BeardMan.Extensions;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace BeardMan
{
    public class BlobsLogic : IBlobsLogic
    {
        private readonly BlobServiceClient blobServiceClient;

        public BlobsLogic(BlobServiceClient blobServiceClient)
        {
            this.blobServiceClient = blobServiceClient;
        }


        public async Task<Response<BlobDownloadInfo>> GetBlobAsync(string name)
        {
            var containerClient = blobServiceClient.GetBlobContainerClient("images");
            var blobClient = containerClient.GetBlobClient(name);
            Response<BlobDownloadInfo> blobDownloadInfo = await blobClient.DownloadAsync();

            return blobDownloadInfo;
        }

        public async Task<IEnumerable<string>> ListBlobAsync()
        {
            var containerClient = blobServiceClient.GetBlobContainerClient("images");
            var items = new List<string>();

            await foreach (var blobItem in containerClient.GetBlobsAsync())
            {
                items.Add(blobItem.Name);
            }
            return items;
        }

        public async Task UploadContentBlobAsync(string content, string fileName)
        {
            throw new NotImplementedException();
        }

        public async Task UploadFileBlobAsync(string filePath, string fileName)
        {
            var containerClient = blobServiceClient.GetBlobContainerClient("images");
            var blobClient = containerClient.GetBlobClient(fileName);
            await blobClient.UploadAsync(filePath, new BlobHttpHeaders { ContentType = filePath.GetContentType() });
        }

        public async Task UploadFileBlobAsync(IFormFile file, string fileName)
        {
            try
            {
                var containerClient = blobServiceClient.GetBlobContainerClient("images");
                var blobClient = containerClient.GetBlobClient(fileName);
                var result = await blobClient.UploadAsync(file.OpenReadStream());
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        public Task DeleteBlobAsync(string blobName)
        {
            throw new NotImplementedException();
        }

    }
}
