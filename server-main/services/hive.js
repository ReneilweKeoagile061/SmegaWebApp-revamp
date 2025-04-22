import hive from "hive-driver";
import { config } from "dotenv";

config();

const { TCLIService, TCLIService_types } = hive.thrift;
const client = new hive.HiveClient(TCLIService, TCLIService_types);
const utils = new hive.HiveUtils(TCLIService_types);

const getSmegaStatement = async (query) => {
    let session = null;
    let operation = null;

    try {
        // Connect to Hive using Kerberos authentication
        await client.connect(
            {
                host: process.env.HiveHost || "10.128.200.51",
                port: parseInt(process.env.HivePort) || 10000,
                options: {
                    principal: process.env.PRINCIPAL || "prodbi@CORP.BTC.BW",
                    kerberosServiceName: process.env.KERBEROS_SERVICE_NAME || "hive",
                    timeout: parseInt(process.env.CONNECTION_TIMEOUT) || 300000
                }
            },
            new hive.connections.TcpConnection(),
            new hive.auth.KerberosTcpAuthentication({
                keytabFile: process.env.KEYTAB_HOME || "/home/fennah/prodbi.keytab",
                principal: process.env.PRINCIPAL || "prodbi@CORP.BTC.BW"
            })
        );

        // Open a session
        session = await client.openSession({
            client_protocol: TCLIService_types.TProtocolVersion.HIVE_CLI_SERVICE_PROTOCOL_V10
        });

        // Execute the query
        operation = await session.executeStatement(query);
        await utils.waitUntilReady(operation, false, (err) => {
            if (err) throw new Error(`Operation failed: ${err.message}`);
        });

        // Fetch all results
        const selectDataOperation = await utils.fetchAll(operation);
        const results = utils.getResult(selectDataOperation).getValue();

        return results;
    } catch (err) {
        console.error("Error in getSmegaStatement:", err);
        throw err;
    } finally {
        // Clean up resources
        try {
            if (operation) await operation.close();
            if (session) await session.close();
            await client.close();
        } catch (cleanupErr) {
            console.error("Error during cleanup:", cleanupErr);
        }
    }
};

export { getSmegaStatement };