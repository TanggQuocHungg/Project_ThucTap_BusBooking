/**
 * Response Handler - Format response chuẩn cho tất cả API
 */

module.exports = {
    // Response thành công
    success: function(res, statusCode = 200, data, message = 'Success') {
        res.status(statusCode).json({
            success: true,
            message: message,
            data: data
        });
    },

    // Response lỗi
    error: function(res, statusCode = 400, message = 'Error') {
        res.status(statusCode).json({
            success: false,
            message: message,
            data: null
        });
    },

    // Validation error
    validationError: function(res, errors) {
        res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: errors
        });
    },

    // Unauthorized
    unauthorized: function(res, message = 'Unauthorized') {
        res.status(401).json({
            success: false,
            message: message,
            data: null
        });
    },

    // Forbidden
    forbidden: function(res, message = 'Forbidden') {
        res.status(403).json({
            success: false,
            message: message,
            data: null
        });
    },

    // Not found
    notFound: function(res, message = 'Not Found') {
        res.status(404).json({
            success: false,
            message: message,
            data: null
        });
    }
};
