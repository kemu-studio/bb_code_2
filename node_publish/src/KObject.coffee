K = {}

class K.Object
  @merge: (target, obj1) ->
    for key of obj1
      target[key] = obj1[key]

exports.Object = K.Object