const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const FeeStructure = require('./models/FeeStructure');
const Payment = require('./models/Payment');

const seedData = async () => {
  try {
    const connUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!connUri) {
      console.error('❌ MONGO_URI is missing. Please set it in backend/.env before running seed.');
      process.exit(1);
    }

    await mongoose.connect(connUri);
    console.log('✅ Connected to MongoDB Atlas for seeding.');

    // Clear existing sample collections
    await User.deleteMany({});
    await FeeStructure.deleteMany({});
    await Payment.deleteMany({});
    console.log('🧹 Cleared existing database records.');

    // 1. Create Admin & Students
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const namanPassword = await bcrypt.hash('naman123', salt);
    const aaravPassword = await bcrypt.hash('student123', salt);

    const admin = await User.create({
      name: 'Prof. Rajesh Sharma (Accountant)',
      email: 'admin@college.edu',
      password: adminPassword,
      role: 'admin',
      phone: '9876543210',
    });

    const student1 = await User.create({
      name: 'Naman Goyal',
      email: 'naman.roll53@college.edu',
      password: namanPassword,
      role: 'student',
      rollNumber: '53',
      course: 'B.Tech Computer Science',
      batch: '2024-2028',
      phone: '9812345678',
    });

    const student2 = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav.roll12@college.edu',
      password: aaravPassword,
      role: 'student',
      rollNumber: '12',
      course: 'B.Tech Computer Science',
      batch: '2024-2028',
      phone: '9823456789',
    });

    console.log('👥 Created Users:');
    console.log('   - Admin: admin@college.edu (pass: admin123)');
    console.log('   - Student: naman.roll53@college.edu (Roll 53, pass: naman123)');
    console.log('   - Student: aarav.roll12@college.edu (Roll 12, pass: student123)');

    // 2. Create Fee Structures
    // Fee Structure 1 (Past due to demonstrate overdue defaulter)
    const pastDueDate = new Date();
    pastDueDate.setDate(pastDueDate.getDate() - 10);

    const feeStructure1 = await FeeStructure.create({
      course: 'B.Tech Computer Science',
      academicYear: '2026-2027',
      feeHeads: [
        { title: 'Tuition Fee (Sem 3)', amount: 65000 },
        { title: 'University Examination Fee', amount: 4500 },
        { title: 'Development & Library Fee', amount: 5500 },
      ],
      totalAmount: 75000,
      dueDate: pastDueDate,
      description: 'Annual Academic Session Fee 2026-2027 (Overdue for testing)',
    });

    // Fee Structure 2 (Upcoming due date)
    const futureDueDate = new Date();
    futureDueDate.setDate(futureDueDate.getDate() + 30);

    const feeStructure2 = await FeeStructure.create({
      course: 'B.Tech Information Technology',
      academicYear: '2026-2027',
      feeHeads: [
        { title: 'Tuition Fee (Sem 3)', amount: 65000 },
        { title: 'Campus Transport Facility', amount: 15000 },
        { title: 'Examination Fee', amount: 5000 },
      ],
      totalAmount: 85000,
      dueDate: futureDueDate,
      description: 'Annual Academic Session Fee with Transport included',
    });

    console.log('📚 Created 2 Fee Structures (B.Tech CSE ₹75,000, B.Tech IT ₹85,000)');

    // 3. Create Sample Payments
    // Payment 1: Naman Goyal pays partial amount (₹40,000 out of ₹75,000 via UPI)
    const payment1 = await Payment.create({
      receiptNo: 'RCP-2026-0001',
      student: student1._id,
      feeStructure: feeStructure1._id,
      amountPaid: 40000,
      paymentMode: 'UPI',
      paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      transactionReference: 'UPI-HDFC-9847192837',
      remarks: 'First installment received via UPI',
      recordedBy: admin._id,
    });

    // Payment 2: Naman Goyal pays second partial amount (₹15,000 via Card)
    const payment2 = await Payment.create({
      receiptNo: 'RCP-2026-0002',
      student: student1._id,
      feeStructure: feeStructure1._id,
      amountPaid: 15000,
      paymentMode: 'Card',
      paymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      transactionReference: 'POS-DEBIT-CARD-09281',
      remarks: 'Second installment paid at college cash counter',
      recordedBy: admin._id,
    });

    console.log('💳 Created Sample Payments:');
    console.log(`   - ${payment1.receiptNo}: ₹40,000 (UPI) for Naman Goyal`);
    console.log(`   - ${payment2.receiptNo}: ₹15,000 (Card) for Naman Goyal`);
    console.log('   - Outstanding for Naman: ₹20,000 (Overdue)');
    console.log('   - Outstanding for Aarav: ₹75,000 (Overdue Defaulter)');

    console.log('\n🎉 Database Seeded Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedData();
