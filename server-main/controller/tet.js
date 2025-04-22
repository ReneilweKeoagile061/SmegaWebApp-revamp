import kerberos from 'kerberos';
import hive from 'hive-driver';

const { TCLIService, HiveClient } = hive;
const auth = hive.auth; // Fallback for CommonJS-style access

const client = new HiveClient(TCLIService);

// Function to authenticate using Kerberos and connect to Hive
async function connectToHive() {
  try {
    // Perform Kerberos authentication using the keytab
    await kerberos.auth.kinit({
      principal: 'prodbi@CORP.BTC.BW', // Your Kerberos principal
      keytab: '/home/smegaweb/prodbi.keytab' // Your Kerberos keytab file path
    });

    console.log('✅ Kerberos Authentication Success.');

    // Now you can proceed with the Hive connection
    const connection = auth({
      host: '10.128.200.51',
      port: 10000,
      options: {
        principal: 'prodbi@CORP.BTC.BW',
        service: 'hive'
      }
    });

    // Connect to Hive
    const session = await client.connect(connection, {});
    console.log('✅ Connected to Hive via Kerberos.');

    // Example query to fetch current date from Hive
    const result = await session.executeStatement('SELECT current_date');
    const data = await result.fetchAll();
    console.log('📅 Hive Query Result:', data);

    // Close the session and client
    await session.close();
    await client.close();
  } catch (error) {
    console.error('❌ Hive connection error:', error);
  }
}

connectToHive();
