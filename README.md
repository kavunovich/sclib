# SCLib (Shifty Client Library)
SCLib is an API that allows you to work with the Shifty Messenger system. It operates using the SMD (Shifty Manifest Dispatch) protocol. 

In essence, there is an appeal to the SMD converter itself, which already receives and processes the request and data. 
This library is multilingual, however, different versions have features and shortcomings, so it is worth using stable versions of the library.

### connect `string` userid, `string` public_key

```js
  await smd.connect(userid, public_key)
  // return Boolean
```

### sendMessage `string` chatid, `string` message

```js
  await smd.sendMessage(chatid, 'just a text')
  // return Boolean
```


### setAvatar `string` file_key

```js
  await smd.setProfileAvatar(file_key)
  // return Boolean
```

### createPrivateChat `string` userid

```js
  await smd.createPrivateChat(userid)
  // return Boolean
```

### getChatInfo `string` chatid

```js
  await smd.getChatInfo(chatid)
  // return Boolean or Array
```

### uploadFile `string | bytes` binary_data

```js
  await smd.uploadFile('any data even text')
  // return Array
```

### getFile `string` file_key

```js
  await smd.getFile('file_key')
  // return Bytes
```

### searchChats `string` chatname, `int` offset, `int` limit

```js
  await smd.searchChats(chatname, 0, 10)
  // return Boolean or Array
```

### searchUsers `string` username, `int` offset, `int` limit

```js
  await smd.searchUsers(username, 0, 10)
  // return Boolean or Array
```

### getChats `string` last_chatid, `int` offset, `int` limit, `boolean` post_this_id 

```js
  await smd.getChats(last_chatid, 0, 10, false)
  // return Boolean or Array
```

### getChat `string` chatid, `string` last_messageid, `int` offset, `int` limit, `boolean` post_this_id 

```js
  await smd.getChat(chatid, last_messageid, 0, 10, false)
  // return Boolean or Array
```
