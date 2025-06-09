import { execSync } from 'child_process';
import hive from 'node-hive'; // use the correct import

// Run kinit command
try {
  console.log('🔑 Running kinit...');
  execSync('kinit -kt /home/smegaweb/prodbi.keytab prodbi@CORP.BTC.BW');
  console.log('✅ kinit successful.');
} catch (err) {
  console.error('❌ kinit failed:', err.message);
  process.exit(1);
}

// Initialize the Hive client
const client = new hive.Client({
  host: '10.128.200.51', // Hive host address
  port: 10000,           // Hive port (adjust as needed)
  username: 'prodbi@CORP.BTC.BW', // If needed, otherwise remove
});

// Connect to Hive
client.connect()
  .then(() => {
    console.log('✅ Connected to Hive!');
    
    // Execute a sample query
    client.execute('SELECT current_date')
      .then((data) => {
        console.log('📅 Query result:', data);
      })
      .catch((err) => {
        console.error('❌ Query error:', err);
      })
      .finally(() => {
        client.end(); // Close connection after query
      });
  })
  .catch((err) => {
    console.error('❌ Hive connection error:', err);
  });
