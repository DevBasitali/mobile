// components/QRCodeDisplay.jsx
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const QR_SIZE = width * 0.7;

const COLORS = {
    navy: { 900: '#0A1628', 800: '#0F2137', 700: '#152A46' },
    gold: { 500: '#F59E0B' },
    white: '#FFFFFF',
    gray: { 400: '#9CA3AF' },
};

/**
 * QR Code Display Component for Customers
 * Shows their booking's handover secret as a scannable QR
 */
export default function QRCodeDisplay({ visible, onClose, qrValue, title = "Handover QR Code" }) {
    if (!qrValue) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

                    {/* QR Code */}
                    <View style={styles.qrContainer}>
                        <QRCode
                            value={qrValue}
                            size={QR_SIZE}
                            backgroundColor={COLORS.white}
                            color={COLORS.navy[900]}
                        />
                    </View>

                    {/* Instructions */}
                    <View style={styles.instructions}>
                        <Ionicons name="information-circle-outline" size={20} color={COLORS.gold[500]} />
                        <Text style={styles.instructionText}>
                            Show this QR code to the car owner when picking up or returning the car.
                        </Text>
                    </View>

                    {/* Close Button */}
                    <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
                        <Text style={styles.doneBtnText}>Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        backgroundColor: COLORS.navy[800],
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.white,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.navy[700],
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrContainer: {
        padding: 20,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        marginBottom: 24,
    },
    instructions: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    instructionText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.gray[400],
        lineHeight: 20,
    },
    doneBtn: {
        width: '100%',
        backgroundColor: COLORS.gold[500],
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    doneBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.navy[900],
    },
});
