# promptly #
---

Simple command line prompting utilify.



## API ##

In all the commands, the options argument is not mandatory.


### .prompt(message, opts, fn) ###

Prompts for a value, printing the `message` and waiting for the input.   
When done, calls `fn` with `error` and `value`.

Default options:
```js
{
    // The default value to assume. If not supplied, the input is mandatory
    'default': 'default value',
    // Automatically trim the input
    'trim': true,
    // A validator or an array of validators.
    'validator': null,
    // Automatically retry on error
    'retry': false
}
```

The validators have two purposes:
```js
function (value) {
    // Validation example, throwing an error when invalid
    if (value.length !== 2) {
        throw new Error('Length must be 2');
    }

    // Parse the value, modifying it
    return value.replace('aa', 'bb');
}
```

Example usages:

Ask for a name.
```js
promptly.prompt('Name: ', function (err, value) {
    // err is always null in this case, because no validators are set
    console.log(value);
});
```

Ask for a name with a constraint (non-empty value and length > 2)
```js
var validator = function (value) {
    if (value.length < 2) {
        throw new Error('Min length of 2');
    }

    return value;
}

promptly.prompt('Name: ', { validator: validator }, function (err, value) {
    if (err) {
        console.error('Invalid name');
        // Manually call retry
        // The passed error have a retry method to easily prompt again.
        err.retry();
    }

    console.log('Name is: ', value);
});
```

Same as above but retry automatically

```js
var validator = function (value) {
    if (value.length < 2) {
        throw new Error('Min length of 2');
    }

    return value;
}

promptly.prompt('Name: ', { validator: validator , retry: true}, function (err, value) {
    // err is always null because promptly will prompting for a name until it validates
    console.log('Name is: ', value);
});
```


### .confirm(message, opts, fn) ###

Ask the user to confirm something.   
Calls `fn` with `error` and `value` (true or false).

The available options are the same, except that `retry` defauls to `true`.   
Truthy values are: `y`, `yes`, `1` and `true`.
Falsy values are `n`, `no`, `0` and `false`.
Comparison is made in case insensitive way.

Example usage:

```js
promptly.confirm('Are you sure? ', function (err, value) {
    console.log('Answer: ', value);
});
```


### .choose(message, choices, opts, fn) ###

Ask the user to choose between multiple `choices` (array of choices).   
Calls `fn` with `error` and `value` (true or false).   

The available options are the same, except that `retry` defauls to `true`.


```js
promptly.choose('Do you want an apple or an orange? ', ['apple', 'orange'], function (err, value) {
    console.log('Answer: ', value);
});
```


### .password(message, opts, fn) ###

Prompts for a password, printing the `message` and waiting for the input.   
When available, calls `fn` with `error` and `value`.   

The available options are the same, except that `trim` defauls to `false`.


```js
promptly.password('password: ', function (err, value) {
    console.log('password is ' + value);
});
```


## License ##

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
