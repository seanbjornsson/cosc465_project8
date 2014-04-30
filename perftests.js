exports.ping = function(req) {
    // req is https://github.com/techpines/express.io/tree/master/lib#socketrequest
    console.log("Got ping socket.io callback. Responding....");
    req.io.emit('pong', req.data);
};
exports.throughput = function(req) {
    console.log("Recieved a "+req.data.bytelength+" byte file");
    req.io.emit("package_received", req.data);
};



