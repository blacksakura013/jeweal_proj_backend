
exports.masterStoneNamePipeLineData =   [
    {
      '$match': {
        'master_type': 'master_stone_name'
      }
    }, {
      '$addFields': {
        'convertId': {
          '$toObjectId': '$master_info.stone_group'
        }
      }
    }, {
      '$lookup': {
        'from': 'masters', 
        'localField': 'convertId', 
        'foreignField': '_id', 
        'as': 'stone_group_data'
      }
    }, {
      '$unwind': {
        'path': '$stone_group_data', 
        'preserveNullAndEmptyArrays': false
      }
    }, {
      '$project': {
        '_id': '$_id', 
        'name': '$name', 
        'code': '$code', 
        'master_type': '$master_type', 
        'master_status': '$master_status', 
        'hsn': '$master_info.hsn', 
        'stone_group_id': '$stone_group_data._id', 
        'stone_group_name': '$stone_group_data.name', 
        'stone_group_code': '$stone_group_data.code'
      }
    }
  ];