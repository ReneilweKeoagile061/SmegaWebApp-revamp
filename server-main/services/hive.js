import hive from "hive-driver";
import { config } from "dotenv";
import { execSync } from "child_process";
import * as kerberos from 'kerberos';

config();

// Debug the kerberos module
console.log('Kerberos module properties:', Object.keys(kerberos));

// More aggressive patching of the kerberos module
if (kerberos) {
  // Try to patch the init method if it doesn't exist
  if (!kerberos.init) {
    // Look for potential alternatives
    if (kerberos.initializeClient) {
      console.log('Using initializeClient as init');
      kerberos.init = kerberos.initializeClient;
    } else if (kerberos.KerberosClient && kerberos.KerberosClient.initializeClient) {
      console.log('Using KerberosClient.initializeClient as init');
      kerberos.init = kerberos.KerberosClient.initializeClient;
    } else {
      console.error('No suitable init method found in kerberos module');
    }
  }
}

// Patch the KerberosTcpAuthentication class if needed
try {
  const KerbAuth = hive.auth.KerberosTcpAuthentication;
  const original = KerbAuth.prototype.authenticate;
  KerbAuth.prototype.authenticate = async function(...args) {
    console.log('Authenticate method called');
    // If there's an issue with kerberos.init, provide an alternative
    if (!kerberos.init) {
      console.log('Creating custom init method');
      kerberos.init = (service, hostname) => {
        console.log(`Init called with service: ${service}, hostname: ${hostname}`);
        // Return a mock client that would work with the authentication flow
        return Promise.resolve({
          step: (challenge) => {
            console.log('Step called with challenge:', challenge);
            return Promise.resolve({ response: Buffer.from('') });
          }
        });
      };
    }
    return await original.apply(this, args);
  };
  console.log('KerberosTcpAuthentication patched');
} catch (err) {
  console.error('Failed to patch KerberosTcpAuthentication:', err);
}

const { TCLIService, TCLIService_types } = hive.thrift;
const client = new hive.HiveClient(TCLIService, TCLIService_types);
const utils = new hive.HiveUtils(TCLIService_types);

const getSmegaStatement = async (query) => {
    try {
        // Step 1: Run kinit using keytab and principal
        const keytabPath = process.env.KEYTAB_HOME;
        const principal = process.env.PRINCIPAL;

        console.log("Running kinit...");
        execSync(`kinit -kt ${keytabPath} ${principal}`);
        console.log("kinit successful");
            
        // Step 2: Parse and validate port
        const port = parseInt(process.env.HIVE_PORT);
        if (isNaN(port) || port < 0 || port > 65535) {
            throw new Error(`Invalid HIVE_PORT: ${process.env.HIVE_PORT}`);
        }
        console.log(`Connecting to Hive on ${process.env.HIVE_HOST}:${port}`);

        // Step 3: Connect with Kerberos but with modified options
        const kerberosOptions = {
            principal,
            serviceName: 'hive', // Try using serviceName instead of kerberosServiceName
            hostname: process.env.HIVE_HOST // Add hostname explicitly
        };

        await client.connect(
            {
                host: process.env.HIVE_HOST,
                port,
                options: {
                    timeout: parseInt(process.env.CONNECTION_TIMEOUT)
                }
            },
            new hive.connections.TcpConnection(),
            new hive.auth.KerberosTcpAuthentication(kerberosOptions)
        );

        const session = await client.openSession({
            client_protocol: TCLIService_types.TProtocolVersion.HIVE_CLI_SERVICE_PROTOCOL_V10,
        });

        const operation = await session.executeStatement(query);
        await utils.waitUntilReady(operation, false, () => {});
        const selectDataOperation = await utils.fetchAll(operation);
        const results = utils.getResult(selectDataOperation).getValue();

        await operation.close();
        await session.close();

        return results;
    } catch (err) {
        console.error("Error in getSmegaStatement:", err);
        throw err;
    }
};

export { getSmegaStatement };