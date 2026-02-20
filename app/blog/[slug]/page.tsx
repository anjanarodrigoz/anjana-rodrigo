"use client";

import { motion } from "framer-motion";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// This would normally come from your MDX files or CMS
const blogPosts = {
  "from-mining-to-code": {
    title:
      "From Mining Engineer to Software Developer: My Journey",
    date: "2024-01-15",
    readTime: "8 min read",
    tags: ["Career", "Personal Story", "Learning"],
    content: `
## Programming Was Always the Passion

I've loved programming since childhood. While other kids were playing games, I was fascinated by how software worked and how you could build things with code. That passion never left me.

When it came time for university, my A/L results got me into the **University of Moratuwa** — one of the top engineering universities in Sri Lanka. I chose Mining & Mineral Processing Engineering, and while it wasn't a CS degree, it gave me something invaluable: **engineering principles and problem-solving skills** that I use every single day as a developer.

But throughout university, my real hobby was building applications.

---

## From Android to Flutter

I started my mobile development journey with **native Android development**. I spent about a year building Android apps, learning Java, understanding the Android lifecycle, and getting comfortable with mobile UI patterns.

After that first year, I migrated to **Flutter**. The cross-platform capability, the hot reload experience, and the expressive UI toolkit convinced me this was the future of mobile development.

### My First Flutter Application

My first real Flutter project was a **moving application for a Melbourne-based company**. It was a great introduction to building production-quality mobile apps — dealing with real users, real requirements, and real deadlines.

### Zomoto: Learning Flutter by Solving a Real Problem

After that, I took on the **restaurant management application** — what became [Zomoto](/blog/building-zomoto-pos). The goal was to learn the Flutter framework deeper by automating the manual work that restaurants deal with every day. Orders on paper, mental math at the cashier, kitchen chaos — all of it could be replaced with a single app.

That project taught me more than any tutorial ever could. It's now running in **3 restaurants in Sri Lanka**, and I'm still actively enhancing it with Clean Architecture and new features.

---

## The Internship: Engineering Meets Code

During my internship period, I worked on a **tunnel project as a trainee mining engineer**. But even there, I couldn't stop building software.

I developed applications for the mining field during my internship:

- **Mining Cycle Tracking Application** — tracking the full mining cycle from drilling to hauling, giving supervisors real-time visibility into operations
- **Production Analytics Tool** — aggregating production data and generating insights that helped optimize output

These projects showed me something important: **software can transform any industry**. The mining engineers I worked with were doing things manually that could be automated in hours. Every field has these opportunities.

---

## The Decision: Going Full-Time into Software

After completing my BSc, I had a choice to make. I could continue in mining engineering, or I could follow the path I'd been building alongside it for years.

I decided to learn more about real-world application development at a deeper level. I joined the **IT faculty as an instructor**, and this is where everything came together.

### What I Learned as an Instructor

Teaching forced me to truly understand the fundamentals. But more importantly, being in the IT faculty exposed me to areas I hadn't explored deeply:

- **System Design Principles** — how to architect applications that scale, how to think about distributed systems, data modeling, and trade-offs
- **Backend Development** — building APIs, database design, server-side logic, authentication systems
- **DevOps** — CI/CD pipelines, deployment strategies, containerization, cloud infrastructure

This period transformed me from a mobile developer into a **full system designer**. I could now think end-to-end — from the mobile app in the user's hand to the server processing their request to the database storing their data.

---

## Where I Am Today

Today, I build full-stack applications with:
- **Flutter** for mobile applications
- **React** for web frontends
- **Node.js** for backend services
- **Firebase & Cloud technologies** for scalable infrastructure

I've built production applications running in real businesses, I teach and mentor aspiring developers, and I continue learning every day.

---

## Lessons from the Journey

### Engineering Principles Transfer Everywhere

My mining engineering background wasn't a detour — it was a foundation:
- **Analytical thinking** → Debugging and system design
- **Process optimization** → Code architecture and performance
- **Problem-solving under constraints** → Building with real-world limitations
- **Documentation and reporting** → Writing clean, maintainable code

### Build Real Things for Real People

The projects that taught me the most were the ones solving real problems — the moving app, Zomoto, the mining tools. Tutorials teach syntax. Real projects teach engineering.

### Teaching Deepens Understanding

Becoming an instructor at the IT faculty wasn't just about sharing knowledge — it forced me to fill gaps in my own understanding. If you want to master something, try explaining it to someone else.

### Follow Your Passion, Even When the Path Isn't Straight

My path went from childhood programming hobby → mining engineering degree → Android development → Flutter → mining internship apps → IT instructor → full-stack developer. It wasn't a straight line, but every step added something valuable.

---

**What's your story?** If you're on a similar journey — combining engineering with software development, or transitioning into tech from another field — I'd love to hear about it.

Connect with me on [Twitter](https://twitter.com/anjanarodrigo) or [LinkedIn](https://linkedin.com/in/anjana-rodrigo-a41539191)!
    `,
  },
  "building-zomoto-pos": {
    title: "Building Zomoto: A Full-Stack Restaurant POS System with Flutter",
    date: "2024-02-01",
    readTime: "15 min read",
    tags: ["Flutter", "Architecture", "Case Study", "Firebase"],
    content: `
*How I built my first Flutter application — a multi-role restaurant POS — and what I learned along the way.*

---

Zomoto is a restaurant point-of-sale system I built entirely in Flutter. It started as my first Flutter project — a way to learn the framework by solving a real problem. What began as a learning exercise has grown into a production application now running in 3 restaurants in Sri Lanka.

This post is a deep dive into what the app does, how it works under the hood, the big decisions I made, and where I'm taking it next.

---

## The Problem I Wanted to Solve

If you've ever worked in or run a restaurant, you know the chaos. Orders get lost between the front of house and kitchen. Waiters scribble on paper. The cashier is doing mental math. The owner has no idea what's selling.

Most existing POS solutions are either:
- **Expensive** — subscription-heavy cloud systems that bleed small restaurants dry
- **Rigid** — one-size-fits-all tools that don't adapt to how your restaurant actually works
- **Disconnected** — separate apps for kitchen, billing, and management that don't talk to each other

I wanted to build one app where every person in the restaurant — the owner, the cashier, the cook, the waiter — logs in and sees exactly what they need. Nothing more, nothing less. And I wanted to learn Flutter by building it.

---

## What Zomoto Does Today

### One App, Five Roles

The core idea is simple: everyone uses the same app, but the experience changes based on who you are.

**The Cashier** gets a full POS terminal. They browse the menu by category, add items to a cart, choose whether it's a dine-in, takeaway, or delivery order, and fire it off to the kitchen. For dine-in, they pick a table from a live grid — the app knows which tables are free and which are occupied. If a table already has an active order, they can add another round instead of creating a new one.

The cashier also handles billing. They see every order's status in real time — which rounds the kitchen has started, which are ready, which items are still being prepped. They can only complete an order once the kitchen marks everything as ready.

**The Kitchen** sees a dedicated display — think of it as a digital ticket rail. Orders come in, grouped into two panels: one for takeaway/delivery, one for dine-in organized by table. Each kitchen station only sees its own items. If you're on the grill, you see grill items. If you're on desserts, you see desserts. You tap "Start Cooking" when you begin, "Mark Ready" when it's done.

**The Waiter** sees a table grid. Tap a table, see its current order, or place a new one. They get the same menu browsing experience as the cashier — categories, variants, modifiers, special notes — but scoped to their workflow.

**The Owner and Manager** share an admin dashboard with tabs for Orders, Menu, Office, and Reports. The Office tab is where the real management happens — staff management, table configuration, kitchen station setup, device registration, modifiers, variations, customer records.

### Real-Time Everything

This isn't a polling-based system. When the kitchen marks an item as ready, the cashier's screen updates instantly. When a waiter places a dine-in order, the table grid flips from green to red in real time. Every order, every status change, every table update flows through Firestore streams.

### Multi-Round Dine-In Orders

In a real restaurant, a table doesn't place one order — they place several. Starters first. Then mains. Maybe a dessert later. Zomoto models this with rounds. Each order can have multiple rounds, each round has its own items, and each item has its own kitchen status. It's a three-level status hierarchy that actually mirrors how food service works.

### Multi-Kitchen Routing

Not every restaurant has one kitchen. Many have separate stations — a main kitchen for hot food, a bar for drinks, a dessert station. Every menu item in Zomoto can be assigned to a specific kitchen. When an order comes in with items from three different stations, each kitchen only sees their items.

---

## The Tech Behind It

### Flutter + Clean Architecture

I chose Flutter because I wanted to learn it by building something real — not just following tutorials. A POS system seemed like the perfect challenge: complex enough to push me, practical enough to be useful.

The codebase follows Clean Architecture with four packages:

- **domain** — Pure Dart. Zero Flutter imports, zero Firebase imports. Just entities, enums, repository interfaces, and failure types.
- **data** — Repository implementations, DTOs, and mappers. Every repository method returns Either<Failure, T> — no exceptions leaking to the UI.
- **firebase_data** — The Firebase-specific implementations. If I ever swap Firebase for something else, only this package changes.
- **local_data** — SharedPreferences for session management, cart persistence, and caching.

As I continue enhancing Zomoto, Clean Architecture has been invaluable. Adding new features doesn't feel like fighting the codebase.

### State Management: Riverpod

I use Riverpod throughout. StreamProvider for anything real-time (active orders, table statuses). StateNotifier for complex mutable state (the cart, auth state). FutureProvider for one-shot reads.

### Firebase: Firestore + Realtime Database + Auth

Active orders live in a Firestore collection. When an order is completed or cancelled, it gets archived — copied to a separate collection and deleted from the active one. This keeps the active collection small and fast.

Restaurant configuration lives in Firebase Realtime Database because it's a flat document that needs to be cheap to read frequently.

### Material 3 Theming

The app uses Material 3 with a custom theme system. Semantic colors for order statuses — amber for pending, blue for preparing, green for ready, red for cancelled. Both light and dark themes are supported.

---

## What I Changed Recently

### Rewrote the Order Placement Pipeline

The biggest refactor was moving order creation logic out of the UI layer into the Firebase data layer. Previously, the screens were responsible for generating order IDs, resolving the current user, setting timestamps. Now, the UI just sends a list of items and the order type. The data layer handles everything else.

### Built the Split Bill Feature

A full-screen dialog with two panels. The left side shows all order items with quantities. The right side shows person cards. Tap a person to select them, then tap items to assign. Each person's card shows their assigned items and a running subtotal. The "Complete Order" button only enables when every item has been assigned.

### Rebuilt the Kitchen Display

The dual-panel layout now properly separates ongoing orders from table orders. Kitchen station filtering works — each kitchen user only sees their items. Ready rounds auto-dismiss after five seconds to keep the screen clean.

---

## What's Coming Next

### Near-Term
- **Payment integration** — card payments, mobile payments, cash drawer management
- **Receipt printing** — the printer infrastructure is there (Bluetooth and USB), just needs wiring up
- **Real-time notifications** — push alerts when food is ready or new orders arrive
- **Offline support** — proper queue handling when the internet drops mid-service

### Medium-Term
- **Discount and promo system** — percentage discounts, promo codes, happy hour pricing
- **Customer profiles and loyalty** — order history, loyalty points, tier-based rewards
- **Reporting and analytics** — daily revenue charts, best-selling items, peak hour analysis

### Long-Term
- **Multi-branch support** — manage multiple restaurant locations from one admin panel
- **Localization** — Sinhala, Tamil, and English language support
- **Table reservation system**
- **Stock and inventory management**

---

## Lessons Learned

**Clean Architecture pays off in POS systems.** The number of times I've been able to change how data flows without touching the UI has justified every minute spent setting up the layer boundaries.

**Model your domain after real-world operations.** The three-level status hierarchy (order > round > item) only makes sense when you've watched how a real kitchen works. Let the real world drive your data model.

**Real-time is non-negotiable for restaurant software.** A POS where you need to refresh to see updates is a POS that gets abandoned.

**Role-based UX is different from role-based access control.** It's not just about who can see what — it's about building completely different experiences for different users within the same codebase.

**Learn by building something real.** Zomoto was my first Flutter project. Building it for actual restaurants forced me to deal with edge cases, performance constraints, and user expectations that tutorials never cover. It's the most effective way to learn a framework.

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| **Framework** | Flutter 3.x + Dart 3.x |
| **Architecture** | Clean Architecture (4-layer monorepo) |
| **State Management** | Riverpod |
| **Navigation** | GoRouter with role-based shell guards |
| **Database** | Firebase Firestore + Realtime Database |
| **Authentication** | Firebase Auth |
| **Local Storage** | SharedPreferences |
| **UI Framework** | Material 3 with custom theme system |
| **Printing** | ESC/POS via Bluetooth & USB thermal printers |
| **Error Handling** | Either<Failure, T> (functional) |

---

## Wrapping Up

Zomoto started as a way to learn Flutter and turned into something real — a production POS system running in 3 restaurants in Sri Lanka. The core flows — ordering, kitchen management, billing, table management — are solid. I'm actively enhancing features and refining the architecture as the system grows.

If you're building something similar, or if you're a restaurant owner curious about what modern POS software looks like from the inside, I'd love to hear from you.

---

*Built with Flutter. Powered by Firebase. Designed for real restaurants.*

Connect with me on [Twitter](https://twitter.com/anjanarodrigo) or [LinkedIn](https://linkedin.com/in/anjana-rodrigo-a41539191)!
    `,
  },
  "clean-architecture-flutter": {
    title: "Implementing Clean Architecture in Flutter: A Practical Guide",
    date: "2024-01-10",
    readTime: "12 min read",
    tags: ["Flutter", "Architecture", "Tutorial"],
    content: `
*Stop overcomplicating it. Here's what Clean Architecture actually means in Flutter, explained like a friend would over coffee.*

---

So you've been building Flutter apps for a while. Maybe you've shipped a few. Things are going well — until they're not. Your codebase starts looking like a plate of hoppers someone dropped on the floor. Business logic mixed with UI code, API calls hiding inside widgets, and every time you want to change one thing, three other things break.

Sound familiar? Yeah, me too.

That's exactly the problem Clean Architecture solves. And no, it's not as scary as those 47-layer diagrams on Medium make it look.

## What Even Is Clean Architecture?

Forget the fancy diagrams for a second.

Clean Architecture is basically **organizing your code so that each piece has one job, and changing one piece doesn't blow up everything else.**

That's it. That's the core idea.

Uncle Bob (Robert C. Martin) came up with this concept, and while he was thinking about software in general, the Flutter community adopted it beautifully. The idea is simple: separate your app into layers, and make sure those layers only talk to each other in a specific direction.

Think of it like a restaurant:

- The **customer** (UI) doesn't need to know how the kitchen works
- The **waiter** (Use Cases) takes orders and delivers food — they connect the two worlds
- The **kitchen** (Data layer) does the actual cooking and gets ingredients from suppliers

If the restaurant changes its supplier, the customer doesn't care. If they redecorate the dining room, the kitchen doesn't care. Everyone minds their own business.

## The Three Layers (Yes, Just Three)

Here's where people overcomplicate things. At its heart, Flutter Clean Architecture has three main layers:

### 1. Presentation Layer (The Face)

This is everything the user sees and touches. Your widgets, your screens, your state management (BLoC, Riverpod, Provider — whatever you prefer).

This layer's only job is to **display things** and **react to user actions**. It should NOT be making API calls, parsing JSON, or deciding business rules.

\`\`\`
lib/
  features/
    authentication/
      presentation/
        pages/
          login_page.dart
          register_page.dart
        widgets/
          login_form.dart
        bloc/
          auth_bloc.dart
          auth_event.dart
          auth_state.dart
\`\`\`

Your \`LoginPage\` shows a form. When the user taps "Login," it tells the BLoC. The BLoC talks to a use case. The page doesn't know or care where the data comes from. Could be an API. Could be a local database. Could be a hamster running on a wheel generating tokens. The page doesn't care.

### 2. Domain Layer (The Brain)

This is the heart of your app. It contains:

- **Entities** — pure Dart objects that represent your core business concepts (User, Product, Order)
- **Use Cases** — single actions your app can perform (LoginUser, GetProducts, PlaceOrder)
- **Repository Interfaces** — contracts that say "I need data, but I don't care how you get it"

Here's the beautiful part: **this layer has ZERO dependencies on Flutter, any packages, or any external library.** It's pure Dart. You could theoretically take this folder and drop it into a command-line app, and it would still work.

\`\`\`dart
// entities/user.dart
class User {
  final String id;
  final String name;
  final String email;

  User({required this.id, required this.name, required this.email});
}
\`\`\`

\`\`\`dart
// repositories/auth_repository.dart (just an interface!)
abstract class AuthRepository {
  Future<User> login(String email, String password);
  Future<void> logout();
}
\`\`\`

\`\`\`dart
// usecases/login_user.dart
class LoginUser {
  final AuthRepository repository;

  LoginUser(this.repository);

  Future<User> call(String email, String password) {
    return repository.login(email, password);
  }
}
\`\`\`

See how \`LoginUser\` doesn't know anything about HTTP, SharedPreferences, or Firebase? It just knows there's a repository that can log people in. How that happens is someone else's problem.

### 3. Data Layer (The Worker)

This is where the real work happens. API calls, database queries, caching logic, JSON parsing — all of it lives here.

This layer contains:

- **Models** — data classes that know how to convert to/from JSON, database rows, etc.
- **Data Sources** — the classes that actually talk to APIs, databases, and local storage
- **Repository Implementations** — the concrete implementations of those interfaces from the domain layer

\`\`\`dart
// models/user_model.dart
class UserModel extends User {
  UserModel({required String id, required String name, required String email})
      : super(id: id, name: name, email: email);

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      name: json['name'],
      email: json['email'],
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'name': name, 'email': email};
  }
}
\`\`\`

\`\`\`dart
// datasources/auth_remote_datasource.dart
class AuthRemoteDataSource {
  final http.Client client;

  AuthRemoteDataSource(this.client);

  Future<UserModel> login(String email, String password) async {
    final response = await client.post(
      Uri.parse('https://api.myapp.com/login'),
      body: {'email': email, 'password': password},
    );

    if (response.statusCode == 200) {
      return UserModel.fromJson(json.decode(response.body));
    } else {
      throw ServerException();
    }
  }
}
\`\`\`

\`\`\`dart
// repositories/auth_repository_impl.dart
class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final AuthLocalDataSource localDataSource;

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<User> login(String email, String password) async {
    final user = await remoteDataSource.login(email, password);
    await localDataSource.cacheUser(user);
    return user;
  }
}
\`\`\`

## The Dependency Rule (The One Rule to Remember)

If you forget everything else, remember this:

**Dependencies point inward.**

The Presentation layer depends on the Domain layer. The Data layer depends on the Domain layer. But the Domain layer depends on **nothing**. It's the center of your universe.

\`\`\`
Presentation → Domain ← Data
\`\`\`

That's why the Domain layer defines repository *interfaces* (abstract classes) instead of concrete implementations. The Data layer provides the actual implementations, and we wire them together using dependency injection.

## Your Folder Structure

Here's what a real project might look like:

\`\`\`
lib/
├── core/
│   ├── error/
│   │   ├── exceptions.dart
│   │   └── failures.dart
│   ├── network/
│   │   └── network_info.dart
│   └── usecases/
│       └── usecase.dart
│
├── features/
│   ├── authentication/
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   ├── models/
│   │   │   └── repositories/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── repositories/
│   │   │   └── usecases/
│   │   └── presentation/
│   │       ├── bloc/
│   │       ├── pages/
│   │       └── widgets/
│   │
│   └── products/
│       ├── data/
│       ├── domain/
│       └── presentation/
│
├── injection_container.dart
└── main.dart
\`\`\`

Each feature is self-contained. Want to delete the products feature? Remove the folder. Done. Nothing else breaks.

## "Isn't This Too Much Code for a Simple App?"

Honestly? Yes, sometimes.

If you're building a simple to-do app or a weekend project, Clean Architecture is overkill. It's like wearing a three-piece suit to go buy groceries. Technically fine, but unnecessary.

Clean Architecture shines when:

- Your app has **complex business logic** (not just CRUD)
- Multiple developers are working on the same codebase
- You need to **write tests** (and you should)
- The app will be maintained and **grow over time**
- You might **swap out** your backend, database, or state management solution

If your app is going to live for more than six months and has more than a handful of screens, the upfront investment pays for itself many times over.

## Error Handling — The Part Nobody Talks About

Here's something that separates a tutorial project from a production app: proper error handling.

In Clean Architecture, we typically use the \`Either\` type from the \`dartz\` package (or \`fpdart\` if you prefer). Instead of throwing exceptions everywhere, your use cases return either a Failure or a Success.

\`\`\`dart
// In your repository interface
abstract class AuthRepository {
  Future<Either<Failure, User>> login(String email, String password);
}
\`\`\`

\`\`\`dart
// In your use case
class LoginUser {
  final AuthRepository repository;

  LoginUser(this.repository);

  Future<Either<Failure, User>> call(String email, String password) {
    return repository.login(email, password);
  }
}
\`\`\`

\`\`\`dart
// In your BLoC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUser loginUser;

  AuthBloc({required this.loginUser}) : super(AuthInitial()) {
    on<LoginRequested>((event, emit) async {
      emit(AuthLoading());

      final result = await loginUser(event.email, event.password);

      result.fold(
        (failure) => emit(AuthError(failure.message)),
        (user) => emit(AuthSuccess(user)),
      );
    });
  }
}
\`\`\`

No try-catch spaghetti. No uncaught exceptions crashing your app at 2 AM. Clean, predictable error flow.

## Dependency Injection — Wiring It All Together

All these layers need to be connected somehow. That's where dependency injection comes in. You can use \`get_it\`, \`injectable\`, or even Riverpod's providers.

\`\`\`dart
// injection_container.dart
final sl = GetIt.instance;

void init() {
  // BLoC
  sl.registerFactory(() => AuthBloc(loginUser: sl()));

  // Use Cases
  sl.registerLazySingleton(() => LoginUser(sl()));

  // Repositories
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: sl(),
      localDataSource: sl(),
    ),
  );

  // Data Sources
  sl.registerLazySingleton(() => AuthRemoteDataSource(client: sl()));
  sl.registerLazySingleton(() => AuthLocalDataSource(sharedPreferences: sl()));

  // External
  sl.registerLazySingleton(() => http.Client());
}
\`\`\`

Everything is wired up in one place. Want to swap your real API for a mock during testing? Change one line.

## Testing — The Real Payoff

Here's where Clean Architecture *really* proves its worth. Because everything is loosely coupled with clear interfaces, testing becomes almost enjoyable (I said *almost*).

\`\`\`dart
// Testing your use case — no API needed, no database, no Flutter
class MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  late LoginUser loginUser;
  late MockAuthRepository mockRepository;

  setUp(() {
    mockRepository = MockAuthRepository();
    loginUser = LoginUser(mockRepository);
  });

  test('should return User when login is successful', () async {
    final testUser = User(id: '1', name: 'Anjana', email: 'test@test.com');

    when(() => mockRepository.login('test@test.com', 'password123'))
        .thenAnswer((_) async => Right(testUser));

    final result = await loginUser('test@test.com', 'password123');

    expect(result, Right(testUser));
  });
}
\`\`\`

You can test your business logic without spinning up a server, without a database, without even importing Flutter. That's powerful.

## Common Mistakes I See Developers Make

After working with Clean Architecture for a while, here are the pitfalls I keep seeing:

**Putting business logic in the BLoC.** Your BLoC should be thin. It receives events, calls use cases, and emits states. That's it. If you have if-else chains and calculations in your BLoC, that logic probably belongs in a use case.

**Making use cases too granular or too broad.** A use case called \`GetUserById\` makes sense. A use case called \`GetUserByIdAndCheckIfTheyHaveASubscriptionAndFormatTheirName\` doesn't. But also, a use case called \`DoEverything\` is equally bad. Find the balance.

**Skipping the domain layer.** "I'll just call the repository directly from the BLoC." Don't. The domain layer is what makes this whole thing work. Skip it, and you've just created fancy folders with no real separation.

**Over-engineering from day one.** You don't need to implement every pattern for every feature on day one. Start with the structure, add complexity as you need it.

## Final Thoughts

Clean Architecture isn't about following rules blindly. It's about organizing your code so that future-you (or your teammates) can actually work with it without wanting to throw their laptop out the window.

Start simple. Get the three layers right. Make sure dependencies point inward. Write tests for your use cases. Everything else is refinement.

The best architecture is the one your team understands and can maintain. Clean Architecture gives you a solid foundation, but don't be afraid to adapt it to your project's needs. There's no architecture police coming to arrest you for having a slightly different folder structure.

Now go build something great — and keep it clean.

---

*Have questions about implementing Clean Architecture in your Flutter project? Connect with me on [Twitter](https://twitter.com/anjanarodrigo) or [LinkedIn](https://linkedin.com/in/anjana-rodrigo-a41539191)!*
    `,
  },
  "optimizing-react-performance": {
    title: "10 Advanced Techniques for Optimizing React Performance",
    date: "2023-12-15",
    readTime: "11 min read",
    tags: ["React", "Performance", "Optimization"],
    content: `
React is powerful, but without careful optimization, applications can become sluggish as they grow. Here are 10 advanced techniques I've used to keep React apps fast and responsive.

---

## 1. Memoize Expensive Computations with useMemo

When you have computations that are expensive and don't need to re-run on every render, \`useMemo\` is your best friend.

\`\`\`jsx
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.price - b.price);
}, [items]);
\`\`\`

Only recalculates when \`items\` actually changes — not on every parent re-render.

---

## 2. Prevent Unnecessary Re-renders with React.memo

Wrap components that receive the same props frequently. React.memo does a shallow comparison and skips re-rendering if props haven't changed.

\`\`\`jsx
const ProductCard = React.memo(({ product, onAdd }) => {
  return (
    <div>
      <h3>{product.name}</h3>
      <button onClick={() => onAdd(product.id)}>Add</button>
    </div>
  );
});
\`\`\`

**Important**: This only works if you also stabilize callback references with \`useCallback\`.

---

## 3. Stabilize Callbacks with useCallback

Without \`useCallback\`, every render creates a new function reference — breaking \`React.memo\` on child components.

\`\`\`jsx
const handleAdd = useCallback((id) => {
  setCart(prev => [...prev, id]);
}, []);
\`\`\`

---

## 4. Virtualize Long Lists

Rendering 10,000 DOM nodes kills performance. Libraries like \`react-window\` or \`@tanstack/virtual\` only render what's visible in the viewport.

\`\`\`jsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
>
  {({ index, style }) => (
    <div style={style}>{items[index].name}</div>
  )}
</FixedSizeList>
\`\`\`

This takes you from rendering thousands of elements to rendering ~20 at any given time.

---

## 5. Code Split with React.lazy and Suspense

Don't load everything upfront. Split your bundle so users only download what they need.

\`\`\`jsx
const Dashboard = React.lazy(() => import('./Dashboard'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Dashboard />
    </Suspense>
  );
}
\`\`\`

Combined with route-based splitting, this can dramatically reduce initial load time.

---

## 6. Debounce Expensive Operations

Search inputs, window resize handlers, scroll listeners — these fire rapidly. Debounce them to avoid hammering your app with state updates.

\`\`\`jsx
const debouncedSearch = useMemo(
  () => debounce((query) => setSearchTerm(query), 300),
  []
);
\`\`\`

---

## 7. Use Keys Correctly in Lists

React uses keys to track which items changed. Using array indices as keys causes unnecessary re-renders when items are reordered or removed.

\`\`\`jsx
// Bad - index keys cause issues on reorder
{items.map((item, i) => <Item key={i} {...item} />)}

// Good - stable unique keys
{items.map(item => <Item key={item.id} {...item} />)}
\`\`\`

---

## 8. Avoid Inline Object/Array Creation in JSX

Every render creates a new reference, which means child components always see "new" props.

\`\`\`jsx
// Bad - new object every render
<Map center={{ lat: 0, lng: 0 }} />

// Good - stable reference
const center = useMemo(() => ({ lat: 0, lng: 0 }), []);
<Map center={center} />
\`\`\`

---

## 9. Profile Before Optimizing

Don't guess where the bottleneck is. Use React DevTools Profiler to measure actual render times and identify which components re-render unnecessarily.

Steps:
1. Open React DevTools → Profiler tab
2. Click Record
3. Interact with your app
4. Stop recording and analyze the flamegraph

Look for components that render frequently with the same props — those are candidates for \`React.memo\`.

---

## 10. Use Transitions for Non-Urgent Updates

React 18's \`useTransition\` lets you mark state updates as non-urgent, keeping the UI responsive during heavy computations.

\`\`\`jsx
const [isPending, startTransition] = useTransition();

function handleFilter(value) {
  // Urgent: update input immediately
  setInputValue(value);

  // Non-urgent: filter results can wait
  startTransition(() => {
    setFilteredResults(filterItems(value));
  });
}
\`\`\`

---

## Summary

| Technique | Best For |
|-----------|----------|
| **useMemo** | Expensive calculations |
| **React.memo** | Components with stable props |
| **useCallback** | Stabilizing function references |
| **Virtualization** | Long lists (100+ items) |
| **Code splitting** | Reducing initial bundle size |
| **Debouncing** | Rapid-fire events (search, scroll) |
| **Proper keys** | Dynamic lists |
| **Stable references** | Preventing unnecessary re-renders |
| **Profiling** | Finding actual bottlenecks |
| **useTransition** | Heavy non-urgent updates |

The most important lesson: **measure first, optimize second**. React is already fast for most use cases. Only add complexity when profiling shows a real problem.

---

*Have questions about React performance? Connect with me on [Twitter](https://twitter.com/anjanarodrigo) or [LinkedIn](https://linkedin.com/in/anjana-rodrigo-a41539191)!*
    `,
  },
  "flutter-flavors-guide": {
    title: "Flutter Flavors: Because Your App Has Multiple Personalities",
    date: "2024-02-10",
    readTime: "14 min read",
    tags: ["Flutter", "DevOps", "Tutorial"],
    content: `
*And that's totally okay.*

---

Have you ever ordered a coffee and been asked, "Do you want it hot or iced?" Same coffee beans, same water, same barista — but the *experience* is different depending on what you pick. That's basically what Flutter Flavors are. Same app, different configurations.

Let me walk you through it without the usual "read-the-docs" headache.

---

## The Problem Nobody Talks About (Until It Bites You)

Picture this. You're building an app. Everything works beautifully on your machine. You push it to your client for testing, and — oh no — the test build is hitting the **production** server. Real users are seeing test data. Your client is not happy. You are not happy. Nobody is happy.

This happens more often than anyone admits.

The truth is, most apps need to exist in more than one version at the same time. You need a **development** version that talks to your local server. A **staging** version that your QA team can break without consequences. And a **production** version that goes to real users who don't care about your internal drama.

Manually changing API URLs, app names, and icons every time you switch between these? That's not development. That's suffering.

**This is the problem Flutter Flavors solve.**

---

## So What Exactly Are Flavors?

Think of flavors as *outfits* for your app. The body underneath is the same — your code, your widgets, your logic. But depending on the occasion, you dress it differently.

A **flavor** lets you create different versions of your app from the same codebase, where each version can have its own:

- App name (so you can tell them apart on your phone)
- App icon
- API base URL
- Color theme
- Firebase project
- Any configuration you can think of

The best part? You don't duplicate a single line of business logic.

---

## Let's Build This Thing (Step by Step)

Enough theory. Let's get our hands dirty.

### Step 1: Define Your Flavors

First, decide what flavors you need. For most projects, three is the sweet spot:

| Flavor | Purpose | Example App Name |
|--------|---------|-----------------|
| \`dev\` | Local development | MyApp (Dev) |
| \`staging\` | QA and client testing | MyApp (Staging) |
| \`prod\` | Real users, real data | MyApp |

### Step 2: Create a Flavor Configuration Class

Create a simple Dart file that holds the configuration for each flavor. I like to put this in \`lib/config/app_config.dart\`.

\`\`\`dart
enum Flavor { dev, staging, prod }

class AppConfig {
  final Flavor flavor;
  final String appName;
  final String apiBaseUrl;

  static late AppConfig _instance;

  factory AppConfig({
    required Flavor flavor,
    required String appName,
    required String apiBaseUrl,
  }) {
    _instance = AppConfig._internal(
      flavor: flavor,
      appName: appName,
      apiBaseUrl: apiBaseUrl,
    );
    return _instance;
  }

  AppConfig._internal({
    required this.flavor,
    required this.appName,
    required this.apiBaseUrl,
  });

  static AppConfig get instance => _instance;

  static bool get isDev => _instance.flavor == Flavor.dev;
  static bool get isStaging => _instance.flavor == Flavor.staging;
  static bool get isProd => _instance.flavor == Flavor.prod;
}
\`\`\`

Nothing fancy here. Just a class that says, "Hey, here's who I am and where I should be talking to."

### Step 3: Create Entry Points for Each Flavor

Instead of one \`main.dart\`, you'll create a separate entry point for each flavor. Here's the key idea: **each entry point configures the app differently, then runs the same app.**

**\`lib/main_dev.dart\`**

\`\`\`dart
import 'package:flutter/material.dart';
import 'config/app_config.dart';
import 'app.dart';

void main() {
  AppConfig(
    flavor: Flavor.dev,
    appName: 'MyApp (Dev)',
    apiBaseUrl: 'https://dev-api.myapp.com',
  );
  runApp(const MyApp());
}
\`\`\`

**\`lib/main_staging.dart\`**

\`\`\`dart
import 'package:flutter/material.dart';
import 'config/app_config.dart';
import 'app.dart';

void main() {
  AppConfig(
    flavor: Flavor.staging,
    appName: 'MyApp (Staging)',
    apiBaseUrl: 'https://staging-api.myapp.com',
  );
  runApp(const MyApp());
}
\`\`\`

**\`lib/main_prod.dart\`**

\`\`\`dart
import 'package:flutter/material.dart';
import 'config/app_config.dart';
import 'app.dart';

void main() {
  AppConfig(
    flavor: Flavor.prod,
    appName: 'MyApp',
    apiBaseUrl: 'https://api.myapp.com',
  );
  runApp(const MyApp());
}
\`\`\`

See the pattern? Same app. Different outfit.

### Step 4: Use the Config in Your App

Now anywhere in your app, you can access the current flavor's configuration:

\`\`\`dart
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConfig.instance.appName,
      home: const HomeScreen(),
    );
  }
}
\`\`\`

And in your API service:

\`\`\`dart
class ApiService {
  final String baseUrl = AppConfig.instance.apiBaseUrl;

  Future<Response> getUsers() {
    return http.get(Uri.parse('\$baseUrl/users'));
  }
}
\`\`\`

That's it. No \`if-else\` spaghetti. No environment variables you'll forget to change. The configuration is baked in at launch time.

### Step 5: Run the Right Flavor

Here's the fun part. You just tell Flutter which entry point to use:

\`\`\`bash
# Development
flutter run -t lib/main_dev.dart

# Staging
flutter run -t lib/main_staging.dart

# Production
flutter run -t lib/main_prod.dart
\`\`\`

The \`-t\` flag stands for *target*. You're telling Flutter, "Start from this file instead of the default \`main.dart\`."

---

## Adding a Visual Indicator (The Banner Trick)

Here's a small trick I love. When you're running the dev or staging version, show a little banner so you **always** know which version you're looking at. No more "wait, is this staging or prod?" moments.

\`\`\`dart
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConfig.instance.appName,
      home: AppConfig.isProd
          ? const HomeScreen()
          : Banner(
              message: AppConfig.instance.flavor.name.toUpperCase(),
              location: BannerLocation.topStart,
              color: AppConfig.isDev ? Colors.green : Colors.orange,
              child: const HomeScreen(),
            ),
    );
  }
}
\`\`\`

Now your dev build has a green "DEV" banner, staging has an orange "STAGING" banner, and production is clean with no banner at all. Simple. Effective. Saves lives (okay, maybe just saves confusion).

---

## Going Deeper: Platform-Level Flavors

What we've built so far works great for Dart-level configuration. But what if you want each flavor to have a different **app icon** or a different **app name** on the home screen? That requires configuring flavors at the platform level too.

### Android

In your \`android/app/build.gradle\`, add flavor dimensions:

\`\`\`groovy
android {
    // ... existing config

    flavorDimensions "app"

    productFlavors {
        dev {
            dimension "app"
            applicationIdSuffix ".dev"
            resValue "string", "app_name", "MyApp (Dev)"
        }
        staging {
            dimension "app"
            applicationIdSuffix ".staging"
            resValue "string", "app_name", "MyApp (Staging)"
        }
        prod {
            dimension "app"
            resValue "string", "app_name", "MyApp"
        }
    }
}
\`\`\`

The \`applicationIdSuffix\` is the magic sauce here. It means \`com.mycompany.myapp.dev\` and \`com.mycompany.myapp.staging\` are treated as **separate apps**. You can install all three on the same phone at the same time. No more uninstalling and reinstalling.

Then update your \`AndroidManifest.xml\` to use the dynamic app name:

\`\`\`xml
<application
    android:label="@string/app_name"
    ...>
\`\`\`

### iOS

For iOS, you'll need to set up build configurations in Xcode:

1. Open \`ios/Runner.xcworkspace\` in Xcode
2. Go to **Runner > Project > Info > Configurations**
3. Duplicate your existing configurations (Debug, Release, Profile) for each flavor
4. Name them: \`Debug-dev\`, \`Release-dev\`, \`Debug-staging\`, \`Release-staging\`, \`Debug-prod\`, \`Release-prod\`
5. Create matching schemes for each flavor

Then add a flavor-specific \`xcconfig\` file for each flavor. For example, \`ios/Flutter/dev.xcconfig\`:

\`\`\`
PRODUCT_BUNDLE_IDENTIFIER=com.mycompany.myapp.dev
PRODUCT_NAME=MyApp (Dev)
\`\`\`

I won't lie — iOS setup is more involved than Android. But you only do it once.

### Running with Platform Flavors

Once platform flavors are configured, use the \`--flavor\` flag:

\`\`\`bash
# Development
flutter run --flavor dev -t lib/main_dev.dart

# Staging
flutter run --flavor staging -t lib/main_staging.dart

# Production
flutter run --flavor prod -t lib/main_prod.dart
\`\`\`

---

## Pro Tips From Someone Who Learned the Hard Way

**1. Create run configurations in your IDE.**
If you use VS Code, add this to your \`.vscode/launch.json\`:

\`\`\`json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Dev",
      "request": "launch",
      "type": "dart",
      "program": "lib/main_dev.dart",
      "args": ["--flavor", "dev"]
    },
    {
      "name": "Staging",
      "request": "launch",
      "type": "dart",
      "program": "lib/main_staging.dart",
      "args": ["--flavor", "staging"]
    },
    {
      "name": "Prod",
      "request": "launch",
      "type": "dart",
      "program": "lib/main_prod.dart",
      "args": ["--flavor", "prod"]
    }
  ]
}
\`\`\`

Now you just pick a flavor from the dropdown and hit run. No typing commands. No typos.

**2. Add a flavor-aware debug banner.**
We already covered this, but seriously, do it. Future you will thank present you.

**3. Never hardcode API URLs.**
If you find yourself writing \`https://api.myapp.com\` directly in a service file, stop. That URL belongs in \`AppConfig\`. Always.

**4. Use different Firebase projects per flavor.**
Each flavor should point to its own Firebase project. Dev data and production data should never, ever mix. Use the \`firebase_options_dev.dart\`, \`firebase_options_staging.dart\`, and \`firebase_options_prod.dart\` pattern with \`FlutterFire CLI\` to generate separate configs.

**5. Keep your \`main.dart\` file.**
Some tools and packages expect a \`main.dart\` to exist. I usually keep it and just make it point to the dev flavor by default:

\`\`\`dart
// lib/main.dart
export 'main_dev.dart';
\`\`\`

---

## When Should You Set Up Flavors?

Honestly? **At the start of the project.**

Setting up flavors takes 30 minutes at the beginning of a project. Retrofitting them into an existing project takes a full afternoon and a few cups of strong coffee. It's one of those things that's always easier to do early.

Even if you think your app is "too small" for flavors, set them up anyway. You'll have at least a dev and prod environment, and you'll avoid accidentally shipping test data to production. Trust me, it happens to the best of us.

---

## Wrapping Up

Flutter Flavors aren't complicated. They're just a structured way to say: "Same app, different settings." The concept is simple, but the impact on your workflow is massive. No more environment mixups. No more "which server am I hitting?" confusion. No more installing and uninstalling builds on your test device.

Set it up once, and you'll wonder how you ever lived without it.

---

*Found this helpful? Connect with me on [Twitter](https://twitter.com/anjanarodrigo) or [LinkedIn](https://linkedin.com/in/anjana-rodrigo-a41539191)!*
    `,
  },
  "flutter-monorepo-melos": {
    title: "Flutter Monorepo with Melos: Stop Juggling Repos, Start Building Apps",
    date: "2024-02-20",
    readTime: "18 min read",
    tags: ["Flutter", "DevOps", "Architecture"],
    content: `
*Because managing 12 separate repositories for one product is not a personality trait. It's a cry for help.*

---

You know that moment when you fix a bug in your shared UI package, bump the version, publish it, then go update the version in your main app, your admin panel, your second app, and that weird internal tool nobody remembers building? And then one of them breaks because someone forgot to update?

Yeah. That moment.

If you've been nodding your head, you either need a monorepo or you need therapy. Probably both. But let's start with the monorepo.

---

## Why I'm Writing This

I currently maintain several Flutter applications — [Zomoto](/blog/building-zomoto-pos) (a restaurant POS system running in 3 restaurants), the [Arcon Travel App](/projects), and the [Melbourne Mover driver app](/projects). Each of these has shared patterns: common models, similar UI components, overlapping utility code, and Firebase integrations that look almost identical across projects.

Right now, they all live in separate repositories. Every time I improve an error handling pattern in Zomoto, I manually copy it to the other projects. Every time I build a reusable widget, I rebuild it from scratch in the next app. It's not sustainable.

So I'm actively working on migrating these projects into a monorepo structure with Melos. This article is both a guide for you and documentation of my own journey — the setup, the decisions, and the lessons I'm learning along the way.

---

## What Even Is a Monorepo?

Let's strip away the Silicon Valley jargon.

A **monorepo** is just... putting all your related projects in one single repository. That's it. One repo. Multiple packages. Multiple apps. All living under the same roof.

Imagine you're building a product ecosystem. You've got:

- A mobile app for end users
- An admin dashboard (also Flutter, maybe Flutter Web)
- A shared UI component library
- A shared API client package
- A shared models/entities package
- Maybe a core utilities package

In the traditional approach, each of these lives in its own Git repository. You version them independently, publish them to a private pub server, and pray that version \`2.3.1\` of your API client is compatible with version \`1.8.0\` of your models package. Spoiler: it usually isn't at 11 PM on a Friday.

In a **monorepo**, all of these live together:

\`\`\`
taskflow/
├── apps/
│   ├── mobile/          # The main Flutter app
│   └── admin/           # Admin dashboard
├── packages/
│   ├── ui_kit/          # Shared widgets and themes
│   ├── api_client/      # HTTP client, API calls
│   ├── models/          # Shared data models
│   └── core/            # Utilities, extensions, constants
├── melos.yaml           # The brain of the operation
└── pubspec.yaml         # Root pubspec
\`\`\`

Everything is **right there**. You change a model, and you instantly see if it breaks the mobile app, the admin panel, or both. No publishing. No version bumping. No waiting.

---

## "But Wait, Won't That Be a Mess?"

Great question. And the answer is: **yes, if you do it without tooling.**

Managing a monorepo manually is like organizing a wedding without a planner. Sure, you *can* do it. But you'll end up running \`flutter pub get\` in 8 different directories, forgetting which packages depend on which, and losing your mind when you need to run tests across everything.

This is where **Melos** walks in, puts on sunglasses, and says "I got this."

---

## Enter Melos: Your Monorepo's Best Friend

**Melos** is a tool built by the folks at Invertase (the same team behind FlutterFire). It's designed specifically for managing Dart and Flutter monorepos.

What does it actually do? In plain English:

- **Links all your local packages together** so they reference each other directly (no publishing needed)
- **Runs commands across all packages** at once (tests, analysis, code generation)
- **Handles versioning and changelogs** automatically
- **Filters which packages to target** based on changes, dependencies, or custom conditions
- **Bootstraps everything** with a single command

Think of Melos as the project manager your monorepo desperately needs.

---

## Setting Up Melos (The Actual Hands-On Part)

Enough philosophy. Let's build a monorepo from scratch.

### Step 1: Install Melos

\`\`\`bash
dart pub global activate melos
\`\`\`

That's it. Melos is now available globally on your machine.

### Step 2: Create Your Project Structure

\`\`\`bash
mkdir taskflow && cd taskflow

mkdir -p apps/mobile
mkdir -p apps/admin
mkdir -p packages/ui_kit
mkdir -p packages/api_client
mkdir -p packages/models
mkdir -p packages/core
\`\`\`

### Step 3: Create the Root \`pubspec.yaml\`

This is a minimal file. Its job is just to declare that this workspace exists:

\`\`\`yaml
name: taskflow_workspace
publish_to: 'none'

environment:
  sdk: '>=3.0.0 <4.0.0'

dev_dependencies:
  melos: ^6.1.0
\`\`\`

### Step 4: Create \`melos.yaml\` — The Heart of Everything

This file lives at the root and tells Melos how your monorepo is structured:

\`\`\`yaml
name: taskflow

packages:
  - apps/**
  - packages/**

command:
  bootstrap:
    usePubspecOverrides: true

scripts:
  analyze:
    run: melos exec -- "dart analyze --fatal-infos"
    description: Run dart analyze in all packages

  test:
    run: melos exec -- "flutter test"
    description: Run tests in all packages
    packageFilters:
      dirExists: test

  format:
    run: melos exec -- "dart format . --set-exit-if-changed"
    description: Check formatting in all packages

  build_runner:
    run: melos exec -- "dart run build_runner build --delete-conflicting-outputs"
    description: Run build_runner in all packages
    packageFilters:
      dependsOn: build_runner

  clean:
    run: melos exec -- "flutter clean"
    description: Clean all packages
\`\`\`

**\`packages\`** tells Melos where to find your packages. The \`**\` glob means "look in all subdirectories."

**\`command.bootstrap.usePubspecOverrides\`** is the magic setting. It tells Melos to use \`pubspec_overrides.yaml\` files to link local packages — so when \`mobile\` depends on \`ui_kit\`, it uses the local version right next to it.

**\`scripts\`** are custom commands you can run across your entire monorepo.

### Step 5: Set Up Individual Packages

Each package gets its own \`pubspec.yaml\`. Here's what a shared package looks like:

**\`packages/models/pubspec.yaml\`**

\`\`\`yaml
name: taskflow_models
description: Shared data models for TaskFlow
publish_to: 'none'

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  freezed_annotation: ^2.4.1
  json_annotation: ^4.8.1

dev_dependencies:
  build_runner: ^2.4.6
  freezed: ^2.4.5
  json_serializable: ^6.7.1
\`\`\`

And here's how an app references the shared packages:

**\`apps/mobile/pubspec.yaml\`**

\`\`\`yaml
name: taskflow_mobile
description: TaskFlow mobile app
publish_to: 'none'

environment:
  sdk: '>=3.0.0 <4.0.0'
  flutter: '>=3.10.0'

dependencies:
  flutter:
    sdk: flutter
  taskflow_models:
    path: ../../packages/models
  taskflow_ui_kit:
    path: ../../packages/ui_kit
  taskflow_api_client:
    path: ../../packages/api_client
\`\`\`

Notice the \`path:\` dependencies. They point to relative paths within the monorepo. No versions. No pub server. Just direct references.

### Step 6: Bootstrap

\`\`\`bash
melos bootstrap
\`\`\`

Melos will resolve dependencies and link everything together. Your monorepo is alive.

---

## Using Melos Day-to-Day

\`\`\`bash
# Run analysis everywhere
melos run analyze

# Run tests everywhere
melos run test

# Run build_runner where needed
melos run build_runner

# Clean everything
melos run clean

# List all packages
melos list

# See dependency graph
melos list --graph
\`\`\`

One command. Every package. No cd-ing around.

### Filtering Packages

This is one of Melos's superpowers:

\`\`\`bash
# Only run in packages that depend on freezed
melos exec --depends-on="freezed" -- "dart run build_runner build"

# Ignore specific packages
melos exec --ignore="taskflow_admin" -- "flutter test"
\`\`\`

---

## The Architecture: How to Think About Package Design

### The Layer Cake

\`\`\`
┌─────────────────────────────────────────┐
│              APPS LAYER                  │
│   mobile  /  admin  /  web              │
└───────────────┬─────────────────────────┘
                │ depends on
┌───────────────▼─────────────────────────┐
│          SHARED PACKAGES                 │
│   ui_kit  /  api_client  /  models      │
└───────────────┬─────────────────────────┘
                │ depends on
┌───────────────▼─────────────────────────┐
│           CORE PACKAGE                   │
│   extensions / constants / utilities     │
└─────────────────────────────────────────┘
\`\`\`

**Dependencies only flow downward.** An app can depend on shared packages. Shared packages can depend on core. Nothing depends upward.

### What Goes Where?

**\`core/\`** — String extensions, date formatting, custom exceptions, constants, logger setup. Zero Flutter dependency if possible. Pure Dart.

**\`models/\`** — User model, Task model, API response wrappers, Freezed union types, shared enums.

**\`api_client/\`** — Dio/http client setup, API endpoint methods, interceptors, error handling.

**\`ui_kit/\`** — Custom buttons, cards, text fields, app theme, shared widgets, custom animations.

---

## A Real-World Example: Sharing a Widget

\`\`\`dart
// packages/ui_kit/lib/src/task_card.dart
import 'package:flutter/material.dart';
import 'package:taskflow_models/taskflow_models.dart';

class TaskCard extends StatelessWidget {
  final Task task;
  final VoidCallback? onTap;

  const TaskCard({super.key, required this.task, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        title: Text(task.title),
        subtitle: Text(task.description),
        trailing: _buildPriorityBadge(task.priority),
        onTap: onTap,
      ),
    );
  }

  Widget _buildPriorityBadge(TaskPriority priority) {
    final color = switch (priority) {
      TaskPriority.high => Colors.red,
      TaskPriority.medium => Colors.orange,
      TaskPriority.low => Colors.green,
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        priority.name.toUpperCase(),
        style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold),
      ),
    );
  }
}
\`\`\`

Now in any app:

\`\`\`dart
import 'package:taskflow_ui_kit/taskflow_ui_kit.dart';

// Just use it. No version conflicts. No publishing.
TaskCard(task: task, onTap: () => navigateToDetail(task))
\`\`\`

Change it once in \`ui_kit\`, and every app gets the update immediately.

---

## Melos + CI/CD: The Power Combo

\`\`\`yaml
name: CI
on:
  pull_request:
    branches: [main]

jobs:
  analyze-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
      - name: Install Melos
        run: dart pub global activate melos
      - name: Bootstrap
        run: melos bootstrap
      - name: Analyze
        run: melos run analyze
      - name: Run Tests
        run: melos run test
\`\`\`

Every PR gets analyzed and tested across your entire workspace.

---

## How I'm Applying This to My Own Projects

I'm in the process of migrating my existing Flutter apps — Zomoto, Arcon Travel, and Melbourne Mover — toward a monorepo structure. Here's what I've identified as shared across all three:

- **Firebase utilities** — Auth setup, Firestore helpers, error handling patterns. Almost identical in all three apps.
- **Common UI components** — Loading indicators, error screens, custom buttons, status badges. I've rebuilt these from scratch in each project.
- **Models and entities** — User models, base entity classes, common enums. Copy-pasted with minor variations.
- **Networking patterns** — Dio interceptors, token refresh logic, API error handling. Same approach, different implementations.

The plan is to extract these into shared packages (\`core\`, \`ui_kit\`, \`firebase_utils\`, \`networking\`) and have each app depend on them. The Clean Architecture patterns I already use in Zomoto make this migration natural — the domain and data layers already have clear boundaries.

It's not a weekend project. Migrating existing apps is more involved than starting fresh. But even extracting just the \`core\` utilities package has already eliminated duplicate code and made bug fixes propagate instantly.

---

## Common Mistakes (So You Don't Have To Make Them)

**Making everything a package.** If a piece of code is only used by one app, keep it in that app. Packages are for shared code.

**Circular dependencies.** Package A depends on B, and B depends on A. Extract the shared code into a third package C.

**Forgetting to bootstrap after pulling.** Always run \`melos bs\` after pulling changes. Make it a habit.

**One giant "shared" package.** Split it: \`core\` for utilities, \`models\` for data, \`ui_kit\` for widgets, \`api_client\` for networking.

**Not using \`publish_to: 'none'\`.** Unless you're publishing to pub.dev, always add this to prevent accidental publishing.

---

## When Should You Use a Monorepo?

**Use a monorepo when:**
- You have multiple apps sharing code
- Your shared packages change frequently
- You're tired of version conflicts between internal packages
- You want to run tests and analysis across everything in one go

**Stick with separate repos when:**
- You have a single app with no shared packages
- Your packages are truly independent with different release cycles
- You're building open-source packages for pub.dev

---

## Wrapping Up

Monorepos aren't magic. They don't make bad architecture good. What they do is **remove friction**. Friction between packages. Friction between projects. Friction between "I fixed the bug" and "every app has the fix."

Melos takes that further by giving you the tools to actually manage the monorepo without losing your sanity. Bootstrap, scripts, filtering, versioning — it handles the boring stuff so you can focus on building.

If you're working on multiple Flutter projects with overlapping code — like I am with Zomoto, Arcon Travel, and Melbourne Mover — give this setup a serious look. The initial setup pays for itself within the first week.

Your future self — the one who doesn't have to manually copy-paste utility code across 4 repositories — will be grateful.

---

*Got questions about setting up your own monorepo? Connect with me on [Twitter](https://twitter.com/anjanarodrigo) or [LinkedIn](https://linkedin.com/in/anjana-rodrigo-a41539191). I've made all the mistakes already so you don't have to!*
    `,
  },
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = blogPosts[slug as keyof typeof blogPosts];

  const pathname = usePathname();
  const [shareUrl, setShareUrl] = useState("");
  useEffect(() => {
    setShareUrl(window.location.href);
  }, [pathname]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <Link href="/blog">
            <Button variant="emerald">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const shareText = encodeURIComponent(post.title);

  return (
    <div className="min-h-screen py-20">
      <article className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm font-medium bg-emerald/20 text-emerald rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-6 gradient-text">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readTime}</span>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Share:</span>
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 glass rounded-lg hover:bg-emerald/10 hover:border-emerald border border-transparent transition-all"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 glass rounded-lg hover:bg-emerald/10 hover:border-emerald border border-transparent transition-all"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 glass rounded-lg hover:bg-emerald/10 hover:border-emerald border border-transparent transition-all"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: post.title,
                    url: shareUrl,
                  });
                } else {
                  navigator.clipboard.writeText(shareUrl);
                  alert("Link copied to clipboard!");
                }
              }}
              className="p-2 glass rounded-lg hover:bg-emerald/10 hover:border-emerald border border-transparent transition-all"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </motion.header>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:gradient-text
            prose-a:text-emerald prose-a:no-underline hover:prose-a:underline
            prose-code:text-amber prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-muted prose-pre:border prose-pre:border-border
            prose-img:rounded-xl
            prose-strong:text-foreground
            prose-em:text-muted-foreground"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </motion.div>

        {/* Comments Section Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 pt-8 border-t border-border"
        >
          <h2 className="text-2xl font-bold mb-4">Comments</h2>
          <div className="glass p-8 rounded-xl text-center">
            <p className="text-muted-foreground">
              Comments section coming soon! For now, feel free to reach out on{" "}
              <a
                href="https://twitter.com/anjanarodrigo"
                className="text-emerald hover:underline"
              >
                Twitter
              </a>{" "}
              or{" "}
              <a
                href="https://linkedin.com/in/anjana-rodrigo-a41539191"
                className="text-emerald hover:underline"
              >
                LinkedIn
              </a>
              .
            </p>
          </div>
        </motion.div>
      </article>
    </div>
  );
}
