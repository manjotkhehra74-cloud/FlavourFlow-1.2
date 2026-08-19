import React, { useContext, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { NavigationContainer, DefaultTheme, DrawerActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthContext } from '../context/AuthContext';
import { colors, gradients } from '../theme';
import { Avatar, GradientView } from '../components/UI';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import SocialScreen from '../screens/SocialScreen';
import TeamScreen from '../screens/TeamScreen';
import LeavesScreen from '../screens/LeavesScreen';
import HelpdeskScreen from '../screens/HelpdeskScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ApprovalsScreen from '../screens/ApprovalsScreen';
import NewLeaveScreen from '../screens/NewLeaveScreen';
import NewAttendanceRequestScreen from '../screens/NewAttendanceRequestScreen';
import NewPostScreen from '../screens/NewPostScreen';
import NewTicketScreen from '../screens/NewTicketScreen';
import PermissionsScreen from '../screens/PermissionsScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.white,
    text: colors.text,
    primary: colors.primary,
    border: colors.border,
    notification: colors.primary,
  },
};

function TabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const isCenter = route.name === 'Punch';

        if (isCenter) {
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.fabWrap}
              onPress={() => options.tabOnPress?.()}
              activeOpacity={0.85}
            >
              <LinearGradient colors={gradients.brand} style={styles.fab}>
                <Ionicons name="finger-print" size={26} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          );
        }

        const icon = options.tabBarIcon;
        const label = options.title || route.name;
        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name={icon || 'ellipse-outline'}
              size={22}
              color={isFocused ? colors.primary : '#94A3B8'}
            />
            <Text style={[styles.tabLabel, { color: isFocused ? colors.primary : '#94A3B8' }]} numberOfLines={1}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { display: 'none' },
      })}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home', tabBarIcon: 'home-outline' }}
      />
      <Tab.Screen
        name="Team"
        component={TeamScreen}
        options={{ title: 'Team', tabBarIcon: 'people-outline' }}
      />
      <Tab.Screen
        name="Punch"
        component={View}
        listeners={{ tabPress: (e) => { e.preventDefault(); } }}
        options={{ title: '' }}
      />
      <Tab.Screen
        name="Social"
        component={SocialScreen}
        options={{ title: 'Social', tabBarIcon: 'chatbubbles-outline' }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{ title: 'More', tabBarIcon: 'grid-outline' }}
      />
    </Tab.Navigator>
  );
}

function MoreScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const items = [
    { icon: 'person-outline', label: 'My Profile', to: { screen: 'Profile', params: { id: user.id } } },
    { icon: 'calendar-outline', label: 'Attendance', to: 'Attendance' },
    { icon: 'time-outline', label: 'Leave Management', to: 'Leaves' },
    { icon: 'headset-outline', label: 'Helpdesk', to: 'Helpdesk' },
    { icon: 'checkmark-done-outline', label: 'Approvals', to: 'Approvals', show: user?.role !== 'employee' },
    { icon: 'people-circle-outline', label: 'Manage Employees', to: 'AdminUsers', show: user?.role === 'admin' },
    { icon: 'shield-checkmark-outline', label: 'Permissions', to: 'Permissions' },
  ];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <Text style={styles.moreTitle}>More</Text>
      {items.filter(i => i.show !== false).map((it, i) => (
        <TouchableOpacity
          key={i}
          style={styles.moreRow}
          onPress={() => navigation.navigate(it.to.screen || it.to, it.to.params)}
        >
          <View style={styles.moreIconWrap}>
            <Ionicons name={it.icon} size={20} color={colors.primary} />
          </View>
          <Text style={styles.moreLabel}>{it.label}</Text>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}

function CustomDrawerContent(props) {
  const { user, logout } = useContext(AuthContext);
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('');
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: colors.navy, paddingTop: 40 }}>
      <LinearGradient
        colors={['#1E1B4B', '#0F172A']}
        style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <LinearGradient colors={gradients.brand} style={{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{initials}</Text>
          </LinearGradient>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{user?.name}</Text>
            <Text style={{ color: '#A5B4FC', fontSize: 12, textTransform: 'capitalize' }}>{user?.role} · {user?.designation || user?.department || ''}</Text>
          </View>
        </View>
      </LinearGradient>

      {[
        { icon: 'grid-outline', label: 'Dashboard', screen: 'Tabs' },
        { icon: 'people-outline', label: 'Employees', screen: 'Team', show: user?.role !== 'employee' },
        { icon: 'time-outline', label: 'Attendance', screen: 'Attendance' },
        { icon: 'calendar-outline', label: 'Leave Management', screen: 'Leaves' },
        { icon: 'checkmark-done-outline', label: 'Approvals', screen: 'Approvals', show: user?.role !== 'employee' },
        { icon: 'people-circle-outline', label: 'Manage Employees', screen: 'AdminUsers', show: user?.role === 'admin' },
        { icon: 'headset-outline', label: 'Helpdesk', screen: 'Helpdesk' },
        { icon: 'shield-checkmark-outline', label: 'Permissions', screen: 'Permissions' },
      ].filter(i => i.show !== false).map((it, i) => (
        <TouchableOpacity
          key={i}
          style={styles.drawerRow}
          onPress={() => props.navigation.navigate(it.screen)}
        >
          <Ionicons name={it.icon} size={20} color="#C7D2FE" />
          <Text style={styles.drawerLabel}>{it.label}</Text>
        </TouchableOpacity>
      ))}

      <View style={{ flex: 1 }} />
      <TouchableOpacity style={[styles.drawerRow, { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' }]} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#FCA5A5" />
        <Text style={[styles.drawerLabel, { color: '#FCA5A5' }]}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

function DrawerNav() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.navy, elevation: 0, shadowOpacity: 0 },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '800' },
        drawerStyle: { width: 280, backgroundColor: colors.navy },
        drawerLabelStyle: { color: '#E0E7FF' },
        drawerActiveBackgroundColor: 'rgba(124,58,237,0.18)',
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#C7D2FE',
        sceneContainerStyle: { backgroundColor: colors.bg },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Tabs" component={MainTabs} options={{ title: 'Pulse HR', drawerLabel: 'Dashboard', drawerIcon: ({ color }) => <Ionicons name="grid-outline" size={20} color={color} /> }} />
      <Drawer.Screen name="Team" component={TeamScreen} options={{ drawerLabel: 'Employees', drawerIcon: ({ color }) => <Ionicons name="people-outline" size={20} color={color} /> }} />
      <Drawer.Screen name="Attendance" component={AttendanceScreen} options={{ drawerIcon: ({ color }) => <Ionicons name="time-outline" size={20} color={color} /> }} />
      <Drawer.Screen name="Leaves" component={LeavesScreen} options={{ title: 'Leave Management', drawerIcon: ({ color }) => <Ionicons name="calendar-outline" size={20} color={color} /> }} />
      <Drawer.Screen name="Helpdesk" component={HelpdeskScreen} options={{ drawerIcon: ({ color }) => <Ionicons name="headset-outline" size={20} color={color} /> }} />
      <Drawer.Screen name="Approvals" component={ApprovalsScreen} options={{ drawerIcon: ({ color }) => <Ionicons name="checkmark-done-outline" size={20} color={color} /> }} />
      <Drawer.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Manage Employees', drawerIcon: ({ color }) => <Ionicons name="people-circle-outline" size={20} color={color} /> }} />
      <Drawer.Screen name="Permissions" component={PermissionsScreen} options={{ drawerIcon: ({ color }) => <Ionicons name="shield-checkmark-outline" size={20} color={color} /> }} />
    </Drawer.Navigator>
  );
}

function HeaderRight() {
  const { user } = useContext(AuthContext);
  return (
    <TouchableOpacity style={{ marginRight: 12 }}>
      <Ionicons name="notifications-outline" size={22} color="#fff" />
    </TouchableOpacity>
  );
}

export default function RootNavigator() {
  const { user } = useContext(AuthContext);
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '800' },
          headerShadowVisible: false,
        }}
      >
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Drawer" component={DrawerNav} options={{ headerShown: false }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
            <Stack.Screen name="NewLeave" component={NewLeaveScreen} options={{ title: 'Apply Leave', presentation: 'modal' }} />
            <Stack.Screen name="NewAttendance" component={NewAttendanceRequestScreen} options={{ title: 'Regularise Attendance', presentation: 'modal' }} />
            <Stack.Screen name="NewPost" component={NewPostScreen} options={{ title: 'New Post', presentation: 'modal' }} />
            <Stack.Screen name="NewTicket" component={NewTicketScreen} options={{ title: 'New Ticket', presentation: 'modal' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff',
    paddingHorizontal: 8, paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#0f172a', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 12,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  tabLabel: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  fabWrap: { alignItems: 'center', justifyContent: 'center', marginTop: -28 },
  fab: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#4C1D95', shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  moreTitle: { fontSize: 28, fontWeight: '900', padding: 20, color: colors.text },
  moreRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 4, borderRadius: 16 },
  moreIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  moreLabel: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '700', color: colors.text },
  drawerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 14 },
  drawerLabel: { color: '#E0E7FF', fontSize: 14, fontWeight: '700' },
});
