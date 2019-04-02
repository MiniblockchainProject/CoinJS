# CoinJS
A Javascript library intended to help with the development of web wallet apps for Cryptonite. It makes use of [cryptocoinjs](https://github.com/cryptocoinjs/) packages to provide functionality related to address and transaction creation, parsing transactions, signing transactions, verifying transactions, etc. 

The test.js file has code examples that can be run with node.js, the test.html file has the same examples but runs in the browser using the bundled javascript file created with browserify. Since web wallet software is intended to run client side you will probably want to use the bundled package in practice.

Run browserify using:

    browserify app.js --s CoinJS > coinjs.js