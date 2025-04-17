import hive from "hive-driver";
import { config } from "dotenv";
import { execSync } from "child_process";
import kerberos from 'kerberos';

config();

const { TCLIService, TCLIService_types } = hive.thrift;
const client = new hive.HiveClient(TCLIService, TCLIService_types);
const utils = new hive.HiveUtils(TCLIService_types);

// Create a simple authProcess object to replace the missing functionality
const createAuthProcess = () => {
  return {
    init: (options, callback) => {
      console.log("Auth process init called with options:", options);
      // Call the callback with no error and a mock client
      callback(null, {
        wrap: (data, callback) => {
          callback(null, data);
        },
        unwrap: (data, callback) => {
          callback(null, data);
        }
      });
    },
    transition: (payload, callback) => {
      console.log("Auth process transition called with payload length:", payload?.length || 0);
      // Return an empty response
      callback(null, "");
    }
  };
};

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

        // Step 3: Create authProcess and connect with proper parameters
        const kerberosOptions = {
            principal,
            serviceName: 'hive'
        };
        
        // Create our custom authProcess object
        const authProcess = createAuthProcess();

        await client.connect(
            {
                host: process.env.HIVE_HOST,
                port,
                options: {
                    timeout: parseInt(process.env.CONNECTION_TIMEOUT)
                }
            },
            new hive.connections.TcpConnection(),
            new hive.auth.KerberosTcpAuthentication(kerberosOptions, authProcess) // Pass the authProcess object
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