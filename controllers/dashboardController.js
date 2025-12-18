const requestHelper = require('../helpers/requestHelper');
const DashboardSetting = require("../models/dashboard_setting/DashboardSetting");

// exports.createDashboardShortcut = async (request, reply) => {
//   try {
//     const dashboardData = request.body;
//     const dashboard = new DashboardSetting(dashboardData);
//     const savedDashboardShortcut = await dashboard.save();
//     reply.code(201).send(savedDashboardShortcut);
//   } catch (err) {
//     reply.code(500).send(err);
//   }
// };


exports.createDashboardShortcut = async (request, reply) => {
  try {
    const { type } = request.body;

    // Check if a shortcut with the same type already exists
    const existingShortcut = await DashboardSetting.findOne({ type });

    if (existingShortcut) {
      return reply.code(200).send({ message: "Shortcut with this type already exists", shortcut: existingShortcut });
    }

    // If not found, create a new one
    const dashboard = new DashboardSetting(request.body);
    const savedDashboardShortcut = await dashboard.save();

    reply.code(201).send(savedDashboardShortcut);
  } catch (err) {
    reply.code(500).send(err);
  }
};


// exports.updatedDashboardShortcut = async (request, reply) => {
//   try {
//     const { _id } = request.body;
//     const updateData = requestHelper.omitFields(request.body,['_id'])


//     // const dashboard = new DashboardShortcut(dashboardData);

//     return new Promise(async (resolve,reject) => { 
//       await DashboardShortcut.findOneAndUpdate({_id:_id},updateData)
//       resolve(updateData)
//           })

//     reply.code(201).send(updateData);
//   } catch (err) {
//     reply.code(500).send(err);
//   }
// };

// exports.getAllDashboardShortcut = async (request, reply) => {
//   try {
//     const dashboard = await DashboardShortcut.find();
//     reply.code(200).send(dashboard);
//   } catch (err) {
//     reply.code(500).send(err);
//   }
// };


exports.getDashboardShortcutById = async (request, reply) => {
  try {
    const dashboard = await DashboardSetting.findById(request.params.id);

    console.log(dashboard, request.params)
    if (!dashboard) {
      return reply.code(404).send({ message: 'DashboardShortcut not found' });
    }
    reply.code(200).send(dashboard);
  } catch (err) {
    reply.code(500).send(err);
  }
};

// exports.toggleDashboardShortcutStatus = async (request, reply) => {
//   try {
//     const dashboardId = request.params.id;


//     const dashboard = await DashboardShortcut.findById(dashboardId);
//     if (!dashboard) {
//       return reply.code(404).send({ message: 'DashboardShortcut not found' });
//     }


//     const newStatus = dashboard.status === 'active' ? 'inactive' : 'active';

 
//     dashboard.status = newStatus;
//     const updatedDashboardShortcut = await dashboard.save();

//     reply.code(200).send(updatedDashboardShortcut);
//   } catch (err) {
//     reply.code(500).send(err);
//   }
// };