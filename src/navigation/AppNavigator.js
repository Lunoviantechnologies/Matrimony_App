import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import DashboardScreen from "../screens/DashboardScreen";
import SearchScreen from "../screens/SearchScreen";
import GenericScreen from "../screens/GenericScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import SavedProfilesScreen from "../screens/SavedProfilesScreen";
import SettingsScreen from "../screens/SettingsScreen";
import FAQScreen from "../screens/FAQScreen";
import ChatWindowScreen from "../screens/ChatWindowScreen";
import TermsScreen from "../screens/TermsScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import CommunityGuidelinesScreen from "../screens/CommunityGuidelinesScreen";
import RefundPolicyScreen from "../screens/RefundPolicyScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ProfileView from "../screens/ProfileView";
import EditProfile from "../screens/EditProfile";
import PremiumSubscription from "../screens/PremiumSubscription";
import MatchesScreen from "../screens/MatchesScreen";
import MyMatchesScreen from "../screens/MyMatchesScreen";
import NearmeScreen from "../screens/NearmeScreen";
import MoreMatchesScreen from "../screens/MoreMatchesScreen";
import RequestsScreen from "../screens/RequestsScreen";
import SentRequestsScreen from "../screens/SentRequestsScreen";
import RejectedScreen from "../screens/RejectedScreen";
import NewMatchesScreen from "../screens/NewMatchesScreen";
import AstroTalkScreen from "../screens/AstroTalkScreen";
import ChatScreen from "../screens/ChatScreen";
import AcceptedMatchesScreen from "../screens/AcceptedMatchesScreen";





const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcons = {
  Home: "🏠",
  Search: "🔍",
  Matches: "❤️",
  Chat: "💬",
  Profile: "👤",
};

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarHideOnKeyboard: true,
      tabBarIcon: ({ focused }) => (
        <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.6 }}>{tabIcons[route.name] || "⬜"}</Text>
      ),
      tabBarActiveTintColor: "#f75b8a",
      tabBarInactiveTintColor: "#6b7280",
      tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
      tabBarStyle: {
        height: 72,
        paddingBottom: 14,
        paddingTop: 8,
        backgroundColor: "#fff",
        borderTopColor: "#e6e7f2",
        borderTopWidth: 1,
        elevation: 12,
      },
      tabBarSafeAreaInset: { bottom: 8 },
    })}
  >
    <Tab.Screen name="Home" component={DashboardScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Matches" component={MatchesScreen} />
    <Tab.Screen name="Chat" component={ChatScreen} />
    <Tab.Screen name="Profile" component={ProfileView} />
  </Tab.Navigator>
);

const routes = [
  { name: "MainTabs", component: MainTabs, options: { headerShown: false } },
  { name: "MyMatches", component: MyMatchesScreen },
  { name: "Nearme", component: NearmeScreen },
  { name: "MoreMatches", component: MoreMatchesScreen },
  { name: "Newmatches", component: NewMatchesScreen },
  { name: "Requests", component: RequestsScreen },
  { name: "Sent", component: SentRequestsScreen },
  { name: "Rejected", component: RejectedScreen },
  { name: "Accepted", component: AcceptedMatchesScreen, params: { title: "Accepted Requests" } },
  { name: "Received", component: GenericScreen, params: { title: "Received Requests" } },
  { name: "ProfileView", component: ProfileView },
  { name: "EditProfile", component: EditProfile },
  { name: "PremiumSubscription", component: PremiumSubscription },
  { name: "AstroTalkQuery", component: AstroTalkScreen },
  { name: "Notifications", component: NotificationsScreen },
  { name: "SavedProfiles", component: SavedProfilesScreen },
  { name: "HelpSupport", component: FAQScreen },
  { name: "Settings", component: SettingsScreen },
  { name: "ChatWindow", component: ChatWindowScreen },
  { name: "Terms", component: TermsScreen, options: { title: "Terms & Conditions" } },
  { name: "PrivacyPolicy", component: PrivacyPolicyScreen, options: { title: "Privacy Policy" } },
  { name: "CommunityGuidelines", component: CommunityGuidelinesScreen, options: { title: "Community Guidelines" } },
  { name: "RefundPolicy", component: RefundPolicyScreen, options: { title: "Refund & Cancellation" } },
  { name: "ForgotPassword", component: ForgotPasswordScreen, options: { title: "Forgot Password" } },
];

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Dashboard" component={MainTabs} options={{ headerShown: false }} />
      {routes.map((r) => {
        if (r.component) {
          return (
            <Stack.Screen
              key={r.name}
              name={r.name}
              component={r.component}
              initialParams={r.params}
              options={{ title: r.params?.title || r.name }}
            />
          );
        }
        return (
        <Stack.Screen
          key={r.name}
          name={r.name}
          component={GenericScreen}
          initialParams={{ title: r.name }}
          options={{ title: r.name }}
        />
        );
      })}
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;