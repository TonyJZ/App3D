#!/usr/bin/env python3
from http.server import HTTPServer, SimpleHTTPRequestHandler, test as test_orig
import sys
import json
import os



def test (*args):
    #default path
    path = "../";
    if len(sys.argv) > 2 :
        path = sys.argv[2]
    os.chdir(path)
    test_orig(*args, port=int(sys.argv[1]) if len(sys.argv) > 1 else 7999)

class CORSRequestHandler (SimpleHTTPRequestHandler):
    def do_POST(self):
        length = self.headers['content-length']
        data = self.rfile.read(int(length))
        dataTxt = data.decode();
        decodedJson = json.loads(dataTxt)
        with open(decodedJson["fileName"],"w" ) as f:
            f.write(dataTxt)
        self.send_response(200) #this is not working
        
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        SimpleHTTPRequestHandler.end_headers(self)

if __name__ == '__main__':
    test(CORSRequestHandler, HTTPServer)
