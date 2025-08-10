import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Calendar, Clock, Plus, X, Check, ChevronDown } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api_client from '../../api/API_CIENT';

export default function BookingsScreen() {
  // Date selection states
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState('single'); // 'single', 'multiple', or 'range'
  const [rangeStart, setRangeStart] = useState(null);
  
  // Other states
  const [bookingType, setBookingType] = useState('in');
  const [selectedShift, setSelectedShift] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [shifts, setShifts] = useState([]);
  const [matchedDates, setMatchedDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showShifts, setShowShifts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchShifts = async () => {
    if (selectedDates.length === 0) {
      setShifts([]);
      setSelectedShift(null);
      setMatchedDates([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api_client.post('/employee/common-shifts/', {
        dates: selectedDates,
        log_type: bookingType
      });

      setShifts(response.data.shifts);
      setMatchedDates(response.data.your_dates || []);
      if (response.data.shifts.length > 0) {
        setSelectedShift(response.data.shifts[0]);
      } else {
        setSelectedShift(null);
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
      Alert.alert('Error', 'Failed to fetch available shifts');
      setMatchedDates([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setSelectedDates([]);
    setRangeStart(null);
    setBookingType('in');
    setSelectedShift(null);
    setShowCalendar(false);
    setShifts([]);
    setMatchedDates([]);
    setShowShifts(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchShifts();
  }, [selectedDates, bookingType]);

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
      
      const isSelected = selectedDates.includes(dateStr);
      const isRangeStart = rangeStart === dateStr;
      const isInRange = rangeStart && 
        selectedDates.includes(dateStr) && 
        dateStr !== rangeStart;

      days.push({
        date: dateStr,
        display: d.getDate(),
        isDisabled: isWeekend || isHoliday,
        isSelected,
        isRangeStart,
        isInRange,
      });
    }
    return days;
  };

  const handleDateSelect = (date) => {
    if (selectionMode === 'single') {
      setSelectedDates([date]);
      setRangeStart(null);
    } 
    else if (selectionMode === 'multiple') {
      setSelectedDates(prev => 
        prev.includes(date) 
          ? prev.filter(d => d !== date) 
          : [...prev, date]
      );
      setRangeStart(null);
    }
    else if (selectionMode === 'range') {
      if (!rangeStart) {
        setRangeStart(date);
        setSelectedDates([date]);
      } else {
        const startDate = new Date(rangeStart);
        const endDate = new Date(date);
        
        if (endDate < startDate) {
          // If selected date is before start date, swap them
          setRangeStart(date);
          handleRangeSelection(date, rangeStart);
        } else {
          handleRangeSelection(rangeStart, date);
        }
      }
    }
  };

  const handleRangeSelection = (start, end) => {
    const dates = [];
    const current = new Date(start);
    const endDate = new Date(end);
    
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
        dates.push(dateStr);
      }
      current.setDate(current.getDate() + 1);
    }
    
    setSelectedDates(dates);
    setRangeStart(null); // Reset range start after selection
  };

  const submitBooking = async () => {
    if (selectedDates.length === 0 || !selectedShift || matchedDates.length === 0) {
      Alert.alert('Error', 'Please select valid dates and a shift');
      return;
    }

    try {
      setLoading(true);
      console.log("Booking data:", {
        shift_id: selectedShift.shift_id,
        dates: matchedDates.join(','),
      });

      const response = await api_client.post('/employee/create_booking/', {
        shift_id: selectedShift.shift_id,
        dates: matchedDates.join(','),
      });

      Alert.alert('Success', 'Booking confirmed successfully!');
      onRefresh();
    } catch (error) {
      console.error('Error submitting booking:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to confirm booking');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (selectedDates.length === 0 || matchedDates.length === 0) {
      Alert.alert('Error', 'Please select dates with available shifts');
      return;
    }
    if (!selectedShift) {
      Alert.alert('Error', 'Please select a shift');
      return;
    }

    Alert.alert(
      'Confirm Booking',
      `Book ${bookingType} for ${matchedDates.length} day(s) at ${selectedShift.shift_time}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: submitBooking }
      ]
    );
  };

  const calendarDays = generateCalendarDays();

  const formatSelectedDates = () => {
    if (selectedDates.length === 0) return 'Select dates';
    if (selectionMode === 'single') return selectedDates[0];
    if (selectionMode === 'multiple') return `${selectedDates.length} dates selected`;
    if (selectionMode === 'range' && selectedDates.length > 1) {
      return `${selectedDates[0]} to ${selectedDates[selectedDates.length - 1]}`;
    }
    return selectedDates.join(', ');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Schedule your transport</Text>
        </View>

        {/* Booking Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Type</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                bookingType === 'in' && styles.activeTypeButton
              ]}
              onPress={() => setBookingType('in')}
            >
              <Text style={[
                styles.typeButtonText,
                bookingType === 'in' && styles.activeTypeButtonText
              ]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                bookingType === 'out' && styles.activeTypeButton
              ]}
              onPress={() => setBookingType('out')}
            >
              <Text style={[
                styles.typeButtonText,
                bookingType === 'out' && styles.activeTypeButtonText
              ]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Dates</Text>
          
          {/* Selection Mode Toggle */}
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                selectionMode === 'single' && styles.activeModeButton
              ]}
              onPress={() => {
                setSelectionMode('single');
                if (selectedDates.length > 1) setSelectedDates([selectedDates[0]]);
              }}
            >
              <Text style={[
                styles.modeButtonText,
                selectionMode === 'single' && styles.activeModeButtonText
              ]}>
                Single
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                selectionMode === 'multiple' && styles.activeModeButton
              ]}
              onPress={() => setSelectionMode('multiple')}
            >
              <Text style={[
                styles.modeButtonText,
                selectionMode === 'multiple' && styles.activeModeButtonText
              ]}>
                Multiple
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                selectionMode === 'range' && styles.activeModeButton
              ]}
              onPress={() => {
                setSelectionMode('range');
                setSelectedDates([]);
                setRangeStart(null);
              }}
            >
              <Text style={[
                styles.modeButtonText,
                selectionMode === 'range' && styles.activeModeButtonText
              ]}>
                Range
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.calendarToggle}
            onPress={() => setShowCalendar(!showCalendar)}
          >
            <Calendar size={20} color="#2563eb" />
            <Text style={styles.calendarToggleText}>
              {formatSelectedDates()}
            </Text>
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>

          {showCalendar && (
            <View style={styles.calendar}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>
                  {selectionMode === 'single' ? 'Select Date' : 
                   selectionMode === 'multiple' ? 'Select Multiple Dates' : 'Select Date Range'}
                </Text>
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
                      day.isRangeStart && styles.rangeStartDay,
                      day.isInRange && styles.inRangeDay,
                      day.isDisabled && styles.disabledDay,
                    ]}
                    onPress={() => handleDateSelect(day.date)}
                    disabled={day.isDisabled}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      (day.isSelected || day.isRangeStart || day.isInRange) && styles.selectedDayText,
                      day.isDisabled && styles.disabledDayText,
                    ]}>
                      {day.display}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectionMode === 'range' && rangeStart && (
                <Text style={styles.rangeHint}>
                  Now select end date for your range
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Shift Selection */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Fetching available shifts...</Text>
          </View>
        ) : (
          <>
            {shifts.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Available Shifts</Text>
                <TouchableOpacity
                  style={styles.shiftToggle}
                  onPress={() => setShowShifts(!showShifts)}
                >
                  <Clock size={20} color="#2563eb" />
                  <Text style={styles.shiftToggleText}>
                    {selectedShift ? `${selectedShift.shift_time} (${selectedShift.pickup_type})` : 'Select a shift'}
                  </Text>
                  <ChevronDown size={20} color="#6b7280" />
                </TouchableOpacity>

                {showShifts && (
                  <View style={styles.shiftOptions}>
                    {shifts.map((shift) => (
                      <TouchableOpacity
                        key={shift.shift_id}
                        style={[
                          styles.shiftOption,
                          selectedShift?.shift_id === shift.shift_id && styles.selectedShiftOption
                        ]}
                        onPress={() => {
                          setSelectedShift(shift);
                          setShowShifts(false);
                        }}
                      >
                        <Text style={styles.shiftOptionText}>
                          {shift.shift_time} ({shift.pickup_type})
                        </Text>
                        {selectedShift?.shift_id === shift.shift_id && (
                          <Check size={20} color="#2563eb" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ) : selectedDates.length > 0 ? (
              <View style={styles.noShiftsContainer}>
                <Text style={styles.noShiftsText}>
                  No common shift for selected dates. Please change the dates.
                </Text>
              </View>
            ) : null}
          </>
        )}

        {/* Booking Summary */}
        {selectedDates.length > 0 && selectedShift && matchedDates.length > 0 && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <Text style={styles.summaryText}>
              {bookingType === 'in' ? 'Login' : 'Logout'} booking for {matchedDates.length} day(s)
            </Text>
            <Text style={styles.summaryText}>Shift Time: {selectedShift.shift_time}</Text>
            <Text style={styles.summaryText}>Pickup Type: {selectedShift.pickup_type}</Text>
            <Text style={styles.summaryText}>
              Dates: {matchedDates.join(', ')}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.bookButton,
              (!selectedShift || selectedDates.length === 0 || matchedDates.length === 0) && styles.disabledButton
            ]}
            onPress={handleBooking}
            disabled={!selectedShift || selectedDates.length === 0 || matchedDates.length === 0}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    padding: 4,
    marginBottom: 12,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeModeButton: {
    backgroundColor: '#2563eb',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeModeButtonText: {
    color: '#ffffff',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTypeButton: {
    backgroundColor: '#2563eb',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTypeButtonText: {
    color: '#ffffff',
  },
  calendarToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  calendarToggleText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  calendar: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDay: {
    width: '14%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  calendarDayText: {
    fontSize: 14,
    color: '#111827',
  },
  selectedDay: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
  },
  rangeStartDay: {
    backgroundColor: '#1d4ed8',
    borderRadius: 20,
  },
  inRangeDay: {
    backgroundColor: '#93c5fd',
    borderRadius: 0,
  },
  selectedDayText: {
    color: '#ffffff',
  },
  disabledDay: {
    opacity: 0.5,
  },
  disabledDayText: {
    color: '#9ca3af',
  },
  rangeHint: {
    marginTop: 8,
    color: '#2563eb',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
  shiftToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  shiftToggleText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  shiftOptions: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  shiftOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  selectedShiftOption: {
    backgroundColor: '#f0f9ff',
  },
  shiftOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  noShiftsContainer: {
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  noShiftsText: {
    color: '#b91c1c',
    textAlign: 'center',
  },
  summary: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  actions: {
    marginBottom: 24,
  },
  bookButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  bookButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});