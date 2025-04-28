import { execSync } from 'child_process';
import hive from 'node-hive'; // (assuming you switch to node-hive)

// Run kinit command
try {
  console.log('🔑 Running kinit...');
  execSync('kinit -kt /home/smegaweb/prodbi.keytab prodbi@CORP.BTC.BW');
  console.log('✅ kinit successful.');
} catch (err) {
  console.error('❌ kinit failed:', err.message);
  process.exit(1);
}

// Now connect to Hive after successful kinit
const client = hive.createClient({
  version: '0.13.0',
  host: '10.128.200.51',
  port: 10000,
  timeout: 10000,
});

client.connect((err) => {
  if (err) {
    console.error('❌ Hive connection error:', err);
    return;
  }
  console.log('✅ Connected to Hive!');
  client.execute('SELECT current_date', (err, data) => {
    if (err) {
      console.error('❌ Query error:', err);
    } else {
      console.log('📅 Query result:', data);
    }
    client.end();
  });
});
