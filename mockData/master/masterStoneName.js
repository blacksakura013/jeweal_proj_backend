const ObjectId = require('mongodb').ObjectId;


module.exports.masterMockData  =  [
    {
      code: 'BS-SP',
      name: 'Blue Sapphire',
      master_info: {
        stone_group: "66a9bed580e5daedf4d28c6d",
        hsn: ""
      },
      master_type: "master_stone_name",
      master_status:"active"
    },
    // {
    //   code: 'PS-SP',
    //   name: 'Pink Sapphires',
    //   master_info: {
    //     stone_group:  mongoose.Types.ObjectId("66a9bed580e5daedf4d28c6d")
    //   },
    //   master_type: "master_stone_group",
    //   master_status:"active"
    // }, 
    // {
    //   code: 'PEAR',
    //   name: 'YS-SP',
    //   master_info: {
    //     stone_group: new mongoose.Types.ObjectId("66a9bed580e5daedf4d28c6d")
    //   },
    //   master_type: "master_stone_group",
    //   master_status:"active"
    // },
  
  
  
  ]
  
  