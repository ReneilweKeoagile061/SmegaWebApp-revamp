import { config } from "../config.js"; 
import * as db from "../services/db.js";
import { getSmegaStatement } from "./hive.js";



const processQuery = async(params) => {
    
    // const sql = `
    // SELECT 
    //     ti.transfer_id AS transaction_id,
    //     ti.party_id,
    //     pa.first_name || '  ' || pa.last_name AS customer_name,
    //     ti.account_id AS customer_contact,
    //     ti.approved_value / 100 AS amount,
    //     ti.previous_balance / 100 AS previous_balance,
    //     ti.post_balance / 100 AS post_balance,
    //     ti.transfer_date AS transfer_date,
    //     ti.transfer_status AS transfer_status,
    //     ti.service_type AS service_type,
    //     ti.second_party_account_id AS receiver
    // FROM
    //     btc_prod.mtx_transaction_items ti,
    //     btc_prod.mtx_party_access pa
    // WHERE
    //     ti.account_id = pa.msisdn
    //     AND pa.status = 'Y'
    //     AND transfer_date >= TO_DATE('${params.datePicker1Value}', 'yyyy-mm-dd')
    //     AND transfer_date < TO_DATE('${params.datePicker2Value}', 'yyyy-mm-dd')
    //     AND account_id = '${params.inputField1Value}'`;




    //     const sql = `
    //     SELECT
    //     ti.transfer_id             AS transaction_id,
    //     ti.party_id,
    //     pa.first_name || '  '|| pa.last_name            AS customer_name,
    //     ti.account_id              AS customer_contact,
    //     ti.approved_value / 100    AS amount,
    //     ti.previous_balance / 100  AS previous_balance,
    //     ti.post_balance / 100      AS post_balance,
    //     ti.transfer_date           AS transfer_date,
    //     ti.transfer_status         AS transfer_status,
    //     ti.service_type            AS service_type,
    //     ti.second_party_account_id AS receiver
    // FROM
    //     btc_prod.MTX_TRANSACTION_ITEMS_01JAN22_31MAY22 ti, btc_prod.mtx_party_access      pa
    // WHERE
    //         account_id = '${params.inputField1Value}'
    //     AND ti.account_id = pa.msisdn
    //     AND pa.status = 'Y'
    //     AND transfer_date >= TO_DATE('${params.datePicker1Value}', 'yyyy-mm-dd')
    //     AND transfer_date < TO_DATE('2022-05-31', 'yyyy-mm-dd')
    // union all 
    //     SELECT
    //     ti.transfer_id             AS transaction_id,
    //     ti.party_id,
    //     pa.first_name || '  '|| pa.last_name            AS customer_name,
    //     ti.account_id              AS customer_contact,
    //     ti.approved_value / 100    AS amount,
    //     ti.previous_balance / 100  AS previous_balance,
    //     ti.post_balance / 100      AS post_balance,
    //     ti.transfer_date           AS transfer_date,
    //     ti.transfer_status         AS transfer_status,
    //     ti.service_type            AS service_type,
    //     ti.second_party_account_id AS receiver
    // FROM
    //     btc_prod.mtx_transaction_items_bkp ti, btc_prod.mtx_party_access      pa
    // WHERE
    //     account_id = '${params.inputField1Value}'
    //     AND ti.account_id = pa.msisdn
    //     AND pa.status = 'Y'
    //     AND transfer_date >= TO_DATE('2022-05-31', 'yyyy-mm-dd')
    //     AND transfer_date < TO_DATE('2024-01-01', 'yyyy-mm-dd')
    // union all 
    // SELECT
    //     ti.transfer_id             AS transaction_id,
    //     ti.party_id,
    //     pa.first_name || '  '|| pa.last_name            AS customer_name,
    //     ti.account_id              AS customer_contact,
    //     ti.approved_value / 100    AS amount,
    //     ti.previous_balance / 100  AS previous_balance,
    //     ti.post_balance / 100      AS post_balance,
    //     ti.transfer_date           AS transfer_date,
    //     ti.transfer_status         AS transfer_status,
    //     ti.service_type            AS service_type,
    //     ti.second_party_account_id AS receiver
    // FROM
    //     btc_prod.mtx_transaction_items ti, btc_prod.mtx_party_access      pa
    // WHERE
    //         account_id = '${params.inputField1Value}'
    //     AND ti.account_id = pa.msisdn
    //     AND pa.status = 'Y'
    //     AND transfer_date >= TO_DATE('2024-01-01', 'yyyy-mm-dd')
    //     AND transfer_date < TO_DATE('${params.datePicker2Value}', 'yyyy-mm-dd')`;


    const sql = `
    SELECT DISTINCT
        ti.transfer_id AS transaction_id,
        ti.party_id,
        pa.first_name || ' ' || pa.last_name AS customer_name,
        ti.account_id AS customer_contact,
        ti.approved_value / 100 AS amount,
        ti.previous_balance / 100 AS previous_balance,
        ti.post_balance / 100 AS post_balance,
        ti.transfer_date AS transfer_date,
        ti.transfer_status AS transfer_status,
        ti.service_type AS service_type,
        ti.second_party_account_id AS receiver
    FROM (
        SELECT * FROM ods_smega.hist_mtx_transaction_items
        UNION ALL
        SELECT * FROM ods_smega.hist_mtx_transaction_items_2
        UNION ALL
        SELECT * FROM ods_smega.mtx_transaction_items
    ) ti
    JOIN ods_smega.mtx_party_access pa ON ti.account_id = pa.msisdn
    WHERE
        ti.account_id = '${params.inputField1Value}'
        AND pa.status = 'Y'
        AND ti.transfer_date >= TO_DATE('${params.datePicker1Value}')
        AND ti.transfer_date <= TO_DATE('${params.datePicker2Value}') 
        order by transfer_date
`;


try {
    //pass the query that has the input paremters into this fucntion
    const value = await getSmegaStatement(sql).then(results => results)

    return value
    
    

} catch (error) {
    
}

}


export {processQuery}