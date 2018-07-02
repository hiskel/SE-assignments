module.exports = {
    sendErrorMsg: function (res, msg) {  
        // console.log(msg)
        res.json({success: false, msg: msg});
    },
    sendSuccess: function (res, to_send) {  
        // console.log(to_send)
        res.json({success: true, data: to_send});    
    }
}