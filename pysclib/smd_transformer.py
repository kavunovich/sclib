from constants import ALPHABET

class smd_transformer:
    @staticmethod
    def transform_array(array, transform_function):
        stack = [(array, [])]
        transformed = {}

        while stack:
            current, path = stack.pop()

            for key, value in current.items():
                new_key = transform_function(key)
                current_path = path + [new_key]

                if isinstance(value, dict):
                    stack.append((value, current_path))
                    ref = transformed
                    for path_key in current_path:
                        if path_key not in ref:
                            ref[path_key] = {}
                        ref = ref[path_key]
                else:
                    ref = transformed
                    last_key = current_path.pop()
                    for path_key in current_path:
                        if path_key not in ref:
                            ref[path_key] = {}
                        ref = ref[path_key]
                    ref[last_key] = value

        return transformed

    @staticmethod
    def sort_object(array):
        stack = [(array, [])]
        sorted_obj = {}

        while stack:
            current, path = stack.pop()
            sorted_keys = sorted(current.keys())

            for key in sorted_keys:
                value = current[key]
                current_path = path + [key]

                if isinstance(value, dict):
                    ref = sorted_obj
                    stack.append((value, current_path))

                    for path_key in current_path:
                        if path_key not in ref:
                            ref[path_key] = {}
                        ref = ref[path_key]
                else:
                    ref = sorted_obj
                    last_key = current_path.pop()

                    for path_key in current_path:
                        if path_key not in ref:
                            ref[path_key] = {}
                        ref = ref[path_key]

                    ref[last_key] = value

        return sorted_obj

    @staticmethod
    def shorten(data):
        if isinstance(data, str):
            index = next((k for k, v in ALPHABET.items() if v == data), None)
            return index if index is not None else data

        transformed = smd_transformer.transform_array(data, lambda key: next((k for k, v in ALPHABET.items() if v == key), key))
        return smd_transformer.sort_object(transformed)

    @staticmethod
    def expand(data):
        if isinstance(data, str):
            return ALPHABET.get(data, data)

        transformed = smd_transformer.transform_array(data, lambda key: ALPHABET.get(key, key))
        return smd_transformer.sort_object(transformed)