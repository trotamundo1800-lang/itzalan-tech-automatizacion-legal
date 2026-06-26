const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  
  // Update user role
  db.run(
    "UPDATE users SET role = ? WHERE email = ?",
    ['abogado', 'test@example.com'],
    function(err) {
      if (err) {
        console.error('Error updating user:', err.message);
        process.exit(1);
      }
      console.log(`Updated ${this.changes} user(s)`);
      
      // Verify
      db.get(
        "SELECT id, email, role FROM users WHERE email = ?",
        ['test@example.com'],
        (err, row) => {
          if (err) {
            console.error('Error querying user:', err.message);
          } else if (row) {
            console.log('User after update:', row);
          } else {
            console.log('User not found');
          }
          db.close();
        }
      );
    }
  );
});
