import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import NewAttendanceRequestScreen from '../screens/NewAttendanceRequestScreen';
import LeavesScreen from '../screens/LeavesScreen';
import NewLeaveScreen from '../screens/NewLeaveScreen';
import TeamScreen from '../screens/TeamScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SocialScreen from '../screens/SocialScreen';
import NewPostScreen from '../screens/NewPostScreen';
import HelpdeskScreen from '../screens/HelpdeskScreen';
import NewTicketScreen from '../screens/NewTicketScreen';
import ApprovalsScreen from '../screens/ApprovalsScreen';
import PermissionsScreen from '../screens/PermissionsScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

function TabIcon({ name, color, size }) {
  return <Ionicons name={name} color={color} size={size || 22} />;
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: { borderTopColor: colors.border, height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen}
        options={{ tabBarIcon: (p) => <TabIcon {...p} name="home-outline" /> }} />
      <Tab.Screen name="Attendance" component={AttendanceScreen}
        options={{ tabBarIcon: (p) => <TabIcon {...p} name="time-outline" /> }} />
      <Tab.Screen name="Social" component={SocialScreen}
        options={{ tabBarIcon: (p) => <TabIcon {...p} name="people-outline" /> }}
      />
      <Tab.Screen name="Team" component={TeamScreen}
        options={{ tabBarIcon: (p) => <TabIcon {...p} name="git-network-outline" /> }} />
      <Tab.Screen name="More" component={ProfileScreen}
        options={{ tabBarIcon: (p) => <TabIcon {...p} name="person-outline" /> }}
        initialParams={{}}
      />
    </Tab.Navigator>
  );
}

function AppTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} />
      <Stack.Screen name="AttendanceRequests" component={AttendanceScreen} />
      <Stack.Screen name="NewAttendanceRequest" component={NewAttendanceRequestScreen} />
      <Stack.Screen name="Leaves" component={LeavesScreen} />
      <Stack.Screen name="NewLeave" component={NewLeaveScreen} />
      <Stack.Screen name="Team" component={TeamScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Social" component={SocialScreen} />
      <Stack.Screen name="NewPost" component={NewPostScreen} />
      <Stack.Screen name="Helpdesk" component={HelpdeskScreen} />
      <Stack.Screen name="NewTicket" component={NewTicketScreen} />
      <Stack.Screen name="Approvals" component={ApprovalsScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Manage employees' }} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="App" component={AppTabs} />
        ) : (
          <RootStack.Screen name="Login" component={LoginScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
