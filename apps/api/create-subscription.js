const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  
  const userId = '09533563-5c8f-46a3-8eb8-bd8260601e75'; // test@example.com
  const planId = uuidv4();
  const subId = uuidv4();
  const now = new Date();
  const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  
  // Create subscription plan
  const planSql = `
    INSERT INTO subscription_plans 
    (id, code, name, description, monthlyPrice, currency, isActive, enablesPremiumFeatures, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const planValues = [
    planId,
    'test-professional',
    'Test Professional',
    'Test professional subscription plan',
    99.99,
    'USD',
    1, // true
    1, // true
    now.toISOString(),
    now.toISOString()
  ];
  
  db.run(planSql, planValues, function(err) {
    if (err) {
      // Plan might already exist, that's ok
      console.log('Plan creation skipped (may already exist)');
    } else {
      console.log('Subscription plan created:', planId);
    }
    
    // Create user subscription
    const subSql = `
      INSERT INTO user_subscriptions 
      (id, userId, planId, provider, status, startsAt, endsAt, autoRenew, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const subValues = [
      subId,
      userId,
      planId,
      'test',
      'active',
      startDate.toISOString(),
      endDate.toISOString(),
      1, // true
      now.toISOString(),
      now.toISOString()
    ];
    
    db.run(subSql, subValues, function(err) {
      if (err) {
        console.error('Error inserting subscription:', err.message);
        process.exit(1);
      }
      
      console.log('User subscription created:', subId);
      db.close();
    });
  });
});
