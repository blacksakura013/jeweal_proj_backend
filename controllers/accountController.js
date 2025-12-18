const accountService  = require("../services/accountService")
const requestHelper = require('../helpers/requestHelper')

const  customerAccountService =   require('../services/customerAccountService')



//VENDOR  ACCOUNTS  --------

exports.createAccountVendor = async (req, reply)=>{
    const data = requestHelper.omitFields(req.body,['_id'])

    const accountData = await accountService.createSimpleAccount(data)
    console.log(accountData,"data----------------")

    reply.code(200).send({
        code : 200,
        "msg" : "create master sucessfully"
    });
}

exports.setActiveStatus = async(req,reply)=>{
    
    const accountData = await accountService.setActiveStatus(req.body._id,req.body.status)

    if(accountData){
        reply.code(200).send(await accountService.getListVendorAccount())

    }

}
exports.getVendorInfo = async(req, reply )=>{

    const accountData = await accountService.getVendorInfo(req.query._id)

    reply.code(200).send(accountData)
}

exports.updateVendor = async (req, res) => {
    try {
        const { _id } = req.body;
        const updateData = requestHelper.omitFields(req.body,['_id'])
       console.log(updateData  , " update")

        // ตรวจสอบว่า id และ updateData ถูกต้อง
        // if (!_id || !updateData) {
        //     return res.status(400).send('Missing required fields');
        // }

        const updatedProfile = await accountService.updateVendorAccount(_id, updateData);
        if(updatedProfile){
             res.code(200).send({
            code:200,
            message : "Change company profile Successfully!"
        });
        }
       
        
    } catch (error) {
        console.error(`Error in updateProfileController: ${error.message}`);
        res.status(500).send('Error updating profile');
    }
};

exports.getListMaster = async (req, reply)=>{
    const accountData = await accountService.getListVendorAccount()
    
    reply.code(200).send(accountData)
}
exports.getListCustomerAccount = async (req, reply)=>{
    const accountData = await accountService.getListCustomerAccount()
    
    reply.code(200).send(accountData)
}



//   CUSTOMER  ACCOUNT -----  
exports.createAccountCustomer = async (req, reply)=>{
    const data = requestHelper.omitFields(req.body,['_id'])

    const accountData = await customerAccountService.createCustomerAccount(data)

    reply.code(200).send({
        code : 200,
        "msg" : "create customer acounts sucessfully"
    });

}



exports.setActiveStatus = async(req,reply)=>{
    
    const accountData = await customerAccountService.setActiveStatus(req.body._id,req.body.status)

    if(accountData){
        reply.code(200).send(await accountService.getListVendorAccount())

    }

}


exports.updateAccountCustomer = async (req, res) => {
    try {
        const { _id } = req.body;
        const updateData = requestHelper.omitFields(req.body,['_id'])
 

        // ตรวจสอบว่า id และ updateData ถูกต้อง
        if (!_id || !updateData) {
            return res.status(400).send('Missing required fields');
        }

        const updatedProfile = await customerAccountService.updateCustomerAccount(_id, updateData);
        if(updatedProfile){
             res.code(200).send({
            code:200,
            message : "Change company profile Successfully!"
        });
        }
       
        
    } catch (error) {
        console.error(`Error in updateProfileController: ${error.message}`);
        res.status(500).send('Error updating profile');
    }
};



//   get all  Accounts 

exports.getAllAccounts = async (req, reply) => {
    try {
        const [vendors, customers] = await Promise.all([
            accountService.getListVendorAccount(),
            accountService.getListCustomerAccount()
        ]);
        reply.code(200).send({
            vendors,
            customers
        });
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};