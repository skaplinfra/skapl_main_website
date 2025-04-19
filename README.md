# SKAPL - Energy Consulting & Project Management

A modern web platform for SKAPL, a high-end energy consulting and project management firm specializing in the solar industry. Built with Next.js, TypeScript, and Supabase.

## Features

- 🌐 Modern, responsive design
- 🎨 Tailwind CSS with custom theming
- 🔒 Secure form submissions
- 📁 File uploads for career applications
- 🌙 Dark mode support
- ⚡ Server-side rendering
- 📱 Mobile-first approach

## Tech Stack

- **Framework:** Next.js 13.5
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Database & Storage:** Supabase
- **Form Handling:** React Hook Form + Zod
- **Notifications:** Sonner
- **Deployment:** Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/skapl_main_website.git
cd skapl_main_website
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up your Supabase database:
   - Create required tables (clients, career_applications)
   - Set up storage bucket (resumes)
   - Configure storage policies

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
skapl_main_website/
├── app/                    # Next.js app directory
│   ├── about/             # About page
│   ├── careers/           # Careers page
│   ├── contact/           # Contact page
│   ├── services/          # Services page
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
├── lib/                   # Utility functions and configs
├── public/               # Static assets
└── styles/              # Global styles
```

## Database Schema

### Clients Table
```sql
create table clients (
  id bigint primary key generated always as identity,
  name text not null,
  email text unique not null,
  phone text,
  company text,
  industry text
);
```

### Career Applications Table
```sql
create table career_applications (
  id bigint primary key generated always as identity,
  submitted_at timestamp with time zone default timezone('utc'::text, now()),
  name text not null,
  email text not null,
  phone text,
  position_applied text not null,
  cover_letter text,
  resume_url text not null
);
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

SKAPL - [contact@skapl.com](mailto:contact@skapl.com)

Project Link: [https://github.com/yourusername/skapl_main_website](https://github.com/yourusername/skapl_main_website)

## Deployment

### Firebase Hosting

This project is configured for deployment to Firebase Hosting with two environments:

- **Demo** (demo branch): [https://skapl-demo.web.app](https://skapl-demo.web.app)
- **Production** (main branch): [https://skapl-prod.web.app](https://skapl-prod.web.app)

#### Manual Deployment

To deploy manually:

```bash
# For demo environment
npm run deploy:demo

# For production environment
npm run deploy:prod
```

#### GitHub Actions Automated Deployment

This repository is configured with GitHub Actions workflows that automatically deploy:
- Push to `demo` branch → Demo environment
- Push to `main` branch → Production environment

#### Required GitHub Secrets

For GitHub Actions to work properly, configure these repository secrets:

**Demo environment:**
- `DEMO_NEXT_PUBLIC_SUPABASE_URL`
- `DEMO_NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DEMO_TURNSTILE_CONTACT_SITE_KEY`
- `DEMO_TURNSTILE_CAREER_SITE_KEY`
- `DEMO_TURNSTILE_CONTACT_SECRET_KEY`
- `DEMO_TURNSTILE_CAREER_SECRET_KEY`
- `FIREBASE_SERVICE_ACCOUNT_SKAPL_DEMO` (Firebase service account JSON)

**Production environment:**
- `PROD_NEXT_PUBLIC_SUPABASE_URL`
- `PROD_NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `PROD_TURNSTILE_CONTACT_SITE_KEY`
- `PROD_TURNSTILE_CAREER_SITE_KEY`
- `PROD_TURNSTILE_CONTACT_SECRET_KEY`
- `PROD_TURNSTILE_CAREER_SECRET_KEY`
- `FIREBASE_SERVICE_ACCOUNT_SKAPL_PROD` (Firebase service account JSON) 