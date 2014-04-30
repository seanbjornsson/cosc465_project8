var myapp = (function(){
    var seq = 0;
    var socket = io.connect();
    var avgRtt = 0;
    var filesize = 12800;

    //the function that starts throughput test (sends a file, waits for response)
    var start_throughput = function(){
        console.log("starting throughput test");
        $("#status").prepend("<div>Initiallizing Throughput Test. Sending " + (filesize*8)+" bytes.....</div>");
        var f = new Float64Array(filesize);
        socket.emit("throughput_data", {timestamp: Date.now(), file:f, bytelength:f.byteLength})
    };   

    //this function registers an io listener to look for the server response to the throughput test and display it
    var listen_package_received = function(){
        console.log("registering throughput feedback listener");
        socket.on("package_received", function(data){
            var upload_time = Date.now() - data.timestamp;
            console.log("Server acknowledged file");
            $("#status").prepend("<div>The server recieved the file after ~~"+upload_time+"~~ milliseconds</div><div>***</div>");
            $("#status").prepend("<div>***</div><div>Calculated throughput: "+(filesize/(upload_time/1000)).toFixed(3)+" B/s</div>");
        });
    };

    //initiates the ping test, and displays that it has started
    var start_ping = function() {
        console.log("starting ping test")
        $("#status").prepend("<div>Initializing Latency Test.....</div>");
        socket.emit('ping', {timestamp: Date.now(), sequence:seq++});
    };

    //registers a socket listener for pong responses. upon a 'pong' response, executes listener function.
    var listen_pong = function(){
        console.log("registering pong listener");
        socket.on('pong', function(data) {
            var rtt = Date.now() - data.timestamp;
            console.log("Ping RTT (milliseconds): " + rtt);
            //display ping responses as they come in
            $("#status").prepend("<div>Ping " + (data.sequence + 1) + " took ~~" + rtt + "~~ milliseconds</div>");
            avgRtt+= rtt;
            //any pong with a seqence < 4 initiates another ping
            if (data.sequence<4){
                socket.emit('ping', {timestamp: Date.now(), sequence:seq++}); 
            }
            //the 5th pong averages the RTT times, displays it, resets the ping sequence, and sends the average back to the server
            else{
                avgRtt = avgRtt / 5;
                $("#status").prepend("<div>***</div><div>The average round trip time was ~~~"+avgRtt+"~~~ milliseconds</div><div>***</div>"); 
                console.log("Sending server average rtt result for storage: " + avgRtt);
                socket.emit('rtt_result', {rtt:avgRtt}); 
                avgRtt = seq = 0;
            };
        });

    };

    return {
        init: function() {
            console.log("Client-side app starting up");
            listen_pong()
            listen_package_received()
            $("#startping").click(start_ping);
            $("#startthroughput").click(start_throughput);
            $("#psych").click(function(){
                $("#psych").replaceWith("<span>PSYCH!!</SPAN>")
            });

        }
    }
})();
jQuery(myapp.init);

