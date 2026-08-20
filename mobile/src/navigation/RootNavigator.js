import React, { useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator,
} from 'react-native';
import { NavigationContainer, DefaultTheme, DrawerActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthContext } from '../context/AuthContext';
import { PunchProvider, usePunch } from '../context/PunchContext';
import { colors, gradients } from '../theme';
import { PulseMark } from '../components/UI';

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
import AttendanceAdminScreen from '../screens/erp/AttendanceAdminScreen';
import ShiftRosterScreen from '../screens/erp/ShiftRosterScreen';
import OvertimeScreen from '../screens/erp/OvertimeScreen';
import RecruitmentScreen from '../screens/erp/RecruitmentScreen';
import PayrollScreen from '../screens/erp/PayrollScreen';
import TrainingScreen from '../screens/erp/TrainingScreen';
import LoansScreen from '../screens/erp/LoansScreen';
import BenefitsScreen from '../screens/erp/BenefitsScreen';
import DocumentsScreen from '../screens/erp/DocumentsScreen';
import PerformanceScreen from '../screens/erp/PerformanceScreen';
import AssetsScreen from '../screens/erp/AssetsScreen';
import ExpensesScreen from '../screens/erp/ExpensesScreen';
import CalendarScreen from '../screens/erp/CalendarScreen';
import ReportsScreen from '../screens/erp/ReportsScreen';
import OnboardingScreen from '../screens/erp/OnboardingScreen';
import HRPoliciesScreen from '../screens/erp/HRPoliciesScreen';
import CompanyDirectoryScreen from '../screens/erp/CompanyDirectoryScreen';
import NotificationsScreen from '../screens/erp/NotificationsScreen';
import EmployeeLifecycleScreen from '../screens/erp/EmployeeLifecycleScreen';
import HelpdeskDetailScreen from '../screens/erp/HelpdeskDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    primary: colors.primary,
    border: colors.border,
    notification: colors.primary,
  },
};

function TabBar({ state, descriptors, navigation }) {
  const punch = usePunch();
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
              onPress={() => punch.openPunch()}
              activeOpacity={0.85}
            >
              <LinearGradient colors={gradients.brand} style={styles.fab}>
                <Ionicons name="finger-print" size={26} color="#fff" />
              </LinearGradient>
              <Text style={styles.fabLabel}>Punch</Text>
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
            <View style={[styles.tabIconWrap, isFocused && styles.tabIconWrapOn]}>
              <Ionicons
                name={isFocused ? (options.tabBarIconOn || icon || 'ellipse') : (icon || 'ellipse-outline')}
                size={22}
                color={isFocused ? colors.primary : '#94A3B8'}
              />
            </View>
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
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { display: 'none' },
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home', tabBarIcon: 'home-outline', tabBarIconOn: 'home' }}
      />
      <Tab.Screen
        name="Team"
        component={TeamScreen}
        options={{ title: 'Team', tabBarIcon: 'people-outline', tabBarIconOn: 'people' }}
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
        options={{ title: 'Social', tabBarIcon: 'chatbubbles-outline', tabBarIconOn: 'chatbubbles' }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{ title: 'More', tabBarIcon: 'grid-outline', tabBarIconOn: 'grid' }}
      />
    </Tab.Navigator>
  );
}

function MoreScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const items = [
    { icon: 'person-outline', label: 'My Profile', to: { screen: 'Profile', params: { id: user?.id } } },
    { icon: 'calendar-outline', label: 'Attendance', to: 'Attendance' },
    { icon: 'shield-checkmark-outline', label: 'Attendance Admin', to: 'AttendanceAdmin', show: user?.role !== 'employee' },
    { icon: 'time-outline', label: 'Leave Management', to: 'Leaves' },
    { icon: 'calendar-outline', label: 'Shift & Roster', to: 'ShiftRoster' },
    { icon: 'timer-outline', label: 'Overtime', to: 'Overtime' },
    { icon: 'briefcase-outline', label: 'Recruitment (ATS)', to: 'Recruitment' },
    { icon: 'school-outline', label: 'Training (LMS)', to: 'Training' },
    { icon: 'trending-up-outline', label: 'Performance (KRA/KPI)', to: 'Performance' },
    { icon: 'document-outline', label: 'Employee Documents', to: 'Documents' },
    { icon: 'wallet-outline', label: 'Payroll Admin', to: 'Payroll' },
    { icon: 'cash-outline', label: 'Loans & Advances', to: 'Loans' },
    { icon: 'heart-outline', label: 'Benefits & Insurance', to: 'Benefits' },
    { icon: 'people-outline', label: 'Onboarding', to: 'Team' },
    { icon: 'book-outline', label: 'HR Policies', to: 'Helpdesk' },
    { icon: 'bar-chart-outline', label: 'Reports & Analytics', to: 'AttendanceAdmin' },
    { icon: 'calendar-outline', label: 'Calendar & Events', to: 'AttendanceAdmin' },
    { icon: 'headset-outline', label: 'Helpdesk', to: 'Helpdesk' },
    { icon: 'checkmark-done-outline', label: 'Approvals', to: 'Approvals', show: user?.role !== 'employee' },
    { icon: 'people-circle-outline', label: 'Manage Employees', to: 'AdminUsers', show: user?.role === 'admin' },
    { icon: 'shield-checkmark-outline', label: 'Permissions', to: 'Permissions' },
    { icon: 'cube-outline', label: 'Assets', to: 'Assets' },
    { icon: 'receipt-outline', label: 'Expenses', to: 'Expenses' },
    { icon: 'calendar-outline', label: 'Calendar & Events', to: 'Calendar' },
    { icon: 'bar-chart-outline', label: 'Reports & Analytics', to: 'Reports' },
    { icon: 'people-outline', label: 'Onboarding', to: 'Onboarding' },
    { icon: 'book-outline', label: 'HR Policies', to: 'HRPolicies' },
    { icon: 'people-circle-outline', label: 'Company Directory', to: 'CompanyDirectory' },
    { icon: 'notifications-outline', label: 'Notifications', to: 'Notifications' },
    { icon: 'git-compare-outline', label: 'Employee Lifecycle', to: 'EmployeeLifecycle' },
    { icon: 'headset-outline', label: 'Helpdesk Detail', to: 'HelpdeskDetail' },
  ];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View style={styles.moreHead}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Ionicons name="menu" size={22} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.moreTitle}>More</Text>
      </View>
      {items.filter((i) => i.show !== false).map((it, i) => (
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
      <TouchableOpacity style={[styles.moreRow, { marginTop: 16 }]} onPress={logout}>
        <View style={[styles.moreIconWrap, { backgroundColor: colors.redSoft }]}>
          <Ionicons name="log-out-outline" size={20} color={colors.red} />
        </View>
        <Text style={[styles.moreLabel, { color: colors.red }]}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function CustomDrawerContent(props) {
  const { user, logout } = useContext(AuthContext);
  const initials = (user?.name || 'U').split(' ').map((w) => w[0]).slice(0, 2).join('');
  const current = props.state.routeNames[props.state.index];

  const items = [
    { icon: 'grid-outline', label: 'Dashboard', screen: 'Tabs' },
    { icon: 'people-outline', label: 'Employees', screen: 'Team', show: user?.role !== 'employee' },
    { icon: 'time-outline', label: 'Attendance', screen: 'Attendance' },
    { icon: 'shield-checkmark-outline', label: 'Attendance Admin', screen: 'AttendanceAdmin', show: user?.role !== 'employee' },
    { icon: 'calendar-outline', label: 'Shift & Roster', screen: 'ShiftRoster' },
    { icon: 'timer-outline', label: 'Overtime', screen: 'Overtime' },
    { icon: 'briefcase-outline', label: 'Recruitment', screen: 'Recruitment' },
    { icon: 'school-outline', label: 'Training', screen: 'Training' },
    { icon: 'trending-up-outline', label: 'Performance', screen: 'Performance' },
    { icon: 'document-outline', label: 'Documents', screen: 'Documents' },
    { icon: 'cash-outline', label: 'Loans', screen: 'Loans' },
    { icon: 'heart-outline', label: 'Benefits', screen: 'Benefits' },
    { icon: 'cube-outline', label: 'Assets', screen: 'Assets' },
    { icon: 'receipt-outline', label: 'Expenses', screen: 'Expenses' },
    { icon: 'calendar-outline', label: 'Calendar', screen: 'Calendar' },
    { icon: 'bar-chart-outline', label: 'Reports', screen: 'Reports' },
    { icon: 'people-outline', label: 'Onboarding', screen: 'Onboarding' },
    { icon: 'book-outline', label: 'HR Policies', screen: 'HRPolicies' },
    { icon: 'people-circle-outline', label: 'Directory', screen: 'CompanyDirectory' },
    { icon: 'notifications-outline', label: 'Notifications', screen: 'Notifications' },
    { icon: 'wallet-outline', label: 'Payroll', screen: 'Payroll' },
    { icon: 'checkmark-done-outline', label: 'Approvals', screen: 'Approvals', show: user?.role !== 'employee' },
    { icon: 'people-circle-outline', label: 'Manage Employees', screen: 'AdminUsers', show: user?.role === 'admin' },
    { icon: 'headset-outline', label: 'Helpdesk', screen: 'Helpdesk' },
    { icon: 'shield-checkmark-outline', label: 'Permissions', screen: 'Permissions' },
  ].filter((i) => i.show !== false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.navy }} edges={['top', 'bottom']}>
      <LinearGradient
        colors={['#1E1B4B', '#0F172A']}
        style={{ padding: 20, paddingBottom: 22, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
          <LinearGradient colors={gradients.brand} style={styles.drawerLogo}>
            <PulseMark color="#fff" size={22} />
          </LinearGradient>
          <Text style={styles.drawerBrand}>Pulse HR</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <LinearGradient colors={gradients.brand} style={{ width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>{initials}</Text>
          </LinearGradient>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{user?.name}</Text>
            <Text style={{ color: '#A5B4FC', fontSize: 12, textTransform: 'capitalize' }}>
              {user?.role} · {user?.designation || user?.department || ''}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={{ paddingTop: 10 }}>
        {items.map((it) => {
          const active = current === it.screen;
          return (
            <TouchableOpacity
              key={it.screen + it.label}
              style={[styles.drawerRow, active && styles.drawerRowOn]}
              onPress={() => props.navigation.navigate(it.screen)}
            >
              <Ionicons name={it.icon} size={20} color={active ? '#fff' : '#C7D2FE'} />
              <Text style={[styles.drawerLabel, active && { color: '#fff' }]}>{it.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />
      <TouchableOpacity style={[styles.drawerRow, styles.drawerLogout]} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#FCA5A5" />
        <Text style={[styles.drawerLabel, { color: '#FCA5A5' }]}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function DrawerNav() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: { width: 292, backgroundColor: colors.navy },
        drawerLabelStyle: { color: '#E0E7FF' },
        drawerActiveBackgroundColor: 'rgba(124,58,237,0.18)',
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#C7D2FE',
        sceneContainerStyle: { backgroundColor: colors.bg },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Tabs" component={MainTabs} options={{ title: 'Pulse HR', drawerLabel: 'Dashboard' }} />
      <Drawer.Screen name="Team" component={TeamScreen} options={{ drawerLabel: 'Employees' }} />
      <Drawer.Screen name="Attendance" component={AttendanceScreen} />
      <Drawer.Screen name="AttendanceAdmin" component={AttendanceAdminScreen} options={{ title: 'Attendance Admin' }} />
      <Drawer.Screen name="ShiftRoster" component={ShiftRosterScreen} options={{ title: 'Shift & Roster' }} />
      <Drawer.Screen name="Overtime" component={OvertimeScreen} options={{ title: 'Overtime' }} />
      <Drawer.Screen name="Recruitment" component={RecruitmentScreen} options={{ title: 'Recruitment' }} />
      <Drawer.Screen name="Training" component={TrainingScreen} options={{ title: 'Training' }} />
      <Drawer.Screen name="Payroll" component={PayrollScreen} options={{ title: 'Payroll' }} />
      <Drawer.Screen name="Loans" component={LoansScreen} options={{ title: 'Loans' }} />
      <Drawer.Screen name="Benefits" component={BenefitsScreen} options={{ title: 'Benefits' }} />
      <Drawer.Screen name="Documents" component={DocumentsScreen} options={{ title: 'Documents' }} />
      <Drawer.Screen name="Performance" component={PerformanceScreen} options={{ title: 'Performance' }} />
      <Drawer.Screen name="Assets" component={AssetsScreen} options={{ title: 'Assets' }} />
      <Drawer.Screen name="Expenses" component={ExpensesScreen} options={{ title: 'Expenses' }} />
      <Drawer.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendar' }} />
      <Drawer.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
      <Drawer.Screen name="Onboarding" component={OnboardingScreen} options={{ title: 'Onboarding' }} />
      <Drawer.Screen name="HRPolicies" component={HRPoliciesScreen} options={{ title: 'HR Policies' }} />
      <Drawer.Screen name="CompanyDirectory" component={CompanyDirectoryScreen} options={{ title: 'Directory' }} />
      <Drawer.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Drawer.Screen name="EmployeeLifecycle" component={EmployeeLifecycleScreen} options={{ title: 'Lifecycle' }} />
      <Drawer.Screen name="HelpdeskDetail" component={HelpdeskDetailScreen} options={{ title: 'Helpdesk' }} />
      <Drawer.Screen name="Leaves" component={LeavesScreen} options={{ title: 'Leave Management' }} />
      <Drawer.Screen name="Helpdesk" component={HelpdeskScreen} />
      <Drawer.Screen name="Approvals" component={ApprovalsScreen} />
      <Drawer.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Manage Employees' }} />
      <Drawer.Screen name="Permissions" component={PermissionsScreen} />
    </Drawer.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navy }}>
        <PulseMark color="#A78BFA" size={36} />
        <ActivityIndicator color="#fff" style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <PunchProvider enabled={!!user}>
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.navy },
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
              <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
              <Stack.Screen name="NewLeave" component={NewLeaveScreen} options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="NewAttendance" component={NewAttendanceRequestScreen} options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="NewAttendanceRequest" component={NewAttendanceRequestScreen} options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="NewPost" component={NewPostScreen} options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="NewTicket" component={NewTicketScreen} options={{ headerShown: false, presentation: 'modal' }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PunchProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 22 : 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#334155',
    shadowColor: '#020617',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 16,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
  tabIconWrap: { width: 36, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  tabIconWrapOn: { backgroundColor: '#2D1B69' },
  tabLabel: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  fabWrap: { alignItems: 'center', justifyContent: 'flex-start', marginTop: -26, width: 72 },
  fab: {
    width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#4C1D95', shadowOpacity: 0.45, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 8,
    borderWidth: 3, borderColor: '#fff',
  },
  fabLabel: { fontSize: 10, fontWeight: '800', color: colors.primary, marginTop: 4 },
  moreHead: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  menuBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  moreTitle: { fontSize: 28, fontWeight: '900', color: colors.text },
  moreRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20,
    backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 4, borderRadius: 16,
  },
  moreIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  moreLabel: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '700', color: colors.text },
  drawerLogo: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  drawerBrand: { color: '#fff', fontSize: 18, fontWeight: '900', marginLeft: 10, letterSpacing: 0.3 },
  drawerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 13, marginHorizontal: 10, borderRadius: 12 },
  drawerRowOn: { backgroundColor: 'rgba(124,58,237,0.28)' },
  drawerLabel: { color: '#E0E7FF', fontSize: 14, fontWeight: '700', marginLeft: 14 },
  drawerLogout: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', marginHorizontal: 0, borderRadius: 0, paddingHorizontal: 30 },
});
