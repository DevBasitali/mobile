import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { addReview } from '../services/reviewService';

const COLORS = {
  background: '#0A1628',
  card: '#1E3A5F',
  gold: '#F59E0B',
  goldDark: '#D97706',
  white: '#FFFFFF',
  gray: '#94A3B8',
  border: '#2A4A73',
};

export default function ReviewModal({ visible, onClose, bookingId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Please write at least 10 characters');
      return;
    }

    try {
      setLoading(true);
      await addReview(bookingId, rating, comment.trim());
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    setError('');
    onClose();
  };

  const StarButton = ({ value }) => (
    <TouchableOpacity onPress={() => setRating(value)} activeOpacity={0.7}>
      <Ionicons
        name={value <= rating ? 'star' : 'star-outline'}
        size={36}
        color={COLORS.gold}
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Rate Your Experience</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Star Rating */}
          <View style={styles.starsContainer}>
            <Text style={styles.ratingLabel}>Tap to rate</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarButton key={star} value={star} />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {rating > 0 ? ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating] : ''}
            </Text>
          </View>

          {/* Comment Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Review</Text>
            <TextInput
              style={styles.textArea}
              value={comment}
              onChangeText={setComment}
              placeholder="Share your experience with this car..."
              placeholderTextColor={COLORS.gray}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{comment.length}/500</Text>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={loading ? [COLORS.gray, COLORS.gray] : [COLORS.gold, COLORS.goldDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitBtn}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="send" size={20} color={COLORS.white} />
                  <Text style={styles.submitText}>Submit Review</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: COLORS.card,
    borderRadius: 12,
  },
  starsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingLabel: {
    color: COLORS.gray,
    fontSize: 14,
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingText: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    height: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: COLORS.gray,
    fontSize: 13,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    color: COLORS.white,
    fontSize: 15,
    minHeight: 100,
  },
  charCount: {
    color: COLORS.gray,
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.15)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    flex: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 8,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
