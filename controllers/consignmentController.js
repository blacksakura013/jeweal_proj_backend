const consignmentService = require("../services/consignmentService");

exports.getAllConsignments = async (request, reply) => {
    try {
        const consignments = await consignmentService.getAllConsignments();
        reply.send(consignments);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.getConsignmentById = async (request, reply) => {
    try {
        const consignment = await consignmentService.getConsignmentById(request.params.id);
        if (!consignment) return reply.code(404).send({ message: "Consignment not found" });
        reply.send(consignment);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};



exports.getAllMemoPending = async (request, reply) => {
    try {
        const { account } = request.query;
        const memoPending = await consignmentService.getAllMemoPending({ account });
        reply.send(memoPending);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};