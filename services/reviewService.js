// services/reviewService.js
import api from "./api";

/**
 * Submit a review for a completed booking
 * @param {string} bookingId - The booking ID to review
 * @param {number} rating - Rating from 1-5
 * @param {string} comment - Review comment
 * @returns {Promise} Created review object
 */
export const addReview = async (bookingId, rating, comment) => {
    const response = await api.post("/reviews/add", { bookingId, rating, comment });
    return response.data;
};

/**
 * Get all reviews for a specific car
 * @param {string} carId - The car ID
 * @returns {Promise} Object with reviews array, averageRating, and totalReviews
 */
export const getCarReviews = async (carId) => {
    const response = await api.get(`/reviews/car/${carId}`);
    return response.data;
};

/**
 * Get all reviews submitted by the current user
 * @returns {Promise} Array of user's reviews with car details
 */
export const getMyReviews = async () => {
    const response = await api.get("/reviews/my-reviews");
    return response.data;
};

export default { addReview, getCarReviews, getMyReviews };
