import kerberos from 'kerberos';  // Kerberos package for authentication
import hive from 'hive-driver';   // Hive driver for connecting to HiveServer2

const { TCLIService, HiveClient } = hive;
const auth = hive.auth; // fallback for CommonJS-style access

const client = new HiveClient(TCLIService);

// Kerberos authentication function
async function authenticateWithKerberos() {
  try {
    // Authenticating using Kerberos
    await kerberos.auth.kinit({
      principal: 'prodbi@CORP.BTC.BW',        // User principal (this should match your Kerberos user)
      keytab: '/path/to/your/keytab',         // Path to your keytab file (for passwordless authentication)
    });

    console.log('✅ Kerberos authentication successful!');
  } catch (err) {
    console.error('❌ Kerberos authentication failed:', err);
    throw err;
  }
}

// Hive connection function
async function connectToHive() {
  try {
    // Authenticate with Kerberos before connecting to Hive
    await authenticateWithKerberos();

    // Create a connection to Hive using Kerberos authentication
    const connection = await client.connect({
      host: '10.128.200.51',  // Hive Host IP address
      port: 10000,            // HiveServer2 port
      options: {
        auth: 'KERBEROS',      // Use Kerberos Authentication
        krbServiceName: 'hive',  // Service principal for Hive (ensure it matches the KDC configuration)
        principal: 'prodbi@CORP.BTC.BW',  // User principal (same as used for kinit)
        ticketCache: '/tmp/krb5cc_1000',  // Path to the Kerberos ticket cache
      }
    });

    console.log('✅ Connected to Hive via Kerberos.');

    // Execute a query to check the connection
    const session = await client.getSession(connection);
    const result = await session.executeStatement('SELECT current_date');
    const data = await result.fetchAll();
    console.log('📅 Hive Query Result:', data);

    // Close the session and connection
    await session.close();
    await client.close();
  } catch (error) {
    console.error('❌ Hive connection error:', error);
  }
}

// Call the connectToHive function to authenticate and connect
connectToHive();
