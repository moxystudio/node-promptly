# promptly #
---

Simple command line prompting utilify.



## API ##

In all the commands, the options argument is not mandatory.


### .prompt(message, opts, fn) ###

Prompts for a value, printing the `message` and waiting for the input.   
When done, calls `fn` with an `error` and `value`.

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
promptly.prompt('name: ', function (err, value) {
    if (err) {
        console.log('invalid name');
        // Manually call retry
        // The passed errors have a retry method to easily prompt again.
        return err.retry();
    }

    console.log(value);
});
```

Ask for a name until it validates (non-empty value).
```js
promptly.prompt('name: ', { retry: true }, function (err, value) {
    console.log(value);
});
```

Ask for a name until it validates (non-empty value and length > 2).
```js
var validator = function (value) {
    if (value.length < 2) {
        throw new Error('Min length of 2');
    }

    return value;
}

promptly.prompt('name: ', { retry: true, validator: validator }, function (err, value) {
    console.log(value);
});
```



### .confirm(message, opts, fn) ###

Ask the user to confirm something.   
Calls `fn` with an `error` and `value` (true or false).

The available options are the same, except that `retry` defauls to `true`.   
Truthy values are: `y`, `yes`, `1` and `true`.
Falsy values are `n`, `no`, `0` and `false`.
Comparison is made in case insensitive way.

Example usage:

```js
promply.confirm('Are you sure? ', function (err, value) {
    console.log('Answer: ', value);
});
```


### .choose(message, choices, opts, fn) ###

Ask the user to choose between multiple `choices` (array of choices).   
Calls `fn` with an `error` and `value` (true or false).   

The available options are the same, except that `retry` defauls to `true`.


```js
promply.choose('Do you want an apple or an orange? ', ['apple', 'orange'], function (err, value) {
    console.log('Answer: ', value);
});
```


### .password(message, opts, fn) ###

Prompts for a password, printing the `message` and waiting for the input.   
When available, calls `fn` with an `error` and `value`.   

The available options are the same, except that `trim` defauls to `false`.


```js
promply.password('password: ', function (err, value) {
    console.log('password is ' + value);
});
```


## License ##

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
