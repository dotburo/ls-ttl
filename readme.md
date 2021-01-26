# LocalStorage helper

Adds expiration to entries

## Usage
```
let client = new Ls({
    keyPrefix: 'ls-',
    ttlSuffix: '-ls-ttl',
    encrypt: btoa
});

client.set('hello1', 'world1', 60);

console.log(
    client.get('hello1'),
    client.getTTL('hello1'),
);
```
