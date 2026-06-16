import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:' + dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing data
  await prisma.payment.deleteMany({});
  await prisma.rSVP.deleteMany({});
  await prisma.guest.deleteMany({});
  await prisma.invitation.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin PlaneAR',
      email: 'admin@planear.app',
      password: 'admin123', // ponytail: simple plain-text password for dev, bcrypt in prod
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.create({
    data: {
      name: 'Juan Perez',
      email: 'juan@planear.app',
      password: 'user123', // ponytail: simple plain-text password for dev, bcrypt in prod
      role: 'USER',
    },
  });

  console.log('Users created:', { adminEmail: admin.email, userEmail: user.email });

  // 3. Create Events
  const event1 = await prisma.event.create({
    data: {
      name: 'Cumpleaños de 30 Juan',
      description: '¡Festejamos mis 30 años con todo! Habrá comida, barra libre y buena música.',
      date: '2026-07-15',
      time: '21:00',
      location: 'Salón de Eventos Palermo, CABA',
      coverImage: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=60',
      maxCapacity: 50,
      status: 'ACTIVE',
      userId: user.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      name: 'Asado Fin de Año PlaneAR',
      description: 'El clásico asado para cerrar el año con amigos de la oficina.',
      date: '2026-12-18',
      time: '13:00',
      location: 'Quinta La Soleada, Pilar',
      coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=60',
      maxCapacity: 30,
      status: 'ACTIVE',
      userId: user.id,
    },
  });

  console.log('Events created:', { event1Id: event1.id, event2Id: event2.id });

  // 4. Create Invitations (unique URLs)
  const inv1 = await prisma.invitation.create({
    data: {
      code: 'juan30',
      eventId: event1.id,
    },
  });

  const inv2 = await prisma.invitation.create({
    data: {
      code: 'asado2026',
      eventId: event2.id,
    },
  });

  console.log('Invitations created:', { inv1Code: inv1.code, inv2Code: inv2.code });

  // 5. Create Guests for Event 1
  const guest1 = await prisma.guest.create({
    data: {
      name: 'Ana Gomez',
      email: 'ana@gmail.com',
      phone: '+5491198765432',
      status: 'CONFIRMED',
      numGuests: 1,
      eventId: event1.id,
    },
  });

  const guest2 = await prisma.guest.create({
    data: {
      name: 'Carlos Lopez',
      email: 'carlos@gmail.com',
      phone: '+5491122334455',
      status: 'REJECTED',
      numGuests: 0,
      eventId: event1.id,
    },
  });

  const guest3 = await prisma.guest.create({
    data: {
      name: 'Maria Dell',
      email: 'maria@gmail.com',
      phone: '+5491155667788',
      status: 'PENDING',
      numGuests: 0,
      eventId: event1.id,
    },
  });

  console.log('Guests created for Event 1');

  // 6. Create RSVPs linked to guests
  await prisma.rSVP.create({
    data: {
      guestId: guest1.id,
      status: 'CONFIRMED',
      numGuests: 1,
      responseDate: new Date('2026-06-10T15:30:00Z'),
    },
  });

  await prisma.rSVP.create({
    data: {
      guestId: guest2.id,
      status: 'REJECTED',
      numGuests: 0,
      responseDate: new Date('2026-06-11T10:15:00Z'),
    },
  });

  console.log('RSVPs created');

  // 7. Create Payment for Event 1
  const payment = await prisma.payment.create({
    data: {
      eventId: event1.id,
      amount: 4500.0,
      status: 'APPROVED',
      mpPreferenceId: 'pref_123456789',
      mpPaymentId: 'pay_987654321',
      guestEmail: 'ana@gmail.com',
    },
  });

  console.log('Payment created:', payment.id);
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
