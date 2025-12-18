const Master = require('../models/master/master')
const masterPipeLine = require('../models/master/pipeline/masterPipeline')

exports.getListMaster = async (master_type)=>{
    switch(master_type){
        case "master_stone_name" : 
            return await getMasterList([
                ...masterPipeLine.MasterStoneNamePipeLine,
                { $sort: { name: 1 } }
            ]);
        case "master_stone_group" : 
            return await getMasterList([
                ...masterPipeLine.MasterStoneGroupPipeLine,
                { $sort: { name: 1 } }
            ]);
        default:
            return await getMasterList([
                ...masterPipeLine.simpleMasterPipeLine(master_type),
                { $sort: { name: 1 } }
            ]);
    }
}

exports.getAllMaster = async () => {
    return await Master.find({master_status:"active"}).sort({ name: 1 });
}

exports.createSimpleMaster =  async (payloadData)=>{ 
    return await Master.create(payloadData)
}

exports.updateSimpleMaster =  async (_id,payloadData)=>{ 
    
    return await Master.findOneAndUpdate({_id:_id},payloadData,{new:true})
}

const getMasterList = async (pipeline)=>{
        return await Master.aggregate(pipeline)
}

exports.getShapeWithSizesByCode = async (code) => {
  const shape = await Master.findOne({
    master_type: "master_stone_shape",
    code: code,
    master_status: "active"
  }).lean();

  if (!shape) return null;

  const sizes = await Master.find({
    master_type: "master_stone_size",
    master_status: "active"
  }).lean();

  const sizeIds = shape.master_info?.size_ids || [];

  return {
    ...shape,
    sizes: sizes.filter(sz => sizeIds.includes(sz.code))
  };
};

exports.deleteMasterByCodes = async (codes, master_type) => {
    const result = await Master.deleteMany({ code: { $in: codes }, master_type });
    return result.deletedCount;
};