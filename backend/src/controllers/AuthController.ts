import { Request, Response } from 'express';
import { MockDbService } from '../services/MockDbService';
import { User } from '../types';

export class AuthController {
  constructor(private mockDb: MockDbService) {}

  login = (req: Request, res: Response): void => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = this.mockDb.getUserByEmail(email);

    if (!user || user.password !== password) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = user;
    if (user.role === 'provider') {
      const provider = this.mockDb.getProviderById(user.id);
      if (provider) {
        if (provider.service_categories?.length > 0) {
          (userWithoutPassword as any).category = provider.service_categories[0];
        }
        (userWithoutPassword as any).areas = provider.areas || [];
      }
    }
    res.json({ user: userWithoutPassword });
  };

  signup = (req: Request, res: Response): void => {
    const { name, email, phone, password, role, category, base_rate, areas } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const existingUser = this.mockDb.getUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: 'Email is already registered' });
      return;
    }

    const parsedAreas = Array.isArray(areas)
      ? areas
      : areas
      ? String(areas).split(',').map(a => a.trim()).filter(Boolean)
      : [];

    const newUser: User = {
      id: 'user_' + Date.now(),
      name,
      email,
      phone: phone || '',
      password,
      avatar: '👤',
      role: role === 'provider' ? 'provider' : 'user',
      ...(role === 'provider' && {
        category: category || 'General Service',
        areas: parsedAreas,
      }),
    };

    this.mockDb.createUser(newUser);

    if (newUser.role === 'provider') {
      this.mockDb.createProvider({
        provider_id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        service_categories: category ? [category] : ['General Service'],
        areas: parsedAreas,
        distance_km: 2.5,
        estimated_travel_minutes: 15,
        base_rate: base_rate ? Number(base_rate) : 1500,
        rating: 5.0,
        review_count: 0,
        last_review_days: 0,
        availability_slots: [],
        reliability_score: 1.0,
        on_time_score: 1.0,
        cancellation_risk: 0.0,
        complexity_supported: ['Basic', 'Intermediate', 'Complex'],
        is_available: true,
      });
    }

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ user: userWithoutPassword });
  };

  updateProfile = (req: Request, res: Response): void => {
    const { user_id, name, phone, category, areas } = req.body;

    if (!user_id) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const parsedAreas = req.body.hasOwnProperty('areas')
      ? (Array.isArray(areas)
        ? areas
        : String(areas || '').split(',').map(a => a.trim()).filter(Boolean))
      : undefined;

    const existingUser = this.mockDb.getUsers().find(u => u.id === user_id);
    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updatedUser = this.mockDb.updateUser(user_id, {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(existingUser.role === 'provider' && category && { category }),
      ...(existingUser.role === 'provider' && parsedAreas !== undefined && { areas: parsedAreas }),
    });

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (updatedUser.role === 'provider') {
      const updatedProvider = this.mockDb.updateProvider(user_id, {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(category && { service_categories: [category] }),
        ...(parsedAreas !== undefined && { areas: parsedAreas }),
      });
      if (updatedProvider) {
        if (updatedProvider.service_categories?.length > 0) {
          (updatedUser as any).category = updatedProvider.service_categories[0];
        }
        (updatedUser as any).areas = updatedProvider.areas || [];
      }
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({ user: userWithoutPassword });
  };
}
