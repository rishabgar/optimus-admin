import { api } from "../auth/axios";

const DEFAULT_OPTIONS = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.85,
  outputType: "image/webp",
};

function getImageFiles(files) {
  return Array.from(files ?? []).filter((file) =>
    file?.type?.startsWith("image/"),
  );
}

function canCompress(file) {
  return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
}

function getResizedDimensions(width, height, maxWidth, maxHeight) {
  const scale = Math.min(maxWidth / width, maxHeight / height, 1);

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function createImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Unable to read image: ${file.name}`));
    };

    image.src = objectUrl;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Unable to compress image."));
        }
      },
      type,
      quality,
    );
  });
}

function getCompressedFileName(fileName, outputType) {
  const extension = outputType.split("/")[1] || "webp";
  const baseName = fileName.replace(/\.[^/.]+$/, "");

  return `${baseName}.${extension}`;
}

export async function compressImage(file, options = {}) {
  if (!canCompress(file)) return file;

  const { maxWidth, maxHeight, quality, outputType } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  const image = await createImage(file);
  const size = getResizedDimensions(
    image.width,
    image.height,
    maxWidth,
    maxHeight,
  );

  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Image compression is not supported in this browser.");
  }

  context.drawImage(image, 0, 0, size.width, size.height);

  const blob = await canvasToBlob(canvas, outputType, quality);

  if (blob.size >= file.size) return file;

  return new File([blob], getCompressedFileName(file.name, outputType), {
    type: blob.type,
    lastModified: Date.now(),
  });
}

export async function compressImages(files, options = {}) {
  const imageFiles = getImageFiles(files);

  return Promise.all(imageFiles.map((file) => compressImage(file, options)));
}

export async function uploadImages({
  files,
  endpoint,
  fieldName = "images",
  data = {},
  compressOptions = {},
  onUploadProgress,
}) {
  if (!endpoint) {
    throw new Error("Upload endpoint is required.");
  }

  const compressedFiles = await compressImages(files, compressOptions);
  const formData = new FormData();

  compressedFiles.forEach((file) => {
    formData.append(fieldName, file);
  });

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  const response = await api.post(endpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });

  return response.data;
}

export async function uploadFileToSignedUrl(file, presignedUrl) {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Unable to upload image.");
  }
}
