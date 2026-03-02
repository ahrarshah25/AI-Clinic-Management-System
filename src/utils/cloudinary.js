const CLOUD_NAME = "dnkuvmxuv";
const UPLOAD_PRESET = "ai-clinic-management-system";
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export const uploadImageToCloudinary = async (file) => {
  if (!file) {
    throw new Error("No file selected");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Cloudinary upload failed");
  }

  const data = await response.json();
  if (!data?.secure_url) {
    throw new Error("Invalid Cloudinary response");
  }

  return data.secure_url;
};

