// 🇮🇳 CreatorBharat SaaS Brand Controller
import { BrandService } from '../services/brandService.js';

export class BrandController {
  static async getBrandById(req, res) {
    try {
      const { id } = req.params;
      const brand = await BrandService.getBrandById(id);
      return res.json(brand);
    } catch (err) {
      console.error('[GET /api/brands/:id] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to retrieve brand profile.';
      return res.status(status).json({ error: message });
    }
  }
}
