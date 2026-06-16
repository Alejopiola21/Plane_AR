import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import assert from 'assert';

const dbPath = path.join(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:' + dbPath });
const prisma = new PrismaClient({ adapter });

async function runTests() {
  console.log('--- STARTING PLANE_AR SMOKE TESTS ---');

  try {
    // 1. Verify connection & User lookup
    console.log('Testing connection & user query...');
    const users = await prisma.user.findMany();
    console.log('✔ Database connection OK. Found users:', users.length);
    
    const admin = users.find(u => u.role === 'ADMIN');
    assert.ok(admin, 'Admin user should be seeded');
    assert.strictEqual(admin.email, 'admin@planear.app', 'Admin email matches');
    console.log('✔ Admin user verification passed.');

    const regularUser = users.find(u => u.role === 'USER');
    assert.ok(regularUser, 'Standard user should be seeded');
    console.log('✔ Standard user verification passed.');

    // 2. Query Event
    console.log('Testing event query...');
    const events = await prisma.event.findMany({
      where: { userId: regularUser.id },
      include: { invitations: true }
    });
    assert.ok(events.length >= 2, 'Should have at least 2 seeded events for user');
    console.log(`✔ Found ${events.length} events for user ${regularUser.name}.`);

    const bdayEvent = events.find(e => e.name.includes('Cumpleaños'));
    assert.ok(bdayEvent, 'Birthday event should exist');
    assert.ok(bdayEvent.invitations.length > 0, 'Event should have invitation code');
    console.log(`✔ Invitation code for Birthday event: ${bdayEvent.invitations[0].code}`);

    // 3. Simulated RSVP Flow
    console.log('Testing simulated Guest & RSVP creation...');
    // Create new temporary guest
    const tempEmail = `smoke_guest_${Date.now()}@test.com`;
    const guest = await prisma.guest.create({
      data: {
        name: 'Smoke Test Guest',
        email: tempEmail,
        status: 'CONFIRMED',
        numGuests: 2,
        eventId: bdayEvent.id
      }
    });
    assert.ok(guest.id, 'Guest should be created successfully');

    const rsvp = await prisma.rSVP.create({
      data: {
        guestId: guest.id,
        status: 'CONFIRMED',
        numGuests: 2
      }
    });
    assert.ok(rsvp.id, 'RSVP should be logged successfully');
    console.log('✔ Simulated Guest & RSVP creation passed.');

    // 4. Simulated Payment Flow
    console.log('Testing simulated Payment creation...');
    const payment = await prisma.payment.create({
      data: {
        eventId: bdayEvent.id,
        amount: 4500,
        status: 'APPROVED',
        guestEmail: tempEmail,
        mpPaymentId: `smoke_pay_${Date.now()}`
      }
    });
    assert.ok(payment.id, 'Payment should be logged successfully');
    console.log('✔ Simulated Payment creation passed.');

    // 5. Cleanup test data
    console.log('Cleaning up test data...');
    await prisma.payment.delete({ where: { id: payment.id } });
    await prisma.rSVP.delete({ where: { id: rsvp.id } });
    await prisma.guest.delete({ where: { id: guest.id } });
    console.log('✔ Cleanup complete.');

    console.log('--- ALL SMOKE TESTS COMPLETED SUCCESSFULLY ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Smoke tests failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
