# Fetch Take-Home Exercise - Site Reliability Engineering

SRE Coding Challenge Submission for Fetch

## Running this project

1. Download this repo
     
2. Install node.js (https://nodejs.org/en/download). Make sure node exists on your PATH

3. In the terminal of your choice, go to this repo's main folder

4. Use command `node ./index.js [path-to-your-input-file-here.yml]` . Only one file may be used as input at a time.

## Code

The overwhelming majority of this projects code lives in the file [index.js](https://github.com/Vosty/FetchProject/blob/master/index.js).

It is written in javascript using node.js, with some imported libraries helping out with parsing the input data and sending HTTP requests.

Error handling is a bit hands off, but we were supposed to assume the files were vaild, so I hope that's okay.

In my testing, for whatever reason the endpoints in the sample input file exclusively returned 301 errors. However, the code works normally when tested against other endpoints so I'm going to boldly assume this is a fetch problem.

I tried to leave enough comments on what each part of the code does. Feel free to reach out to ask questions at mattvosty@gmail.com
