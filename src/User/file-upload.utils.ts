import { Storage } from '@google-cloud/storage';
const projectId = process.env.PROJECT_ID;
const keyFilename = process.env.KEYFILENAME;
const storage = new Storage({ projectId, keyFilename });
async function uploadFile(bucketName, file, fileOutputName) {
  try {
    const bucket = storage.bucket(bucketName);
    const ret = await bucket.upload(file, {
      destination: fileOutputName,
    });

    return ret;
  } catch (error) {
    console.error('Error:', error);
  }
}
