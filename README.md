# Okay Brunch

Okay Brunch is a premium restaurant application built with modern web technologies. It features a sleek user interface, comprehensive e-commerce functionality, and a dedicated admin dashboard.

## 🚀 Tech Stack

-   **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
-   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS
-   **Database & Auth:** [Supabase](https://supabase.com/)
-   **Payments:** [Stripe](https://stripe.com/)
-   **State Management:** [Zustand](https://github.com/pmndrs/zustand)
-   **UI Components:** [Radix UI](https://www.radix-ui.com/) & [Shadcn UI](https://ui.shadcn.com/)
-   **Icons:** [Lucide React](https://lucide.dev/)
-   **Fonts:** DM Sans, Space Mono, Source Serif 4

## 📂 Architecture

The project follows a modular architecture using the Next.js App Router:

```
├── app/                  # Application routes (Pages & Layouts)
│   ├── (auth)/           # Authentication routes (Login, Signup)
│   ├── (shop)/           # Shop & Checkout flows
│   ├── admin/            # Protected admin dashboard
│   ├── api/              # API routes (Stripe intents, etc.)
│   └── layout.tsx        # Root layout with providers
├── components/           # Reusable UI components
│   ├── ui/               # Core design system primitives (Buttons, Inputs)
│   ├── checkout/         # Checkout-specific components
│   └── ...
├── hooks/                # Custom React hooks (e.g., useCartStore)
├── lib/                  # Utilities & libraries (Supabase client, Utils)
├── types/                # Centralized TypeScript definitions
└── public/               # Static assets
```

## 🛠️ Setup & Running

1.  **Install Dependencies:**
    ```bash
    pnpm install
    # or
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env` file with the following keys:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
    STRIPE_SECRET_KEY=your_stripe_secret
    ```

3.  **Run Development Server:**
    ```bash
    pnpm dev
    # or
    npm run dev
    ```

## 🔐 Key Features

### Admin Dashboard (`/admin`)
-   **Role-Based Access:** Only users with the `admin` role can access.
-   **Secure Redirection:** Automatic server-side redirection for unauthorized users.
-   **Management:** View orders (extensible for menu management).

### E-Commerce Flow
-   **Shopping Cart:** Persisted local storage cart using Zustand.
-   **Checkout:** Secure Stripe integration for payments.
-   **Order Tracking:** Users can view their order history and status.

### Authentication
-   **Supabase Auth:** Secure email/password login and signup.
-   **Profile Management:** User profiles store delivery details.

## 🎨 Design System
The design emphasizes a "premium brunch" aesthetic using:
-   **Bold Typography:** Serif headings combined with mono accents.
-   **High Contrast:** Sharp borders and clean layouts.
-   **Interactive Elements:** Smooth transitions and hover effects.
