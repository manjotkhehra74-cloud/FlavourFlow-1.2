require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./index');

const today = new Date();
function isoDate(offsetDays = 0) {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function run() {
  db._reset();

  const hash = bcrypt.hashSync('password', 10);

  const users = [
    { code: 'UTL1001', name: 'Akshay Mehta', email: 'akshay@pulsehr.app', role: 'manager', color: '#0d9488', desig: 'Engineering Manager', dept: 'Engineering', manager: null, phone: '9876500001', bday: '08-19', hire: '2022-08-15' },
    { code: 'UTL12830', name: 'Deepak Kumar Chauhan', email: 'deepak.c@pulsehr.app', role: 'employee', color: '#ef4444', desig: 'Software Engineer', dept: 'Engineering', manager: 1, phone: '9876500002', bday: '03-22', hire: '2023-09-09' },
    { code: 'UTL12831', name: 'Rajnikant R Rao', email: 'rajni@pulsehr.app', role: 'employee', color: '#7c3aed', desig: 'QA Engineer', dept: 'Engineering', manager: 1, phone: '9876500003', bday: '11-05', hire: '2024-01-12' },
    { code: 'UTL12832', name: 'Deepak Thakur', email: 'deepak.t@pulsehr.app', role: 'employee', color: '#059669', desig: 'Backend Developer', dept: 'Engineering', manager: 1, phone: '9876500004', bday: '05-30', hire: '2023-02-01' },
    { code: 'UTL12833', name: 'Anuj Jain', email: 'anuj@pulsehr.app', role: 'employee', color: '#f59e0b', desig: 'Product Designer', dept: 'Design', manager: 1, phone: '9876500005', bday: '08-19', hire: '2024-08-19' },
    { code: 'UTL12834', name: 'Naresh Sharma', email: 'naresh@pulsehr.app', role: 'employee', color: '#2563eb', desig: 'DevOps Engineer', dept: 'Engineering', manager: 1, phone: '9876500006', bday: '12-01', hire: '2022-05-20' },
    { code: 'UTL12835', name: 'Dharmesh Shah', email: 'dharmesh@pulsehr.app', role: 'employee', color: '#0891b2', desig: 'Frontend Developer', dept: 'Engineering', manager: 1, phone: '9876500007', bday: '07-14', hire: '2024-08-19' },
    { code: 'UTL12836', name: 'Riddhi Patel', email: 'riddhi@pulsehr.app', role: 'employee', color: '#db2777', desig: 'HR Executive', dept: 'HR', manager: 1, phone: '9876500008', bday: '08-19', hire: '2024-08-19' },
  ];

  users.forEach((u) => {
    db.users.insert({
      emp_code: u.code, name: u.name, email: u.email, password_hash: hash,
      role: u.role, avatar_color: u.color, designation: u.desig, department: u.dept,
      manager_id: u.manager, phone: u.phone, birthday: u.bday, hire_date: u.hire,
    });
  });

  const types = ['casual', 'sick', 'earned', 'optional'];
  db.users.all().filter(u => u.role === 'employee').forEach((u) => {
    types.forEach((t) => {
      db.leave_balances.insert({ user_id: u.id, leave_type: t, total: 12, used: Math.floor(Math.random() * 5) });
    });
  });

  const statuses = ['present', 'present', 'present', 'late', 'wfh'];
  for (let day = -14; day <= 0; day++) {
    const date = isoDate(day);
    const dow = new Date(date).getDay();
    if (dow === 0 || dow === 6) continue;
    db.users.all().filter(u => u.role === 'employee').forEach((u) => {
      const s = statuses[Math.floor(Math.random() * statuses.length)];
      const inTime = s === 'late' ? '10:52:00' : '09:30:00';
      db.attendance.insert({
        user_id: u.id, date,
        clock_in: `${date}T${inTime}`, clock_out: `${date}T18:30:00`,
        status: s, source: 'selfie',
        latitude: 30.900 + Math.random() * 0.01,
        longitude: 75.850 + Math.random() * 0.01, note: '',
      });
    });
  }

  const reqs = [
    { user_id: 2, date: isoDate(-1), type: 'mark_attendance', reason: 'Got stuck in traffic near Ferozepur Road', status: 'rejected', reviewed_by: 1 },
    { user_id: 3, date: isoDate(1), type: 'mark_attendance', reason: 'Client visit in Gurgaon', status: 'pending' },
    { user_id: 5, date: isoDate(0), type: 'regularization', reason: 'Forgot to punch in during morning standup', status: 'pending' },
    { user_id: 4, date: isoDate(-2), type: 'regularization', reason: 'Biometric device was down', status: 'approved', reviewed_by: 1 },
    { user_id: 6, date: isoDate(1), type: 'mark_attendance', reason: 'Working from Chandigarh office', status: 'pending' },
    { user_id: 7, date: isoDate(0), type: 'regularization', reason: 'Late due to doctor appointment', status: 'pending' },
  ];
  reqs.forEach((r) => db.attendance_requests.insert({ ...r, reviewed_at: r.reviewed_by ? new Date().toISOString() : null }));

  const leaves = [
    { user_id: 5, leave_type: 'casual', from_date: isoDate(3), to_date: isoDate(3), days: 1, reason: 'Personal work', status: 'pending' },
    { user_id: 6, leave_type: 'sick', from_date: isoDate(-3), to_date: isoDate(-2), days: 2, reason: 'Viral fever', status: 'approved', reviewed_by: 1 },
    { user_id: 8, leave_type: 'optional', from_date: isoDate(7), to_date: isoDate(7), days: 1, reason: 'Festival', status: 'pending' },
  ];
  leaves.forEach((l) => db.leave_requests.insert({ ...l, reviewed_at: l.reviewed_by ? new Date().toISOString() : null }));

  const posts = [
    { user_id: 1, body: 'Welcome everyone to the new Pulse HR app! Go ahead and mark your attendance. 🎉', badge: 'Team Welcome', likes: 5, liked_by: [2, 3, 4, 5, 6] },
    { user_id: 7, body: 'Shipped the new checkout redesign today. Huge shoutout to the design & QA team for the quick turnaround.', badge: 'Ship It', reward_to: 5, likes: 12, liked_by: [1, 2, 3, 4, 6, 8] },
    { user_id: 8, body: 'Reminder: Submit your attendance regularisation before EOD Friday.', likes: 3, liked_by: [1, 5] },
  ];
  posts.forEach((p) => db.posts.insert({ ...p }));
  db.comments.insert({ post_id: 2, user_id: 5, body: 'Looks amazing — thanks team! 🙌' });
  db.comments.insert({ post_id: 2, user_id: 4, body: 'Great collaboration everyone.' });

  const wishes = [
    { recipient_id: 5, sender_id: 1, wish_type: 'birthday', body: 'Happy birthday Anuj! Have a great year ahead. 🎂' },
    { recipient_id: 7, sender_id: 1, wish_type: 'work_anniversary', body: 'Happy 2nd work anniversary Dharmesh!' },
    { recipient_id: 8, sender_id: 1, wish_type: 'work_anniversary', body: 'Happy work anniversary Riddhi!' },
  ];
  wishes.forEach((w) => db.wishes.insert(w));

  const tickets = [
    { user_id: 5, subject: 'Laptop battery not charging', category: 'it', description: 'Battery drains within 1 hour, adapter light is off.', priority: 'high', status: 'open' },
    { user_id: 6, subject: 'Parking sticker renewal', category: 'facilities', description: 'Need a new sticker for Sept 2026.', priority: 'low', status: 'in_progress' },
  ];
  tickets.forEach((t) => db.tickets.insert(t));

  console.log('✅ Seed complete.');
  console.log('   Manager login:  akshay@pulsehr.app / password');
  console.log('   Employee login: deepak.c@pulsehr.app / password (or any email above)');
}

run();
