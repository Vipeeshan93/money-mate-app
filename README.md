# 💰 MoneyMate — AI-Powered Financial Management App

An intelligent mobile application designed to help users manage personal finances by tracking income, expenses, and budgets while receiving personalized financial insights through an AI-powered chatbot.

This system enhances financial decision-making by combining real-time data tracking, visualization, and AI-driven recommendations in a user-friendly mobile environment.

---

## 📊 Features

### 💼 Financial Management

* Add, edit, and delete income and expense transactions
* Categorize financial activities for better tracking
* Maintain a digital financial diary
* View past transactions with filtering options

### 💰 Budget Management

* Create and manage budget categories
* Monitor spending against budget limits
* Detect overspending with visual indicators
* Edit and delete budget allocations

### 📈 Analytics & Reports

* Visualize income and expenses using **pie charts**
* Analyze financial data (daily, weekly, monthly, yearly)
* Understand spending patterns through graphical insights

### 🤖 AI-Powered Chatbot

* Ask financial questions using natural language
* Get personalized financial advice and recommendations
* Analyze spending behavior and suggest budget adjustments
* Real-time financial insights using AI

### 🔐 User Management

* Secure user authentication (Sign up / Login)
* Password reset with security verification
* Personalized user data storage

---

## 🏗️ Architecture

The application follows a **layered architecture**:

* **Presentation Layer**

  * React Native mobile interface
  * User interaction and UI rendering

* **Application Logic Layer**

  * Business logic processing
  * Transaction and budget management
  * Chatbot request handling

* **Data Layer**

  * Firebase Firestore (NoSQL database)
  * Real-time data storage and synchronization

* **External Services Layer**

  * OpenAI API (AI chatbot intelligence)
  * Chart Kit (data visualization)

### 🔑 Key Design Principles

* Separation of concerns
* Scalable cloud-based architecture
* Real-time data synchronization
* Modular and maintainable design

---

## 🛠️ Technologies

* **React Native** — Cross-platform mobile development
* **Firestore — Backend & database
* **OpenAI API** — AI chatbot integration
* **JavaScript** — Core programming language
* **React Native Chart Kit** — Data visualization
* **Android Studio** — Development & testing environment

---

## 📂 Key Components

* `screens/` → Application screens (Dashboard, Budget, Transactions)
* `components/` → Reusable UI components
* `context/` → State management
* `firebaseConfig.js` → Firebase integration
* `chatbot.js` → AI chatbot logic
* `transactions/` → Transaction management
* `budget/` → Budget handling

---

## ⚙️ System Functionalities

* User authentication (Signup, Login, Reset Password)
* Transaction management (CRUD operations)
* Budget management (Create, Update, Delete)
* Financial reporting & visualization
* AI chatbot interaction for financial insights

---

## ⚙️ Getting Started

### 📌 Prerequisites

* **Android Studio** (with Android Emulator)
* **Firebase Project** (Firestore)
* **Google account** (for Firebase setup)
* **OpenAI API Key** (for chatbot functionality)

---

## 🚀 Setup

```bash id="setup001"
git clone https://github.com/your-username/money-mate-app.git
cd money-mate-app
```

1. Open the project in **Android Studio**
2. Configure your **Firebase project**
3. Add your **OpenAI API Key** in the project configuration
4. Run the app using an emulator or physical Android device

---

## 📊 System Highlights

* Real-time financial tracking using Firebase
* AI-driven personalized recommendations
* Interactive and user-friendly mobile UI
* Data visualization for better decision-making

---

## 🔮 Future Improvements

* Cross-Platform Support (iOS)
* Integrated Payment Functionality
* Receipt Scanning (OCR Integration)
* Advanced Analytics & Dashboards

---



