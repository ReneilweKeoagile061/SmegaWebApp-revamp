import hive from 'hive-driver';

const { HiveClient } = hive;

const client = new HiveClient();

async function connectToHive() {
  try {
    const connection = await client.connect({
      host: '10.128.200.51',
      port: 10000,
      options: {
        auth: 'KERBEROS',
        krbServiceName: 'hive',
        principal: 'prodbi@CORP.BTC.BW',
      },
    });

    const session = await connection.openSession();
    console.log('✅ Connected to Hive using Kerberos ticket.');

    const result = await session.executeStatement('SELECT current_date');
    const data = await result.fetchAll();
    console.log('📅 Hive query result:', data);

    await session.close();
    await client.close();
  } catch (err) {
    console.error('❌ Hive connection error:', err);
  }
}

connectToHive();
