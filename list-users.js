const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  
  // List all users
  db.all("SELECT id, email, role FROM users", (err, rows) => {
    if (err) {
      console.error('Error querying users:', err.message);
    } else if (rows && rows.length > 0) {
      console.log('All users:');
      rows.forEach(row => {
        console.log(`  - ${row.email} (${row.role})`);
      });
    } else {
      console.log('No users found');
    }
    db.close();
  });
});
