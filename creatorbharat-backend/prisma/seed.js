const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@creatorbharat.in' },
    update: {},
    create: {
      email: 'admin@creatorbharat.in',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Creators
  const creatorsData = [
    {
      handle: 'rahul-sharma',
      name: 'Rahul Sharma',
      email: 'rahul@demo.in',
      password: await bcrypt.hash('demo123', 10),
      city: 'Jaipur',
      state: 'Rajasthan',
      niche: ['Travel', 'Lifestyle'],
      platform: ['Instagram'],
      followers: 248000,
      er: 4.8,
      verified: true,
      featured: true,
      score: 88,
    },
    {
      handle: 'priya-mehta',
      name: 'Priya Mehta',
      email: 'priya@demo.in',
      password: await bcrypt.hash('demo123', 10),
      city: 'Mumbai',
      state: 'Maharashtra',
      niche: ['Fashion', 'Beauty'],
      platform: ['Instagram', 'YouTube'],
      followers: 512000,
      er: 6.2,
      verified: true,
      featured: false,
      score: 94,
    },
    {
      handle: 'arjun-kapoor',
      name: 'Arjun Kapoor',
      email: 'arjun@demo.in',
      password: await bcrypt.hash('demo123', 10),
      city: 'Bengaluru',
      state: 'Karnataka',
      niche: ['Tech', 'Gaming'],
      platform: ['YouTube', 'Instagram'],
      followers: 890000,
      er: 8.1,
      verified: true,
      featured: true,
      score: 97,
    },
    {
      handle: 'sneha-iyer',
      name: 'Sneha Iyer',
      email: 'sneha@demo.in',
      password: await bcrypt.hash('demo123', 10),
      city: 'Chennai',
      state: 'Tamil Nadu',
      niche: ['Food', 'Lifestyle'],
      platform: ['Instagram', 'YouTube'],
      followers: 156000,
      er: 5.4,
      verified: true,
      featured: false,
      score: 82,
    }
  ];

  for (const c of creatorsData) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        password: c.password,
        role: 'CREATOR',
      }
    });

    await prisma.creator.upsert({
      where: { userId: user.id },
      update: { status: 'ACTIVE' },
      create: {
        userId: user.id,
        handle: c.handle,
        name: c.name,
        city: c.city,
        state: c.state,
        niche: c.niche,
        platform: c.platform,
        followers: c.followers,
        engagementRate: c.er,
        verified: c.verified,
        featured: c.featured,
        score: c.score,
        pro: true,
        status: 'ACTIVE',
      }
    });
  }

  // Brands & Campaigns
  const brandUser = await prisma.user.upsert({
    where: { email: 'brand@demo.in' },
    update: {},
    create: {
      email: 'brand@demo.in',
      password: await bcrypt.hash('demo123', 10),
      role: 'BRAND',
    }
  });

  const brand = await prisma.brand.upsert({
    where: { userId: brandUser.id },
    update: {},
    create: {
      userId: brandUser.id,
      companyName: 'MakeMyTrip',
      contactName: 'Brand Manager',
      industry: 'Travel',
    }
  });

  const campaigns = [
    {
      title: 'Summer Travel Campaign 2026',
      brandId: brand.id,
      description: 'Looking for travel creators to showcase hidden destinations across India. Authentic storytelling preferred.',
      budgetMin: 50000,
      budgetMax: 200000,
      slots: 10,
      filled: 0,
      urgent: true,
      status: 'LIVE',
      niche: ['Travel'],
      platform: ['Instagram', 'YouTube']
    },
    {
      title: 'Festive Beauty Lookbook -- Diwali 2026',
      brandId: brand.id,
      description: 'Seeking fashion & beauty creators for Diwali 2026 campaign. Create festive looks using Nykaa products.',
      budgetMin: 30000,
      budgetMax: 150000,
      slots: 15,
      filled: 0,
      urgent: false,
      status: 'LIVE',
      niche: ['Fashion', 'Beauty'],
      platform: ['Instagram']
    },
    {
      title: 'boAt Airdopes 500 Review Campaign',
      brandId: brand.id,
      description: 'Honest unboxing and review of boAt Airdopes 500. Must cover sound quality, battery life, and build.',
      budgetMin: 25000,
      budgetMax: 100000,
      slots: 8,
      filled: 0,
      urgent: false,
      status: 'LIVE',
      niche: ['Tech', 'Gaming'],
      platform: ['YouTube', 'Instagram']
    }
  ];

  for (const camp of campaigns) {
    // Basic check to avoid duplicates during seeding
    const existing = await prisma.campaign.findFirst({
      where: { title: camp.title }
    });
    if (!existing) {
      await prisma.campaign.create({
        data: camp
      });
    }
  }

  // Blog Posts
  const blogs = [
    {
      slug: 'small-town-creators',
      title: 'How Small-Town Creators Are Taking Over Instagram',
      category: 'Creator Stories',
      excerpt: 'From Jaipur to Patna, creators from Tier 2 and 3 cities are building massive audiences.',
      body: 'The narrative around Indian content creation has always centered on Mumbai and Delhi. But 2026 has rewritten that story entirely...',
      author: 'CreatorBharat Team',
      featured: true,
      image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80',
    },
    {
      slug: 'first-brand-deal',
      title: 'Your First Brand Deal: Complete 2026 Guide',
      category: 'Creator Tips',
      excerpt: 'Step-by-step guide to landing your first brand collaboration.',
      body: 'Landing your first brand deal feels impossible until it happens...',
      author: 'Rahul Sharma',
      featured: false,
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80',
    },
    {
      slug: 'engagement-vs-followers',
      title: 'Why Engagement Rate Beats Follower Count',
      category: 'Brand Guides',
      excerpt: 'The metric that actually predicts campaign success.',
      body: 'Creator A: 1M followers, 1.2% ER. Creator B: 150K followers, 8.5% ER. Same reach. Creator B costs 5-8x less...',
      author: 'CreatorBharat Team',
      featured: false,
      image: 'https://images.unsplash.com/photo-1611605698335-8441051e7b47?w=800&q=80',
    },
    {
      slug: 'top-creator-cities-2026',
      title: 'Top 10 Creator Cities Beyond Mumbai and Delhi',
      category: 'Top Lists',
      excerpt: 'India\'s regional creator landscape is richer than ever.',
      body: '1. Jaipur 2. Ahmedabad 3. Lucknow 4. Indore 5. Surat...',
      author: 'Editorial Team',
      featured: false,
      image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80',
    },
    {
      slug: 'set-creator-rates-2026',
      title: 'How to Set Your Creator Rates in 2026',
      category: 'Creator Tips',
      excerpt: 'Stop undercharging. Start using the 2026 formula.',
      body: 'Use the CreatorBharat Rate Calculator. Base = followers x ER x platform multiplier...',
      author: 'CreatorBharat Team',
      featured: false,
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80',
    }
  ];

  for (const b of blogs) {
    await prisma.blog.upsert({
      where: { slug: b.slug },
      update: {},
      create: b
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
