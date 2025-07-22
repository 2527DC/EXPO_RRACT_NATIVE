import React, { useState  } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Calendar, Clock, MapPin, Plus, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookingsScreen() {
  
  const [selectedDates, setSelectedDates] = useState([]);
  const [bookingType, setBookingType] = useState('login');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Main Office');
  const [showCalendar, setShowCalendar] = useState(false);

  const timeSlots = {
    login: ['10:00', '12:00', '14:00'],
    logout: ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
  };

  const locations = ['Main Office', 'Branch Office', 'Client Site A', 'Client Site B'];

  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    const oneMonthFromToday = new Date();
    oneMonthFromToday.setMonth(today.getMonth() + 1);

    for (let d = new Date(today); d <= oneMonthFromToday; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = false;

      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        display: d.getDate(),
        isDisabled: isWeekend || isHoliday,
        isSelected: selectedDates.includes(dateStr),
      });
    }
    return days;
  };

  // const handleDateSelect = (date) => {
  //   if (selectedDates.includes(date)) {
  //     setSelectedDates(selectedDates.filter(d => d !== date));
  //   } else {
  //     setSelectedDates([...selectedDates, date]);
  //   }
  // };

  const handleDateSelect = (date) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter(d => d !== date));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const handleBooking = () => {
    if (selectedDates.length === 0) {
      Alert.alert('Error', 'Please select at least one date');
      return;
    }
    if (!selectedTime) {
      Alert.alert('Error', 'Please select a time');
      return;
    }

    Alert.alert(
      'Confirm Booking',
      `Book ${bookingType} for ${selectedDates.length} day(s) at ${selectedTime}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            // Handle booking logic here
            const formattedDate = new Date(selectedDates[0]).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
            Alert.alert('Success', 'Booking confirmed!');
            setSelectedDates([]);
            setSelectedTime('');
          }
        }
      ]
    );
  };

  const calendarDays = generateCalendarDays();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>New Booking</Text>
          <Text style={styles.subtitle}>Schedule your transfer</Text>
        </View>

        {/* Booking Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Type</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                bookingType === 'login' && styles.activeTypeButton
              ]}
              onPress={() => setBookingType('login')}
            >
              <Text style={[
                styles.typeButtonText,
                bookingType === 'login' && styles.activeTypeButtonText
              ]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                bookingType === 'logout' && styles.activeTypeButton
              ]}
              onPress={() => setBookingType('logout')}
            >
              <Text style={[
                styles.typeButtonText,
                bookingType === 'logout' && styles.activeTypeButtonText
              ]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Dates</Text>
          <TouchableOpacity
            style={styles.calendarToggle}
            onPress={() => setShowCalendar(!showCalendar)}
          >
            <Calendar size={20} color="#2563eb" />
            <Text style={styles.calendarToggleText}>
              {selectedDates.length === 0 ? 'Select dates' : `${selectedDates.length} day(s) selected`}
            </Text>
          </TouchableOpacity>

          {showCalendar && (
            <View style={styles.calendar}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>Select Multiple Days</Text>
                <TouchableOpacity onPress={() => setShowCalendar(false)}>
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <View style={styles.calendarGrid}>
                {calendarDays.map((day) => (
                  <TouchableOpacity
                    key={day.date}
                    style={[
                      styles.calendarDay,
                      day.isSelected && styles.selectedDay,
                      day.isDisabled && styles.disabledDay,
                    ]}
                    onPress={() => !day.isDisabled && handleDateSelect(day.date)}
                    disabled={day.isDisabled}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      day.isSelected && styles.selectedDayText,
                      day.isDisabled && styles.disabledDayText,
                    ]}>
                      {day.display}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.timeSlots}>
            {timeSlots[bookingType].map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.activeTimeSlot
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Clock size={16} color={selectedTime === time ? '#ffffff' : '#6b7280'} />
                <Text style={[
                  styles.timeSlotText,
                  selectedTime === time && styles.activeTimeSlotText
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationSelector}>
            {locations.map((location) => (
              <TouchableOpacity
                key={location}
                style={[
                  styles.locationButton,
                  selectedLocation === location && styles.activeLocationButton
                ]}
                onPress={() => setSelectedLocation(location)}
              >
                <MapPin size={16} color={selectedLocation === location ? '#ffffff' : '#6b7280'} />
                <Text style={[
                  styles.locationButtonText,
                  selectedLocation === location && styles.activeLocationButtonText
                ]}>
                  {location}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Booking Summary */}
        {selectedDates.length > 0 && selectedTime && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <Text style={styles.summaryText}>
              {bookingType === 'login' ? 'Login' : 'Logout'} booking for {selectedDates.length} day(s)
            </Text>
            <Text style={styles.summaryText}>Time: {selectedTime}</Text>
            <Text style={styles.summaryText}>Location: {selectedLocation}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBooking}
          >
            <Plus size={20} color="#ffffff" />
            <Text style={styles.bookButtonText}>Confirm Booking</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  activeTypeButton: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTypeButtonText: {
    color: '#ffffff',
  },
  calendarToggle: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  calendarToggleText: {
    fontSize: 16,
    color: '#1f2937',
  },
  calendar: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  calendarDay: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  selectedDay: {
    backgroundColor: '#2563eb',
  },
  disabledDay: {
    backgroundColor: '#f9fafb',
    opacity: 0.5,
  },
  calendarDayText: {
    fontSize: 14,
    color: '#1f2937',
  },
  selectedDayText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  disabledDayText: {
    color: '#9ca3af',
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 100,
  },
  activeTimeSlot: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#6b7280',
  },
  activeTimeSlotText: {
    color: '#ffffff',
  },
  locationSelector: {
    gap: 8,
  },
  locationButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeLocationButton: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  locationButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  activeLocationButtonText: {
    color: '#ffffff',
  },
  summary: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  actions: {
    marginBottom: 24,
  },
  bookButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});