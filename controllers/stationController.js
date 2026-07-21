let stationModel = require('../schemas/stations')

module.exports = {
    CreateAStation: async function (name, address, city) {
        try {
            // 1. VALIDATE: Kiểm tra bến xe đã tồn tại
            let existItem = await stationModel.findOne({
                name: name,
                isDeleted: false
            })
            if (existItem) {
                throw new Error("Bến xe này đã tồn tại");
            }

            // 2. VALIDATE: Kiểm tra dữ liệu không trống
            if (!name || !address || !city) {
                throw new Error("Tên, địa chỉ, và thành phố không được để trống");
            }

            let newItem = new stationModel({
                name: name,
                address: address,
                city: city
            });
            await newItem.save();
            return newItem;
        } catch (error) {
            throw error;
        }
    },

    GetAllStations: async function () {
        return await stationModel.find({
            isDeleted: false
        })
    },

    GetAStationById: async function (id) {
        let result = await stationModel.findOne({
            isDeleted: false,
            _id: id
        })
        
        if (result) {
            return result;
        }
        return false;
    },

    UpdateAStation: async function (id, updateData) {
        // VALIDATE: Chỉ cho update name, address, city
        let allowedFields = ['name', 'address', 'city'];
        let cleanData = {};
        
        for (let field of allowedFields) {
            if (updateData[field] !== undefined) {
                cleanData[field] = updateData[field];
            }
        }

        let updatedItem = await stationModel.findOneAndUpdate({
            isDeleted: false,
            _id: id
        }, cleanData, { new: true })

        if (updatedItem) {
            return updatedItem;
        }
        return false;
    },

    DeleteAStation: async function (id) {
        let updatedItem = await stationModel.findOneAndUpdate({
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