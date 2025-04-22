import hive from 'hive-driver';

const { TCLIService, HiveClient } = hive;
const auth = hive.auth; // fallback for CommonJS-style access

const client = new HiveClient(TCLIService);

async function connectToHive() {
  try {
    const connection = auth({
      host: '10.128.200.51',
      port: 10000,
      options: {
        principal: 'prodbi@CORP.BTC.BW',
        service: 'hive'
      }
    });

    const session = await client.connect(connection, {});
    console.log('✅ Connected to Hive via Kerberos.');

    const result = await session.executeStatement('SELECT current_date');
    const data = await result.fetchAll();
    console.log('📅 Hive Query Result:', data);

    await session.close();
    await client.close();
  } catch (error) {
    console.error('❌ Hive connection error:', error);
  }
}

connectToHive();
