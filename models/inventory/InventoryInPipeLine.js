exports.InventoryInListPipeline = (inventory_type)=>{
  return [
    {
  $match : { "inventory_type": inventory_type }
    },
    {
  $replaceRoot: {
      newRoot: {
        $mergeObjects:[
      "$$ROOT",
      {   inventory_item_pcs_count : {$sum : "$inventory_item.pcs" } },
      {   inventory_item_weight_count : {$sum : "$inventory_item.weight" } },
      {   inventory_item_total_amount : {$sum : "$inventory_item.total_amount" } }
          ]
    
      }
    }
  
  }
    
  ]
  }
  
  
  
  
  
  exports.InventoryInPipeline = (inventory_type)=>{
    [
      {
        $addFields:
          {
            "inventory_item.stone": {
              $toObjectId: "66bae928974aa4cf8656efc3"
            }
          }
      },
      {
        $addFields:
  
          {
            "inventory_item.shape": {
              $toObjectId: "66b04cf6a157b590a66a2e10"
            }
          }
      },
      {
        $addFields: {
          "inventory_item.size": {
            $toObjectId: "66bb0944974aa4cf8656f217"
          }
        }
      },
      {
        $addFields: {
          "inventory_item.color": {
            $toObjectId: "66b05842a157b590a66a2eef"
          }
        }
      },
      {
        $addFields: {
          "inventory_item.cutting": {
            $toObjectId: "66b05a23a157b590a66a2ef9"
          }
        }
      },
      {
        $addFields: {
          "inventory_item.quality": {
            $toObjectId: "66b2dcb23bc017bc35a43e98"
          }
        }
      },
      {
        $addFields: {
          "inventory_item.clarity": {
            $toObjectId: "66b05bb1a157b590a66a2f1f"
          }
        }
      },
      {
        $addFields: {
          "inventory_item.cer_type": {
            $toObjectId: "66b2dcee3bc017bc35a43ec1"
          }
        }
      },
      {
        $addFields: {
          "inventory_item.lot_no": {
            $toObjectId: "66b2f0f8429baa6c7241f3b9"
          }
        }
      },
      {
        $unwind:
  
          {
            path: "$inventory_item",
            preserveNullAndEmptyArrays: false
          }
      },
      {
        $lookup:
    
          {
            from: "masters",
            localField: "inventory_item.stone",
            foreignField: "_id",
            as: "inventory_item.stone"
          }
      },
      {
        $unwind:
          {
            path: "$inventory_item.stone",
            preserveNullAndEmptyArrays: false
          }
      },
      {
        $lookup: {
          from: "masters",
          localField: "inventory_item.shape",
          foreignField: "_id",
          as: "inventory_item.shape"
        }
      },
      {
        $unwind: {
          path: "$inventory_item.shape",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $lookup: {
          from: "masters",
          localField: "inventory_item.size",
          foreignField: "_id",
          as: "inventory_item.size"
        }
      },
      {
        $unwind: {
          path: "$inventory_item.size",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $lookup: {
          from: "masters",
          localField: "inventory_item.color",
          foreignField: "_id",
          as: "inventory_item.color"
        }
      },
      {
        $unwind: {
          path: "$inventory_item.color",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $lookup: {
          from: "masters",
          localField: "inventory_item.cutting",
          foreignField: "_id",
          as: "inventory_item.cutting"
        }
      },
      {
        $unwind: {
          path: "$inventory_item.cutting",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $lookup: {
          from: "masters",
          localField: "inventory_item.quality",
          foreignField: "_id",
          as: "inventory_item.quality"
        }
      },
      {
        $unwind: {
          path: "$inventory_item.quality",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $lookup: {
          from: "masters",
          localField: "inventory_item.clarity",
          foreignField: "_id",
          as: "inventory_item.clarity"
        }
      },
      {
        $unwind: {
          path: "$inventory_item.clarity",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $lookup: {
          from: "masters",
          localField: "inventory_item.cer_type",
          foreignField: "_id",
          as: "inventory_item.cer_type"
        }
      },
      {
        $unwind: {
          path: "$inventory_item.cer_type",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $lookup: {
          from: "masters",
          localField: "inventory_item.lot_no",
          foreignField: "_id",
          as: "inventory_item.lot_no"
        }
      },
      {
        $unwind: {
          path: "$inventory_item.lot_no",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $group: {
          _id: "$_id",
          invoice_no: {
            $first: "$invoice_no"
          },
          account: {
            $first: "$account"
          },
          inventory_item: {
            $push: {
              location: "$inventory_item.location",
              stone: "$inventory_item.stone",
              shape: "$shapeDetails",
              size: "$inventory_item.size",
              color: "$inventory_item.color",
              cutting: "$inventory_item.cutting",
              quality: "$inventory_item.quality",
              clarity: "$inventory_item.clarity",
              cer_type: "$inventory_item.cer_type",
              cer_no: "$inventory_item.cer_no",
              lot_no: "$inventory_item.lot_no",
              weight: "$inventory_item.weight",
              total_amount:
                "$inventory_item.total_amount",
              price: "$inventory_item.price",
              discount_percent:
                "$inventory_item.discount_percent",
              discount_amount:
                "$inventory_item.discount_amount",
              unit: "$inventory_item.unit",
              amount: "$inventory_item.amount",
              due_date: "$inventory_item.due_date",
              ref_no: "$inventory_item.ref_no",
              remark: "$inventory_item.remark",
              status: "$inventory_item.status"
            }
          },
          inventory_type: {
            $first: "$inventory_type"
          },
          currency: {
            $first: "$currency"
          }
        }
      }
    ]
  }