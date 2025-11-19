import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn(
    "Cloudinary environment variables are missing. Image uploads will fail until CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set.",
  );
} else {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

type UploadFolder =
  | "phoo/orders/cake-sketches"
  | "phoo/orders/payment-screenshots";

export const uploadImage = async (
  dataUri: string,
  folder: UploadFolder,
): Promise<UploadApiResponse> => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary is not configured via environment variables.");
  }

  return cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    overwrite: false,
    unique_filename: true,
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
};

