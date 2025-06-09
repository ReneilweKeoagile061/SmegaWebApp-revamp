import OracleDB from 'oracledb';
import {config} from '../config.js';


const query = async(sql) => {
    try {
        const connection = await OracleDB.getConnection(config.db);
        const results= await connection.execute(sql);
        console.log(results)

        return results.rows;
    } catch (error) {
        throw error;
    }
   

   

    
}

export {query}