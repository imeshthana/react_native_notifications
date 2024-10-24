import { View , Alert } from 'react-native';
import React , {useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import Notifications from './screens/notifications';

export default function App() {
  // const notifications = [
  //   { title: 'Notification 1', msg: 'Notification body 1', image: 'https://via.placeholder.com/150', time: new Date().getTime() },
  //   { title: 'Notification 2', msg: 'Notification body 2', image: 'https://via.placeholder.com/150', time: new Date().getTime() },
  //   { title: 'Notification 3', msg: 'Notification body 3', image: 'https://via.placeholder.com/150', time: new Date().getTime() },
  //   { title: 'Notification 4', msg: 'Notification body 4', image: 'https://via.placeholder.com/150', time: new Date().getTime() },
  //   { title: 'Notification 5', msg: 'Notification body 5', image: 'https://via.placeholder.com/150', time: new Date().getTime() },
  //   { title: 'Notification 6', msg: 'Notification body 6', image: 'https://via.placeholder.com/150', time: new Date().getTime() },
  //   { title: 'Notification 7', msg: 'Notification body 7', image: 'https://via.placeholder.com/150', time: new Date().getTime() },
  //   { title: 'Notification 8', msg: 'Notification body 8', image: 'https://via.placeholder.com/150', time: new Date().getTime() },
  //   { title: 'Notification 9', msg: 'Notification body 9', image: 'https://via.placeholder.com/150', time: new Date().getTime() },
  //   { title: 'Notification 10', msg: 'Notification body 10', image: 'https://via.placeholder.com/150', time: new Date().getTime() }
  // ];

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  const saveNotification = async (notification) => {
    try {
      const storedNotifications = await AsyncStorage.getItem('notifications');
      const notificationsArray = storedNotifications ? JSON.parse(storedNotifications) : [];
 
      const title = notification.notification?.title || 'No title';
      const msg = notification.notification?.body || 'No message';
      const image = notification.notification?.android?.imageUrl || null;
      const time = new Date().getTime();
      const newNotification = { title, msg, image, time};  

      notificationsArray.push(newNotification);
      await AsyncStorage.setItem('notifications', JSON.stringify(notificationsArray));
    } catch (error) {
      console.log('Error saving notification:', error);
    }
  };

  useEffect(() => {
    if(requestUserPermission()){
      messaging().getToken().then(token => {
        console.log('FCM Token:', token);
      });
    } else {
      console.log('Permission not granted');
    }

    messaging().getInitialNotification().then(async remoteMessage => {
      if (remoteMessage) {
        console.log('Notifications caused app to open from quit state:', remoteMessage.notification);
        const notification = remoteMessage.notification;
        Alert.alert(notification.title, notification.body);
        saveNotification(remoteMessage);
      }
    });

    messaging().onNotificationOpenedApp(async remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage.notification);
      const notification = remoteMessage.notification;
      Alert.alert(notification.title, notification.body);
      saveNotification(remoteMessage); 
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background:', remoteMessage.notification);
      saveNotification(remoteMessage);
    });


    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Notification received in foreground:', remoteMessage.notification);
      const notification = remoteMessage.notification;
      Alert.alert(notification.title, notification.body);
      saveNotification(remoteMessage); 
    });

    return unsubscribe;
  },[]);


  return (
    <View>
      <Notifications />
    </View>
  );
}