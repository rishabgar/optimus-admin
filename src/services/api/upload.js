import api from "./axios";

export const getSignedUploadUrl = async (adminId, contentType) => {
  const response = await api.get(`/upload/signed/url/${adminId}`, {
    params: { contentType },
  });

  return response.data?.data;
};
