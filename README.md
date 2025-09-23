

# GoBhutan Admin Dashboard

A modern, scalable React dashboard for managing multiple reservation services including hotels, taxis, flights, movie tickets, and bus bookings.

## 🚀 Features

- **Modern Tech Stack**: React 18 + Vite + Tailwind CSS
- **Responsive Design**: Mobile-first design that works on all devices
- **Scalable Architecture**: Clean folder structure with reusable components
- **shadcn/ui Components**: Beautiful, accessible UI components
- **Route-based Navigation**: Centralized routing configuration
- **Dashboard Analytics**: Overview cards and activity tracking

## 📁 Project Structure

```
src/
  components/      # Reusable UI components
    ui/           # shadcn/ui components
  features/        # Feature-specific UI + logic
  layouts/         # Shared layouts
  pages/           # Top-level route pages
  routes/          # Route configuration
  hooks/           # Custom React hooks
  lib/             # Utilities and constants
  styles/          # Global styles
```

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🎯 Available Services

- **Dashboard**: Overview and analytics
- **Taxi Service**: Ride booking management
- **Hotels**: Room reservations
- **Flights**: Flight bookings
- **Movie Tickets**: Cinema reservations
- **Bus Tickets**: Bus route bookings

## 🎨 UI Components

Built with shadcn/ui and Tailwind CSS for consistent, beautiful design:

- Cards with hover effects
- Responsive navigation
- Interactive buttons and badges
- Accessible form components
- Loading states and animations

## 📱 Responsive Design

- **Mobile**: Collapsible sidebar with overlay
- **Tablet**: Adaptive layout with proper spacing
- **Desktop**: Full sidebar with expand/collapse

## 🔧 Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🏗️ Architecture Principles

- **Component Reusability**: Shared UI components with consistent props
- **Configuration-Driven**: Navigation and routes defined in central config
- **Accessibility First**: ARIA attributes and keyboard navigation
- **Performance**: Optimized with Vite and React best practices
- **Maintainability**: Clean code structure with TypeScript-like prop definitions

## 📄 License

© 2024 Jigme Choling. All rights reserved.
