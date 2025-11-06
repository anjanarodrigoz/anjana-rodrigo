# Anjana Rodrigo - Portfolio Website

A cutting-edge, fully responsive portfolio website built with Next.js 15, TypeScript, Tailwind CSS, and Framer Motion. Features advanced WebGL particle systems, 3D animations, and a sophisticated dual-theme system.

## 🚀 Features

- ✨ **WebGL Particle System** - 10,000+ interactive particles responding to mouse movements
- 🎨 **Dual Theme System** - Seamless dark/light mode transitions with custom color palettes
  - Dark Mode: Emerald green, golden amber, coral pink on deep charcoal
  - Light Mode: Warm pearl, sage green, sunset orange
- 🎭 **Advanced Animations** - Framer Motion powered transitions and micro-interactions
- ⚡ **Performance Optimized** - Lazy loading, code splitting, and image optimization
- ♿ **Accessibility First** - WCAG AAA compliant with ARIA landmarks and keyboard navigation
- 📱 **Fully Responsive** - Mobile-first design that works on all devices
- 🎯 **Command Palette** - Quick navigation with Cmd+K
- 🔍 **SEO Optimized** - Dynamic meta tags, Open Graph, and structured data

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS with custom design tokens
- **Animations**: Framer Motion, React Spring
- **3D Graphics**: React Three Fiber, Three.js
- **UI Components**: Shadcn/UI, Radix UI
- **State Management**: Zustand
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/anjanarodrigoz/portfolio.git

# Navigate to the project directory
cd portfolio

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 🏗️ Project Structure

```
├── app/                    # Next.js App Router pages
├── components/
│   ├── atoms/             # Atomic design - smallest components
│   ├── molecules/         # Combinations of atoms
│   ├── organisms/         # Complex UI components
│   ├── sections/          # Page sections
│   ├── features/          # Feature-specific components
│   ├── ui/                # Shadcn UI components
│   └── providers/         # Context providers
├── lib/
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── store/             # Zustand stores
│   ├── constants/         # Constants and configurations
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── styles/                # Global styles
```

## 🧪 Available Scripts

```bash
# Development
npm run dev              # Start development server

# Production
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler check

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

## 🎨 Design System

### Color Palette

**Dark Mode**

- Primary: Emerald Green (#10B981)
- Secondary: Golden Amber (#F59E0B)
- Accent: Coral Pink (#FB7185)
- Background: Deep Charcoal (#171717)

**Light Mode**

- Primary: Sage Green (#86EFAC)
- Secondary: Sunset Orange (#FB923C)
- Background: Warm Pearl (#FAF9F6)

### Typography

- **Headings**: System fonts with variable weights
- **Body**: Sans-serif stack optimized for readability
- **Code**: Monospace for code snippets

## 🌐 Deployment

This project is configured for deployment on Vercel:

```bash
# Deploy to Vercel
vercel --prod
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Anjana Rodrigo**

- Website: [anjanarodrigo.com](https://anjanarodrigo.com)
- GitHub: [@anjanarodrigo](https://github.com/anjanarodrigoz)
- LinkedIn: [Anjana Rodrigo](https://linkedin.com/in/anjana-rodrigo-a41539191)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Shadcn for the beautiful UI components
- The open-source community

---

⭐ If you found this helpful, please consider giving it a star!
