// services/handoverService.js
import api from "./api";

/**
 * Host scans customer's QR code to verify handover
 * @param {string} qrCode - The handover secret from QR
 */
export const scanQR = async (qrCode) => {
    const response = await api.post("/handover/scan", { qrCode });
    return response.data;
};

/**
 * Host submits pickup photos to start the trip
 * @param {string} bookingId - Booking ID
 * @param {FormData} formData - Form data with images
 */
export const submitPickup = async (bookingId, formData) => {
    formData.append("bookingId", bookingId);
    const response = await api.post("/handover/pickup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000, // 60 seconds for image upload
    });
    return response.data;
};

/**
 * Host submits return photos to complete the trip
 * @param {string} bookingId - Booking ID
 * @param {FormData} formData - Form data with images
 */
export const submitReturn = async (bookingId, formData) => {
    formData.append("bookingId", bookingId);
    const response = await api.post("/handover/return", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000, // 60 seconds for image upload
    });
    return response.data;
};

export default {
    scanQR,
    submitPickup,
    submitReturn,
};
