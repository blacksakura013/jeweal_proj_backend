const customerAccount = require('../models/account/customerAccount')

exports.createCustomerAccount =  async (payloadData)=>{ 
    return await customerAccount.create(payloadData)
    
}
exports.updateCustomerAccount = async (id,updateData)=>{
    return new Promise(async (resolve,reject) => { 
        await customerAccount.findOneAndUpdate({_id:id},updateData)
        resolve(updateData)
            })

}
exports.setActiveStatus = async(id,status)=>{
    return new Promise(async (resolve,reject) => { 
        await customerAccount.findOneAndUpdate({_id:id},{account_status:status})

        resolve(true)

            })
}

exports.getListCustomerAccount =  async ()=>{ 
    return await customerAccount.find({account_type:"customer"})
}

exports.getCustomerInfo =  async (_id)=>{ 
    return await customerAccount.findById(_id)
}