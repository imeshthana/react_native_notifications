import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native';
import React , {useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import moment from 'moment';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

// Function to retrieve notifications from AsyncStorage
  const getStoredNotifications = async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem('notifications');
      if (storedNotifications) {
        let parsedNotifications = storedNotifications ? JSON.parse(storedNotifications) : [];
        parsedNotifications.reverse();
        setNotifications(parsedNotifications);      
      }
    } catch (error) {
      console.log('Error fetching notifications:', error);
    }
  };

// Fetch stored notifications initially
  useEffect(() => {
    getStoredNotifications();
  },[]);

// Function to delete all stored notifications from AsyncStorage.
  const deleteAllNotifications = async () => {
    try {
      await AsyncStorage.removeItem('notifications');
      setNotifications([]);
    } catch (error) {
      console.log('Error deleting notifications:', error);
    }
  };

// Helper function to format the notification date for display
  const getFormattedDate = (time) => {
    const notificationDate = moment(time);
    const today = moment().startOf('day');
    
    if (notificationDate.isSame(today, 'day')) {
      return 'Today';
    } else if (notificationDate.isSame(today.subtract(1, 'days'), 'day')) {
      return 'Yesterday';
    } else {
      return notificationDate.format('dddd');
    }
  };

  // Function to render a single notification item in the list
  const renderNotificationItem = ({ item }) => (
    <View style={styles.notificationCard}>
      {item.image ? 
        <Image source={{ uri: item.image }} style={styles.notificationImage} />
        : <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.notificationImage}/>
      }
      <View style={styles.notificationContent}>
        <Text style={styles.dateText}>{getFormattedDate(item.time)}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.msg}</Text>
      </View>
    </View>
  );

  return (
      <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Notifications</Text>
              <TouchableOpacity style={styles.iconWrapper} onPress={deleteAllNotifications}>
                    <AntDesign name="delete" size={24} color="white" />
                </TouchableOpacity>
            </View>
            {notifications.length > 0 ? (<FlatList
              data={notifications}
              renderItem={renderNotificationItem}
              keyExtractor={(item, index) => index.toString()}
            />):(
              <Text style={styles.noNotificationsText}>No notifications yet</Text>
            )}
            <StatusBar style="auto" />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  header: {
    marginTop:20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
},
iconWrapper: {
    width: 24, 
},
dateText: {
  color: '#B3ABBC', 
  fontSize: 12,
  textAlign: 'right',
},
  headerText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 10,
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  notificationImage: {
    width: 50,
    height: 50,
    marginTop: 15,
    marginRight: 16,
    borderRadius: 25,
  },
  notificationContent: {
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
    position: 'absolute',
    top: 10,
    right: 10,
    margin: 5
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  metaData: {
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  timeText: {
    color: 'gray',
    fontSize: 12,
    marginTop: 5,
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  noNotificationsText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 20,
  }
});