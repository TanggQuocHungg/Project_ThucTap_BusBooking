let seatModel = require('../schemas/seats')
let tripModel = require('../schemas/trips')

module.exports = {
    CreateASeat: async function (trip, seatNumber, status) {
        try {
            // 1. VALIDATE: Kiểm tra trip tồn tại
            let tripData = await tripModel.findOne({ 
                _id: trip, 
                isDeleted: false 
            });
            if (!tripData) {
                throw new Error("Chuyến xe không tồn tại");
            }

            // 2. VALIDATE: Kiểm tra ghế đã tồn tại trong chuyến này
            let existItem = await seatModel.findOne({
                trip: trip,
                seatNumber: seatNumber,
                isDeleted: false
            })
            if (existItem) {
                throw new Error("Ghế này đã tồn tại trong chuyến xe");
            }

            // 3. VALIDATE: Kiểm tra status hợp lệ
            let validStatus = ['AVAILABLE', 'HOLD', 'BOOKED'];
            if (status && !validStatus.includes(status)) {
                throw new Error("Trạng thái phải là AVAILABLE, HOLD hoặc BOOKED");
            }

            let newItem = new seatModel({
                trip: trip,
                seatNumber: seatNumber,
                status: status || "AVAILABLE"
            });
            await newItem.save();
            return newItem;
        } catch (error) {
            throw error;
        }
    },

    GetAllSeats: async function (tripId) {
        let condition = { isDeleted: false };
        if (tripId) {
            condition.trip = tripId;
        }
        return await seatModel.find(condition).populate('trip')
    },

    GetASeatById: async function (id) {
        let result = await seatModel.findOne({
            isDeleted: false,
            _id: id
        }).populate('trip')
        
        if (result) {
            return result;
        }
        return false;
    },

    UpdateASeat: async function (id, updateData) {
        // VALIDATE: Chỉ cho update status
        let allowedFields = ['status'];
        let cleanData = {};
        
        for (let field of allowedFields) {
            if (updateData[field] !== undefined) {
                cleanData[field] = updateData[field];
            }
        }

        // VALIDATE: Kiểm tra status hợp lệ
        if (cleanData.status) {
            let validStatus = ['AVAILABLE', 'HOLD', 'BOOKED'];
            if (!validStatus.includes(cleanData.status)) {
                throw new Error("Trạng thái phải là AVAILABLE, HOLD hoặc BOOKED");
            }
        }

        let updatedItem = await seatModel.findOneAndUpdate({
            isDeleted: false,
            _id: id
        }, cleanData, { new: true })

        if (updatedItem) {
            return updatedItem;
        }
        return false;
    },

    DeleteASeat: async function (id) {
        let updatedItem = await seatModel.findOneAndUpdate({
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