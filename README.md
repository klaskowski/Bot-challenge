# Bot-challenge
A game platform, where programs battle each other, in a set of classic game ideas.

The goal of this project is to create a web platform, that gives user ability to duel, as well as organize tournaments. A bot is supposed to be implemented as a HTTP server, implementing defined REST endpoint specification. Those endpoints take game state as a parameter, and respond with a move. Then, a game server starts makings requests to player's servers and performs a game in a turn-based fasion. Game visualization is going to be presented on a web platform using WebGL to render, and WebSockets to send a game state to the viewer.

## Guidelines
This project follows StandardJS, while using ECMA 2015 without Babel (only syntax supported by Node 7.8 and Chrome 59).

### Tests
Unit tests describe game engine behavior. They are supposed to help ease possible refactorings in the future.
Use `yarn test` to run them, or `yarn tdd` if continuous test runs are expected after each file change.