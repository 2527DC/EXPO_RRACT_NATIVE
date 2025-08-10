import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SectionList, Modal, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, CalendarPlus, Home, Briefcase, Filter } from 'lucide-react-native';
import api_client from '../../api/API_CIENT';

export default function TripHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [logTypeFilter, setLogTypeFilter] = useState('all');
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 10,
    hasMore: true
  });

  const getStatusColor = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case 'Confirmed': return '#10b981';
      case 'Pending': return '#f59e0b';
      case 'Cancelled': return '#ef4444';
      case 'Completed': return '#3b82f6';
      default: return '#6b7280';
    }
  }, []);

  const fetchBookings = useCallback(async (isRefreshing = false, isFilterChange = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else if (!isFilterChange) {
        // Only set loading if it's not a filter change and not a refresh
        // (filter changes will show the refresh indicator in SectionList)
        setLoading(true);
      }

      setError(null);

      const capitalizeFirst = (str) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      };

      const params = {
        status: statusFilter === 'all' ? undefined : capitalizeFirst(statusFilter),
        skip: isRefreshing || isFilterChange ? 0 : pagination.skip,
        limit: pagination.limit
      };

      console.log("📡 Fetching bookings with params:", params);

      const response = await api_client.get('/employee/bookings/', { params });

      const receivedBookings = Array.isArray(response?.data?.bookings)
        ? response.data.bookings.map(item => ({
            ...item,
            booking_id: item.booking_id || `temp-${Date.now()}-${Math.random()}`,
          }))
        : [];

      setBookings(receivedBookings);
      setPagination({
        skip: receivedBookings.length,
        limit: pagination.limit,
        hasMore: receivedBookings.length === pagination.limit
      });

    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, pagination.limit]);

  // Reset pagination and fetch bookings when status filter changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, skip: 0, hasMore: true }));
    fetchBookings(false, true);
  }, [statusFilter, fetchBookings]);

  const handleRefresh = useCallback(() => {
    fetchBookings(true);
  }, [fetchBookings]);

  const handleEndReached = useCallback(() => {
    if (!loading && pagination.hasMore) {
      fetchBookings();
    }
  }, [loading, pagination.hasMore, fetchBookings]);

  const filteredBookings = useCallback(() => {
    return bookings.filter(item => {
      if (!item?.shift_details) return false;
      return logTypeFilter === 'all' || item.shift_details.log_type === logTypeFilter;
    });
  }, [bookings, logTypeFilter]);

  const categorizedData = [
    {
      title: "Home to Office",
      data: filteredBookings().filter(item => item?.shift_details?.log_type === 'in'),
      icon: <Home size={20} color="#10b981" />
    },
    {
      title: "Office to Home",
      data: filteredBookings().filter(item => item?.shift_details?.log_type === 'out'),
      icon: <Briefcase size={20} color="#3b82f6" />
    }
  ].filter(section => section.data.length > 0);

  const renderBookingItem = ({ item }) => {
    if (!item?.shift_details) return null;
    
    return (
      <View style={styles.bookingCard}>
        <View style={styles.cardHeader}>
          <View style={styles.shiftCodeBadge}>
            <Text style={styles.shiftCodeText}>{item.shift_details.shift_code || 'N/A'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status?.toUpperCase() || 'UNKNOWN'}</Text>
          </View>
        </View>
        
        <View style={styles.routeContainer}>
          <View style={styles.routeIcon}>
            {item.shift_details.log_type === 'in' ? (
              <Home size={20} color="#10b981" />
            ) : (
              <Briefcase size={20} color="#3b82f6" />
            )}
          </View>
          <View style={styles.routeArrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
          <View style={styles.routeIcon}>
            {item.shift_details.log_type === 'in' ? (
              <Briefcase size={20} color="#3b82f6" />
            ) : (
              <Home size={20} color="#10b981" />
            )}
          </View>
        </View>
        
        <View style={styles.routeTextContainer}>
          <Text style={styles.routeText}>
            {item.shift_details.log_type === 'in' ? 'Home to Office' : 'Office to Home'}
          </Text>
        </View>
        
        <View style={styles.shiftInfo}>
          <View style={styles.infoRow}>
            <Clock size={16} color="#6b7280" />
            <Text style={styles.infoText}>{item.shift_details.shift_time || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <CalendarPlus size={16} color="#6b7280" />
            <Text style={styles.infoText}>{item.date || 'N/A'}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      {section.icon}
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Trips</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter size={20} color="#3b82f6" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>
      
      <SectionList
        sections={categorizedData}
        renderItem={renderBookingItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={item => item.booking_id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading...' : 'No trips found with current filters'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          pagination.hasMore && !refreshing ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color="#3b82f6" />
            </View>
          ) : null
        }
      />
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Trips</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Trip Type</Text>
              <View style={styles.filterOptions}>
                <Pressable 
                  style={[styles.filterOption, logTypeFilter === 'all' && styles.filterOptionActive]}
                  onPress={() => setLogTypeFilter('all')}
                >
                  <Text style={[styles.filterOptionText, logTypeFilter === 'all' && styles.filterOptionTextActive]}>All</Text>
                </Pressable>
                <Pressable 
                  style={[styles.filterOption, logTypeFilter === 'in' && styles.filterOptionActive]}
                  onPress={() => setLogTypeFilter('in')}
                >
                  <Text style={[styles.filterOptionText, logTypeFilter === 'in' && styles.filterOptionTextActive]}>Home to Office</Text>
                </Pressable>
                <Pressable 
                  style={[styles.filterOption, logTypeFilter === 'out' && styles.filterOptionActive]}
                  onPress={() => setLogTypeFilter('out')}
                >
                  <Text style={[styles.filterOptionText, logTypeFilter === 'out' && styles.filterOptionTextActive]}>Office to Home</Text>
                </Pressable>
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.filterOptions}>
                <Pressable 
                  style={[styles.filterOption, statusFilter === 'all' && styles.filterOptionActive]}
                  onPress={() => setStatusFilter('all')}
                >
                  <Text style={[styles.filterOptionText, statusFilter === 'all' && styles.filterOptionTextActive]}>All</Text>
                </Pressable>
                <Pressable 
                  style={[styles.filterOption, statusFilter === 'Confirmed' && styles.filterOptionActive]}
                  onPress={() => setStatusFilter('Confirmed')}
                >
                  <Text style={[styles.filterOptionText, statusFilter === 'Confirmed' && styles.filterOptionTextActive]}>Confirmed</Text>
                </Pressable>
                <Pressable 
                  style={[styles.filterOption, statusFilter === 'Pending' && styles.filterOptionActive]}
                  onPress={() => setStatusFilter('Pending')}
                >
                  <Text style={[styles.filterOptionText, statusFilter === 'Pending' && styles.filterOptionTextActive]}>Pending</Text>
                </Pressable>
                <Pressable 
                  style={[styles.filterOption, statusFilter === 'Cancelled' && styles.filterOptionActive]}
                  onPress={() => setStatusFilter('Cancelled')}
                >
                  <Text style={[styles.filterOptionText, statusFilter === 'Cancelled' && styles.filterOptionTextActive]}>Cancelled</Text>
                </Pressable>
                <Pressable 
                  style={[styles.filterOption, statusFilter === 'Completed' && styles.filterOptionActive]}
                  onPress={() => setStatusFilter('Completed')}
                >
                  <Text style={[styles.filterOptionText, statusFilter === 'Completed' && styles.filterOptionTextActive]}>Completed</Text>
                </Pressable>
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => {
                  setStatusFilter('Pending'); // Reset to pending
                  setLogTypeFilter('all');
                }}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonText: {
    marginLeft: 8,
    color: '#3b82f6',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#f9fafb',
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  shiftCodeBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  shiftCodeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4f46e5',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  routeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeArrow: {
    marginHorizontal: 12,
  },
  arrowText: {
    fontSize: 20,
    color: '#6b7280',
  },
  routeTextContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  shiftInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalClose: {
    fontSize: 20,
    color: '#6b7280',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  filterOptionActive: {
    backgroundColor: '#e0e7ff',
    borderColor: '#a5b4fc',
  },
  filterOptionText: {
    color: '#4b5563',
  },
  filterOptionTextActive: {
    color: '#4f46e5',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    marginRight: 8,
  },
  resetButtonText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    marginLeft: 8,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});
