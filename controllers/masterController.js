const MasterService  = require("../services/masterService")
const requestHelper = require("../helpers/requestHelper")
exports.getMaster = async (req, reply) => {
  const master_type = req.query.master_type ? req.query.master_type : "";
  const code = req.query.code;

  if (master_type === "master_stone_shape" && code) {
    const shapeWithSizes = await MasterService.getShapeWithSizesByCode(code);
    if (!shapeWithSizes) return reply.code(404).send({ message: "Shape not found" });
    return reply.code(200).send(shapeWithSizes);
  }

  const masterData = await MasterService.getListMaster(master_type);
  reply.code(200).send(masterData);
};
// Get all master data from data base
exports.getAllMaster = async (req, reply)=>{
    const masterData = await MasterService.getAllMaster()
    reply.code(200).send(masterData)
}

exports.createMaster = async (req, reply)=>{
    console.log(req.body)
    const masterData = await MasterService.createSimpleMaster(req.body)

    reply.code(200).send({
        code : 200,
        "msg" : "create master sucessfully"
    });

}
exports.updateMaster = async (req, reply)=>{
    console.log(req.body)
    const _id = req.body._id?req.body._id:"";
    
    const bodyWithoutIdAndType = requestHelper.omitFields(req.body, ['_id','master_type']);
    if(_id==""){
        reply.code(400).send({
            code : 400,
            "msg" : "plese pass _id parameter for update"
        });
    
    }
    try {
        const masterData = await MasterService.updateSimpleMaster(req.body._id,bodyWithoutIdAndType )
        
        reply.code(200).send({
            code : 200,
            "msg" : "update master sucessfully"
        });
    } catch (error) {
        throw error;
    }
 
   

}

exports.deleteMaster = async (req, reply) => {
    const { codes, master_type } = req.body; // codes: array of code
    if (!Array.isArray(codes) || !master_type) {
        return reply.code(400).send({ message: "codes (array) and master_type are required" });
    }
    const deletedCount = await MasterService.deleteMasterByCodes(codes, master_type);
    reply.code(200).send({ message: `Deleted ${deletedCount} items` });
};

exports.changeMasterStatus = async (req,res)=>{

}

exports.changeMasterStatus = async (req,res)=>{

}