'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const randToken = require('rand-token')
var BeaconSchema = new Schema({
  date_registered: {
    type: Date,
    default: Date.now
  },
  date: {
    type: Date,
    required: 'Date when captured'
  },
  user: {
    type: String,
    required: 'User',
  },
  beacon: {
    type: Object,
    required: 'Beacon data'
  }

});

var Beacon = mongoose.model('Beacon', BeaconSchema);
module.exports = Beacon;



var NearableSampleSchema = new Schema({
  uuid: {
    type: String,
    required: 'Sensor uuid'
  },
  date_registered: {
    type: Date,
    default: Date.now
  },
  date: {
    type: Date,
    required: 'Date when captured'
  },
  data: {
    company: {
      type: String,
    },
    frameType: {
      type: String
    },
    temperature: {
      type: Number
    },
    isMoving: {
      type: Boolean
    },
    acceleration: {
      x: {
        type: Number
      },
      y: {
        type: Number
      },
      z: {
        type: Number
      }
    },
    previousMotionStateDuration: {
      number: {
        type: Number
      },
      unit: {
        type: String
      }
    },
    currentMotionStateDuration: {
      number: {
        type: Number
      },
      unit: {
        type: String
      }
    }

  }

});

var SensorSample = mongoose.model('SensorSample', NearableSampleSchema);
module.exports = SensorSample;

var SensorConfSchema = new Schema({
    uid: {
      type: String,
      required: 'User Identifier'
    },
    sid: {
      type: String,
      required: 'Sensor identifier'
    },
    label: {
      type: String,
      required: 'Describe the position of the sensor'
    },
    date: {
      type: Date,
      default: Date.now
    },
});

var SensorConf = mongoose.model('SensorConf', SensorConfSchema);
module.exports = SensorConf;


var ActivitySchema = new Schema({
  label: {
    type: String,
    required: 'Activity label'
  },
  user: {
    type: String,
    required: 'Identifier of the user'
  },
  start: {
    type: Date,
    required: 'Start time of the activity'
  },
  end: {
    type: Date,
    required: 'Ending time of the activity'
  },
  comment: {
    type: String,
    required: false
  }
});

var Activity = mongoose.model('Activity', ActivitySchema);
module.exports = Activity;


var UserSchema = new Schema({
  name: {
    type: String,
    required: 'User name'
  },
  date: {
    type: Date,
    default: Date.now
  },
  comment: {
    type: String
  },
  token: {
    type: String,
    default: function() {
      return randToken.generate(64);
    }
  }
});

var User = mongoose.model('User', UserSchema);
module.exports = User;
