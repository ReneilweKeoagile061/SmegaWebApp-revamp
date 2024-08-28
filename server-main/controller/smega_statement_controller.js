import {  processQuery } from "../services/smega_service.js"
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

const renderHome=async(req,res,next) => {


    const homePagePath = path.join(__dirname, '../view/pages/home.html');
    res.sendFile(homePagePath)
}

export {
    getUserStatment,
    renderHome
}