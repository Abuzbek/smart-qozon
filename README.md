# Pishir (Pishir)

Pishir is a smart cooking assistant mobile application built with React Native and Expo. It helps users discover recipes based on available ingredients, utilizing AI generation features powered by Supabase Edge Functions.

## 🚀 Features

- **Smart Recipe Generation**: Suggests recipes based on ingredients you have.
- **User Synchronization**: Seamless login and device synchronization using phone numbers.
- **Favorites**: Save your favorite recipes for quick access.
- **Modern UI/UX**: Built with a clean, responsive design using custom components.

## 🛠 Tech Stack

- **Frontend**: React Native, Expo, TypeScript
- **Navigation**: Expo Router
- **Backend**: Supabase (Database, Edge Functions)
- **Storage**: MMKV (High-performance local storage)
- **State Management**: Zustand (implied/planned) / Local State
- **Device Info**: `expo-device` for unique device tracking

## 🏁 Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm or yarn
- Expo Go app on your physical device or an Android/iOS emulator

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Abuzbek/smart-qozon.git
   cd smart-qozon
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with your Supabase credentials:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Project**

   ```bash
   npx expo start
   ```

## 📱 Project Structure

- `app/`: Expo Router pages and layouts.
  - `(tabs)/`: Main application tabs (Home, Favorites, Settings).
  - `login.tsx`: Authentication screen.
- `components/`: Reusable UI components (IngredientSelector, ResultCard, etc.).
- `lib/`: Utility libraries (Supabase client, User sync logic).
- `constants/`: App constants (Colors, Theme).
- `supabase/`: Supabase configuration and Edge Functions.

## 🧪 E2E Testing

We use [Maestro](https://maestro.mobile.dev/) for End-to-End testing.

### Running Tests Locally

1. Install Maestro CLI:

   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

2. Start your iOS Simulator or Android Emulator and install the app (development build).
3. Run the login flow:

   ```bash
   maestro test .maestro/login.yaml
   ```

4. Run the full navigation flow:

   ```bash
   maestro test .maestro/navigation.yaml
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[MIT](LICENSE)
