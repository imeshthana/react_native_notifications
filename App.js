import { View , Alert } from 'react-native';
import React , {useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import Notifications from './screens/notifications';

export default function App() {
  // Function to request notification permissions from the user
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  // Function to save a new notification in AsyncStorage
  const saveNotification = async (notification) => {
    try {
      // Retrieve stored notifications from AsyncStorage.
      const storedNotifications = await AsyncStorage.getItem('notifications');
      const notificationsArray = storedNotifications ? JSON.parse(storedNotifications) : [];
 
      // Extract title, message, image, and time from the notification object
      const title = notification.notification?.title || 'No title';
      const msg = notification.notification?.body || 'No message';
      const image = notification.notification?.android?.imageUrl || null;
      const time = new Date().getTime();
      const newNotification = { title, msg, image, time};  

      // Add the new notification to the array and save it back to AsyncStorage
      notificationsArray.push(newNotification);
      await AsyncStorage.setItem('notifications', JSON.stringify(notificationsArray));

    } catch (error) {
      console.log('Error saving notification:', error);
    }
  };

  // useEffect to manage the initial setup, including requesting permission, handling notifications, and loading stored notifications
  useEffect(() => {
    if(requestUserPermission()){
      messaging().getToken().then(token => {
        console.log('FCM Token:', token);
      });
    } else {
      console.log('Permission not granted');
    }

    // Check if the app was opened by a notification when in a quit state
    messaging().getInitialNotification().then(async remoteMessage => {
      if (remoteMessage) {
        console.log('Notifications caused app to open from quit state:', remoteMessage.notification);
        const notification = remoteMessage.notification;
        Alert.alert(notification.title, notification.body);
        saveNotification(remoteMessage);
      }
    });

    // Handle notifications that open the app from the background state
    messaging().onNotificationOpenedApp(async remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage.notification);
      const notification = remoteMessage.notification;
      Alert.alert(notification.title, notification.body);
      saveNotification(remoteMessage); 
    });

    // Handle notifications received in the background
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background:', remoteMessage.notification);
      saveNotification(remoteMessage);
    });

    // Handle notifications received while the app is in the foreground
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Notification received in foreground:', remoteMessage.notification);
      const notification = remoteMessage.notification;
      Alert.alert(notification.title, notification.body);
      saveNotification(remoteMessage); 
    });

    return unsubscribe;
  },[]);

  return (
      <Notifications />
  );
}