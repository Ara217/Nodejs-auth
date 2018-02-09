class MongoValidators {
    
}

MongoValidators.email = [
    function (val) {
        return (
            new RegExp(
                '^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|' +
                '(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|' +
                '(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$'
            )
        ).test(val);
    },
    'Please enter a valid email address'
];

module.exports = MongoValidators;