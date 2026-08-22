# Swarrnim University ERP — Native Mobile Application (Android & iOS)

A dedicated native mobile application for **Swarrnim Startup & Innovation University**, powered by **React Native & Expo**, sharing the exact same backend, database, RBAC permissions, and authentication system as the existing Web ERP.

---

## 📱 Supported Role Dashboards

| Role | Primary Mobile Features |
| :--- | :--- |
| **Student** | Live Attendance breakdown, Exam SGPA/CGPA, Student Diary dossier, Verified Documents, Service Requests, Grievance lodging, PTM schedule |
| **Parent / Guardian** | Multi-child selector, Real-time attendance alert, Report cards, Fee ledger & receipts, PTM consultation response & reschedule requests |
| **Faculty** | Class attendance quick entry, Teaching timetable, PTM schedule & remarks editor, Student inquiry review & approvals |
| **Mentor** | Assigned mentees roster, Attendance & academic risk radar, Early intervention triggers, Direct guardian calling |
| **Admin / Executive** | Real-time university KPIs, attendance averages, pending request counts across offices |

---

## 🏗️ Architecture & Technology

```
Existing Web ERP               Native Mobile App (React Native + Expo)
       │                                     │
       └──────────────┬──────────────────────┘
                      │
              Shared REST API / JWT
            (/api/v1/auth, /api/v1/...)
                      │
          Prisma Database & RBAC Engine
```

- **Framework**: React Native 0.74+, Expo 51+
- **Navigation**: React Navigation 6 (Native Stack + Custom 5-Tab Bottom Navigation)
- **State Management**: React Context (`AuthContext`, `NetworkContext`)
- **Storage**: `Expo SecureStore` (JWT tokens) + `AsyncStorage` (Offline cache)
- **Push Notifications**: Expo Notifications & Firebase Cloud Messaging (FCM)
- **Deep Linking**: `swarrnimerp://` universal linking scheme

---

## 📂 Project Structure

```
/mobile
├── App.tsx                     # Root App container & Providers
├── index.js                    # Expo entry registration
├── app.json                    # Native package names & permissions
├── eas.json                    # EAS production & preview build profiles
├── package.json                # React Native & Expo dependencies
├── tsconfig.json               # TypeScript configuration
└── src
    ├── constants/              # Theme, API routes, App configuration
    ├── types/                  # Shared models & navigation typing
    ├── context/                # AuthContext & NetworkContext
    ├── services/               # API client, AuthService, DataService, PushNotifications, DeepLinks
    ├── navigation/             # RootNavigator, AuthNavigator, MainTabNavigator
    ├── components/
    │   ├── common/             # Card, Badge, Button, Input, Header, ChildSelectorModal, OfflineNotice
    │   └── dashboard/          # StatCard, QuickActionGrid, RecentActivityList
    └── screens/
        ├── auth/               # LoginScreen, ForgotPasswordScreen
        ├── student/            # StudentHome, Attendance, Academic, Exam, Diary, Documents, Requests
        ├── parent/             # ParentHome, ParentPTM, ParentAcademic, ParentFees
        ├── faculty/            # FacultyHome, Attendance, PTM, Requests
        ├── mentor/             # MentorHome, Mentees, RiskTracker
        ├── common/             # Notifications, Details, CreateRequest, CreateComplaint, DocViewer, Profile, Settings
        └── admin/              # AdminOverviewScreen
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js 18+ or 20+
- Expo CLI: `npm install -g expo-cli` or `npx expo`
- iOS Simulator (macOS / Xcode) or Android Emulator (Android Studio) / Physical device with Expo Go.

### 2. Running the Mobile App
```bash
# Navigate to mobile folder
cd mobile

# Start Expo development server
npx expo start
```
- Press `a` to open in Android Emulator
- Press `i` to open in iOS Simulator
- Scan the QR code with **Expo Go** on your Android or iPhone device.

---

## 🔔 Push Notifications & Deep Linking

### Push Notification Categories
1. `ATTENDANCE`: Defaulter alerts & daily updates
2. `EXAM`: Exam timetable releases & published results
3. `PTM`: Consultation invitations, schedule reminders & confirmation updates
4. `REQUEST`: Service ticket status updates & grievance resolution
5. `NOTICE`: University-wide circulars and announcements

### Deep Linking Schema (`swarrnimerp://`)
- `swarrnimerp://attendance` $\to$ Student Attendance Screen
- `swarrnimerp://results` $\to$ Examination & Grades Screen
- `swarrnimerp://ptm/:id` $\to$ PTM Consultation Details
- `swarrnimerp://requests/:id` $\to$ Service Request Status

---

## 📦 Android & iOS Production Builds

### Android Build (APK & AAB)
```bash
# Production Android App Bundle (.aab for Google Play)
npx eas-cli build --platform android --profile production

# Testable Standalone APK
npx eas-cli build --platform android --profile preview
```

### iOS Build (Simulator & App Store)
```bash
# Simulator build (.tar.gz / .app)
npx eas-cli build --platform ios --profile preview

# Production IPA for Apple App Store / TestFlight
npx eas-cli build --platform ios --profile production
```

---

## 🔐 Security & Non-Breaking Guarantee
- **Role Scoping**: Every API call uses Bearer JWT tokens with server-side RBAC validation.
- **Parent Isolation**: Parents can only access records for verified linked children.
- **Zero Web Disruption**: The root web ERP routes and databases remain completely unchanged.
