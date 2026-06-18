import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const PLACEHOLDER_PHOTOS = [
  {
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop",
    alt: "Mountain landscape at golden hour",
    width: 1200,
    height: 800,
  },
  {
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=900&fit=crop",
    alt: "Forest valley with morning light",
    width: 1200,
    height: 900,
  },
  {
    url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&h=750&fit=crop",
    alt: "Wildflower meadow",
    width: 1200,
    height: 750,
  },
  {
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=1600&fit=crop",
    alt: "Starry night over mountains",
    width: 1200,
    height: 1600,
  },
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@portfolio.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme123";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await db.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, name: "Admin" },
    create: {
      email: adminEmail,
      passwordHash,
      name: "Admin",
    },
  });

  await db.siteSettings.upsert({
    where: { id: "default" },
    update: {
      siteTitle: "Herman Tong — Photography & Film",
      bio: "Visual storyteller capturing landscapes, portraits, and cinematic motion.",
      footerTagline: "Photography and cinematic video work.",
      contactBlurb: "Reach out to discuss photography or film projects.",
      contactEmail: adminEmail,
    },
    create: {
      id: "default",
      siteTitle: "Herman Tong — Photography & Film",
      bio: "Visual storyteller capturing landscapes, portraits, and cinematic motion.",
      footerTagline: "Photography and cinematic video work.",
      contactBlurb: "Reach out to discuss photography or film projects.",
      contactEmail: adminEmail,
      instagram: "https://instagram.com/",
      vimeo: "https://vimeo.com/",
      youtube: "https://youtube.com/",
    },
  });

  const streetPhotography = await db.collection.upsert({
    where: { slug: "street-photography" },
    update: {
      title: "Street Photography",
      description: "Urban moments and city light across Hong Kong.",
      type: "photo",
      defaultView: "slideshow",
      published: true,
      featured: true,
      sortOrder: 1,
    },
    create: {
      slug: "street-photography",
      title: "Street Photography",
      description: "Urban moments and city light across Hong Kong.",
      type: "photo",
      defaultView: "slideshow",
      published: true,
      featured: true,
      sortOrder: 1,
    },
  });

  const brandFilms = await db.collection.upsert({
    where: { slug: "brand-films" },
    update: {
      title: "Brand Films",
      description: "Cinematic brand stories and commercial work.",
      type: "mixed",
      defaultView: "slideshow",
      published: true,
      featured: true,
      sortOrder: 2,
    },
    create: {
      slug: "brand-films",
      title: "Brand Films",
      description: "Cinematic brand stories and commercial work.",
      type: "mixed",
      defaultView: "slideshow",
      published: true,
      featured: true,
      sortOrder: 2,
    },
  });

  await db.photo.deleteMany({
    where: { collectionId: streetPhotography.id },
  });

  await db.photo.createMany({
    data: PLACEHOLDER_PHOTOS.map((photo, index) => ({
      collectionId: streetPhotography.id,
      url: photo.url,
      alt: photo.alt,
      width: photo.width,
      height: photo.height,
      sortOrder: index,
    })),
  });

  await db.photo.deleteMany({
    where: { collectionId: brandFilms.id },
  });

  await db.photo.create({
    data: {
      collectionId: brandFilms.id,
      url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&h=675&fit=crop",
      alt: "Behind the scenes on a film set",
      width: 1200,
      height: 675,
      sortOrder: 0,
    },
  });

  await db.video.deleteMany({
    where: { collectionId: brandFilms.id },
  });

  await db.video.createMany({
    data: [
      {
        collectionId: brandFilms.id,
        title: "Corporate Brand Film",
        description: "A cinematic brand story for a technology company.",
        embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        provider: "youtube",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1280&h=720&fit=crop",
        sortOrder: 0,
      },
      {
        collectionId: brandFilms.id,
        title: "Product Launch Reel",
        description: "Dynamic product showcase for a startup launch.",
        embedUrl: "https://player.vimeo.com/video/76979871",
        provider: "vimeo",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1280&h=720&fit=crop",
        sortOrder: 1,
      },
    ],
  });

  console.log("Seed complete.");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });