// 🇮🇳 CreatorBharat SaaS Brand Service
import prisma from '../prisma.js';

export class BrandService {
  /**
   * Retrieves public brand profile details by brand ID.
   */
  static async getBrandById(id) {
    const brand = await prisma.brand.findUnique({
      where: { id },
      select: {
        id: true,
        companyName: true,
        logo: true,
        website: true,
        verified: true
      }
    });

    if (!brand) {
      const error = new Error('Brand profile not found.');
      error.statusCode = 404;
      throw error;
    }

    return {
      id: brand.id,
      name: brand.companyName,
      photo: brand.logo,
      website: brand.website,
      verified: brand.verified
    };
  }
}
