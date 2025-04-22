// tet.js
import hiveDriver from 'hive-driver';

const { HiveClient, auth, TCLIService } = hiveDriver;

const client = new HiveClient(TCLIService);

async function connectToHive() {
  try {
    const connection = client.connect({
      host: '10.128.200.51',
      port: 10000,
      options: {
        auth: 'KERBEROS',
        krbServiceName: 'hive',
        principal: 'prodbi@CORP.BTC.BW',
      }
    });

    const session = await (await connection).openSession();
    console.log('✅ Connected to Hive.');

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
