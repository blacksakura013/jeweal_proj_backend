// Require the framework and instantiate it

const express = require('express')
const app = express()


const masterController = require("./controllers/masterController");
const fastifyCors = require("@fastify/cors"); //
const inventoryInSchema = require("./validation/inventory/inventoryInValidateSchema");
const companyProfileController = require("./controllers/companyProfileController");
const loadController = require("./controllers/loadController");
const saleController = require("./controllers/saleController");
const currencyController = require("./controllers/currencyController");
const locationController = require("./controllers/locationController");
const configController = require("./controllers/configController");
const subLocationController = require("./controllers/subLocationController");
const stockController = require("./controllers/stockController");
const stockMovementController = require("./controllers/stockMovementController");
const consignmentController = require("./controllers/consignmentController");
const dashboardController = require("./controllers/dashboardController");
const accountController = require("./controllers/accountController");
const quotationController = require("./controllers/quotationController");
const poController = require("./controllers/poController");
const puController = require("./controllers/puController");

const memoReturnController = require('./controllers/memoReturnController');
const memoOutController = require('./controllers/memoOutController');
const memoOutReturnController = require('./controllers/memoOutReturnController');

const memoInController = require("./controllers/memoInController");

const reserveController = require('./controllers/reserveController');
const bankController = require('./controllers/bankController');
const fastifyIO = require("fastify-socket.io");
const fastifyMultipart = require("@fastify/multipart"); //
const fastify = require("fastify")({ logger: true }); //
const bcrypt = require("bcrypt");
const fastifyJwt = require('@fastify/jwt');
fastify.register(fastifyJwt, { secret: 'your-secret-key' });
const authController = require('./controllers/authController')(fastify);
const dynamicPermissionMiddleware = require('./middlewares/dynamicPermissionMiddleware');
const userController = require('./controllers/userController');


require('./cronJobs');

const path = require("path");

fastify.get("/realtime", (request, reply) => {
  reply.sendFile("index.html");
}); //ทดสอบ

fastify.register(require("@fastify/static"), {
  root: path.join(__dirname),
  prefix: "/",
     root: path.join(__dirname, 'uploads'),
    prefix: '/uploads/',
});
fastify.register(fastifyIO);
fastify.ready((err) => {
  if (err) throw err;
  fastify.io.on("connection", (socket) => {
    console.log("Client connected");
    socket.emit("message", "Welcome to real-time stock movement!");
  });
});
fastify.register(fastifyMultipart); //

fastify.register(require("@fastify/express")); //
fastify.register(fastifyCors, {
  origin: "*", // Allow all origins
  methods: ["GET", "PUT", "POST", "DELETE"], // Allowed HTTP methods
});

// Declare a route
fastify.get("/", function (request, reply) {
  reply.send({ hello: "world" });
});

fastify.get("/master", masterController.getMaster);
fastify.get("/master/all", masterController.getAllMaster);
fastify.delete('/master', masterController.deleteMaster);
fastify.post("/master", masterController.createMaster);
fastify.put("/master", masterController.updateMaster);

// fastify.get('/inventory-in',inventoryController.getInventoryIn)


//   sale =========================

fastify.post("/sales", saleController.createSale);
fastify.get("/sales", saleController.getAllSales);
fastify.get("/sales/:id", saleController.getSaleById);
fastify.get("/sales/next-invoice-no", saleController.getNextInvoiceNo);
fastify.put("/sale/:id", saleController.updateSale);
fastify.put('/sales/:id/cancel', saleController.cancelSale);



//  company profile
fastify.post('/companyProfile',companyProfileController.createCompanyProfile);
fastify.put("/companyProfile", companyProfileController.updateCompanyProfile);
fastify.get("/companyProfile", companyProfileController.getCompanyProfile);



/// Backup routes
/// Bank routes
fastify.post('/banks', bankController.createBank);
fastify.get('/banks', bankController.getAllBanks);
fastify.get('/banks/:id', bankController.getBankById);
fastify.put('/banks/:id', bankController.updateBank);
fastify.put('/banks/:id/togglestatus', bankController.toggleBankStatus);


//   locations ==================
fastify.post('/locations', locationController.createLocation)
fastify.get('/locations', locationController.getAllLocations)
fastify.get('/locations/active', locationController.getAllActiveLocations);
fastify.get('/locations/:id', locationController.getLocationById)
fastify.put('/locations/:id', locationController.updateLocation)
fastify.put('/locations/:id/togglestatus', locationController.toggleLocationStatus)


//  Currency ============================

fastify.post("/currencies", currencyController.createCurrency);
fastify.get("/currencies", currencyController.getAllCurrencies);
fastify.get("/currencies/:id", currencyController.getCurrencyById);
fastify.put("/currencies/:id", currencyController.updateCurrency);
fastify.put(
  "/currencies/:id/togglestatus",
  currencyController.toggleCurrencyStatus
);

//   Sub locations ==================
fastify.post("/sublocations", subLocationController.createSubLocation);
fastify.get("/sublocations", subLocationController.getAllSubLocations);
fastify.get("/sublocations/:id", subLocationController.getSubLocationById);
fastify.put("/sublocations/:id", subLocationController.updateSubLocation);
fastify.put(
  "/sublocations/:id/togglestatus",
  subLocationController.toggleSubLocationStatus
);

//  Toggle =======================================
fastify.post("/configs", configController.createConfig);
fastify.get("/configs", configController.getAllConfigs);
fastify.get("/configs/:id", configController.getConfigById);
fastify.put("/configs/:id/togglestatus", configController.toggleConfigStatus);



/// Load routes
fastify.post('/loads', loadController.createLoad);
fastify.get('/loads', loadController.getAllLoads);
fastify.get('/loads/:id', loadController.getLoadById);
fastify.put('/loads/:id', loadController.updateLoad);
fastify.put('/load/:id/approve', loadController.approveLoad);
fastify.get('/loads/next-invoice-no', loadController.getNextInvoiceNo);


/// Stock routes
fastify.get('/stocks', stockController.getAllStocks);
fastify.get('/stocks/:id', stockController.getStockById);
fastify.get('/stocksandconsignments', stockController.getAllStocksAndConsignments);



//  stock movement
fastify.get("/stock-movement", stockMovementController.getStockMovementList);
fastify.get("/stock-movement/:stoneCode",stockMovementController.getStockMovementsByStoneCode);


//  consignment
fastify.get("/consignments", consignmentController.getAllConsignments);

// vendor routes-----
fastify.get("/account/vendor/get-info", accountController.getVendorInfo);
fastify.post("/account/vendor", accountController.createAccountVendor);
fastify.post("/account/customer", accountController.createAccountCustomer);
fastify.put("/account/vendor/setactive", accountController.setActiveStatus);
fastify.put("/account/vendor", accountController.updateVendor);
fastify.get("/account/vendor/list", accountController.getListMaster);
fastify.get("/account/customer/list", accountController.getListCustomerAccount);
fastify.get('/accounts/all', accountController.getAllAccounts);

///        quoation routes
fastify.post("/quotations", quotationController.createQuotation);
fastify.get("/quotations", quotationController.getAllQuotations);
fastify.get("/quotations/:id", quotationController.getQuotationById);
fastify.get('/quotations/next-invoice-no', quotationController.getNextInvoiceNo);
fastify.put("/quotations/:id", quotationController.updateQuotation);
///  PU routes 
fastify.post('/pu', puController.createPU);
fastify.put('/pu/:id', puController.updatePU);
fastify.put('/pu/:id/approve', puController.approvePU);
fastify.get('/pu', puController.getAllPUs);
fastify.get('/pu/:id', puController.getPUById);
fastify.get('/Pu/next-invoice-no', puController.getNextInvoiceNo);
fastify.get('/pu/approved-items/by-account', puController.getAllApprovePUItemsByAccount);


/// PO routes
fastify.post('/po', poController.createPO);
fastify.put('/po/:id', poController.updatePO);
fastify.put('/po/:id/approve', poController.approvePO);
fastify.get('/po', poController.getAllPOs);
fastify.get('/po/:id', poController.getPOById);
fastify.get('/PO/next-invoice-no', poController.getNextInvoiceNo);
fastify.get('/po/approved/by-account', poController.getAllApprovePOsByAccount);



//  memo IN
fastify.get("/memo-in/next-invoice-no", memoInController.getNextInvoiceNo);
fastify.post("/memo-in", memoInController.createMemoIn);
fastify.get("/memo-in", memoInController.getAllMemoIns);
fastify.put("/memo-in/:id", memoInController.updateMemoIn);
fastify.get("/memo/allItems", memoInController.getAllMemoInsItems);
fastify.get("/memo-in/:id", memoInController.getMemoInById);
fastify.get('/consignments/memo-pending', consignmentController.getAllMemoPending);
fastify.put('/memo-in/:id/approve', memoInController.approveMemoIn);


// memo Return routes
fastify.post('/memo-returns', memoReturnController.createMemoReturn);
fastify.put('/memo-returns/:id', memoReturnController.updateMemoReturn);
fastify.get('/memo-returns/next-invoice-no', memoReturnController.getNextInvoiceNo);
fastify.get('/memo-returns', memoReturnController.getAllMemoReturns);
fastify.get('/memo-returns/:id', memoReturnController.getMemoReturnById);
fastify.get('/memo-returns/items', memoReturnController.getAllMemoReturnItems);


/// Memo Out routes
fastify.post('/memo-outs', memoOutController.createMemoOut);
fastify.put('/memo-outs/:id', memoOutController.updateMemoOut);
fastify.get('/memo-outs/next-invoice-no', memoOutController.getNextInvoiceNo);
fastify.get('/memo-outs', memoOutController.getAllMemoOuts);
fastify.get('/memo-outs/:id', memoOutController.getMemoOutById);
fastify.get('/memo-outs/items', memoOutController.getAllMemoOutItems);


//  memo  out return routes 
fastify.post('/memo-out-returns', memoOutReturnController.createMemoOutReturn);
fastify.put('/memo-out-returns/:id', memoOutReturnController.updateMemoOutReturn);
fastify.get('/memo-out-returns/next-invoice-no', memoOutReturnController.getNextInvoiceNo);
fastify.get('/memo-out-returns', memoOutReturnController.getAllMemoOutReturns);
fastify.get('/memo-out-returns/:id', memoOutReturnController.getMemoOutReturnById);


/// Reserve routes
fastify.post('/reserves', reserveController.createReserve);
fastify.put('/reserves/:id', reserveController.updateReserve);
fastify.get('/reserves/next-invoice-no', reserveController.getNextInvoiceNo);
fastify.get('/reserves', reserveController.getAllReserves);
fastify.get('/reserves/:id', reserveController.getReserveById);
fastify.get('/reserves/by-account', reserveController.getAllReturnReservesByAccount);
fastify.put('/reserves/:id/approve', reserveController.approveReserve);


fastify.get(
  "/dashboard-setting/:id",
  dashboardController.getDashboardShortcutById
);
fastify.post("/dashboard-setting", dashboardController.createDashboardShortcut);


/// User permission routes
fastify.post('/register', authController.register);
fastify.post('/login', authController.login);
fastify.post('/refresh-token', authController.refreshToken);

fastify.put('/admin/user/:username/permissions', authController.updatePermissions);  // create  user and permisiion 
fastify.get('/admin', authController.adminOnly);  //
fastify.get('/user', authController.userInfo);

fastify.get('/users', userController.getAllUsers);
fastify.get('/users/:username', userController.getUserByUsername);


fastify.get('/:main/:sub/:action', { preHandler: dynamicPermissionMiddleware }, async (request, reply) => {
  reply.send({ message: `Access granted to /${request.params.main}/${request.params.sub}/${request.params.action}` });
});
fastify.get('/:main/:action', { preHandler: dynamicPermissionMiddleware }, async (request, reply) => {
  reply.send({ message: `Access granted to /${request.params.main}/${request.params.action}` });
});


// User routes



// เริ่มเซิร์ฟเวอร์
const port = process.env.PORT || 4000;

fastify.listen(
  { port, host: '0.0.0.0' },
  function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    fastify.log.info(`Server listening at ${address}`);
  }
);

