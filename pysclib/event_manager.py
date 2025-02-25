import types

class event_manager:
    def __init__(self):
        self._callbacks = {}
        self.is_debug = True

    def add(self, keyword, callback):
        if keyword not in self._callbacks:
            self._callbacks[keyword] = []
        
        self._callbacks[keyword].append({"callback": callback})

    def call(self, keyword, *args):
        if keyword not in self._callbacks:
            return

        callbacks_to_remove = []

        for index, item in enumerate(self._callbacks[keyword]):            
            if isinstance(item['callback'], types.FunctionType):
                if self.is_debug is True:
                    print(item["callback"])
                
                rac = item["callback"](*args)

                if rac is True:
                    callbacks_to_remove.append(index)

        for index in reversed(callbacks_to_remove):
            del self._callbacks[keyword][index]

        if len(self._callbacks[keyword]) == 0:
            del self._callbacks[keyword]