
def dict_with_keys(keys):
    def expects(fn):
        def _expects(instance, frame):
            for key in keys:
                assert frame.get(key), '{0} key must exist!'.format(key)
            result = fn(instance, frame)
            return result
        return _expects
    return expects

def build_frame(from_, to, action, body):
    return {
        'from': from_,
        'to': to,
        'action': action,
        'body': body
    }