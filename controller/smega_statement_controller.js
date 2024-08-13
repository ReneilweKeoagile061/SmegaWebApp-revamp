import {  processQuery } from "../services/smega_service.js"

const getUserStatment = async(req,res,next) => {
    const {inputField1Value,datePicker1Value,datePicker2Value } = req.body;
   

    // Basic input validation
    if (!inputField1Value || !datePicker1Value || !datePicker2Value) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    await processQuery(req.body)
    .then(results => {
        res.status(200).json(results);
    })
    .catch(err=> next(err));



}



export {
    getUserStatment
}