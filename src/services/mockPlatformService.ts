export interface Salon {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  status: 'active' | 'pending' | 'suspended';
  subscriptionStatus: 'active' | 'trial' | 'past_due' | 'suspended';
  createdAt: string;
}

let _salonsCache: Salon[] | null = null;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockPlatformService = {
  async getSalons(): Promise<Salon[]> {
    await delay(300);
    if (_salonsCache) return _salonsCache;
    
    const stored = localStorage.getItem('trimora_salons_db');
    if (stored) {
      _salonsCache = JSON.parse(stored);
    } else {
      _salonsCache = [
        {
          id: 'trimora-salon',
          name: 'Trimora Salon (Original)',
          slug: 'trimora',
          contactEmail: 'contact@trimora.com',
          contactPhone: '+44 7700 111111',
          address: '123 High Street, London',
          status: 'active',
          subscriptionStatus: 'active',
          createdAt: '2021-01-15T00:00:00Z',
        },
        {
          id: 'salon-b',
          name: 'Elegance Hair Studio',
          slug: 'elegance',
          contactEmail: 'hello@elegance.com',
          contactPhone: '+44 7700 222222',
          address: '45 Queen St, Manchester',
          status: 'active',
          subscriptionStatus: 'trial',
          createdAt: '2023-05-10T00:00:00Z',
        },
        {
          id: 'salon-c',
          name: 'Urban Barber',
          slug: 'urban-barber',
          contactEmail: 'info@urbanbarber.co.uk',
          contactPhone: '+44 7700 333333',
          address: '88 King Rd, Birmingham',
          status: 'suspended',
          subscriptionStatus: 'past_due',
          createdAt: '2023-11-20T00:00:00Z',
        }
      ];
      localStorage.setItem('trimora_salons_db', JSON.stringify(_salonsCache));
    }
    return _salonsCache!;
  },

  async createSalon(data: Partial<Salon> & { ownerPassword?: string; ownerFirstName?: string; ownerLastName?: string }): Promise<Salon> {
    await delay(500);
    const salons = await this.getSalons();
    
    // Check if slug is unique
    if (salons.find(s => s.slug === data.slug)) {
      throw new Error('A salon with this slug already exists.');
    }

    const newSalon: Salon = {
      id: `salon-${Date.now()}`,
      name: data.name || 'New Salon',
      slug: data.slug || `salon-${Date.now()}`,
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      address: data.address || '',
      status: data.status || 'pending',
      subscriptionStatus: data.subscriptionStatus || 'trial',
      createdAt: new Date().toISOString(),
    };
    
    if (data.contactEmail && data.ownerPassword) {
      const { mockAuthService } = await import('./mockAuthService');
      await mockAuthService.createSalonOwner(
        data.contactEmail, 
        data.ownerPassword, 
        newSalon.id, 
        data.ownerFirstName, 
        data.ownerLastName
      );
    }
    
    _salonsCache = [...salons, newSalon];
    localStorage.setItem('trimora_salons_db', JSON.stringify(_salonsCache));
    return newSalon;
  },

  async updateSalon(id: string, data: Partial<Salon>): Promise<void> {
    await delay(400);
    const salons = await this.getSalons();
    _salonsCache = salons.map(s => s.id === id ? { ...s, ...data } : s);
    localStorage.setItem('trimora_salons_db', JSON.stringify(_salonsCache));
  },
  
  async getDashboardStats() {
    await delay(300);
    const salons = await this.getSalons();
    return {
      totalSalons: salons.length,
      activeSalons: salons.filter(s => s.status === 'active').length,
      suspendedSalons: salons.filter(s => s.status === 'suspended').length,
      totalRevenueEstimate: 12500, // mock data
      newRegistrationsThisMonth: salons.filter(s => new Date(s.createdAt).getMonth() === new Date().getMonth()).length
    };
  }
};
