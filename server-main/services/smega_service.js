import { config } from "../config.js"; 
import * as db from "../services/db.js";
import { getSmegaStatement } from "./hive.js";



const processQuery = async(params) => {


    
    const sql = `

    SELECT 
    transaction_id,  
    party_id,
    customer_name,
    customer_contact,
    amount,previous_balance,
    post_balance,transfer_status,
    service_type,receiver,transaction_date 

    FROM 
    summary_smega.partitioned_hist_mx_transaction_items_smega
    WHERE 
        customer_contact = ${params.inputField1Value}
    AND transaction_date BETWEEN TO_DATE('${params.datePicker1Value}') 
    AND TO_DATE('${params.datePicker2Value}')
`;



try {
    //pass the query that has the input paremters into this fucntion
    const value = await getSmegaStatement(sql).then(results => results)

    return value
    
    

} catch (error) {
    
}

}


export {processQuery}