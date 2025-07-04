import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ResponseError } from '../types/error';

export class MulterConfig {
    // Ensure directory exists
    static ensureDirectoryExists = (dirPath: string) => {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    };

    // Generate File Name
    static generateFilename = (file: Express.Multer.File) => {
        const ext = path.extname(file.originalname);
        return `${uuidv4()}${ext}`;
    };

    // Handle Upload Profile Image
    public static profileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = 'public/profile';
            MulterConfig.ensureDirectoryExists(uploadPath);
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            cb(null, this.generateFilename(file));
        }
    });

    // Filter Profile Image
    public static profileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new ResponseError(400, 'Only image files are allowed', {
                photo: ['Only image files are allowed']
            }));
        }
    };

    // Handle Products Image
    public static productsStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = 'public/products';
            MulterConfig.ensureDirectoryExists(uploadPath);
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            cb(null, this.generateFilename(file));
        }
    });

    // Filter Products Image
    public static productFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new ResponseError(400, 'Only image files are allowed', {
                images: ['Only image files are allowed']
            }));
        }
    };
}

export const uploadPhotoProfile = multer({
    storage: MulterConfig.profileStorage,
    fileFilter: MulterConfig.profileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('photo');

export const uploadProducts = multer({
    storage: MulterConfig.productsStorage,
    fileFilter: MulterConfig.productFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 5 // Maximum 5 files
    }
}).array('images', 5);