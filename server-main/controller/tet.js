import kerberos from 'kerberos';
import hive from 'hive-driver';

const { TCLIService, HiveClient } = hive;
const auth = hive.auth; // Fallback for CommonJS-style access

const client = new HiveClient(TCLIService);

// Function to authenticate using Kerberos and connect to Hive
async function connectToHive() {
  try {
    // Authenticate using kerberos (kinit equivalent)
    kerberos.auth.authenticate({
      principal: 'prodbi@CORP.BTC.BW',
      keytab: '/home/smegaweb/prodbi.keytab',
      service: 'hive'
    }, (err) => {
      if (err) {
        console.error('❌ Kerberos Authentication Failed:', err);
        return;
      }
      console.log('✅ Kerberos Authentication Success.');

      // Now proceed with Hive connection
      const connection = auth({
        host: '10.128.200.51',
        port: 10000,
        options: {
          principal: 'prodbi@CORP.BTC.BW',
          service: 'hive'
        }
      });

      client.connect(connection, {})
        .then(async (session) => {
          console.log('✅ Connected to Hive via Kerberos.');

          // Example query to fetch current date from Hive
          const result = await session.executeStatement('SELECT current_date');
          const data = await result.fetchAll();
          console.log('📅 Hive Query Result:', data);

          // Close the session and client
          await session.close();
          await client.close();
        })
        .catch((err) => {
          console.error('❌ Failed to connect to Hive:', err);
        });
    });
  } catch (error) {
    console.error('❌ Hive connection error:', error);
  }
}

connectToHive();
