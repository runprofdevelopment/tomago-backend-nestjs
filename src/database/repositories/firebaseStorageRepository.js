const admin = require('../../infrastructure/firebaseInit');
const { v4: uuidv4 } = require('uuid');
const config = require('../../../config')();
const _get = require('lodash/get');

/**
 * Abstracts some basic Storage operations.
 * See https://firebase.google.com/docs/storage
 */
function normalizeBucketName(name) {
  if (!name) return undefined;
  return String(name).replace(/^gs:\/\//, '');
}

module.exports = class FirebaseStorageRepository {
  /**
   * @param {Object} file
   * @param {Buffer} file.buffer
   * @param {String} file.destination
   * @param {String} file.fileType
   * @returns
   */
  static async uploadBufferFile({
    buffer,
    destination,
    fileType,
  }) {
    const storage = admin.storage();
    const bucketName = normalizeBucketName(
      _get(config, 'storageBucketName', undefined),
    );
    console.log('uploadBufferFile - bucketName =', bucketName);
    console.log('uploadBufferFile - config.env =', config.env);
    console.log('uploadBufferFile - admin.apps.length =', admin.apps.length);
    
    if (!bucketName) {
      throw new Error('Storage bucket name not configured. Please check your environment configuration.');
    }
    
    const bucket = storage.bucket(bucketName);

    const token = uuidv4();
    const file = bucket.file(destination);
    await file.save(buffer, {
      resumable: false,
      public: true,
      metadata: {
        contentType: fileType,
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });
    // Make the file public (optional)
    await file.makePublic();

    // Get the Firebase Storage URL
    const downloadURL = this.constructFirebaseDownloadURL(
      bucket.name,
      destination,
      token,
    );
    console.log('Download URL:', downloadURL);
    return downloadURL;

    // const publicUrl = file.publicUrl();
    // return publicUrl;
  }

  static constructFirebaseDownloadURL(
    bucketName,
    filePath,
    token,
  ) {
    const encodedPath = encodeURIComponent(filePath); // Ensure proper encoding
    return token
      ? `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${token}`
      : `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;
  }

  /**
   * Upload file to storage and make it public + creating download token
   * @param {*} param0
   * @returns
   */
  static async uploadFile({
    filePath,
    destination,
    fileType,
  }) {
    const storage = admin.storage();
    const bucketName = normalizeBucketName(
      _get(config, 'storageBucketName', undefined),
    );
    const bucket = storage.bucket(bucketName);

    const [file, meta] = await bucket.upload(filePath, {
      destination: destination,
      resumable: false,
      public: true,
      metadata: {
        contentType: fileType,
        metadata: {
          firebaseStorageDownloadTokens: uuidv4(),
        },
      },
    });

    return meta.mediaLink;
  }

  static async deleteFileFromPublicUrl(publicUrl) {
    try {
      if (!publicUrl) return;

      const firebaseConfig = _get(
        config,
        'firebaseConfig',
        undefined,
      );

      // Extract the file path from the public URL
      const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/`;
      const filePath = decodeURIComponent(
        publicUrl.split(baseUrl)[1].split('?')[0],
      );

      // Get bucket reference
      const storage = admin.storage();
      const bucketName = normalizeBucketName(
        _get(config, 'storageBucketName', undefined),
      );
      const bucket = storage.bucket(bucketName);

      // Create a reference to the file
      const file = bucket.file(filePath);

      // Delete the file
      await file.delete();
      console.log('File deleted successfully');
    } catch (error) {
      console.error(
        `Error deleting file: ${publicUrl}`,
        error,
      );
    }
  }

  static async getPublicUrl(
    filePath,
    storageBucketName,
    filename,
  ) {
    try {
      const storage = admin.storage();
      const bucketName = normalizeBucketName(
        storageBucketName || _get(config, 'storageBucketName', undefined),
      );
      console.log('bucketName =', bucketName);
      const bucket = storage.bucket(bucketName);

      // Get a reference to the storage bucket
      // const bucket = getStorage().bucket();

      // Get a reference to the file
      const file = bucket.file(filePath);

      await file.setMetadata({
        contentDisposition: `attachment; filename="${filename}"`,
      });

      // Make the file public (optional)
      await file.makePublic();

      // const encodedPath = encodeURIComponent(filePath);
      // const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media`;

      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

      console.log('Public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error getting public URL:', error);
    }
  }

  static async generateSignedUrl(
    filePath,
    storageBucketName,
  ) {
    const storage = admin.storage();
    const bucketName = normalizeBucketName(
      storageBucketName || _get(config, 'storageBucketName', undefined),
    );
    console.log('bucketName =', bucketName);
    const bucket = storage.bucket(bucketName);

    // Get a reference to the file
    const file = bucket.file(filePath);

    const options = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    };

    const [url] = await file.getSignedUrl(options);
    console.log(`Signed URL: ${url}`);
    return url;
  }

  static getFilePathFromUrl(url) {
    const firebaseConfig = _get(
      config,
      'firebaseConfig',
      undefined,
    );
    const storageBucket = firebaseConfig.storageBucket;

    const matches = url.match(/\/o\/(.*?)\?/);
    if (matches && matches.length > 1) {
      return decodeURIComponent(matches[1]);
    }

    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname.replace(
      '/' + storageBucket,
      '',
    );
    const filePath = decodeURIComponent(pathname.slice(1)); // Remove leading '/'
    if (filePath) return filePath;

    // const matches = url;
    // throw new Error('Invalid URL');
  }

  static async getFileSizeByUrl(publicUrl) {
    try {
      const filePath = this.getFilePathFromUrl(publicUrl);
      const storage = admin.storage();
      const bucketName = normalizeBucketName(
        _get(config, 'storageBucketName', undefined),
      );
      const bucket = storage.bucket(bucketName);
      const [metadata] = await bucket
        .file(filePath)
        .getMetadata();
      console.log(`File size: ${metadata.size} bytes`);
      return metadata.size;
    } catch (error) {
      console.error('Error retrieving file size:', error);
      throw error;
    }
  }

  static async getFileMetadataByUrl(publicUrl) {
    try {
      const filePath = this.getFilePathFromUrl(publicUrl);
      const storage = admin.storage();
      const bucketName = normalizeBucketName(
        _get(config, 'storageBucketName', undefined),
      );
      const bucket = storage.bucket(bucketName);
      const [metadata] = await bucket
        .file(filePath)
        .getMetadata();
      // console.log(`File size: ${metadata.size} bytes`);
      return metadata;
    } catch (error) {
      console.error('Error retrieving file size:', error);
      throw error;
    }
  }

  static isValidFirebaseStorageUrl(
    publicUrl,
    storageBucketName,
  ) {
    try {
      const parsedUrl = new URL(publicUrl);
      console.log({ parsedUrl });

      // Check if the URL is valid
      if (!parsedUrl) {
        throw new Error('Invalid URL');
      }

      // Check if the URL belongs to your Firebase Storage bucket
      // const expectedHost = `${bucketName}.appspot.com`;
      const firebaseConfig = _get(
        config,
        'firebaseConfig',
        undefined,
      );

      // const expectedHost = storageBucketName || _get(config, 'storageBucketName', undefined);
      const expectedHost =
        storageBucketName || firebaseConfig.storageBucket;
      if (parsedUrl.hostname !== expectedHost) {
        throw new Error(
          'URL does not belong to the specified Firebase Storage bucket',
        );
      }

      // Check if the URL contains a valid file path
      const pathMatch =
        parsedUrl.pathname.match(/^\/o\/(.+)$/);
      if (!pathMatch) {
        throw new Error(
          'URL does not contain a valid file path',
        );
      }

      return true;
    } catch (error) {
      console.error('URL validation error:', error.message);
      return false;
    }
  }
};
