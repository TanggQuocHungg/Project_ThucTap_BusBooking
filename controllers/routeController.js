let routeModel = require('../schemas/routes')
let stationModel = require('../schemas/stations')

module.exports = {
    CreateARoute: async function (startStation, endStation, distance, basePrice) {
        try {
            // 1. VALIDATE: Kiểm tra tuyến đường không tồn tại
            let existItem = await routeModel.findOne({
                startStation: startStation,
                endStation: endStation,
                isDeleted: false
            })
            if (existItem) {
                throw new Error("Tuyến đường này đã tồn tại");
            }

            // 2. VALIDATE: Kiểm tra start và end station không giống nhau
            if (startStation === endStation) {
                throw new Error("Ga khởi hành và ga đến phải khác nhau");
            }

            // 3. VALIDATE: Kiểm tra startStation tồn tại
            let startStn = await stationModel.findOne({ _id: startStation, isDeleted: false });
            if (!startStn) {
                throw new Error("Ga khởi hành không tồn tại");
            }

            // 4. VALIDATE: Kiểm tra endStation tồn tại
            let endStn = await stationModel.findOne({ _id: endStation, isDeleted: false });
            if (!endStn) {
                throw new Error("Ga đến không tồn tại");
            }

            // 5. VALIDATE: Kiểm tra distance > 0
            if (distance <= 0) {
                throw new Error("Khoảng cách phải lớn hơn 0");
            }

            // 6. VALIDATE: Kiểm tra basePrice >= 0
            if (basePrice < 0) {
                throw new Error("Giá cơ bản không được âm");
            }

            let newItem = new routeModel({
                startStation: startStation,
                endStation: endStation,
                distance: distance,
                basePrice: basePrice
            });
            await newItem.save();
            return newItem;
        } catch (error) {
            throw error;
        }
    },

    GetAllRoutes: async function () {
        return await routeModel.find({
            isDeleted: false
        }).populate('startStation').populate('endStation')
    },

    GetARouteById: async function (id) {
        let result = await routeModel.findOne({
            isDeleted: false,
            _id: id
        }).populate('startStation').populate('endStation')
        
        if (result) {
            return result;
        }
        return false;
    },

    UpdateARoute: async function (id, updateData) {
        // VALIDATE: Chỉ cho update distance và basePrice
        let allowedFields = ['distance', 'basePrice'];
        let cleanData = {};
        
        for (let field of allowedFields) {
            if (updateData[field] !== undefined) {
                cleanData[field] = updateData[field];
            }
        }

        // VALIDATE: Kiểm tra distance > 0
        if (cleanData.distance !== undefined && cleanData.distance <= 0) {
            throw new Error("Khoảng cách phải lớn hơn 0");
        }

        // VALIDATE: Kiểm tra basePrice >= 0
        if (cleanData.basePrice !== undefined && cleanData.basePrice < 0) {
            throw new Error("Giá cơ bản không được âm");
        }

        let updatedItem = await routeModel.findOneAndUpdate({
            isDeleted: false,
            _id: id
        }, cleanData, { new: true })

        if (updatedItem) {
            return updatedItem;
        }
        return false;
    },

    DeleteARoute: async function (id) {
        let updatedItem = await routeModel.findOneAndUpdate({
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