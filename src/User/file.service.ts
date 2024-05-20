import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import * as path from 'node:path';

@Injectable()
export class FileService {
  private storage = new Storage({
    projectId: 'centered-scarab-417121',
    keyFilename: 'centered-scarab-417121-04c2ad5106de.json',
  });
  private bucket = this.storage.bucket('photos_bike_app');

  async uploadFile(file: Express.Multer.File) {
    await this.bucket.upload(path.join(__dirname, '..', '..', file.path), {
      public: true,
    });
    return {
      url: 'https://storage.googleapis.com/photos_bike_app/' + file.filename,
    };
  }
}
