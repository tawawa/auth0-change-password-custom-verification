var App = require('./index');
var port = process.env.PORT || 3000;

App.listen(port, function () {
    console.log('Server started on port', port);
})
