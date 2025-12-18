const Consignment = require("../models/consignment/consignment");

exports.getAllConsignments = async () => {
    try {
        return await Consignment.find().populate("currency");
    } catch (error) {
        throw new Error("Failed to fetch consignments: " + error.message);
    }
};

exports.getConsignmentById = async (id) => {
    try {
        const consignment = await Consignment.findById(id);
        if (!consignment) {
            throw new Error("Consignment not found");
        }
        return consignment;
    } catch (error) {
        throw new Error("Failed to fetch consignment: " + error.message);
    }
};

exports.getAllMemoPending = async (filter = {}) => {
    try {
        const query = { pcs: { $gt: 0 } }; 

        if (filter.account) {
            query.account = { $regex: new RegExp(`^${filter.account}$`, 'i') };
        }

        return await Consignment.find(query);
    } catch (error) {
        throw new Error("Failed to fetch memo pending: " + error.message);
    }
};