# LensForge Setup Guide

## ✅ Project Successfully Created!

Your **LensForge** marketplace website is fully scaffolded and ready for development.

## 🚀 Quick Start

### 1. Configure Your Database

First, set up PostgreSQL and update `.env.local`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/lensforge
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 2. Set Up Database

```bash
# Create the database tables
npx prisma migrate dev --name init

# Open Prisma Studio to view/edit data
npx prisma studio
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📁 Project Structure Overview

```
src/
├── app/                    # Next.js pages & routes
│   ├── api/               # API endpoints
│   ├── dashboard/         # Protected user dashboard
│   ├── marketplace/       # Product marketplace
│   ├── login/            # Login page
│   ├── signup/           # Registration page
│   ├── layout.tsx        # Root layout with auth
│   └── page.tsx          # Home with 3D hero
├── components/           # Reusable React components
│   ├── Navbar.tsx       # Navigation with auth
│   ├── Hero3D.tsx       # Three.js 3D section
│   ├── ProductCard.tsx  # Product display card
│   └── Footer.tsx       # Footer
└── lib/
    ├── auth.ts          # NextAuth configuration
    ├── prisma.ts        # Prisma client singleton
    ├── types.ts         # TypeScript types
    └── utils.ts         # Helper functions
```

## 🗄️ Database Models

The schema includes:
- **User**: Sellers and buyers with profiles
- **Product**: Items for sale with pricing/ratings
- **Review**: Customer feedback and ratings
- **Order**: Purchase records with items
- **Favorite**: Wishlist functionality

## 🔐 Authentication Flow

1. User signs up via `/signup`
2. Password hashed with bcryptjs
3. Credentials stored in PostgreSQL
4. NextAuth manages JWT sessions
5. Protected routes require authentication

### Test Credentials

Create an account at signup, then use those credentials to login.

## 🎨 Customization Options

### Change Theme Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  primary: '#your-color',
  secondary: '#your-color',
}
```

### Modify 3D Hero
Edit `src/components/Hero3D.tsx`:
- Change sphere color: `color="#your-color"`
- Adjust rotation: `autoRotateSpeed={2}`
- Modify distortion: `distort={0.5}`

### Add Product Categories
Update sample products in:
- `src/app/page.tsx`
- `src/app/marketplace/page.tsx`

## 📦 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Run production build
npm run lint      # Run ESLint
```

## 🚀 Next Steps to Production

### 1. Payment Integration (Stripe)
```bash
npm install stripe @stripe/stripe-js
```
- Create Stripe account
- Add webhook handlers
- Implement checkout flow

### 2. File Storage (AWS S3)
```bash
npm install aws-sdk
```
- Upload product images
- Manage user avatars

### 3. Email Service (SendGrid/Resend)
```bash
npm install resend
```
- Confirmation emails
- Order notifications

### 4. Admin Dashboard
- Product moderation
- User management
- Analytics & reporting

### 5. Real-time Features
```bash
npm install socket.io
```
- Live notifications
- Chat messaging
- Real-time inventory

### 6. Performance Optimization
- Image optimization (Next.js Image)
- Database indexing
- CDN for static assets
- Caching strategy

## 📝 Environment Variables Checklist

- [ ] DATABASE_URL configured
- [ ] NEXTAUTH_URL set
- [ ] NEXTAUTH_SECRET generated
- [ ] NEXT_PUBLIC_API_URL configured
- [ ] Database migrated
- [ ] Test account created

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Verify PostgreSQL is running
# Check DATABASE_URL format
# Test connection: psql $DATABASE_URL
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Prisma Issues
```bash
# Regenerate Prisma client
npx prisma generate

# View database state
npx prisma studio
```

## 🔗 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma ORM](https://www.prisma.io/docs/)
- [NextAuth.js](https://next-auth.js.org/)
- [Three.js](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)

## 📞 Support

For help or questions:
- Check the README.md
- Review Next.js documentation
- Inspect error logs
- Verify environment variables

## 🎯 Feature Checklist

- [x] 3D Hero Section
- [x] Product Marketplace
- [x] User Authentication
- [x] Dashboard
- [x] Database Schema
- [ ] Payments (TODO)
- [ ] File Uploads (TODO)
- [ ] Email Notifications (TODO)
- [ ] Admin Panel (TODO)
- [ ] Real-time Chat (TODO)

---

**Ready to customize? Start at `src/app/page.tsx` to modify the home page!** 🚀
