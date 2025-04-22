import hive from 'hive-driver';
import { execSync } from 'child_process';

const { TCLIService, HiveClient } = hive;
const { KerberosAuth } = hive.auth;

function ensureKerberosTicket() {
  try {
    execSync('klist', { stdio: 'pipe' });
    console.log('🎫 Valid Kerberos ticket found.');
  } catch {
    console.log('🆕 No ticket, running kinit...');
    execSync('kinit -k -t /home/smegaweb/prodbi.keytab prodbi@CORP.BTC.BW');
    console.log('✅ Kerberos ticket obtained.');
  }
}

const client = new HiveClient(TCLIService);

async function connectToHive() {
  try {
    ensureKerberosTicket(); // Make sure ticket is active before connecting

    const connection = client.connect({
      host: '10.128.200.51',
      port: 10000,
      options: {
        auth: new KerberosAuth({
          principal: 'prodbi@CORP.BTC.BW',
          host: '10.128.200.51',
          service: 'hive',
        }),
      },
    });

    const session = await connection;
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
