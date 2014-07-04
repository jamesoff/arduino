#!/usr/bin/env python

import SimpleHTTPServer
import SocketServer
import serial
import threading
import json
import datetime
import time
import sys


DATA = {}

def launch_httpd():
    PORT = 8080

    Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
    httpd = SocketServer.TCPServer(("", PORT), Handler)

    print "Serving at port %d" % PORT

    httpd.serve_forever()


def collect_serial():
    global DATA
    ser = serial.Serial('/dev/tty.usbmodem1411')
    print "Serial thread starting"
    while True:
        try:
            line = ser.readline().strip()
            newdata = json.loads(line)
            print newdata
            DATA[int(time.time())] = newdata;
            leftData = [] 
            rightData = []
            for ts in sorted(DATA.keys()):
                leftData.append({"x": datetime.datetime.fromtimestamp(ts).strftime("%H:%M:%S"), "y": DATA[ts]["left"]})
                rightData.append({"x": datetime.datetime.fromtimestamp(ts).strftime("%H:%M:%S"), "y": DATA[ts]["right"]})
            json.dump([
                {"values": leftData, "key": "left"},
                {"values": rightData, "key": "right"}
                ], open("data.json", "w"))
            json.dump(newdata, open("scores.json", "w"))
        except Exception, e:
            print e
            pass
            

def load_data():
    return {}
    try:
        DATA = json.load(open("data.json", "r"))
        print "Loaded previous data."
        return DATA
    except:
        print "Starting fresh."
        return {}


def main():
    global DATA
    DATA = load_data()

    httpd_thread = threading.Thread(target=launch_httpd)
    httpd_thread.daemon = True

    serial_thread = threading.Thread(target=collect_serial)
    serial_thread.daemon = True

    httpd_thread.start()
    serial_thread.start()

    while True:
        time.sleep(10)
        pass
    sys.exit()
    

if __name__ == "__main__":
    main()
