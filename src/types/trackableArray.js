import {getTracker} from '../core/tracker';
import {defineProp, create} from '../utils/utils';

export const outOfBoundariesTrackRange = 1;
const ignoreChangesProp = '__@state__ignoreChanges';
const mutatingMethods = ['shift', 'push', 'pop', 'unshift', 'reverse', 'sort', 'fill', 'copyWithin', 'splice'];

const trackableArrayPrototype = create(Array.prototype);
mutatingMethods.forEach(defineTrackableArrayMethod);
defineProp(trackableArrayPrototype, 'toJSON', {
    configurable: true,
    enumerable: false,
    value() {
        return this.slice();
    }
});

export function getTrackableArray(origArray) {
    const trackableArray = create(trackableArrayPrototype);
    const tracker = getTracker(trackableArray);

    // init array
    for(let i = 0; i < origArray.length; i++) {
        defineTrackableProp(trackableArray, i, tracker, false);
        tracker.initValue(i, origArray[i]);
    }

    tracker.initValue('length', origArray.length);

    defineTrackableProp(trackableArray, origArray.length, tracker, true);
    defineProp(trackableArray, 'length', {
        configurable: true,
        enumerable: false,
        get() {
            return tracker.getValue('length');
        },
        set(l){
            const prevLength = tracker.getValue('length');

            if(prevLength > l) {
                for(let i = l; i < prevLength; i++) {
                    // old values
                    tracker.deleteValue(i);
                }

                for(let i = l; i < l + outOfBoundariesTrackRange; i++) {
                    // new track boundaries
                    defineTrackableProp(this, i, tracker, true);
                }

                for(let i = l + outOfBoundariesTrackRange; i < prevLength + outOfBoundariesTrackRange; i++) {
                    // old boundaries
                    delete this[i];
                }
            } else if(prevLength < l) {
                for(let i = prevLength; i < l; i++) {
                    // new values
                    tracker.initValue(i, this[i]);
                    defineTrackableProp(this, i, tracker, false);
                }

                for(let i = l; i < l + outOfBoundariesTrackRange; i++) {
                    // new track boundaries
                    defineTrackableProp(this, i, tracker, true);
                }
            }

            if(this[ignoreChangesProp]) {
                tracker.setValueSilently('length', l);
            } else {
                tracker.setValue('length', l);
            }

        }
    });

    return trackableArray;
}

function defineTrackableProp(target, prop, tracker, isOutOfBoundaries) {
    defineProp(target, prop, {
        configurable: true,
        enumerable: !isOutOfBoundaries,
        get() {
            return tracker.getValue(prop);
        },
        set(v) {
            if(this[ignoreChangesProp]) {
                tracker.initValue(prop, v);
                return;
            }

            if(isOutOfBoundaries) {
                tracker.initValue(prop, v);
                target.length = Number(prop) + 1;
            } else {
                tracker.setValue(prop, v);
            }
        }
    });
}

function defineTrackableArrayMethod(name) {
    defineProp(trackableArrayPrototype, name, {
        configurable: true,
        enumerable: false,
        value() {
            defineProp(this, ignoreChangesProp, {
                configurable: true,
                enumerable: false,
                value: true
            });
            const result = Array.prototype[name].apply(this, arguments);
            delete this[ignoreChangesProp];
            getTracker(this).reportChange();
            return result;
        }
    });
}