const stoneNamePipeLine = require('./masterStoneNamePipeLine')
const stoneGroupPipeLine = require('./masterStoneGroupPipeLine')

exports.MasterStoneNamePipeLine = stoneNamePipeLine.masterStoneNamePipeLineData;
exports.MasterStoneGroupPipeLine = stoneGroupPipeLine.masterStoneGroupPipeLineData;
exports.simpleMasterPipeLine = (master_type) => {
  return [
    {
      '$match': {
        'master_type': master_type,
      }
    }
  ];
}

exports.simpleMasterActivePipeLine = (master_type) => {
  return [
    {
      '$match': {
        'master_type': master_type,
        'master_status': "active"
      }
    }
  ];
}





