import Deceased from '../models/deceasedModel.js';

const saveDeacesed = async (req, res, next)=>{
    console.log(req.body)
    const sentDeacesed = req.body;
    console.log(sentDeacesed);
    const graveId = req.params.id;
     const deacesed = new Deceased({
        name: sentDeacesed.name,
        surname: sentDeacesed.surname,
        dateBirth: sentDeacesed.dateBirth,
        dateDeath: sentDeacesed.dateDeath,
        grave: graveId,
    })
    
    //const createdGrave = await grave.save();
    
    try {
    createdDeacesed = await deacesed.save();
    res.json(createdDeacesed);
    } catch (error) {
        return res.json({message: 'Cound not store data'})
    } 
//    client.close()
    
    console.log('POST request');
    
}

export { saveDeacesed } 