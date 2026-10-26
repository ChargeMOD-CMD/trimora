import bcrypt from 'bcryptjs';
import { testConnection, getDb } from './connection';

async function seedDatabase() {
  console.log('----------------------------------------------------');
  console.log('🌱 Seeding Trimora Data on Neon PostgreSQL');
  console.log('----------------------------------------------------');

  const connectionCheck = await testConnection();
  if (!connectionCheck.ok) {
    console.error('❌ Connection Failed:', connectionCheck.message);
    console.error('\nPlease ensure your DATABASE_URL in .env is correct.');
    process.exit(1);
  }

  const sql = getDb();

  try {
    // 1. Seed Salon
    console.log('🏢 Seeding Trimora Salon...');
    await sql`
      INSERT INTO salons (
        id, name, slug, tagline, description, contact_email, contact_phone, 
        address, city, state, postcode, country, cover_image, logo_url, 
        rating, review_count, amenities, working_hours, status, subscription_status
      ) VALUES (
        'trimora-salon',
        'Trimora',
        'trimora',
        'Where style meets sophistication.',
        'Trimora is a premium salon dedicated to delivering an unparalleled grooming and beauty experience. Our expert team of stylists combine artistry with technique to help you look and feel your absolute best.',
        'hello@trimora.co.uk',
        '+44 20 7946 0234',
        '24 Beaumont Street',
        'London',
        'Greater London',
        'W1G 6DH',
        'UK',
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=85',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&q=80',
        4.9,
        486,
        '["Free WiFi", "Premium Products", "Private Consultation", "Complimentary Refreshments", "Parking Nearby"]'::jsonb,
        '[
          {"day": "Monday", "open": "09:00", "close": "19:00", "isOpen": true},
          {"day": "Tuesday", "open": "09:00", "close": "19:00", "isOpen": true},
          {"day": "Wednesday", "open": "09:00", "close": "19:00", "isOpen": true},
          {"day": "Thursday", "open": "09:00", "close": "20:00", "isOpen": true},
          {"day": "Friday", "open": "09:00", "close": "20:00", "isOpen": true},
          {"day": "Saturday", "open": "08:00", "close": "18:00", "isOpen": true},
          {"day": "Sunday", "open": "10:00", "close": "16:00", "isOpen": false}
        ]'::jsonb,
        'active',
        'active'
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        updated_at = NOW();
    `;

    // 2. Seed Users
    console.log('👤 Seeding Default Users with Bcrypt Salt Hashing (OWASP A02)...');
    const users = [
      {
        id: 'user-super-1',
        email: 'super@trimora',
        rawPassword: 'super@2026#',
        first_name: 'Super',
        last_name: 'Admin',
        phone: '+44 7700 111111',
        role: 'super_admin',
        business_id: null,
      },
      {
        id: 'user-owner-1',
        email: 'admin@trimora',
        rawPassword: 'saloon@2026#',
        first_name: 'Admin',
        last_name: 'Trimora',
        phone: '+44 7700 111111',
        role: 'owner',
        business_id: 'trimora-salon',
      },
      {
        id: 'u-staff-1',
        email: 'isabelle@trimora.co.uk',
        rawPassword: 'password123',
        first_name: 'Isabelle',
        last_name: 'Laurent',
        phone: '+44 7700 100010',
        role: 'stylist',
        business_id: 'trimora-salon',
      },
      {
        id: 'u-staff-2',
        email: 'marcus@trimora.co.uk',
        rawPassword: 'password123',
        first_name: 'Marcus',
        last_name: 'Chen',
        phone: '+44 7700 100020',
        role: 'stylist',
        business_id: 'trimora-salon',
      },
    ];

    for (const u of users) {
      const passwordHash = await bcrypt.hash(u.rawPassword, 12);
      await sql`
        INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, business_id)
        VALUES (${u.id}, ${u.email}, ${passwordHash}, ${u.first_name}, ${u.last_name}, ${u.phone}, ${u.role}, ${u.business_id})
        ON CONFLICT (id) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role;
      `;
    }

    // 3. Seed Stylists
    console.log('✂️ Seeding Stylists...');
    const stylists = [
      {
        id: 'ts-staff-1',
        business_id: 'trimora-salon',
        name: 'Isabelle Laurent',
        title: 'Creative Director & Master Colourist',
        bio: 'Isabelle is Trimora\'s Creative Director and one of London\'s most acclaimed hair colourists. Trained in Paris with over 15 years experience.',
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80',
        rating: 5.0,
        review_count: 198,
        service_ids: JSON.stringify(['ts-1', 'ts-2', 'ts-3', 'ts-4', 'ts-5', 'ts-7']),
        working_hours: JSON.stringify([
          { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { dayOfWeek: 3, isOpen: false, openTime: '09:00', closeTime: '19:00' },
          { dayOfWeek: 4, isOpen: true, openTime: '10:00', closeTime: '20:00' },
          { dayOfWeek: 5, isOpen: true, openTime: '10:00', closeTime: '20:00' },
          { dayOfWeek: 6, isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { dayOfWeek: 0, isOpen: false, openTime: '10:00', closeTime: '16:00' },
        ]),
        order_index: 1,
      },
      {
        id: 'ts-staff-2',
        business_id: 'trimora-salon',
        name: 'Marcus Chen',
        title: 'Head Colour Specialist',
        bio: 'Marcus is our head colour technician with a deep passion for transformative hair colour. After working backstage at London Fashion Week for 5 years.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
        rating: 4.9,
        review_count: 142,
        service_ids: JSON.stringify(['ts-1', 'ts-2', 'ts-3', 'ts-4', 'ts-5', 'ts-7']),
        working_hours: JSON.stringify([
          { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '19:00' },
          { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '19:00' },
          { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '19:00' },
          { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '20:00' },
          { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '20:00' },
          { dayOfWeek: 6, isOpen: true, openTime: '08:00', closeTime: '18:00' },
          { dayOfWeek: 0, isOpen: false, openTime: '10:00', closeTime: '16:00' },
        ]),
        order_index: 2,
      },
      {
        id: 'ts-staff-3',
        business_id: 'trimora-salon',
        name: 'Priya Sharma',
        title: 'Senior Stylist & Texture Specialist',
        bio: 'Priya has been creating beautiful hair for over a decade. Specialising in cuts, styling and treatments with unmatched textured hair expertise.',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
        rating: 4.9,
        review_count: 108,
        service_ids: JSON.stringify(['ts-1', 'ts-2', 'ts-5', 'ts-6']),
        working_hours: JSON.stringify([
          { dayOfWeek: 1, isOpen: true, openTime: '10:00', closeTime: '19:00' },
          { dayOfWeek: 2, isOpen: true, openTime: '10:00', closeTime: '19:00' },
          { dayOfWeek: 3, isOpen: true, openTime: '10:00', closeTime: '19:00' },
          { dayOfWeek: 4, isOpen: true, openTime: '10:00', closeTime: '20:00' },
          { dayOfWeek: 5, isOpen: true, openTime: '10:00', closeTime: '20:00' },
          { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { dayOfWeek: 0, isOpen: false, openTime: '10:00', closeTime: '16:00' },
        ]),
        order_index: 3,
      },
    ];

    for (const s of stylists) {
      await sql`
        INSERT INTO stylists (
          id, business_id, name, title, bio, avatar, rating, review_count, 
          service_ids, working_hours, order_index
        ) VALUES (
          ${s.id}, ${s.business_id}, ${s.name}, ${s.title}, ${s.bio}, ${s.avatar}, 
          ${s.rating}, ${s.review_count}, ${s.service_ids}::jsonb, ${s.working_hours}::jsonb, ${s.order_index}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          service_ids = EXCLUDED.service_ids;
      `;
    }

    // 4. Seed Services
    console.log('💇 Seeding Services...');
    const services = [
      {
        id: 'ts-1',
        business_id: 'trimora-salon',
        name: 'Classic Haircut',
        description: 'A timeless cut tailored to your unique style. Includes a detailed consultation, precision cut, blowdry and finish.',
        category: 'haircuts',
        duration_mins: 45,
        price: 55,
        addons: JSON.stringify([
          { id: 'ta-1', name: 'Scalp Massage', price: 12, durationMins: 10 },
          { id: 'ta-2', name: 'Deep Conditioning Treatment', price: 20, durationMins: 15 },
        ]),
        staff_ids: JSON.stringify(['ts-staff-1', 'ts-staff-2', 'ts-staff-3']),
        tags: JSON.stringify(['popular', 'classic']),
        is_featured: true,
        order_index: 1,
      },
      {
        id: 'ts-2',
        business_id: 'trimora-salon',
        name: 'Hair Styling & Blowout',
        description: 'Professional wash, scalp massage, blow dry and tailored heat styling for volume and shine.',
        category: 'styling',
        duration_mins: 40,
        price: 45,
        addons: JSON.stringify([
          { id: 'ta-1', name: 'Scalp Massage', price: 12, durationMins: 10 },
        ]),
        staff_ids: JSON.stringify(['ts-staff-1', 'ts-staff-2', 'ts-staff-3']),
        tags: JSON.stringify(['styling']),
        is_featured: false,
        order_index: 2,
      },
      {
        id: 'ts-3',
        business_id: 'trimora-salon',
        name: 'Full Head Colour',
        description: 'Complete colour transformation using ammonia-free luxury formulas. Includes deep conditioning treatment.',
        category: 'color',
        duration_mins: 150,
        price: 130,
        addons: JSON.stringify([
          { id: 'ta-3', name: 'Toner', price: 25, durationMins: 15 },
          { id: 'ta-4', name: 'Gloss Treatment', price: 18, durationMins: 10 },
        ]),
        staff_ids: JSON.stringify(['ts-staff-1', 'ts-staff-2']),
        tags: JSON.stringify(['colour', 'premium']),
        is_featured: true,
        order_index: 3,
      },
      {
        id: 'ts-4',
        business_id: 'trimora-salon',
        name: 'Balayage & Ombré',
        description: 'Hand-painted bespoke highlights for a seamless sun-kissed finish. Includes root smudge, gloss toner and blowout.',
        category: 'color',
        duration_mins: 180,
        price: 175,
        addons: JSON.stringify([
          { id: 'ta-3', name: 'Toner', price: 25, durationMins: 15 },
        ]),
        staff_ids: JSON.stringify(['ts-staff-1', 'ts-staff-2']),
        tags: JSON.stringify(['colour', 'luxury']),
        is_featured: true,
        order_index: 4,
      },
      {
        id: 'ts-5',
        business_id: 'trimora-salon',
        name: 'Men\'s Cut & Style',
        description: 'Precision haircut with expert blowdry and styling. Includes consultation, shampoo, cut, style and finish with premium products.',
        category: 'haircuts',
        duration_mins: 50,
        price: 48,
        addons: JSON.stringify([
          { id: 'ta-7', name: 'Beard Oil Treatment', price: 10, durationMins: 10 },
        ]),
        staff_ids: JSON.stringify(['ts-staff-3']),
        tags: JSON.stringify(['mens', 'popular']),
        is_featured: true,
        order_index: 5,
      },
    ];

    for (const s of services) {
      await sql`
        INSERT INTO services (
          id, business_id, name, description, category, duration_mins, price, 
          addons, staff_ids, tags, is_featured, order_index
        ) VALUES (
          ${s.id}, ${s.business_id}, ${s.name}, ${s.description}, ${s.category}, 
          ${s.duration_mins}, ${s.price}, ${s.addons}::jsonb, ${s.staff_ids}::jsonb, 
          ${s.tags}::jsonb, ${s.is_featured}, ${s.order_index}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price;
      `;
    }

    // 5. Seed Customers
    console.log('👥 Seeding Customers...');
    const customers = [
      {
        id: 'tc-1',
        business_id: 'trimora-salon',
        first_name: 'Emma',
        last_name: 'Harrington',
        email: 'emma.h@email.com',
        phone: '+44 7700 100001',
        notes: 'Prefers natural tones. Sensitive scalp.',
        total_spend: 1840,
        total_visits: 18,
        loyalty_points: 380,
      },
      {
        id: 'tc-2',
        business_id: 'trimora-salon',
        first_name: 'Charlotte',
        last_name: 'Blake',
        email: 'c.blake@email.com',
        phone: '+44 7700 100002',
        notes: 'Likes volume styling for fine hair.',
        total_spend: 920,
        total_visits: 12,
        loyalty_points: 190,
      },
    ];

    for (const c of customers) {
      await sql`
        INSERT INTO customers (
          id, business_id, first_name, last_name, email, phone, notes, 
          total_spend, total_visits, loyalty_points
        ) VALUES (
          ${c.id}, ${c.business_id}, ${c.first_name}, ${c.last_name}, ${c.email}, 
          ${c.phone}, ${c.notes}, ${c.total_spend}, ${c.total_visits}, ${c.loyalty_points}
        )
        ON CONFLICT (id) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          total_spend = EXCLUDED.total_spend;
      `;
    }

    // 6. Seed Sample Reviews
    console.log('⭐ Seeding Reviews...');
    const reviews = [
      {
        id: 'tr-1',
        business_id: 'trimora-salon',
        customer_name: 'Emma Harrington',
        staff_name: 'Isabelle Laurent',
        service_name: 'Balayage & Ombré',
        overall_rating: 5.0,
        comment: 'Isabelle is simply the most talented colourist in London. My balayage always looks perfect and lasts beautifully.',
      },
      {
        id: 'tr-2',
        business_id: 'trimora-salon',
        customer_name: 'Charlotte Blake',
        staff_name: 'Marcus Chen',
        service_name: 'Hair Styling & Blowout',
        overall_rating: 5.0,
        comment: 'Marcus is incredible with colour and styling. He understood exactly what I wanted and delivered results beyond expectations.',
      },
    ];

    for (const r of reviews) {
      await sql`
        INSERT INTO reviews (id, business_id, customer_name, staff_name, service_name, overall_rating, comment)
        VALUES (${r.id}, ${r.business_id}, ${r.customer_name}, ${r.staff_name}, ${r.service_name}, ${r.overall_rating}, ${r.comment})
        ON CONFLICT (id) DO UPDATE SET comment = EXCLUDED.comment;
      `;
    }

    console.log('\n✅ Database seeded successfully with initial data!');
  } catch (error: any) {
    console.error('❌ Seeding failed with error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
