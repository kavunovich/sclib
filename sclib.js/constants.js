export const PROTOCOL_CONFIG = {
    WEBSOCKET_URLS: [
        'wss://net.shifty.su/ws/'
    ],
    REQUEST_URLS: [
        'https://net.shifty.su/'
    ],
    DEFAULT_TIMEOUT: 5000,
    CONNECTION_TIMEOUT: 5000,
    MESSAGE_VERSION: 1,
    METHOD_VERSION: 2,
    ALPHABET_VERSION: 3
};

export const MESSAGE_TYPES = {
    ERROR: 0,                   SUCCESSFUL_AUTH: 1,
    CHATS: 2,                   CHATS_ERROR: 3,
    CHAT: 4,                    CHAT_ERROR: 5,
    CHATINFO: 6,                CHATINFO_ERROR: 7,
    SEND_MESSAGE: 8,            SEND_MESSAGE_ERROR: 9,
    SEND_MESSAGE_SUCCESS: 10,   NEW_MESSAGE: 11,
    SEARCH_USERS: 12,           SEARCH_CHATS: 13,
    SEARCH_USERS_ERROR: 14,     SEARCH_CHATS_ERROR: 15,
    CREATE_PRIVATE_CHAT: 16,    CREATE_PRIVATE_CHAT_ERROR: 17,
    CREATE_GROUP: 18,           CREATE_GROUP_ERROR: 19,
    CREATE_CHANNEL: 20,         CREATE_CHANNEL_ERROR: 21,
    SET_AVATAR: 22
};

export const ALPHABET = {
    0: 'parse_mode',        1: 'public_key', 
    2: 'request_id',        3: 'username',
    4: 'icons',             5: 'limit',
    6: 'data',              7: 'filehash',
    8: 'private_key',       9: 'message',
    10: 'chatid',           11: '',
    12: 'username_hash',    13: '',
    14: 'userid',           15: '',
    16: 'type',             17: 'index',
    18: 'time',             19: 'session_id',
    20: 'code',             21: 'version',
    22: 'user_sender',      23: '',
    24: 'chatname',         25: 'method_version',
    26: '',                 27: '',
    28: '',                 29: '',
    30: 'private',          31: 'block',
    32: 'date',             33: '',
    34: 'owner',            35: 'groupname',
    36: 'rules',            37: 'avatargroup',
    38: 'description',      39: 'muted',
    40: 'permissions',      41: 'canSendMessage',
    42: 'email',            43: 'key',
    44: 'salt',             45: '',
    46: '',                 47: '',
    48: '',                 49: '',
    50: '',                 51: 'hash_pass',
    52: '',                 53: 'last_chatid',
    54: 'offset',           55: 'last_messageid',
    56: 'count',            57: 'chaticon',
    58: 'messageid',        59: 'post'
};