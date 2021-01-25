# LocalStorage helper

- Adds expiration to entries
- Randomises or encrypts keys

## Usage
```
let client = new Ls();

client.set('hello1', 'world1', 60);
client.setWithEncryptedKey('hello2', 'world2', 60);
client.setWithRandomKey('hello3', 'world3', 60);

console.log(
    client.get('hello1'),
    client.get('hello2'),
    client.get('hello3'),
);

console.log(
    client.getTTL('hello1'),
    client.getTTL('hello2'),
    client.getTTL('hello3'),
);
```
