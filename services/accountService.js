const Account = require('../models/account/account.js')

exports.createSimpleAccount = async (payloadData) => {
    return await Account.create(payloadData)

}
exports.updateVendorAccount = async (id, updateData) => {
    return new Promise(async (resolve, reject) => {
        await Account.findOneAndUpdate({ _id: id }, updateData)
        resolve(updateData)
    })

}
exports.setActiveStatus = async (id, status) => {
    return new Promise(async (resolve, reject) => {
        await Account.findOneAndUpdate({ _id: id }, { account_status: status })
        resolve(true)
    })
}

exports.getListVendorAccount = async () => {
    return await Account.find({ 
        account_type: "vendor",

    });
}


exports.getListCustomerAccount = async () => {
    return await Account.find({ 
        account_type: "customer",
       
    });
}

exports.getVendorInfo = async (_id) => {
    return await Account.findById(_id)
}



