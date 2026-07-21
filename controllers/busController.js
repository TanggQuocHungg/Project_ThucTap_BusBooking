let busModel = require('../schemas/buses')

module.exports = {
    CreateABus: async function (licensePlate, type, capacity) {
        try {
            // 1. VALIDATE: Kiểm tra biển số xe đã tồn tại
            let existItem = await busModel.findOne({
                licensePlate: licensePlate,
                isDeleted: false
            })
            if (existItem) {
                throw new Error("Biển số xe đã tồn tại");
            }

            // 2. VALIDATE: Kiểm tra type hợp lệ
            let validTypes = ['BUS_29', 'BUS_45', 'BUS_60'];
            if (!validTypes.includes(type)) {
                throw new Error("Loại xe phải là BUS_29, BUS_45 hoặc BUS_60");
            }

            // 3. VALIDATE: Kiểm tra capacity > 0
            if (capacity <= 0 || capacity > 100) {
                throw new Error("Công suất xe phải từ 1 đến 100 chỗ");
            }

            let newItem = new busModel({
                licensePlate: licensePlate,
                type: type,
                capacity: capacity,
                imageUrl: imageUrl || ''
            });
            await newItem.save();
            return newItem;
        } catch (error) {
            throw error;
        }
    },

    GetAllBuses: async function () {
        return await busModel.find({
            isDeleted: false
        })
    },

    GetABusById: async function (id) {
        let result = await busModel.findOne({
            isDeleted: false,
            _id: id
        })
        if (result) {
            return result;
        }
        return false;
    },

    UpdateABus: async function (id, updateData) {
        // VALIDATE: Chỉ cho update type và capacity
        let allowedFields = ['licensePlate', 'type', 'capacity', 'imageUrl'];
        let cleanData = {};
        
        for (let field of allowedFields) {
            if (updateData[field] !== undefined) {
                cleanData[field] = updateData[field];
            }
        }

        // VALIDATE: Kiểm tra type nếu có update
        if (cleanData.type) {
            let validTypes = ['BUS_29', 'BUS_45', 'BUS_60'];
            if (!validTypes.includes(cleanData.type)) {
                throw new Error("Loại xe phải là BUS_29, BUS_45 hoặc BUS_60");
            }
        }

        // VALIDATE: Kiểm tra capacity nếu có update
        if (cleanData.capacity) {
            if (cleanData.capacity <= 0 || cleanData.capacity > 100) {
                throw new Error("Công suất xe phải từ 1 đến 100 chỗ");
            }
        }

        let updatedItem = await busModel.findOneAndUpdate({
            isDeleted: false,
            _id: id
        }, cleanData, { new: true })
        
        if (updatedItem) {
            return updatedItem;
        }
        return false;
    },

    DeleteABus: async function (id) {
        let updatedItem = await busModel.findOneAndUpdate({
            isDeleted: false,
            _id: id
        }, {
            isDeleted: true
        }, { new: true })
        
        if (updatedItem) {
            return updatedItem;
        }
        return false;
    }
}